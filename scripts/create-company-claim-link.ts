import 'dotenv/config';
import { createCompanyClaimToken } from '../src/lib/company-auth';
import { sendCompanyClaimInviteEmail } from '../src/lib/email';
import { getPrisma } from '../src/lib/prisma';

function argValue(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function siteUrl() {
  return process.env.SITE_URL || process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
}

async function main() {
  const companyId = argValue('--company-id');
  const emailArg = argValue('--email');
  const shouldSend = process.argv.includes('--send');

  if (!companyId) {
    throw new Error('Usage: tsx scripts/create-company-claim-link.ts --company-id <id> [--email firma@example.dk] [--send]');
  }

  const prisma = getPrisma();
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { location: true },
  });

  if (!company) throw new Error(`Company not found: ${companyId}`);

  const email = emailArg || company.email;
  if (!email) throw new Error(`Company ${company.name} does not have an email. Pass --email.`);

  const { token, claimToken } = await createCompanyClaimToken(company.id, email);
  const claimUrl = new URL(`/claim/${token}/`, siteUrl()).toString();

  if (shouldSend) {
    await sendCompanyClaimInviteEmail({
      companyName: company.name,
      email: claimToken.email,
      claimUrl,
      expiresAt: claimToken.expiresAt,
    });
  }

  console.info(JSON.stringify({
    companyId: company.id,
    companyName: company.name,
    email: claimToken.email,
    claimUrl,
    expiresAt: claimToken.expiresAt.toISOString(),
    emailSent: shouldSend,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
