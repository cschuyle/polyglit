function envFlagTrue(value: string | undefined): boolean {
  return String(value ?? '').trim().toLowerCase() === 'true';
}

export function fixturesEnabled(): boolean {
  return envFlagTrue(import.meta.env.REACT_APP_USE_FIXTURES_FLAG);
}

export function groupByEnabled(): boolean {
  return envFlagTrue(import.meta.env.REACT_APP_GROUP_BY_FLAG);
}

export function sortNavEnabled(): boolean {
  return envFlagTrue(import.meta.env.REACT_APP_SORT_NAV_FLAG);
}

export function multiTrovesEnabled(): boolean {
  return envFlagTrue(import.meta.env.REACT_APP_MULTI_TROVES_FLAG);
}

export type TroveData = {
  troveId: string;
  shortName: string;
  h1: string;
  h2: string;
  h3?: string;
};

/**
 * Parses REACT_APP_TROVE_DATA, a JSON array of trove descriptor objects.
 * Each entry must have troveId, shortName, h1, h2 (string, may contain HTML), and optional h3.
 * Returns [] if unset, empty, or malformed.
 */
export function configuredTroveData(): TroveData[] {
  const raw = import.meta.env.REACT_APP_TROVE_DATA ?? '';
  if (!raw.trim()) {
    console.error('[polyglit] REACT_APP_TROVE_DATA is not set or empty. No troves will load.');
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('[polyglit] REACT_APP_TROVE_DATA is malformed JSON:', err);
    return [];
  }
  if (!Array.isArray(parsed)) {
    console.error('[polyglit] REACT_APP_TROVE_DATA must be a JSON array. Got:', typeof parsed);
    return [];
  }
  const valid = parsed.filter(
    (item): item is TroveData =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.troveId === 'string' &&
      typeof item.shortName === 'string' &&
      typeof item.h1 === 'string' &&
      typeof item.h2 === 'string'
  );
  if (valid.length === 0) {
    console.error('[polyglit] REACT_APP_TROVE_DATA contained no valid trove entries.');
  }
  return valid;
}
