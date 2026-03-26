const env = import.meta.env;

export const API_BASE_URL = (env.VITE_API_URL as string) || "http://localhost:3002";
export const DATABRAIN_PLUGIN_BASE_URL =
  (env.VITE_DATABRAIN_PLUGIN_URL as string) || "https://api.usedatabrain.com";
export const DEFAULT_CLIENT_ID = (env.VITE_DEFAULT_CLIENT_ID as string) || "default";
export const DEFAULT_DASHBOARD_ID = (env.VITE_DEFAULT_DASHBOARD_ID as string) || "";
export const DEFAULT_METRIC_ID = (env.VITE_DEFAULT_METRIC_ID as string) || "";
