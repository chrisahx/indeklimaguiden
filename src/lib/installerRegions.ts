export interface InstallerRegion {
  name: string;
  slug: string;
  minPostalCode: number;
  maxPostalCode: number;
}

export const installerRegions: InstallerRegion[] = [
  {
    name: 'Hovedstaden og Sjælland',
    slug: 'hovedstaden-og-sjaelland',
    minPostalCode: 1000,
    maxPostalCode: 2999,
  },
  {
    name: 'Fyn og Øerne',
    slug: 'fyn-og-oerne',
    minPostalCode: 3000,
    maxPostalCode: 4999,
  },
  {
    name: 'Sydjylland',
    slug: 'sydjylland',
    minPostalCode: 5000,
    maxPostalCode: 6999,
  },
  {
    name: 'Midtjylland',
    slug: 'midtjylland',
    minPostalCode: 7000,
    maxPostalCode: 7999,
  },
  {
    name: 'Nordjylland',
    slug: 'nordjylland',
    minPostalCode: 8000,
    maxPostalCode: 9999,
  },
];
