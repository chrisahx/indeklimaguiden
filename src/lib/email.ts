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
  return `Ny kundeforespørgsel via Indeklima Guiden

Hej ${installer.name},

I modtager denne forespørgsel, fordi kunden har bedt Indeklima Guiden om at finde op til 3 relevante varmepumpe-installatører i nærheden. Kunden ønsker at blive kontaktet direkte om opgaven.

========================================
KUNDEOPLYSNINGER
========================================

Navn
${input.fullName}

Adresse
${input.streetAddress}
${input.postalCode} ${input.city}

E-mail
${input.email}

Telefon
${input.phone}

========================================
OPGAVE
========================================

Hvad kunden søger hjælp til
${needTypeLabel(input.needType)}

Kundens beskrivelse
${input.message}

========================================
NÆSTE SKRIDT
========================================

Kontakt kunden direkte på telefon eller e-mail, hvis opgaven er relevant for jer. Kunden forventer ikke et bindende tilbud med det samme, men en indledende dialog om behov, løsning og eventuel besigtigelse.

Hvis I ikke kan hjælpe med opgaven, kan I blot se bort fra forespørgslen.

Venlig hilsen
Indeklima Guiden
`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function multilineHtml(value: string) {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

function leadEmailHtml(input: InstallerLeadInput, installer: MatchedInstaller) {
  const customerEmail = encodeURIComponent(input.email);
  const customerPhone = input.phone.replace(/[^+\d]/g, '');

  return `<!doctype html>
<html lang="da">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ny kundeforespørgsel via Indeklima Guiden</title>
  </head>
  <body style="margin:0; padding:0; background:#f7f3ea; color:#183044; font-family:Inter, Arial, sans-serif; line-height:1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f3ea; padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px; overflow:hidden; border:1px solid #dce6df; border-radius:22px; background:#ffffff; box-shadow:0 18px 60px rgba(7,48,79,0.09);">
            <tr>
              <td style="padding:30px 30px 26px; background:linear-gradient(135deg,#07304f,#006f9e); color:#ffffff;">
                <div style="display:inline-block; margin-bottom:14px; border:1px solid rgba(255,255,255,0.32); border-radius:999px; padding:6px 11px; background:rgba(255,255,255,0.12); font-size:12px; font-weight:800; letter-spacing:0.06em; text-transform:uppercase;">Indeklima Guiden</div>
                <h1 style="margin:0 0 10px; color:#ffffff; font-size:28px; line-height:1.15; letter-spacing:-0.03em;">Ny kundeforespørgsel om varmepumpe</h1>
                <p style="margin:0; max-width:560px; color:#e4f7fd; font-size:16px;">Hej ${escapeHtml(installer.name)}, kunden har bedt os finde op til 3 relevante installatører og ønsker at blive kontaktet direkte.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 30px 8px;">
                <p style="margin:0 0 18px; color:#64717a; font-size:15px;">Forespørgslen er sendt til jer, fordi opgaven kan være relevant for en varmepumpe-installatør i kundens område. Se kundens oplysninger og opgavebeskrivelse nedenfor.</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate; border-spacing:0 12px;">
                  <tr>
                    <td style="border:1px solid #dce6df; border-radius:16px; padding:18px; background:#fbfaf6;">
                      <h2 style="margin:0 0 14px; color:#07304f; font-size:18px; line-height:1.25;">Kundeoplysninger</h2>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr><td style="padding:7px 0; color:#64717a; width:145px; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Navn</td><td style="padding:7px 0; color:#183044; font-weight:700;">${escapeHtml(input.fullName)}</td></tr>
                        <tr><td style="padding:7px 0; color:#64717a; width:145px; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Adresse</td><td style="padding:7px 0; color:#183044;">${escapeHtml(input.streetAddress)}<br />${escapeHtml(input.postalCode)} ${escapeHtml(input.city)}</td></tr>
                        <tr><td style="padding:7px 0; color:#64717a; width:145px; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">E-mail</td><td style="padding:7px 0;"><a href="mailto:${customerEmail}" style="color:#006f9e; font-weight:800; text-decoration:none;">${escapeHtml(input.email)}</a></td></tr>
                        <tr><td style="padding:7px 0; color:#64717a; width:145px; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Telefon</td><td style="padding:7px 0;"><a href="tel:${escapeHtml(customerPhone)}" style="color:#006f9e; font-weight:800; text-decoration:none;">${escapeHtml(input.phone)}</a></td></tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="border:1px solid #dce6df; border-radius:16px; padding:18px; background:#ffffff;">
                      <h2 style="margin:0 0 14px; color:#07304f; font-size:18px; line-height:1.25;">Opgave</h2>
                      <div style="margin-bottom:14px;">
                        <div style="margin-bottom:5px; color:#64717a; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Hvad kunden søger hjælp til</div>
                        <div style="display:inline-block; border-radius:999px; padding:7px 12px; background:#eef8df; color:#4f8f1f; font-weight:850;">${escapeHtml(needTypeLabel(input.needType))}</div>
                      </div>
                      <div>
                        <div style="margin-bottom:5px; color:#64717a; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Kundens beskrivelse</div>
                        <div style="border-left:4px solid #079bd3; padding:12px 14px; border-radius:0 12px 12px 0; background:#e4f7fd; color:#183044;">${multilineHtml(input.message)}</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:12px 30px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius:18px; background:#07304f;">
                  <tr>
                    <td style="padding:20px; color:#ffffff;">
                      <h2 style="margin:0 0 8px; color:#ffffff; font-size:18px;">Næste skridt</h2>
                      <p style="margin:0 0 16px; color:#e4f7fd;">Kontakt kunden direkte på telefon eller e-mail, hvis opgaven er relevant for jer. Kunden forventer en indledende dialog om behov, løsning og eventuel besigtigelse.</p>
                      <a href="tel:${escapeHtml(customerPhone)}" style="display:inline-block; margin:0 8px 8px 0; border-radius:999px; padding:10px 15px; background:#70b62c; color:#ffffff; font-weight:850; text-decoration:none;">Ring til kunden</a>
                      <a href="mailto:${customerEmail}" style="display:inline-block; margin:0 0 8px; border:1px solid rgba(255,255,255,0.42); border-radius:999px; padding:9px 15px; color:#ffffff; font-weight:850; text-decoration:none;">Send e-mail</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0; color:#64717a; font-size:13px;">Hvis I ikke kan hjælpe med opgaven, kan I blot se bort fra forespørgslen.</p>
                <p style="margin:10px 0 0; color:#64717a; font-size:13px;">Venlig hilsen<br /><strong style="color:#07304f;">Indeklima Guiden</strong></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function customerConfirmationText(input: InstallerLeadInput, installerCount: number) {
  return `Tak for din forespørgsel til Indeklima Guiden

Hej ${input.fullName},

Vi har modtaget din forespørgsel om varmepumpe og sender den videre til ${installerCount} relevante installatører tæt på dig.

Installatørerne får dine kontaktoplysninger og din beskrivelse af opgaven, så de kan kontakte dig direkte om næste skridt.

========================================
DIN FORESPØRGSEL
========================================

Adresse
${input.streetAddress}
${input.postalCode} ${input.city}

Hvad du søger hjælp til
${needTypeLabel(input.needType)}

Din beskrivelse
${input.message}

========================================
HVAD SKER DER NU?
========================================

1. Vi sender din forespørgsel til op til 3 relevante installatører i nærheden.
2. Installatørerne vurderer opgaven ud fra din beskrivelse.
3. Relevante installatører kontakter dig direkte på telefon eller e-mail.

Du er ikke forpligtet til at acceptere et tilbud.

Venlig hilsen
Indeklima Guiden
`;
}

function customerConfirmationHtml(input: InstallerLeadInput, installerCount: number) {
  return `<!doctype html>
<html lang="da">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Vi har modtaget din forespørgsel</title>
  </head>
  <body style="margin:0; padding:0; background:#f7f3ea; color:#183044; font-family:Inter, Arial, sans-serif; line-height:1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f3ea; padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px; overflow:hidden; border:1px solid #dce6df; border-radius:22px; background:#ffffff; box-shadow:0 18px 60px rgba(7,48,79,0.09);">
            <tr>
              <td style="padding:30px 30px 26px; background:linear-gradient(135deg,#07304f,#006f9e); color:#ffffff;">
                <div style="display:inline-block; margin-bottom:14px; border:1px solid rgba(255,255,255,0.32); border-radius:999px; padding:6px 11px; background:rgba(255,255,255,0.12); font-size:12px; font-weight:800; letter-spacing:0.06em; text-transform:uppercase;">Indeklima Guiden</div>
                <h1 style="margin:0 0 10px; color:#ffffff; font-size:28px; line-height:1.15; letter-spacing:-0.03em;">Vi har modtaget din forespørgsel</h1>
                <p style="margin:0; max-width:560px; color:#e4f7fd; font-size:16px;">Hej ${escapeHtml(input.fullName)}, vi sender din forespørgsel videre til ${installerCount} relevante varmepumpe-installatører tæt på dig.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 30px 8px;">
                <p style="margin:0 0 18px; color:#64717a; font-size:15px;">Installatørerne får dine kontaktoplysninger og din beskrivelse af opgaven, så de kan kontakte dig direkte om næste skridt. Du er ikke forpligtet til at acceptere et tilbud.</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate; border-spacing:0 12px;">
                  <tr>
                    <td style="border:1px solid #dce6df; border-radius:16px; padding:18px; background:#fbfaf6;">
                      <h2 style="margin:0 0 14px; color:#07304f; font-size:18px; line-height:1.25;">Din forespørgsel</h2>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr><td style="padding:7px 0; color:#64717a; width:145px; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Adresse</td><td style="padding:7px 0; color:#183044;">${escapeHtml(input.streetAddress)}<br />${escapeHtml(input.postalCode)} ${escapeHtml(input.city)}</td></tr>
                        <tr><td style="padding:7px 0; color:#64717a; width:145px; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Behov</td><td style="padding:7px 0;"><span style="display:inline-block; border-radius:999px; padding:7px 12px; background:#eef8df; color:#4f8f1f; font-weight:850;">${escapeHtml(needTypeLabel(input.needType))}</span></td></tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="border:1px solid #dce6df; border-radius:16px; padding:18px; background:#ffffff;">
                      <h2 style="margin:0 0 14px; color:#07304f; font-size:18px; line-height:1.25;">Din beskrivelse</h2>
                      <div style="border-left:4px solid #079bd3; padding:12px 14px; border-radius:0 12px 12px 0; background:#e4f7fd; color:#183044;">${multilineHtml(input.message)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:12px 30px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius:18px; background:#07304f;">
                  <tr>
                    <td style="padding:20px; color:#ffffff;">
                      <h2 style="margin:0 0 8px; color:#ffffff; font-size:18px;">Hvad sker der nu?</h2>
                      <ol style="margin:0; padding-left:20px; color:#e4f7fd;">
                        <li style="margin-bottom:6px;">Vi sender din forespørgsel til op til 3 relevante installatører i nærheden.</li>
                        <li style="margin-bottom:6px;">Installatørerne vurderer opgaven ud fra din beskrivelse.</li>
                        <li>Relevante installatører kontakter dig direkte på telefon eller e-mail.</li>
                      </ol>
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0; color:#64717a; font-size:13px;">Hvis du opdager en fejl i oplysningerne, kan du indsende formularen igen med de korrekte oplysninger.</p>
                <p style="margin:10px 0 0; color:#64717a; font-size:13px;">Venlig hilsen<br /><strong style="color:#07304f;">Indeklima Guiden</strong></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
        subject: `Ny kundeforespørgsel om varmepumpe fra ${input.postalCode} til ${installer.name}`,
        text: leadEmailText(input, installer),
        html: leadEmailHtml(input, installer),
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

  try {
    await transporter.sendMail({
      from,
      to: input.email,
      subject: 'Vi har modtaget din forespørgsel om varmepumpe',
      text: customerConfirmationText(input, installers.length),
      html: customerConfirmationHtml(input, installers.length),
    });
  } catch (error) {
    const message = errorMessage(error);
    console.error('[installer-lead] Customer confirmation email failed', { customerEmail: input.email, error: message });
    throw new Error(`Kundebekræftelsen kunne ikke sendes til ${input.email}: ${message}`);
  }

  return { installerEmailCount: results.length, customerEmailCount: 1, totalEmailCount: results.length + 1 };
}
