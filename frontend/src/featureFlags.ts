function envFlagTrue(value: string | undefined): boolean {
  return String(value ?? '').trim().toLowerCase() === 'true';
}

export function fixturesEnabled(): boolean {
  return envFlagTrue(process.env.REACT_APP_USE_FIXTURES_FLAG);
}

export function groupByEnabled(): boolean {
  return envFlagTrue(process.env.REACT_APP_GROUP_BY_FLAG);
}
