import type { AstroCookies } from 'astro';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { getPrisma } from './prisma';

export const COMPANY_SESSION_COOKIE = 'company_session';
export const COMPANY_TERMS_VERSION = '2026-07-10';
export const CLAIM_TOKEN_DAYS = 30;
export const LOGIN_CODE_MINUTES = 10;
export const LOGIN_CODE_REQUEST_LIMIT = 3;
export const LOGIN_CODE_REQUEST_WINDOW_MINUTES = 10;
export const SESSION_DAYS = 30;
const MAX_LOGIN_ATTEMPTS = 5;

export class LoginCodeRequestLimitError extends Error {
  constructor() {
    super('Login code request limit exceeded.');
    this.name = 'LoginCodeRequestLimitError';
  }
}

export function normalizeCompanyEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashSecret(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function generateClaimToken() {
  return randomBytes(32).toString('base64url');
}

export function generateSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function generateLoginCode() {
  return String(randomInt(100000, 1000000));
}

export function loginCodeHash(email: string, code: string) {
  return hashSecret(`${normalizeCompanyEmail(email)}:${code.trim()}`);
}

export function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export async function createCompanyClaimToken(companyId: string, email: string, now = new Date()) {
  const prisma = getPrisma();
  const token = generateClaimToken();
  const normalizedEmail = normalizeCompanyEmail(email);

  const claimToken = await prisma.companyClaimToken.create({
    data: {
      companyId,
      email: normalizedEmail,
      tokenHash: hashSecret(token),
      expiresAt: addDays(now, CLAIM_TOKEN_DAYS),
    },
    include: {
      company: {
        include: { location: true },
      },
    },
  });

  return { token, claimToken };
}

export async function getValidCompanyClaimToken(token: string) {
  const prisma = getPrisma();
  const tokenHash = hashSecret(token);
  const claimToken = await prisma.companyClaimToken.findUnique({
    where: { tokenHash },
    include: {
      company: {
        include: { location: true },
      },
    },
  });

  if (!claimToken || claimToken.usedAt || claimToken.expiresAt <= new Date()) return null;

  return claimToken;
}

export async function completeCompanyClaim(input: {
  token: string;
  claimantName?: string;
  termsAccepted: boolean;
  marketingConsent: boolean;
}) {
  if (!input.termsAccepted) throw new Error('Du skal acceptere vilkarene for at claim virksomheden.');

  const prisma = getPrisma();
  const tokenHash = hashSecret(input.token);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const claimToken = await tx.companyClaimToken.findUnique({
      where: { tokenHash },
      include: { company: true },
    });

    if (!claimToken || claimToken.usedAt || claimToken.expiresAt <= now) {
      throw new Error('Claim-linket er ugyldigt eller udlobet.');
    }

    if (claimToken.company.isClaimed) {
      throw new Error('Virksomheden er allerede claimet.');
    }

    const user = await tx.user.upsert({
      where: { email: claimToken.email },
      update: { name: input.claimantName?.trim() || undefined },
      create: {
        email: claimToken.email,
        name: input.claimantName?.trim() || undefined,
      },
    });

    const marketingConsentAt = input.marketingConsent ? now : null;

    const claim = await tx.companyClaim.create({
      data: {
        companyId: claimToken.companyId,
        userId: user.id,
        claimantEmail: claimToken.email,
        claimantName: input.claimantName?.trim() || null,
        status: 'approved',
        verificationMethod: 'email_claim_token',
        verificationPayload: { claimTokenId: claimToken.id },
        termsAcceptedAt: now,
        termsAcceptedVersion: COMPANY_TERMS_VERSION,
        marketingConsent: input.marketingConsent,
        marketingConsentAt,
        expiresAt: claimToken.expiresAt,
        decidedAt: now,
        completedAt: now,
      },
    });

    const company = await tx.company.update({
      where: { id: claimToken.companyId },
      data: {
        isClaimed: true,
        claimedByUserId: user.id,
        claimedAt: now,
        claimEmail: claimToken.email,
        termsAcceptedAt: now,
        termsAcceptedVersion: COMPANY_TERMS_VERSION,
        marketingConsent: input.marketingConsent,
        marketingConsentAt,
      },
      include: { location: true },
    });

    await tx.companyClaimToken.update({
      where: { id: claimToken.id },
      data: { usedAt: now },
    });

    return { user, company, claim };
  });
}

