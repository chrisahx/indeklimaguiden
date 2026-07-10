import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import {
  sendCompanyClaimCompletedEmail,
  sendCompanyLoginCodeEmail,
  sendInstallerLeadEmails,
} from '../lib/email';
import {
  completeCompanyClaim,
  createMagicLoginCode,
  createSession,
  destroyCompanySession,
  LOGIN_CODE_MINUTES,
  normalizeCompanyEmail,
  setCompanySessionCookie,
  verifyMagicLoginCode,
} from '../lib/company-auth';
import { findNearestInstallers, storeInstallerLead } from '../lib/installer-leads';

const requiredString = z.string().trim().min(1, 'Feltet skal udfyldes.');

export const server = {
  submitInstallerLead: defineAction({
    accept: 'form',
    input: z.object({
      fullName: requiredString.min(2, 'Skriv venligst dit fulde navn.'),
      streetAddress: requiredString.min(4, 'Skriv venligst vejnavn og husnummer.'),
      postalCode: requiredString.regex(/^\d{4}$/, 'Skriv venligst et gyldigt dansk postnummer på 4 cifre.'),
      city: requiredString.min(2, 'Skriv venligst by.'),
      email: z.string().trim().email('Skriv venligst en gyldig e-mailadresse.'),
      phone: requiredString.min(8, 'Skriv venligst et gyldigt telefonnummer.'),
      needType: z.enum(['new_heat_pump', 'existing_heat_pump', 'service_or_error', 'unsure']),
      message: requiredString.min(12, 'Beskriv kort, hvad du har brug for hjælp til.'),
      consent: z.coerce.boolean().refine(Boolean, 'Du skal acceptere, at vi må dele forespørgslen med relevante installatører.'),
    }),
    handler: async ({ consent: _consent, ...input }) => {
      const leadInput = input;
      const installers = await findNearestInstallers(input.postalCode);

      if (installers.length === 0) {
        console.error('[installer-lead] No installers found', { postalCode: input.postalCode, email: input.email });
        throw new ActionError({
          code: 'NOT_FOUND',
          message: 'Vi kunne ikke finde relevante installatører i databasen lige nu. Prøv igen senere.',
        });
      }

      try {
        const emailResult = await sendInstallerLeadEmails(leadInput, installers);
        const lead = await storeInstallerLead(leadInput, installers, 'sent');
        console.info('[installer-lead] Lead submitted', {
          leadId: lead.id,
          postalCode: input.postalCode,
          emailResult,
          installers: installers.map((installer) => ({ id: installer.id, email: installer.email, verified: installer.isVerified })),
        });

        return { leadId: lead.id, installerCount: installers.length, emailStatus: 'sent' };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ukendt fejl ved afsendelse af lead-mail.';
        const lead = await storeInstallerLead(leadInput, installers, 'failed', message);
        console.error('[installer-lead] Lead email failed', {
          leadId: lead.id,
          postalCode: input.postalCode,
          error: message,
          installers: installers.map((installer) => ({ id: installer.id, email: installer.email, verified: installer.isVerified })),
        });

        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Din forespørgsel blev registreret, men vi kunne ikke sende den videre lige nu. Vi har logget fejlen.',
        });
      }
    },
  }),
  completeCompanyClaim: defineAction({
    accept: 'form',
    input: z.object({
      token: requiredString,
      claimantName: z.string().trim().optional(),
      termsAccepted: z.coerce.boolean().refine(Boolean, 'Du skal acceptere vilkarene for at claim virksomheden.'),
      marketingConsent: z.coerce.boolean().optional().default(false),
    }),
    handler: async (input, context) => {
      let result: Awaited<ReturnType<typeof completeCompanyClaim>>;

      try {
        result = await completeCompanyClaim(input);
        const { token } = await createSession(result.user.id);
        setCompanySessionCookie(context.cookies, token);
      } catch (error) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: error instanceof Error ? error.message : 'Claim kunne ikke gennemfores.',
        });
      }

      const dashboardUrl = new URL('/company/dashboard/', context.url).toString();

      try {
        await sendCompanyClaimCompletedEmail({
          companyName: result.company.name,
          email: result.user.email,
          dashboardUrl,
        });
      } catch (error) {
        console.error('[company-claim] Claim completed email failed', {
          companyId: result.company.id,
          email: result.user.email,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return {
        companyName: result.company.name,
        dashboardUrl,
      };
    },
  }),
  requestCompanyLoginCode: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().trim().email('Skriv venligst en gyldig e-mailadresse.'),
    }),
    handler: async (input) => {
      const loginCode = await createMagicLoginCode(input.email);

      if (loginCode) {
        const company = loginCode.user.claimedCompanies[0];
        await sendCompanyLoginCodeEmail({
          companyName: company?.name ?? 'jeres virksomhed',
          email: loginCode.email,
          code: loginCode.code,
          expiresInMinutes: LOGIN_CODE_MINUTES,
        });
      }

      return { email: normalizeCompanyEmail(input.email) };
    },
  }),
  verifyCompanyLoginCode: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().trim().email('Skriv venligst en gyldig e-mailadresse.'),
      code: z.string().trim().regex(/^\d{6}$/, 'Koden skal bestå af 6 cifre.'),
    }),
    handler: async (input, context) => {
      const user = await verifyMagicLoginCode(input.email, input.code);

      if (!user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Koden er ugyldig eller udlobet. Bestil en ny kode og prov igen.',
        });
      }

      const { token } = await createSession(user.id);
      setCompanySessionCookie(context.cookies, token);

      return { dashboardUrl: new URL('/company/dashboard/', context.url).toString() };
    },
  }),
  logoutCompanyUser: defineAction({
    accept: 'form',
    input: z.object({}),
    handler: async (_input, context) => {
      await destroyCompanySession(context.cookies);
      return { loginUrl: '/company/login/' };
    },
  }),
};
