import 'dotenv/config';
import { createCompanyClaimToken } from '../src/lib/company-auth';
import { sendCompanyClaimInviteEmail } from '../src/lib/email';
import { getPrisma } from '../src/lib/prisma';

function argValue(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function usage() {
  return 'Usage: tsx scripts/create-company-claim-link.ts [--company-id <id> | --batch <count>] [--email firma@example.dk] [--database <connection-string>] [--site-url <url>] [--send]';
}

function siteUrl(siteUrlArg?: string) {
  return siteUrlArg || process.env.SITE_URL || process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
}

function parseBatchCount(value: string | undefined) {
  if (!value) return undefined;

  const count = Number(value);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('--batch must be a positive integer.');
  }

  return count;
}

async function main() {
  const companyId = argValue('--company-id');
  const emailArg = argValue('--email');
  const databaseUrl = argValue('--database');
  const siteUrlArg = argValue('--site-url');
  const batchCount = parseBatchCount(argValue('--batch'));
  const shouldSend = process.argv.includes('--send');

  if (!companyId && !batchCount) {
    throw new Error(usage());
  }

  if (companyId && batchCount) {
    throw new Error('Pass either --company-id or --batch, not both.');
  }

  if (batchCount && emailArg) {
    throw new Error('--email cannot be used with --batch. Batch mode uses each company email.');
  }

  if (batchCount && !shouldSend) {
    throw new Error('--batch requires --send so companies are only selected when emails will actually be sent.');
  }

  if (databaseUrl) process.env.DATABASE_URL = databaseUrl;

  const prisma = getPrisma();

  if (batchCount) {
    const companies = await prisma.company.findMany({
      where: {
        claimEmailSent: false,
        email: { not: null },
        isClaimed: false,
      },
      orderBy: { createdAt: 'asc' },
      take: batchCount,
    });

    const sent: Array<{ companyId: string; companyName: string; email: string; claimUrl: string; expiresAt: string }> = [];
    const failed: Array<{ companyId: string; companyName: string; email: string; error: string }> = [];

    for (const company of companies) {
      const email = company.email;
      if (!email) continue;

      try {
        const { token, claimToken } = await createCompanyClaimToken(company.id, email);
        const claimUrl = new URL(`/claim/${token}/`, siteUrl(siteUrlArg)).toString();

        await sendCompanyClaimInviteEmail({
          companyName: company.name,
          email: claimToken.email,
          claimUrl,
          expiresAt: claimToken.expiresAt,
        });

        await prisma.company.update({
          where: { id: company.id },
          data: { claimEmailSent: true },
        });

        sent.push({
          companyId: company.id,
          companyName: company.name,
          email: claimToken.email,
          claimUrl,
          expiresAt: claimToken.expiresAt.toISOString(),
        });
      } catch (error) {
        failed.push({
          companyId: company.id,
          companyName: company.name,
          email,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    console.info(JSON.stringify({
      requested: batchCount,
      attempted: companies.length,
      sentCount: sent.length,
      failedCount: failed.length,
      sent,
      failed,
    }, null, 2));

    if (failed.length > 0) process.exitCode = 1;
    return;
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { location: true },
  });

  if (!company) throw new Error(`Company not found: ${companyId}`);

  const email = emailArg || company.email;
  if (!email) throw new Error(`Company ${company.name} does not have an email. Pass --email.`);

  const { token, claimToken } = await createCompanyClaimToken(company.id, email);
  const claimUrl = new URL(`/claim/${token}/`, siteUrl(siteUrlArg)).toString();

  if (shouldSend) {
    await sendCompanyClaimInviteEmail({
      companyName: company.name,
      email: claimToken.email,
      claimUrl,
      expiresAt: claimToken.expiresAt,
    });

    await prisma.company.update({
      where: { id: company.id },
      data: { claimEmailSent: true },
    });
  }

  console.info(JSON.stringify({
    companyId: company.id,
    companyName: company.name,
    email: claimToken.email,
    claimUrl,
    expiresAt: claimToken.expiresAt.toISOString(),
    emailSent: shouldSend,
    claimEmailSent: shouldSend ? true : company.claimEmailSent,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
