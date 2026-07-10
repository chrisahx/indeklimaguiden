import nodemailer from "nodemailer";
import type { InstallerLeadInput, MatchedInstaller } from "./installer-leads";

function env(name: string) {
  return import.meta.env?.[name] ?? process.env[name];
}

function envBoolean(name: string, fallback = false) {
  const value = env(name);
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function needTypeLabel(value: string) {
  const labels: Record<string, string> = {
    new_heat_pump: "Ny varmepumpe",
    existing_heat_pump: "Hjælp til eksisterende varmepumpe",
    service_or_error: "Service eller fejl",
    unsure: "Ikke sikker endnu",
  };

  return labels[value] ?? value;
}

function getTransporter() {
  const host = env("SMTP_HOST");
  const port = Number.parseInt(env("SMTP_PORT") ?? "587", 10);
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");

  if (!host) throw new Error("SMTP_HOST is not configured.");

  return nodemailer.createTransport({
    host,
    port,
    secure: envBoolean("SMTP_SECURE"),
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function multilineHtml(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function leadEmailHtml(input: InstallerLeadInput, installer: MatchedInstaller) {
  const customerEmail = encodeURIComponent(input.email);
  const customerPhone = input.phone.replace(/[^+\d]/g, "");

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

function customerConfirmationText(
  input: InstallerLeadInput,
  installerCount: number,
) {
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

function customerConfirmationHtml(
  input: InstallerLeadInput,
  installerCount: number,
) {
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

interface CompanyEmailInput {
  companyName: string;
  email: string;
}

interface CompanyClaimInviteInput extends CompanyEmailInput {
  claimUrl: string;
  expiresAt: Date;
}

interface CompanyLoginCodeInput extends CompanyEmailInput {
  code: string;
  expiresInMinutes: number;
}

interface CompanyClaimCompletedInput extends CompanyEmailInput {
  dashboardUrl: string;
}

function formatDanishDateTime(date: Date) {
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Copenhagen",
  }).format(date);
}

function formatDanishTimeWithSeconds(date: Date) {
  return new Intl.DateTimeFormat("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/Copenhagen",
  }).format(date);
}

function companyEmailShell(
  title: string,
  intro: string,
  body: string,
  signoff = '<strong style="color:#07304f;">Indeklima Guiden</strong>',
) {
  return `<!doctype html>
<html lang="da">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0; padding:0; background:#f7f3ea; color:#183044; font-family:Inter, Arial, sans-serif; line-height:1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f3ea; padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px; overflow:hidden; border:1px solid #dce6df; border-radius:22px; background:#ffffff; box-shadow:0 18px 60px rgba(7,48,79,0.09);">
            <tr>
              <td style="padding:30px 30px 26px; background:linear-gradient(135deg,#07304f,#006f9e); color:#ffffff;">
                <div style="display:inline-block; margin-bottom:14px; border:1px solid rgba(255,255,255,0.32); border-radius:999px; padding:6px 11px; background:rgba(255,255,255,0.12); font-size:12px; font-weight:800; letter-spacing:0.06em; text-transform:uppercase;">Indeklima Guiden</div>
                <h1 style="margin:0 0 10px; color:#ffffff; font-size:28px; line-height:1.15; letter-spacing:-0.03em;">${escapeHtml(title)}</h1>
                <p style="margin:0; max-width:560px; color:#e4f7fd; font-size:16px;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 30px 30px;">
                ${body}
                <p style="margin:24px 0 0; color:#64717a; font-size:13px;">Venlig hilsen<br />${signoff}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function claimInviteText(input: CompanyClaimInviteInput) {
  return `Jeres virksomhed er nu med på Indeklima Guiden

Hej ${input.companyName}

${input.companyName} kan nu modtage relevante kundehenvendelser fra lokale boligejere gennem Indeklima Guiden - helt gratis.

I kan nu bekræfte og administrere jeres virksomhedsside, så I selv kan gennemgå og opdatere virksomhedens oplysninger.

Bekræft og administrér virksomhedssiden:
${input.claimUrl}

Hvis knappen eller linket ikke virker, kan I kopiere adressen ind i jeres browser.

Kort om Indeklima Guiden

Jeg har oprettet Indeklima Guiden, en ny hjemmeside, der skal gøre det lettere for boligejere at finde og kontakte varmepumpeinstallatører i deres nærområde.

Som en del af hjemmesiden har jeg oprettet et landsdækkende register over varmepumpeinstallatører, og ${input.companyName} har allerede fået sin egen virksomhedsside.

På Indeklima Guiden kan boligejere blandt andet:

søge efter installatører i deres område
sammenligne virksomheder og finde relevante kontaktoplysninger
sende én forespørgsel til op til tre lokale installatører

I kender måske tilbudsløsningen fra eksempelvis varmepumpe.dk eller 3byggetilbud. Forskellen er, at jeg har valgt at gøre løsningen gratis for installatørerne.

Når en boligejer sender en forespørgsel, finder systemet relevante installatører i området og sender kundeoplysningerne direkte videre - uden betaling for leadet.

Jeg har bygget Indeklima Guiden, fordi jeg synes, der manglede en bedre måde for forbrugerne at finde lokale installatører på, samtidig med at installatørerne får en gratis kanal til øget synlighed og nye kundehenvendelser.

Har I spørgsmål, er I altid velkomne til at skrive til info@indeklimaguiden.dk.

Venlig hilsen
Christian
Indeklima Guiden
`;
}

function claimInviteHtml(input: CompanyClaimInviteInput) {
  return `<!doctype html>
<html lang="da">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Jeres virksomhed er nu med på Indeklima Guiden</title>
  </head>
  <body style="margin:0; padding:0; background:#ffffff; color:#1f2933; font-family:Arial, sans-serif; line-height:1.6;">
    <div style="max-width:640px; margin:0 auto; padding:28px 20px;">
      <p style="margin:0 0 18px; font-size:16px; color:#1f2933;">Hej ${escapeHtml(input.companyName)}</p>

      <p style="margin:0 0 16px; font-size:16px; color:#1f2933;"><strong>${escapeHtml(input.companyName)} kan nu modtage relevante kundehenvendelser fra lokale boligejere gennem Indeklima Guiden - helt gratis.</strong></p>

      <p style="margin:0 0 20px; font-size:16px; color:#1f2933;">I kan nu bekræfte og administrere jeres virksomhedsside, så I selv kan gennemgå og opdatere virksomhedens oplysninger.</p>

      <p style="margin:0 0 16px;">
        <a href="${escapeHtml(input.claimUrl)}" style="display:inline-block; border-radius:6px; padding:12px 18px; background:#006f9e; color:#ffffff; font-size:16px; font-weight:700; text-decoration:none;">Bekræft og administrér virksomhedssiden</a>
      </p>

      <p style="margin:0 0 24px; font-size:14px; color:#52606d;">Hvis knappen ikke virker, kan I kopiere dette link ind i jeres browser:<br /><a href="${escapeHtml(input.claimUrl)}" style="color:#006f9e; word-break:break-all;">${escapeHtml(input.claimUrl)}</a></p>

      <h2 style="margin:0 0 10px; font-size:17px; line-height:1.3; color:#1f2933;">Kort om Indeklima Guiden</h2>

      <p style="margin:0 0 16px; font-size:16px; color:#1f2933;">Jeg har oprettet <a href="https://indeklimaguiden.dk" style="color:#006f9e; text-decoration:underline;">Indeklima Guiden</a>, en ny hjemmeside, der skal gøre det lettere for boligejere at finde og kontakte varmepumpeinstallatører i deres nærområde.</p>

      <p style="margin:0 0 16px; font-size:16px; color:#1f2933;">Som en del af hjemmesiden har jeg oprettet et landsdækkende register over varmepumpeinstallatører, og ${escapeHtml(input.companyName)} har allerede fået sin egen virksomhedsside.</p>

      <p style="margin:0 0 8px; font-size:16px; color:#1f2933;">På Indeklima Guiden kan boligejere blandt andet:</p>
      <ul style="margin:0 0 16px; padding-left:22px; font-size:16px; color:#1f2933;">
        <li>søge efter installatører i deres område</li>
        <li>sammenligne virksomheder og finde relevante kontaktoplysninger</li>
        <li>sende én forespørgsel til op til tre lokale installatører</li>
      </ul>

      <p style="margin:0 0 16px; font-size:16px; color:#1f2933;">I kender måske tilbudsløsningen fra eksempelvis varmepumpe.dk eller 3byggetilbud. Forskellen er, at jeg har valgt at gøre løsningen gratis for installatørerne.</p>

      <p style="margin:0 0 16px; font-size:16px; color:#1f2933;">Når en boligejer sender en forespørgsel, finder systemet relevante installatører i området og sender kundeoplysningerne direkte videre - uden betaling for leadet.</p>

      <p style="margin:0 0 16px; font-size:16px; color:#1f2933;">Jeg har bygget Indeklima Guiden, fordi jeg synes, der manglede en bedre måde for forbrugerne at finde lokale installatører på, samtidig med at installatørerne får en gratis kanal til øget synlighed og nye kundehenvendelser.</p>

      <p style="margin:0 0 22px; font-size:16px; color:#1f2933;">Har I spørgsmål, er I altid velkomne til at skrive til <a href="mailto:info@indeklimaguiden.dk" style="color:#006f9e; text-decoration:underline;">info@indeklimaguiden.dk</a>.</p>

      <p style="margin:0; font-size:16px; color:#1f2933;">Venlig hilsen<br />Christian<br />Indeklima Guiden</p>
    </div>
  </body>
</html>`;
}

function loginCodeText(input: CompanyLoginCodeInput) {
  return `Din login-kode til Indeklima Guiden

Hej ${input.companyName},

Brug denne kode til at logge ind på jeres virksomhedsside:

${input.code}

Koden udløber om ${input.expiresInMinutes} minutter.

Hvis I ikke har bedt om en login-kode, kan I se bort fra denne mail.

Venlig hilsen
Indeklima Guiden
`;
}

function loginCodeHtml(input: CompanyLoginCodeInput) {
  return companyEmailShell(
    "Din login-kode",
    `Hej ${input.companyName}, brug koden herunder til at logge ind.`,
    `<p style="margin:0 0 18px; color:#64717a; font-size:15px;">Indtast koden på login-siden for at få adgang til jeres virksomhedsområde.</p>
    <div style="margin:0 0 18px; border:1px solid #dce6df; border-radius:18px; padding:22px; background:#fbfaf6; text-align:center;">
      <div style="margin-bottom:8px; color:#64717a; font-size:12px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase;">Engangskode</div>
      <div style="color:#07304f; font-size:38px; line-height:1; font-weight:900; letter-spacing:0.18em;">${escapeHtml(input.code)}</div>
    </div>
    <p style="margin:0; color:#64717a; font-size:14px;">Koden udløber om ${input.expiresInMinutes} minutter. Hvis I ikke har bedt om en login-kode, kan I se bort fra denne mail.</p>`,
  );
}

function claimCompletedText(input: CompanyClaimCompletedInput) {
  return `Jeres virksomhedsside er claimet

Hej ${input.companyName},

Jeres virksomhedsside hos Indeklima Guiden er nu claimet med e-mailadressen ${input.email}.

I kan logge ind og se jeres virksomhedsoplysninger her:
${input.dashboardUrl}

Venlig hilsen
Indeklima Guiden
`;
}

function claimCompletedHtml(input: CompanyClaimCompletedInput) {
  return companyEmailShell(
    "Jeres virksomhedsside er claimet",
    `Hej ${input.companyName}, jeres claim er gennemført.`,
    `<p style="margin:0 0 18px; color:#64717a; font-size:15px;">Virksomhedssiden for <strong style="color:#07304f;">${escapeHtml(input.companyName)}</strong> er nu claimet med e-mailadressen <strong style="color:#07304f;">${escapeHtml(input.email)}</strong>.</p>
    <p style="margin:0 0 20px;"><a href="${escapeHtml(input.dashboardUrl)}" style="display:inline-block; border-radius:999px; padding:12px 18px; background:#006f9e; color:#ffffff; font-weight:850; text-decoration:none;">Gå til virksomhedsområde</a></p>
    <p style="margin:0; color:#64717a; font-size:14px;">Fremover kan I logge ind med jeres e-mailadresse og en engangskode.</p>`,
  );
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function sendInstallerLeadEmails(
  input: InstallerLeadInput,
  installers: MatchedInstaller[],
) {
  const transporter = getTransporter();
  const from =
    env("SMTP_FROM") || "Indeklima Guiden <leads@indeklimaguiden.dk>";

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
    if (result.status === "fulfilled") return [];
    const installer = installers[index];
    return [
      {
        installerId: installer.id,
        installerEmail: installer.email,
        error: errorMessage(result.reason),
      },
    ];
  });

  if (failed.length > 0) {
    console.error("[installer-lead] SMTP send failures", failed);
    throw new Error(
      `${failed.length} af ${installers.length} lead-mails kunne ikke sendes: ${failed.map((failure) => `${failure.installerEmail}: ${failure.error}`).join("; ")}`,
    );
  }

  try {
    await transporter.sendMail({
      from,
      to: input.email,
      subject: "Vi har modtaget din forespørgsel om varmepumpe",
      text: customerConfirmationText(input, installers.length),
      html: customerConfirmationHtml(input, installers.length),
    });
  } catch (error) {
    const message = errorMessage(error);
    console.error("[installer-lead] Customer confirmation email failed", {
      customerEmail: input.email,
      error: message,
    });
    throw new Error(
      `Kundebekræftelsen kunne ikke sendes til ${input.email}: ${message}`,
    );
  }

  return {
    installerEmailCount: results.length,
    customerEmailCount: 1,
    totalEmailCount: results.length + 1,
  };
}

export async function sendCompanyClaimInviteEmail(
  input: CompanyClaimInviteInput,
) {
  const transporter = getTransporter();
  const from =
    env("SMTP_FROM") || "Indeklima Guiden <leads@indeklimaguiden.dk>";

  await transporter.sendMail({
    from,
    to: input.email,
    bcc: "info@indeklimaguiden.dk",
    subject: "Jeres virksomhed er nu med på Indeklima Guiden",
    text: claimInviteText(input),
    html: claimInviteHtml(input),
  });
}

export async function sendCompanyLoginCodeEmail(input: CompanyLoginCodeInput) {
  const transporter = getTransporter();
  const from =
    env("SMTP_FROM") || "Indeklima Guiden <leads@indeklimaguiden.dk>";
  const timestamp = formatDanishTimeWithSeconds(new Date());

  await transporter.sendMail({
    from,
    to: input.email,
    subject: `Din login-kode til Indeklima Guiden - ${timestamp}`,
    text: loginCodeText(input),
    html: loginCodeHtml(input),
  });
}

export async function sendCompanyClaimCompletedEmail(
  input: CompanyClaimCompletedInput,
) {
  const transporter = getTransporter();
  const from =
    env("SMTP_FROM") || "Indeklima Guiden <leads@indeklimaguiden.dk>";

  await transporter.sendMail({
    from,
    to: input.email,
    subject: `Jeres virksomhedsside er claimet: ${input.companyName}`,
    text: claimCompletedText(input),
    html: claimCompletedHtml(input),
  });
}
