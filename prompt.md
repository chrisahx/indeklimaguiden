# AI Agent Prompt: Build “Lad os kontakte 3 kloakmestre for dig”

You are working in a project that is very similar to `indeklimaguiden`, but this project is for kloakmestre in Denmark. Implement the full lead-generation system equivalent to Indeklima Guiden’s “Lad os kontakte 3 installatører for dig”, adapted to kloakmestre.

Do not only add a button. Build the entire system end to end:

- Landing page CTA button/section.
- A dedicated form page.
- Server action/form handler.
- Kloakmester matching logic.
- Database persistence for submitted leads.
- SMTP setup with Nodemailer.
- Lead emails to up to 3 kloakmestre.
- Confirmation email to the customer.
- Email HTML/text designs matching the existing email layout from Indeklima Guiden, but using this project’s own colors/design tokens.
- Validation, success/error states, logging, and build verification.

## First Step

Inspect the current project before editing. Identify the framework, routing, layout components, global CSS variables, database/client setup, company/kloakmester data model, existing actions/API route conventions, and any existing email utilities.

Look specifically for equivalents of:

- `src/pages/index.astro`
- `src/components/*FinderSection.astro` or CTA components
- `src/actions/index.ts`
- `src/lib/email.ts`
- `src/lib/*leads.ts`
- Prisma schema/migrations or any other database schema
- Existing company/kloakmester directory pages
- Global CSS variables in `src/styles/global.css`
- `.env.example`, README, or deployment docs

Preserve the project’s established naming/style. If the project uses Astro actions, use Astro actions. If it uses API routes instead, use the project’s existing server-side form convention. Keep the implementation minimal but complete.

## Feature Goal

Users should be able to click a CTA on the landing page named:

`Lad os kontakte 3 kloakmestre for dig`

The CTA should lead to a dedicated form page where a Danish homeowner can submit one request. The system should find up to 3 relevant kloakmestre near the submitted postal code, send the request to those kloakmestre by email, send a confirmation email to the customer, and store the lead in the database with selected companies and email status.

## Landing Page CTA

Add or update the landing page CTA so the user can choose between browsing the directory and letting the site contact 3 kloakmestre.

Use project-specific routes, but the expected route shape should be similar to:

- Directory: `/kloakmester/` or the existing kloakmester directory route.
- Lead form: `/kontakt-om-kloakmester/`.

Suggested CTA copy:

- Section pill: `Få professionel hjælp`
- Title: `Find kloakmester nær dig`
- Description: `Søger du efter en kloakmester nær dig? Start med vores landsdækkende oversigt over lokale kloakmestre, CVR, kontaktoplysninger og offentligt indsamlede anmeldelser. Vil du gøre det nemmere, kan du udfylde én formular, så sender vi din forespørgsel til op til 3 relevante kloakmestre tæt på dig.`
- Primary button: `Find kloakmester nær mig`
- Secondary button: `Lad os kontakte 3 kloakmestre for dig`

If the project already has a reusable finder/CTA component, reuse it. If not, create a small reusable component rather than duplicating a large block directly in the page.

The CTA should be responsive and match the site’s visual language.

## Dedicated Form Page

Create a page equivalent to Indeklima Guiden’s `kontakt-om-varmepumpe-installatoer.astro`, adapted to kloakmestre.

Suggested route:

`/kontakt-om-kloakmester/`

The page must be server-rendered if using Astro actions:

```ts
export const prerender = false;
```

Suggested SEO metadata:

- Title: `Få 3 lokale kloakmestre til at kontakte dig`
- Description: `Udfyld én formular og lad os matche dig med op til 3 relevante kloakmestre nær dit postnummer. Gratis og uforpligtende.`
- Path: `/kontakt-om-kloakmester/`

Suggested breadcrumb items:

- `Forside` -> `/`
- `Kloakmestre` -> existing directory route, for example `/kloakmester/`
- `Kontakt 3 kloakmestre` -> `/kontakt-om-kloakmester/`

Suggested hero copy:

- Pill: `Gratis og uforpligtende`
- H1: `Få kontakt til 3 kloakmestre nær dig`
- Body: `Fortæl kort hvad du har brug for, så matcher vi din forespørgsel med op til 3 relevante kloakmestre i dit område. Vi prioriterer verificerede virksomheder og vælger nærliggende postnumre, hvis der ikke er nok helt lokalt.`

Suggested trust grid:

