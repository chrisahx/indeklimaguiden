export const SITE = {
  name: 'Indeklima Guiden',
  domain: 'indeklimaguiden.dk',
  url: 'https://indeklimaguiden.dk',
  locale: 'da_DK',
  lang: 'da',
  contactEmail: 'info@indeklimaguiden.dk',
  gaMeasurementId: 'G-JXX9F3JRM8',
};

export const CATEGORIES = {
  aircondition: {
    name: 'Aircondition',
    slug: 'aircondition',
    description:
      'Guides til mobile airconditionanlæg, installation, strømforbrug og køling i danske hjem.',
  },
  varmepumper: {
    name: 'Varmepumper',
    slug: 'varmepumper',
    description:
      'Praktiske guides til luft til luft-varmepumper, priser, strømforbrug, tilskud og installation.',
  },
  indeklima: {
    name: 'Indeklima',
    slug: 'indeklima',
    description:
      'Råd om luftfugtighed, ventilation, luftkvalitet, affugtere og luftrensere i hjemmet.',
  },
  affugter: {
    name: 'Affugter',
    slug: 'affugter',
    description:
      'Guides til affugtere, fugtproblemer, kældre, badeværelser og sund luftfugtighed i danske hjem.',
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
