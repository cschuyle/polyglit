const S3_PUBLIC_BASE = 'https://moocho-test.s3-us-west-2.amazonaws.com/public';

function localFixturesEnabled(): boolean {
  const v = process.env.REACT_APP_POLYGLIT_LOCAL;
  return v === '1' || v === 'true' || Boolean(v && v !== '0' && v !== 'false');
}

/** Trove JSON URL: S3 in production, `/fixtures/public/...` when POLYGLIT_LOCAL is used with `npm start`. */
export function trovePublicJson(filename: string): string {
  if (!localFixturesEnabled()) {
    return `${S3_PUBLIC_BASE}/${filename}`;
  }
  const base = process.env.PUBLIC_URL || '';
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${prefix}/fixtures/public/${filename}`;
}
