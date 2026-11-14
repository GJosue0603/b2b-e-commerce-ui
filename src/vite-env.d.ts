/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_CATALOG_DATA_MODE?: string
  readonly VITE_AUTH_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
