function envFlagTrue(value: string | undefined): boolean {
  return String(value ?? '').trim().toLowerCase() === 'true';
}

export function fixturesEnabled(): boolean {
  return envFlagTrue(process.env.REACT_APP_USE_FIXTURES_FLAG);
}

export function groupByEnabled(): boolean {
  return envFlagTrue(process.env.REACT_APP_GROUP_BY_FLAG);
}

export function sortNavEnabled(): boolean {
  return envFlagTrue(process.env.REACT_APP_SORT_NAV_FLAG);
}

export function multiTrovesEnabled(): boolean {
  return envFlagTrue(process.env.REACT_APP_MULTI_TROVES_FLAG);
}

export type TroveId = 'little-prince' | 'hobbit' | 'alice-in-wonderland' | 'books';

const KNOWN_TROVE_IDS: TroveId[] = ['little-prince', 'hobbit', 'alice-in-wonderland', 'books'];

export function configuredTroveIds(): TroveId[] {
  const raw = process.env.REACT_APP_TROVE_IDS ?? '';
  const ids = raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is TroveId => KNOWN_TROVE_IDS.includes(value as TroveId));
  return Array.from(new Set(ids));
}

/**
 * The root route loads the first valid ID from REACT_APP_TROVE_IDS.
 * Set REACT_APP_TROVE_IDS to one trove ID or a comma-delimited list of trove IDs.
 */
export function troveIdOverride(): TroveId | null {
  return configuredTroveIds()[0] ?? null;
}