- `1 formular` / `Du slipper for at kontakte flere virksomheder manuelt.`
- `Lokalt match` / `Kloakmestre vælges ud fra postnummer og nærhed.`
- `Relevant opgave` / `De får din beskrivelse, så dialogen starter konkret.`

Suggested form card heading:

- Eyebrow: `Start her`
- H2: `Beskriv din kloakopgave`
- Text: `Felterne bruges kun til at matche og sende din forespørgsel videre til relevante kloakmestre.`

## Form Fields

Implement these fields with server-side validation and visible field errors:

- `fullName`, text, autocomplete `name`, required, minimum 2 characters.
- `streetAddress`, text, autocomplete `street-address`, required, minimum 4 characters.
- `postalCode`, text, autocomplete `postal-code`, inputmode `numeric`, pattern `[0-9]{4}`, maxlength `4`, required.
- `city`, text, autocomplete `address-level2`, required, minimum 2 characters.
- `email`, email, autocomplete `email`, required.
- `phone`, tel, autocomplete `tel`, inputmode `tel`, required, minimum 8 characters.
- `needType`, select, required.
- `message`, textarea, required, minimum 12 characters.
- `consent`, checkbox, required.

Suggested `needType` enum values and labels:

- `blocked_drain`: `Stoppet afløb eller kloak`
- `sewer_damage`: `Skade, brud eller rotter i kloakken`
- `inspection_or_tv`: `TV-inspektion eller fejlsøgning`
- `new_installation`: `Ny kloak, omfangsdræn eller regnvandsløsning`
- `service_or_maintenance`: `Service, vedligehold eller slamsugning`
- `unsure`: `Jeg er ikke sikker endnu`

Suggested textarea placeholder:

`Skriv fx hvad problemet er, hvor længe det har stået på, om det haster, boligtype, adgangsforhold eller om du allerede har fået lavet TV-inspektion.`

Suggested consent text:

`Jeg accepterer, at [SITE_NAME] må dele min forespørgsel med op til 3 relevante kloakmestre.`

On success, show:

`Tak. Din forespørgsel er sendt.`

And:

`Vi har sendt den videre til {count} relevante kloakmester/kloakmestre.`

On general error, show a visible alert with the action error message.

## FAQ On Form Page

Add FAQ content and JSON-LD if the project already supports those components/utilities.

Suggested FAQ:

- Q: `Hvordan finder I kloakmestre nær mig?`
- A: `Vi bruger det postnummer, du indtaster i formularen, og matcher dig med op til 3 virksomheder i databasen. Kloakmestre i samme postnummer prioriteres først, derefter nærliggende postnumre.`

- Q: `Koster det noget at sende en forespørgsel?`
- A: `Nej. Det er gratis og uforpligtende at sende en forespørgsel.`

- Q: `Sender I mine oplysninger til alle kloakmestre?`
- A: `Nej. Din forespørgsel sendes kun til op til 3 relevante kloakmestre, som matcher dit område bedst muligt.`

- Q: `Kan jeg bruge formularen ved akutte kloakproblemer?`
- A: `Ja, men hvis der er akut oversvømmelse, sundhedsfare eller risiko for større skade, bør du også kontakte en akut kloakservice direkte.`

## Process Section

Add a small “Sådan fungerer det” section:

- Pill: `Sådan fungerer det`
- H2: `Fra formular til relevante kloakmestre`
- Text: `Processen er bygget til at gøre det nemmere at finde kloakhjælp uden at kontakte mange virksomheder manuelt.`

Cards:

- `01` / `Du beskriver opgaven` / `Fortæl om du har stoppet afløb, kloakskade, TV-inspektion, ny kloak eller anden kloakhjælp.`
- `02` / `Vi matcher lokalt` / `Systemet finder op til 3 kloakmestre tæt på dit postnummer og prioriterer verificerede virksomheder.`
- `03` / `Kloakmestre kontakter dig` / `De modtager dine oplysninger og kan kontakte dig direkte med relevante spørgsmål eller tilbud.`

## Server Action / Handler

If using Astro actions, add an action similar to this shape:

