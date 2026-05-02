const S3_PUBLIC_BASE = 'https://moocho-test.s3-us-west-2.amazonaws.com/public';
const S3_CACHE_BUSTER = Date.now();

function localFixturesEnabled(): boolean {
  const v = process.env.REACT_APP_POLYGLIT_LOCAL;
  return v === '1' || v === 'true' || Boolean(v && v !== '0' && v !== 'false');
}

/** Trove JSON URL: S3 in production, `/fixtures/public/...` when POLYGLIT_LOCAL is used with `npm start`. */
export function trovePublicJson(filename: string): string {
  if (!localFixturesEnabled()) {
    const s3Url = `${S3_PUBLIC_BASE}/${filename}?${S3_CACHE_BUSTER}`;
    console.log('Using S3 URL: %s', s3Url);
    return s3Url;
  }
  const base = process.env.PUBLIC_URL || '';
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base;
  const localFile = `${prefix}/fixtures/public/${filename}`;
  console.log('Using local fixture: %s', localFile);
  return localFile;
}
