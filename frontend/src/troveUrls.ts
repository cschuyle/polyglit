import {fixturesEnabled} from './featureFlags';

const S3_PUBLIC_BASE = 'https://moocho-test.s3-us-west-2.amazonaws.com/public';
const S3_CACHE_BUSTER = Date.now();

/** Trove JSON URL: S3 in production, `/fixtures/public/...` when REACT_APP_USE_FIXTURES_FLAG is used with `npm start`. */
export function trovePublicJson(filename: string): string {
  if (!fixturesEnabled()) {
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