```ts
submitKloakmesterLead: defineAction({
  accept: 'form',
  input: z.object({
    fullName: requiredString.min(2, 'Skriv venligst dit fulde navn.'),
    streetAddress: requiredString.min(4, 'Skriv venligst vejnavn og husnummer.'),
    postalCode: requiredString.regex(/^\d{4}$/, 'Skriv venligst et gyldigt dansk postnummer på 4 cifre.'),
    city: requiredString.min(2, 'Skriv venligst by.'),
    email: z.string().trim().email('Skriv venligst en gyldig e-mailadresse.'),
    phone: requiredString.min(8, 'Skriv venligst et gyldigt telefonnummer.'),
    needType: z.enum(['blocked_drain', 'sewer_damage', 'inspection_or_tv', 'new_installation', 'service_or_maintenance', 'unsure']),
    message: requiredString.min(12, 'Beskriv kort, hvad du har brug for hjælp til.'),
    consent: z.coerce.boolean().refine(Boolean, 'Du skal acceptere, at vi må dele forespørgslen med relevante kloakmestre.'),
  }),
  handler: async ({ consent: _consent, ...input }) => {
    const companies = await findNearestKloakmestre(input.postalCode);

    if (companies.length === 0) {
      console.error('[kloakmester-lead] No companies found', { postalCode: input.postalCode, email: input.email });
      throw new ActionError({
        code: 'NOT_FOUND',
        message: 'Vi kunne ikke finde relevante kloakmestre i databasen lige nu. Prøv igen senere.',
      });
    }

    try {
      const emailResult = await sendKloakmesterLeadEmails(input, companies);
      const lead = await storeKloakmesterLead(input, companies, 'sent');
      console.info('[kloakmester-lead] Lead submitted', {
        leadId: lead.id,
        postalCode: input.postalCode,
        emailResult,
        companies: companies.map((company) => ({ id: company.id, email: company.email, verified: company.isVerified })),
      });

      return { leadId: lead.id, kloakmesterCount: companies.length, emailStatus: 'sent' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ukendt fejl ved afsendelse af lead-mail.';
      const lead = await storeKloakmesterLead(input, companies, 'failed', message);
      console.error('[kloakmester-lead] Lead email failed', {
        leadId: lead.id,
        postalCode: input.postalCode,
        error: message,
        companies: companies.map((company) => ({ id: company.id, email: company.email, verified: company.isVerified })),
      });

      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Din forespørgsel blev registreret, men vi kunne ikke sende den videre lige nu. Vi har logget fejlen.',
      });
    }
  },
})
```

Adapt function names to the project’s conventions. If the project already has a generic company lead action, reuse/extend it cleanly.

## Matching Logic

Create a lead utility equivalent to `src/lib/installer-leads.ts`, but named for kloakmestre, for example:

`src/lib/kloakmester-leads.ts`

Interfaces:

```ts
export interface KloakmesterLeadInput {
  fullName: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  email: string;
  phone: string;
  needType: string;
  message: string;
}

export interface MatchedKloakmester {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isVerified: boolean;
  postalCode: string;
  city: string | null;
  postalDistance: number;
}
```

Implement:

- `findNearestKloakmestre(postalCode: string)`
- `storeKloakmesterLead(input, companies, emailStatus, errorMessage?)`

Matching rules:

- Parse submitted postal code as integer.
- Return an empty array if invalid.
- Query companies/kloakmestre with non-empty email.
- Join company location/address table if needed.
- Require valid 4-digit Danish postal code in the location.
- Exclude rejected/inactive companies according to the project’s existing status field.
- Sort by nearest postal code distance ascending.
- Prefer verified companies among equally near companies.
- Use stable ordering by company name and id.
- Limit to 3.

Use the project’s actual table/model names. In a Prisma/Postgres setup similar to Indeklima Guiden, the raw SQL looked like:

```sql
select
  companies.id,
  companies.name,
  trim(companies.email) as email,
  companies.phone,
  companies.is_verified,
  trim(company_locations.postal_code) as postal_code,
  nullif(trim(company_locations.city), '') as city,
  abs(trim(company_locations.postal_code)::int - $postalCodeNumber)::int as postal_distance
from companies
join company_locations on company_locations.company_id = companies.id
where nullif(trim(companies.email), '') is not null
  and trim(company_locations.postal_code) ~ '^[0-9]{4}$'
  and companies.status <> 'rejected'
order by
  postal_distance asc,
  companies.is_verified desc,
  companies.name asc,
  companies.id asc
limit 3
```

If the other project has lead balancing or previous-lead tracking, avoid always selecting the same 3 companies by adding a minimal fair tie-breaker only if it fits the current data model. Do not over-engineer this unless there is already support for it.

## Database Persistence

Add a lead table/model if one does not already exist.

Equivalent Prisma model shape:

