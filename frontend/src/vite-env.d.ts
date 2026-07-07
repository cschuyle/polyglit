/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_USE_FIXTURES_FLAG?: string;
  readonly REACT_APP_GROUP_BY_FLAG?: string;
  readonly REACT_APP_SORT_NAV_FLAG?: string;
  readonly REACT_APP_MULTI_TROVES_FLAG?: string;
  readonly REACT_APP_TROVE_DATA?: string;
  readonly REACT_APP_IMAGE_CACHE_BUSTER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
