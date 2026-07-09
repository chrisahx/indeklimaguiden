import nodemailer from 'nodemailer';
import type { InstallerLeadInput, MatchedInstaller } from './installer-leads';

function env(name: string) {
  return import.meta.env[name] ?? process.env[name];
}

function envBoolean(name: string, fallback = false) {
  const value = env(name);
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function needTypeLabel(value: string) {
  const labels: Record<string, string> = {
    new_heat_pump: 'Ny varmepumpe',
    existing_heat_pump: 'Hjælp til eksisterende varmepumpe',
    service_or_error: 'Service eller fejl',
    unsure: 'Ikke sikker endnu',
  };

  return labels[value] ?? value;
}

function getTransporter() {
  const host = env('SMTP_HOST');
  const port = Number.parseInt(env('SMTP_PORT') ?? '587', 10);
  const user = env('SMTP_USER');
  const pass = env('SMTP_PASS');

  if (!host) throw new Error('SMTP_HOST is not configured.');

  return nodemailer.createTransport({
    host,
    port,
    secure: envBoolean('SMTP_SECURE'),
    auth: user && pass ? { user, pass } : undefined,
  });
}

function leadEmailText(input: InstallerLeadInput, installer: MatchedInstaller) {
  return `Ny kundeforespørgsel fra Indeklima Guiden.
Installatør: ${installer.name}

Kundeoplysninger:
Navn: ${input.fullName}
Vej og nummer: ${input.streetAddress}
Postnummer: ${input.postalCode}
By: ${input.city}
E-mail: ${input.email}
Telefon: ${input.phone}

Behov:
${needTypeLabel(input.needType)}

Beskrivelse:
${input.message}

Matchet postnummer: ${installer.postalCode}${installer.city ? ` ${installer.city}` : ''}
Verificeret i Indeklima Guiden: ${installer.isVerified ? 'Ja' : 'Nej'}

Kontakt kunden direkte for at aftale næste skridt.
`;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function sendInstallerLeadEmails(input: InstallerLeadInput, installers: MatchedInstaller[]) {
  const transporter = getTransporter();
  const from = env('SMTP_FROM') || 'Indeklima Guiden <leads@indeklimaguiden.dk>';

  const results = await Promise.allSettled(
    installers.map((installer) =>
      transporter.sendMail({
        from,
        to: installer.email,
        replyTo: input.email,
        subject: `Ny kundeforespørgsel om varmepumpe fra ${input.postalCode}`,
        text: leadEmailText(input, installer),
      }),
    ),
  );

  const failed = results.flatMap((result, index) => {
    if (result.status === 'fulfilled') return [];
    const installer = installers[index];
    return [{ installerId: installer.id, installerEmail: installer.email, error: errorMessage(result.reason) }];
  });

  if (failed.length > 0) {
    console.error('[installer-lead] SMTP send failures', failed);
    throw new Error(`${failed.length} af ${installers.length} lead-mails kunne ikke sendes: ${failed.map((failure) => `${failure.installerEmail}: ${failure.error}`).join('; ')}`);
  }

  return results.length;
}
