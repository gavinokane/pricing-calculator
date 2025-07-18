/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_GUID: string;
  // add other VITE_ variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