```prisma
model KloakmesterLead {
  id                String   @id @default(cuid())
  fullName          String
  streetAddress     String
  postalCode        String
  city              String
  email             String
  phone             String
  needType          String
  message           String
  selectedCompanies Json
  emailStatus       String
  errorMessage      String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("kloakmester_leads")
}
```

If the project already uses `InstallerLead`, `CompanyLead`, or another generic lead table, adapt that instead of introducing a duplicate model.

`selectedCompanies` should store exactly what was selected at submission time:

```ts
companies.map((company) => ({
  id: company.id,
  name: company.name,
  email: company.email,
  phone: company.phone,
  isVerified: company.isVerified,
  postalCode: company.postalCode,
  city: company.city,
  postalDistance: company.postalDistance,
  isSamePostalCode: company.postalDistance === 0,
}))
```

Run the project’s normal Prisma migration/generate workflow if this project uses Prisma. Do not hand-edit generated Prisma client files.

## SMTP And Nodemailer

Add `nodemailer` and `@types/nodemailer` if missing.

Expected dependencies:

```json
"nodemailer": "^9.0.3"
```

Expected dev dependency:

```json
"@types/nodemailer": "^8.0.1"
```

Create or extend `src/lib/email.ts`.

Environment variables:

- `SMTP_HOST`, required.
- `SMTP_PORT`, optional, default `587`.
- `SMTP_USER`, optional unless SMTP provider requires auth.
- `SMTP_PASS`, optional unless SMTP provider requires auth.
- `SMTP_SECURE`, optional boolean, true for implicit TLS/465, false for STARTTLS/587.
- `SMTP_FROM`, optional, default should use this project’s brand and lead sender address.

Use helpers:

```ts
function env(name: string) {
  return import.meta.env?.[name] ?? process.env[name];
}

function envBoolean(name: string, fallback = false) {
  const value = env(name);
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
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
```

Add `.env.example` entries if the project has an example env file.

## Email Design Requirements

The email design should match the Indeklima Guiden lead email structure exactly in layout quality and hierarchy, but replace all brand text and inline colors with this project’s own colors.

Important: emails must use inline CSS and table layout for compatibility.

Build both plain text and HTML versions for:

- Email to each selected kloakmester.
- Confirmation email to the customer.

Use the current project’s global color variables as the source of truth. Since email HTML cannot use CSS variables reliably, copy the actual hex values from the project’s design tokens into constants at the top of the email file, for example:

```ts
const BRAND_NAME = '[PROJECT BRAND NAME]';
const DEFAULT_FROM = `${BRAND_NAME} <leads@[domain].dk>`;

const EMAIL_COLORS = {
  background: '#...',
  surface: '#ffffff',
  surfaceStrong: '#...',
  primary: '#...',
  primarySoft: '#...',
  accent: '#...',
  accentDark: '#...',
  accentSoft: '#...',
  success: '#...',
  successDark: '#...',
  successSoft: '#...',
  text: '#...',
  muted: '#...',
  border: '#...',
};
```

Do not keep Indeklima Guiden’s blue/green colors unless the kloakmester project actually uses those colors.

### Shared Email Helpers

Implement:

```ts
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
```

### Need Type Labels

Implement:

```ts
function needTypeLabel(value: string) {
  const labels: Record<string, string> = {
    blocked_drain: 'Stoppet afløb eller kloak',
    sewer_damage: 'Skade, brud eller rotter i kloakken',
    inspection_or_tv: 'TV-inspektion eller fejlsøgning',
    new_installation: 'Ny kloak, omfangsdræn eller regnvandsløsning',
    service_or_maintenance: 'Service, vedligehold eller slamsugning',
    unsure: 'Ikke sikker endnu',
  };

  return labels[value] ?? value;
}
```

## Email To Kloakmestre: Plain Text

Implement text equivalent to:

```txt
Ny kundeforespørgsel via [SITE_NAME]

Hej [COMPANY_NAME],

I modtager denne forespørgsel, fordi kunden har bedt [SITE_NAME] om at finde op til 3 relevante kloakmestre i nærheden. Kunden ønsker at blive kontaktet direkte om opgaven.

========================================
KUNDEOPLYSNINGER
========================================

Navn
[FULL_NAME]

Adresse
[STREET_ADDRESS]
[POSTAL_CODE] [CITY]

E-mail
[EMAIL]

Telefon
[PHONE]

========================================
OPGAVE
========================================

Hvad kunden søger hjælp til
[NEED_TYPE_LABEL]

Kundens beskrivelse
[MESSAGE]

========================================
NÆSTE SKRIDT
========================================

Kontakt kunden direkte på telefon eller e-mail, hvis opgaven er relevant for jer. Kunden forventer ikke et bindende tilbud med det samme, men en indledende dialog om behov, løsning og eventuel besigtigelse.

Hvis I ikke kan hjælpe med opgaven, kan I blot se bort fra forespørgslen.

Venlig hilsen
[SITE_NAME]
```

