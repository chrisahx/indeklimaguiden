import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client/client';

let prisma: PrismaClient | undefined;

export function getPrisma() {
  const connectionString = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured. Add it to .env for local SSR database pages.');
  }

  if (!prisma) {
    const adapter = new PrismaPg({ connectionString });
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
}
