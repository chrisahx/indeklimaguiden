import { Prisma } from '../../prisma/generated/client/client';
import { getPrisma } from './prisma';

export interface InstallerLeadInput {
  fullName: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  email: string;
  phone: string;
  needType: string;
  message: string;
}

export interface MatchedInstaller {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isVerified: boolean;
  postalCode: string;
  city: string | null;
  postalDistance: number;
}

interface InstallerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_verified: boolean;
  postal_code: string;
  city: string | null;
  postal_distance: number;
}

export async function findNearestInstallers(postalCode: string) {
  const postalCodeNumber = Number.parseInt(postalCode, 10);
  if (!Number.isInteger(postalCodeNumber)) return [];

  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<InstallerRow[]>`
    select
      companies.id,
      companies.name,
      trim(companies.email) as email,
      companies.phone,
      companies.is_verified,
      trim(company_locations.postal_code) as postal_code,
      nullif(trim(company_locations.city), '') as city,
      abs(trim(company_locations.postal_code)::int - ${postalCodeNumber})::int as postal_distance
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
  `;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    isVerified: row.is_verified,
    postalCode: row.postal_code,
    city: row.city,
    postalDistance: row.postal_distance,
  }));
}

export async function storeInstallerLead(
  input: InstallerLeadInput,
  installers: MatchedInstaller[],
  emailStatus: 'sent' | 'failed',
  errorMessage?: string,
) {
  const prisma = getPrisma();
  return prisma.installerLead.create({
    data: {
      fullName: input.fullName,
      streetAddress: input.streetAddress,
      postalCode: input.postalCode,
      city: input.city,
      email: input.email,
      phone: input.phone,
      needType: input.needType,
      message: input.message,
      selectedCompanies: installers.map((installer) => ({
        id: installer.id,
        name: installer.name,
        email: installer.email,
        phone: installer.phone,
        isVerified: installer.isVerified,
        postalCode: installer.postalCode,
        city: installer.city,
        postalDistance: installer.postalDistance,
        isSamePostalCode: installer.postalDistance === 0,
      })) as Prisma.InputJsonValue,
      emailStatus,
      errorMessage,
    },
  });
}
