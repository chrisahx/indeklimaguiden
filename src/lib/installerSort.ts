export const installerSortOptions = [
  { value: 'name', label: 'Navn' },
  { value: 'google-rating', label: 'Google rating' },
  { value: 'trustpilot-rating', label: 'Trustpilot rating' },
  { value: 'city', label: 'By' },
] as const;

export const installerSortDirections = [
  { value: 'asc', label: 'Stigende' },
  { value: 'desc', label: 'Faldende' },
] as const;

export type InstallerSortBy = (typeof installerSortOptions)[number]['value'];
export type InstallerSortDirection = (typeof installerSortDirections)[number]['value'];

export interface InstallerSortState {
  sortBy: InstallerSortBy;
  sortDirection: InstallerSortDirection;
}

const sortValues = new Set<string>(installerSortOptions.map((option) => option.value));
const directionValues = new Set<string>(installerSortDirections.map((option) => option.value));

export function parseInstallerSort(searchParams: URLSearchParams): InstallerSortState {
  const requestedSort = searchParams.get('sort') ?? '';
  const sortBy = sortValues.has(requestedSort) ? (requestedSort as InstallerSortBy) : 'name';
  const requestedDirection = searchParams.get('direction') ?? '';

  if (directionValues.has(requestedDirection)) {
    return { sortBy, sortDirection: requestedDirection as InstallerSortDirection };
  }

  return {
    sortBy,
    sortDirection: sortBy === 'google-rating' || sortBy === 'trustpilot-rating' ? 'desc' : 'asc',
  };
}