## Email To Kloakmestre: HTML

Use this structure, adapted to project colors and brand:

- `<!doctype html>` with `lang="da"`.
- Body background = project background color.
- Outer presentation table width 100%, padded.
- Inner table max-width around `680px`, white/surface background, border, `border-radius:22px`, subtle box shadow using project primary RGB if possible.
- Header row with gradient from project primary to project accent/dark accent.
- Brand pill with `[SITE_NAME]`.
- H1: `Ny kundeforespørgsel om kloakarbejde`
- Intro: `Hej [COMPANY_NAME], kunden har bedt os finde op til 3 relevante kloakmestre og ønsker at blive kontaktet direkte.`
- Intro paragraph below header explaining why they receive it.
- Card 1: `Kundeoplysninger`, with rows for name, address, email mailto link, phone tel link.
- Card 2: `Opgave`, with need type pill and message callout.
- Dark/primary next-step box with title `Næste skridt`, explanatory text, `Ring til kunden` button and `Send e-mail` button.
- Footer line: `Hvis I ikke kan hjælpe med opgaven, kan I blot se bort fra forespørgslen.`
- Signoff: `Venlig hilsen` / `[SITE_NAME]`.

Escape all user and company content with `escapeHtml`. Convert message line breaks with `multilineHtml`. Use `encodeURIComponent(input.email)` for `mailto:` and normalize phone for `tel:` with `input.phone.replace(/[^+\d]/g, '')`.

## Customer Confirmation: Plain Text

Implement text equivalent to:

```txt
Tak for din forespørgsel til [SITE_NAME]

Hej [FULL_NAME],

Vi har modtaget din forespørgsel om kloakarbejde og sender den videre til [COUNT] relevante kloakmestre tæt på dig.

Kloakmestrene får dine kontaktoplysninger og din beskrivelse af opgaven, så de kan kontakte dig direkte om næste skridt.

========================================
DIN FORESPØRGSEL
========================================

Adresse
[STREET_ADDRESS]
[POSTAL_CODE] [CITY]

Hvad du søger hjælp til
[NEED_TYPE_LABEL]

Din beskrivelse
[MESSAGE]

========================================
HVAD SKER DER NU?
========================================

1. Vi sender din forespørgsel til op til 3 relevante kloakmestre i nærheden.
2. Kloakmestrene vurderer opgaven ud fra din beskrivelse.
3. Relevante kloakmestre kontakter dig direkte på telefon eller e-mail.

Du er ikke forpligtet til at acceptere et tilbud.

Venlig hilsen
[SITE_NAME]
```

## Customer Confirmation: HTML

Use the same table-based email shell/design as the kloakmester email.

Content requirements:

- Title: `Vi har modtaget din forespørgsel`
- Header intro: `Hej [FULL_NAME], vi sender din forespørgsel videre til [COUNT] relevante kloakmestre tæt på dig.`
- Paragraph: `Kloakmestrene får dine kontaktoplysninger og din beskrivelse af opgaven, så de kan kontakte dig direkte om næste skridt. Du er ikke forpligtet til at acceptere et tilbud.`
- Card: `Din forespørgsel`, with address and need pill.
- Card: `Din beskrivelse`, with message callout.
- Primary box: `Hvad sker der nu?`, ordered list with the three steps above.
- Footer note: `Hvis du opdager en fejl i oplysningerne, kan du indsende formularen igen med de korrekte oplysninger.`
- Signoff with brand name.

## Email Sending Function

Implement a function equivalent to:

