import {fixturesEnabled} from './featureFlags';

const S3_PUBLIC_BASE = 'https://moocho-test.s3-us-west-2.amazonaws.com/public';
// Trove JSON is always busted on every page load so data changes show up immediately.
const S3_CACHE_BUSTER = Date.now();
// Images are busted only when this is set manually; bump it when publishing new S3 images.
const IMAGE_CACHE_BUSTER = (process.env.REACT_APP_IMAGE_CACHE_BUSTER ?? '').trim();

/** Appends the manual image cache-buster (REACT_APP_IMAGE_CACHE_BUSTER) to an image URL when set. */
export function bustImageUrl(url: string | undefined | null): string {
  if (!url) {
    return url ?? '';
  }
  if (!IMAGE_CACHE_BUSTER) {
    return url;
  }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(IMAGE_CACHE_BUSTER)}`;
}

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
