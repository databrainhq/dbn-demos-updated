/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DASHBOARD_ID: string;
  readonly VITE_METRIC_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