```ts
export async function sendKloakmesterLeadEmails(
  input: KloakmesterLeadInput,
  companies: MatchedKloakmester[],
) {
  const transporter = getTransporter();
  const from = env('SMTP_FROM') || DEFAULT_FROM;

  const results = await Promise.allSettled(
    companies.map((company) =>
      transporter.sendMail({
        from,
        to: company.email,
        replyTo: input.email,
        subject: `Ny kundeforespørgsel om kloakarbejde fra ${input.postalCode} til ${company.name}`,
        text: kloakmesterLeadEmailText(input, company),
        html: kloakmesterLeadEmailHtml(input, company),
      }),
    ),
  );

  const failed = results.flatMap((result, index) => {
    if (result.status === 'fulfilled') return [];
    const company = companies[index];
    return [{ companyId: company.id, companyEmail: company.email, error: errorMessage(result.reason) }];
  });

  if (failed.length > 0) {
    console.error('[kloakmester-lead] SMTP send failures', failed);
    throw new Error(
      `${failed.length} af ${companies.length} lead-mails kunne ikke sendes: ${failed.map((failure) => `${failure.companyEmail}: ${failure.error}`).join('; ')}`,
    );
  }

  try {
    await transporter.sendMail({
      from,
      to: input.email,
      subject: 'Vi har modtaget din forespørgsel om kloakarbejde',
      text: customerConfirmationText(input, companies.length),
      html: customerConfirmationHtml(input, companies.length),
    });
  } catch (error) {
    const message = errorMessage(error);
    console.error('[kloakmester-lead] Customer confirmation email failed', {
      customerEmail: input.email,
      error: message,
    });
    throw new Error(`Kundebekræftelsen kunne ikke sendes til ${input.email}: ${message}`);
  }

  return {
    kloakmesterEmailCount: results.length,
    customerEmailCount: 1,
    totalEmailCount: results.length + 1,
  };
}
```

Behavior requirement: if any company lead email fails, throw and store lead as failed. If company emails succeed but customer confirmation fails, throw and store lead as failed. This matches the reference behavior.

## Brand Replacement Rules

Replace all Indeklima-specific terms:

- `Indeklima Guiden` -> this project’s brand name.
- `varmepumpe-installatør/installatører` -> `kloakmester/kloakmestre`.
- `varmepumpe` -> `kloakarbejde`, `kloakopgave`, or specific problem context.
- `installation/service på varmepumpe` -> `stoppet afløb`, `kloakskade`, `TV-inspektion`, `ny kloak`, `omfangsdræn`, `regnvandsløsning`, `service/vedligehold`.
- Routes should use kloakmester routes, not varmepumpe routes.
- CSS/email colors should use this project’s tokens, not Indeklima Guiden colors.

## Accessibility And UX

- Use semantic labels for every field.
- Keep visible validation errors near fields.
- Use `role="status"` for success message.
- Use `role="alert"` for general errors.
- Keep the submit button text exactly: `Lad os kontakte 3 kloakmestre for dig`.
- Make the page responsive on mobile and desktop.
- Avoid client-side-only submission unless the project already does that. Server-side POST is preferred.

## Security And Privacy

- Escape all HTML in emails.
- Do not expose SMTP credentials client-side.
- Do not include private customer data in logs beyond what is already necessary; logging postal code and email is acceptable if consistent with the project, but avoid logging full address/message unless needed.
- Only send customer data to selected companies after explicit consent.
- Do not send the request to more than 3 companies.

## Documentation

Update `.env.example` or README with SMTP configuration if not already documented:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
SMTP_FROM="[SITE_NAME] <leads@[domain].dk>"
```

Mention that the form requires SMTP to be configured in production.

## Verification

After implementation:

- Run typecheck/build using the project’s existing commands.
- Run Prisma generate/migration commands if schema changed.
- Verify the lead form route renders.
- Verify the landing page has the new CTA.
- Verify the action/handler compiles.
- Verify all imports are valid.
- Verify email functions compile and do not rely on CSS variables inside email HTML.

If SMTP credentials are not available locally, do not fake a successful send. The code should fail with a clear `SMTP_HOST is not configured.` error when submitted without SMTP config. Build/typecheck should still pass.

## Reference Implementation Summary From Indeklima Guiden

Use these reference concepts, not necessarily exact filenames if the target project differs:

- Landing page uses `InstallerFinderSection` with primary directory CTA and secondary lead-form CTA.
- Lead form page posts to `actions.submitInstallerLead` and uses `Astro.getActionResult` plus `isInputError`.
- Lead action validates with `zod`, calls `findNearestInstallers`, sends emails, stores lead with status `sent` or `failed`, and returns `{ leadId, installerCount, emailStatus }`.
- Matching query selects companies with non-empty email, valid postal code, non-rejected status, nearest postal distance, verified first, limit 3.
- Email helper uses Nodemailer with `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `SMTP_FROM`.
- Lead email has a polished table-based HTML layout with brand gradient header, customer details card, task card, and next-step CTA box.
- Customer confirmation email uses the same visual system and explains what happens next.

Implement this fully and keep the changes focused.