export async function createMagicLoginCode(email: string, now = new Date()) {
  const prisma = getPrisma();
  const normalizedEmail = normalizeCompanyEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      claimedCompanies: {
        where: { isClaimed: true },
        take: 1,
      },
    },
  });

  if (!user || user.claimedCompanies.length === 0) return null;

  const requestWindowStart = addMinutes(now, -LOGIN_CODE_REQUEST_WINDOW_MINUTES);
  const recentRequestCount = await prisma.magicLoginCode.count({
    where: {
      email: normalizedEmail,
      createdAt: { gte: requestWindowStart },
    },
  });

  if (recentRequestCount >= LOGIN_CODE_REQUEST_LIMIT) {
    throw new LoginCodeRequestLimitError();
  }

  const code = generateLoginCode();
  await prisma.magicLoginCode.create({
    data: {
      email: normalizedEmail,
      codeHash: loginCodeHash(normalizedEmail, code),
      expiresAt: addMinutes(now, LOGIN_CODE_MINUTES),
    },
  });

  return { code, email: normalizedEmail, user };
}

export async function verifyMagicLoginCode(email: string, code: string) {
  const prisma = getPrisma();
  const normalizedEmail = normalizeCompanyEmail(email);
  const loginCode = await prisma.magicLoginCode.findFirst({
    where: {
      email: normalizedEmail,
      usedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!loginCode || loginCode.expiresAt <= new Date() || loginCode.attemptCount >= MAX_LOGIN_ATTEMPTS) {
    return null;
  }

  const expectedHash = loginCodeHash(normalizedEmail, code);
  const isValid = constantTimeEquals(loginCode.codeHash, expectedHash);

  if (!isValid) {
    await prisma.magicLoginCode.update({
      where: { id: loginCode.id },
      data: { attemptCount: { increment: 1 } },
    });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      claimedCompanies: {
        where: { isClaimed: true },
        include: { location: true },
      },
    },
  });

  if (!user || user.claimedCompanies.length === 0) return null;

  await prisma.magicLoginCode.update({
    where: { id: loginCode.id },
    data: { usedAt: new Date() },
  });

  return user;
}

export async function createSession(userId: string) {
  const prisma = getPrisma();
  const token = generateSessionToken();
  const session = await prisma.userSession.create({
    data: {
      userId,
      tokenHash: hashSecret(token),
      expiresAt: addDays(new Date(), SESSION_DAYS),
    },
  });

  return { token, session };
}

export function setCompanySessionCookie(cookies: AstroCookies, token: string) {
  cookies.set(COMPANY_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export function clearCompanySessionCookie(cookies: AstroCookies) {
  cookies.delete(COMPANY_SESSION_COOKIE, { path: '/' });
}

export async function getCompanySession(cookies: AstroCookies) {
  const token = cookies.get(COMPANY_SESSION_COOKIE)?.value;
  if (!token) return null;

  const prisma = getPrisma();
  const tokenHash = hashSecret(token);
  const session = await prisma.userSession.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          claimedCompanies: {
            where: { isClaimed: true },
            include: { location: true },
            orderBy: { name: 'asc' },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.userSession.delete({ where: { id: session.id } });
    clearCompanySessionCookie(cookies);
    return null;
  }

  return session;
}

export async function destroyCompanySession(cookies: AstroCookies) {
  const token = cookies.get(COMPANY_SESSION_COOKIE)?.value;
  if (token) {
    const prisma = getPrisma();
    await prisma.userSession.deleteMany({ where: { tokenHash: hashSecret(token) } });
  }

  clearCompanySessionCookie(cookies);
}
