const DANISH_REPLACEMENTS: Record<string, string> = {
  æ: 'ae',
  ø: 'oe',
  å: 'aa',
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
};

export function slugifyCity(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[æøåäöü]/g, (match) => DANISH_REPLACEMENTS[match] ?? match)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
