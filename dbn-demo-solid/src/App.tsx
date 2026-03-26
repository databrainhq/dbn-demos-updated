import type { Component } from "solid-js";
import { createResource, createSignal, Show } from "solid-js";
import "@databrainhq/plugin/web";

type LangCode = "" | "en" | "fr" | "de" | "es";

type FetchResult =
  | { state: "setup" }
  | { state: "ready"; token: string }
  | { state: "error"; error: string };

const API_URL = "http://localhost:3002";
const DASHBOARD_ID = import.meta.env.VITE_DASHBOARD_ID || "";
const METRIC_ID = import.meta.env.VITE_METRIC_ID || "";

const ADMIN_THEME_PRESETS: Record<string, object> = {
  "Clean Light": {
    general: { name: "Clean Light", fontFamily: "Inter" },
    dashboard: { backgroundColor: "#ffffff", ctaColor: "#2563eb", ctaTextColor: "#ffffff", metricCardColor: "#ffffff" },
    cardTitle: { fontSize: "16px", fontWeight: "600", color: "#0f172a" },
    cardDescription: { fontSize: "13px", fontWeight: "400", color: "#64748b" },
    chart: { palettes: [{ name: "Default", colors: ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2"] }], selected: "Default" },
    cardCustomization: { padding: "16px", borderRadius: "8px", shadow: "0 1px 3px rgba(0,0,0,0.1)" },
  },
  "Dark Mode": {
    general: { name: "Dark Mode", fontFamily: "Inter" },
    dashboard: { backgroundColor: "#0f172a", ctaColor: "#60a5fa", ctaTextColor: "#0f172a", metricCardColor: "#1e293b" },
    cardTitle: { fontSize: "16px", fontWeight: "600", color: "#f1f5f9" },
    cardDescription: { fontSize: "13px", fontWeight: "400", color: "#94a3b8" },
    chart: { palettes: [{ name: "Neon", colors: ["#60a5fa", "#a78bfa", "#f472b6", "#fb923c", "#4ade80", "#22d3ee"] }], selected: "Neon" },
    cardCustomization: { padding: "16px", borderRadius: "8px", shadow: "0 1px 3px rgba(0,0,0,0.4)", disableShadowOnHover: true },
  },
  "Corporate Blue": {
    general: { name: "Corporate Blue", fontFamily: "system-ui" },
    dashboard: { backgroundColor: "#f0f4f8", ctaColor: "#1e40af", ctaTextColor: "#ffffff", metricCardColor: "#ffffff" },
    cardTitle: { fontSize: "14px", fontWeight: "700", color: "#1e3a5f" },
    cardDescription: { fontSize: "12px", fontWeight: "400", color: "#475569" },
    chart: { palettes: [{ name: "Corporate", colors: ["#1e40af", "#3b82f6", "#93c5fd", "#1d4ed8", "#60a5fa", "#bfdbfe"] }], selected: "Corporate" },
    cardCustomization: { padding: "12px", borderRadius: "4px", shadow: "0 1px 2px rgba(0,0,0,0.06)" },
  },
  "Warm Brand": {
    general: { name: "Warm Brand", fontFamily: "Georgia" },
    dashboard: { backgroundColor: "#faf5ff", ctaColor: "#7c3aed", ctaTextColor: "#ffffff", metricCardColor: "#fefce8" },
    cardTitle: { fontSize: "18px", fontWeight: "600", color: "#4c1d95" },
    cardDescription: { fontSize: "14px", fontWeight: "400", color: "#6b21a8" },
    chart: { palettes: [{ name: "Warm", colors: ["#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#f43f5e", "#8b5cf6"] }], selected: "Warm" },
    cardCustomization: { padding: "20px", borderRadius: "16px", shadow: "0 4px 12px rgba(124,58,237,0.1)" },
  },
};
const ADMIN_PRESET_KEYS = Object.keys(ADMIN_THEME_PRESETS);

/** Unlocks Create / Manage Metrics embed APIs (toolbar buttons). */
const DASHBOARD_OPTIONS = JSON.stringify({
  disableMetricCreation: false,
  disableManageMetrics: false,
  disableMetricUpdation: false,
  disableMetricDeletion: false,
});

async function fetchGuestToken(clientId: string): Promise<FetchResult> {
  try {
    const res = await fetch(`${API_URL}/api/guest-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    });
    const data = await res.json();
    if (res.ok && data.configured === false) return { state: "setup" };
    if (res.ok && data.guestToken) {
      return { state: "ready", token: data.guestToken };
    }
    return {
      state: "error",
      error: data.error || "Failed to get guest token",
    };
  } catch (e) {
    return {
      state: "error",
      error: e instanceof Error ? e.message : "Connection failed",
    };
  }
}

function callDashboardEmbedFn(fnName: "onClickCreateMetric" | "onClickManageMetrics") {
  const el = document.querySelector("dbn-dashboard");
  const inner = el?.shadowRoot?.querySelector(".dbn-dashboard") as
    | Record<string, () => void>
    | undefined;
  if (inner && typeof inner[fnName] === "function") inner[fnName]();
}

if (typeof window !== "undefined") {
  window.databrainServerEvent = (event: { type?: string } & Record<string, unknown>) => {
    if (event?.type === "TOKEN_EXPIRED") {
      console.warn(
        "Databrain: guest token expired. Refresh or use Switch client / Retry to get a new one.",
      );
    } else {
      console.log("Databrain server event:", event);
    }
  };
}

declare global {
  interface Window {
    databrainServerEvent?: (event: { type?: string } & Record<string, unknown>) => void;
  }
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": {
        token?: string;
        "dashboard-id"?: string;
        theme?: string;
        "admin-theme-options"?: string;
        options?: string;
        language?: string;
        "handle-server-event"?: string;
        "enable-download-csv"?: string;
        "enable-email-csv"?: string;
        "disable-fullscreen"?: string;
      };
      "dbn-metric": {
        token?: string;
        "metric-id"?: string;
        width?: number;
        height?: number;
        variant?: string;
        "chart-renderer-type"?: string;
        "metric-filter-position"?: string;
        "enable-multi-metric-filters"?: boolean;
      };
    }
  }
}

const toolbarBtn: string =
  "padding:6px 12px;border:1px solid #d1d5db;border-radius:4px;font-size:12px;cursor:pointer;background:#fff;";
const toolbarBtnDisabled: string =
  `${toolbarBtn}opacity:0.5;cursor:not-allowed;`;

const App: Component = () => {
  const [clientKey, setClientKey] = createSignal("default");
  const [clientInput, setClientInput] = createSignal("default");
  const [adminPreset, setAdminPreset] = createSignal("");
  const [adminThemeJsonText, setAdminThemeJsonText] = createSignal("");
  const [adminThemeError, setAdminThemeError] = createSignal("");
  const [lang, setLang] = createSignal<LangCode>("");
  const [enableDownloadCsv, setEnableDownloadCsv] = createSignal(false);
  const [enableEmailCsv, setEnableEmailCsv] = createSignal(false);
  const [disableFullscreen, setDisableFullscreen] = createSignal(false);

  const [result, { refetch }] = createResource(clientKey, fetchGuestToken);

  const handlePresetChange = (preset: string) => {
    setAdminPreset(preset);
    setAdminThemeError("");
    if (preset && ADMIN_THEME_PRESETS[preset]) {
      setAdminThemeJsonText(JSON.stringify(ADMIN_THEME_PRESETS[preset], null, 2));
    } else {
      setAdminThemeJsonText("");
    }
  };

  const handleAdminJsonChange = (val: string) => {
    setAdminThemeJsonText(val);
    setAdminPreset("");
    if (val.trim()) {
      try { JSON.parse(val); setAdminThemeError(""); } catch { setAdminThemeError("Invalid JSON"); }
    } else {
      setAdminThemeError("");
    }
  };

  const resolvedAdminTheme = () => {
    let raw: any = null;
    const text = adminThemeJsonText();
    if (text.trim()) {
      try { raw = JSON.parse(text); } catch { /* fall through */ }
    }
    const preset = adminPreset();
    if (!raw && preset && ADMIN_THEME_PRESETS[preset]) {
      raw = ADMIN_THEME_PRESETS[preset];
    }
    if (!raw) return undefined;
    return JSON.stringify({
      general: raw.general || {},
      dashboard: raw.dashboard || {},
      cardTitle: raw.cardTitle || {},
      cardDescription: raw.cardDescription || {},
      chart: raw.chart || {},
      cardCustomization: raw.cardCustomization || {},
      ...raw,
    });
  };

  const embedBoolAttrs = () => {
    const o: Record<string, string> = {};
    if (enableDownloadCsv()) o["enable-download-csv"] = "true";
    if (enableEmailCsv()) o["enable-email-csv"] = "true";
    if (disableFullscreen()) o["disable-fullscreen"] = "true";
    return o;
  };

  const switchClient = () => {
    const next = clientInput().trim() || "default";
    if (next === clientKey()) void refetch();
    else setClientKey(next);
  };

  const dashboardReady = () =>
    result()?.state === "ready" && Boolean(DASHBOARD_ID);

  const primaryActionStyle =
    "padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px;";

  return (
    <div style="height:100vh;display:flex;flex-direction:column;">
      <div
        style="border-bottom:1px solid #e5e7eb;padding:10px 12px;display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;background:#fff;"
      >
        <span style="font-weight:600;font-size:14px;">Databrain + Solid</span>

        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#374151;">
          Admin Theme
          <select
            value={adminPreset()}
            onChange={(e) => handlePresetChange(e.currentTarget.value)}
            style="border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:12px;"
          >
            <option value="">None (default)</option>
            {ADMIN_PRESET_KEYS.map((k) => (
              <option value={k}>{k}</option>
            ))}
          </select>
        </label>

        <span style="font-size:12px;color:#6b7280;">Embed:</span>
        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;">
          <input
            type="checkbox"
            checked={enableDownloadCsv()}
            onChange={(e) => setEnableDownloadCsv(e.currentTarget.checked)}
          />
          CSV download
        </label>
        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;">
          <input
            type="checkbox"
            checked={enableEmailCsv()}
            onChange={(e) => setEnableEmailCsv(e.currentTarget.checked)}
          />
          Email CSV
        </label>
        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;">
          <input
            type="checkbox"
            checked={disableFullscreen()}
            onChange={(e) => setDisableFullscreen(e.currentTarget.checked)}
          />
          Disable fullscreen
        </label>

        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#374151;">
          Language
          <select
            value={lang()}
            onChange={(e) => setLang(e.currentTarget.value as LangCode)}
            style="border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:12px;"
          >
            <option value="">Default</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
          </select>
        </label>

        <span
          style="width:1px;height:20px;background:#e5e7eb;display:inline-block;"
          aria-hidden="true"
        />

        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#374151;">
          Client ID
          <input
            type="text"
            value={clientInput()}
            onInput={(e) => setClientInput(e.currentTarget.value)}
            style="border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:12px;width:140px;"
            placeholder="default"
          />
        </label>
        <button type="button" onClick={() => switchClient()} style={toolbarBtn}>
          Switch client
        </button>

        <button
          type="button"
          disabled={!dashboardReady()}
          style={dashboardReady() ? toolbarBtn : toolbarBtnDisabled}
          onClick={() => callDashboardEmbedFn("onClickCreateMetric")}
        >
          Create Metric
        </button>
        <button
          type="button"
          disabled={!dashboardReady()}
          style={dashboardReady() ? toolbarBtn : toolbarBtnDisabled}
          onClick={() => callDashboardEmbedFn("onClickManageMetrics")}
        >
          Manage Metrics
        </button>
      </div>

      <Show when={result.loading}>
        <div style="display:flex;align-items:center;justify-content:center;flex:1;color:#666;">
          Loading dashboard…
        </div>
      </Show>

      <Show when={!result.loading && result()?.state === "setup"}>
        <div
          style="max-width:420px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;"
        >
          <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">
            Configure Databrain
          </h2>
          <p style="font-size:14px;color:#666;margin-bottom:16px;line-height:1.5;">
            Set <code>DATABRAIN_API_TOKEN</code> and <code>DATA_APP_NAME</code> in{" "}
            <code>backend/.env</code>.
          </p>
          <button type="button" onClick={() => refetch()} style={primaryActionStyle}>
            Check again
          </button>
        </div>
      </Show>

      <Show when={!result.loading && result()?.state === "error"}>
        <div
          style="max-width:420px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;"
        >
          <h2 style="font-size:18px;font-weight:600;color:#dc2626;margin-bottom:8px;">
            Error
          </h2>
          <p style="font-size:14px;color:#666;margin-bottom:16px;">
            {(result() as FetchResult & { state: "error" }).error}
          </p>
          <button type="button" onClick={() => refetch()} style={primaryActionStyle}>
            Retry
          </button>
        </div>
      </Show>

      <Show when={!result.loading && result()?.state === "ready" && !DASHBOARD_ID}>
        <div
          style="max-width:420px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;"
        >
          <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">
            Set Dashboard ID
          </h2>
          <p style="font-size:14px;color:#666;margin-bottom:16px;line-height:1.5;">
            Set <code>VITE_DASHBOARD_ID</code> in <code>.env</code> to your embed ID.
          </p>
          <button type="button" onClick={() => refetch()} style={primaryActionStyle}>
            Check again
          </button>
        </div>
      </Show>

      <Show when={!result.loading && result()?.state === "ready" && DASHBOARD_ID}>
        <div style="padding:8px 12px;border-bottom:1px solid #e5e7eb;background:#fff;">
          <details>
            <summary style="font-size:12px;color:#64748b;cursor:pointer;user-select:none;">
              Admin Theme JSON {adminThemeError() && <span style="color:#dc2626;margin-left:8px;">{adminThemeError()}</span>}
            </summary>
            <textarea
              style="margin-top:8px;width:100%;height:140px;font-family:monospace;font-size:12px;border:1px solid #d1d5db;border-radius:6px;padding:8px;background:#f9fafb;resize:vertical;box-sizing:border-box;"
              value={adminThemeJsonText()}
              onInput={(e) => handleAdminJsonChange(e.currentTarget.value)}
              placeholder={'Paste or edit adminThemeOptions JSON here.\nSelect a preset above to start from an example.'}
              spellcheck={false}
            />
          </details>
        </div>

        <div
          style="flex:1;display:flex;flex-direction:column;min-height:0;padding:8px;gap:12px;"
        >
          <div style="flex:1;min-height:280px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#fafafa;">
            <dbn-dashboard
              token={(result() as Extract<FetchResult, { state: "ready" }>).token}
              dashboard-id={DASHBOARD_ID}
              options={DASHBOARD_OPTIONS}
              handle-server-event="databrainServerEvent"
              {...(resolvedAdminTheme() ? { "admin-theme-options": resolvedAdminTheme()! } : {})}
              {...(lang() ? { language: lang()! } : {})}
              {...embedBoolAttrs()}
            />
          </div>

          <Show when={METRIC_ID}>
            <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#fff;">
              <div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:8px;">
                Metric card
              </div>
              <dbn-metric
                token={(result() as Extract<FetchResult, { state: "ready" }>).token}
                metric-id={METRIC_ID}
                width={500}
                height={320}
                variant="card"
                chart-renderer-type="svg"
                metric-filter-position="outside"
                enable-multi-metric-filters
              />
            </div>
          </Show>

          <Show when={!METRIC_ID}>
            <p style="font-size:12px;color:#6b7280;margin:0;">
              Set <code>VITE_METRIC_ID</code> in <code>.env</code> to show a{" "}
              <code>&lt;dbn-metric&gt;</code> sample below the dashboard.
            </p>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default App;
