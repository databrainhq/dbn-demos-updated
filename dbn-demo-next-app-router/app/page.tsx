"use client";
import "@databrainhq/plugin/web";
import { useEffect, useState, useCallback, useRef } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": any;
      "dbn-metric": any;
    }
  }
}

// Server event handler for TOKEN_EXPIRED
if (typeof window !== "undefined") {
  (window as any).databrainServerEvent = (event: any) => {
    if (event?.type === "TOKEN_EXPIRED") {
      console.warn("Databrain: guest token expired. Refresh the page.");
    }
  };
}

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
    dashboard: { backgroundColor: "#f0f4f8", ctaColor: "#1e40af", ctaTextColor: "#ffffff", metricCardColor: "#ffffff", selectBoxSize: "small", selectBoxVariant: "floating" },
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

const defaultClientId =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_CLIENT_ID || "default"
    : "default";

export default function Home() {
  const dashboardId = process.env.NEXT_PUBLIC_DASHBOARD_ID || "";
  const metricId = process.env.NEXT_PUBLIC_METRIC_ID || "";

  const dashboardRef = useRef<HTMLElement | null>(null);

  const [clientId, setClientId] = useState(defaultClientId);
  const [clientIdDraft, setClientIdDraft] = useState(defaultClientId);

  const [token, setToken] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "setup" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [adminPreset, setAdminPreset] = useState("");
  const [adminThemeJson, setAdminThemeJson] = useState("");
  const [adminThemeError, setAdminThemeError] = useState("");

  const [enableDownloadCsv, setEnableDownloadCsv] = useState(false);
  const [enableEmailCsv, setEnableEmailCsv] = useState(false);
  const [disableFullscreen, setDisableFullscreen] = useState(false);

  const [language, setLanguage] = useState("en");

  const fetchToken = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/guest-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          params: { dashboardAppFilters: [] },
        }),
      });
      const data = await res.json();
      if (res.ok && data.configured === false) { setState("setup"); return; }
      if (res.ok && data.guestToken) { setToken(data.guestToken); setState("ready"); return; }
      setState("error");
      setError(data.error || "Failed to get guest token");
    } catch (e: any) {
      setState("error");
      setError(e.message || "Connection failed");
    }
  }, [clientId]);

  useEffect(() => { fetchToken(); }, [fetchToken]);

  const callEmbedFn = (fn: "onClickCreateMetric" | "onClickManageMetrics") => {
    const el = dashboardRef.current ?? document.querySelector("dbn-dashboard");
    const inner = el?.shadowRoot?.querySelector(".dbn-dashboard") as any;
    if (inner && typeof inner[fn] === "function") inner[fn]();
  };

  const handleSwitchClient = () => {
    const next = clientIdDraft.trim() || "default";
    setClientId(next);
  };

  if (state === "loading" || state === "idle") {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading dashboard…</div>;
  }

  if (state === "setup") {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Configure Databrain</h2>
        <p className="text-sm text-gray-600 mb-4">Set <code className="bg-gray-100 px-1 rounded">DATABRAIN_API_TOKEN</code> and <code className="bg-gray-100 px-1 rounded">DATA_APP_NAME</code> in <code className="bg-gray-100 px-1 rounded">.env.local</code>.</p>
        <button onClick={fetchToken} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Check again</button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button onClick={fetchToken} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Retry</button>
      </div>
    );
  }

  if (!dashboardId) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Set Dashboard ID</h2>
        <p className="text-sm text-gray-600">Set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_DASHBOARD_ID</code> in <code className="bg-gray-100 px-1 rounded">.env.local</code>.</p>
      </div>
    );
  }

  const resolvedAdminTheme = (() => {
    let raw: any = null;
    if (adminThemeJson.trim()) {
      try { raw = JSON.parse(adminThemeJson); } catch { /* fall through */ }
    }
    if (!raw && adminPreset && ADMIN_THEME_PRESETS[adminPreset]) {
      raw = ADMIN_THEME_PRESETS[adminPreset];
    }
    if (!raw) return undefined;
    // Plugin expects all top-level keys to exist
    return JSON.stringify({
      general: raw.general || {},
      dashboard: raw.dashboard || {},
      cardTitle: raw.cardTitle || {},
      cardDescription: raw.cardDescription || {},
      chart: raw.chart || {},
      cardCustomization: raw.cardCustomization || {},
      ...raw,
    });
  })();

  const handlePresetChange = (preset: string) => {
    setAdminPreset(preset);
    setAdminThemeError("");
    if (preset && ADMIN_THEME_PRESETS[preset]) {
      setAdminThemeJson(JSON.stringify(ADMIN_THEME_PRESETS[preset], null, 2));
    } else {
      setAdminThemeJson("");
    }
  };

  const handleJsonChange = (val: string) => {
    setAdminThemeJson(val);
    setAdminPreset("");
    if (val.trim()) {
      try { JSON.parse(val); setAdminThemeError(""); } catch { setAdminThemeError("Invalid JSON"); }
    } else {
      setAdminThemeError("");
    }
  };

  const embedBoolAttrs: Record<string, string> = {};
  if (enableDownloadCsv) embedBoolAttrs["enable-download-csv"] = "true";
  if (enableEmailCsv) embedBoolAttrs["enable-email-csv"] = "true";
  if (disableFullscreen) embedBoolAttrs["disable-fullscreen"] = "true";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-3 py-3 flex flex-wrap items-end gap-x-6 gap-y-3">
        <span className="font-semibold text-sm shrink-0">Databrain + Next.js (App Router)</span>

        <div className="flex flex-col gap-1 min-w-[10rem]">
          <span className="text-xs font-medium text-gray-500">Admin Theme</span>
          <select
            value={adminPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">None (default)</option>
            {Object.keys(ADMIN_THEME_PRESETS).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">Embed options</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={enableDownloadCsv}
                onChange={(e) => setEnableDownloadCsv(e.target.checked)}
                className="rounded border-gray-300"
              />
              Download CSV
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={enableEmailCsv}
                onChange={(e) => setEnableEmailCsv(e.target.checked)}
                className="rounded border-gray-300"
              />
              Email CSV
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={disableFullscreen}
                onChange={(e) => setDisableFullscreen(e.target.checked)}
                className="rounded border-gray-300"
              />
              Disable fullscreen
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-[10rem]">
          <span className="text-xs font-medium text-gray-500">Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="en">English (en)</option>
            <option value="fr">French (fr)</option>
            <option value="de">German (de)</option>
            <option value="es">Spanish (es)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[12rem] max-w-md">
          <span className="text-xs font-medium text-gray-500">Multi-tenant (clientId)</span>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={clientIdDraft}
              onChange={(e) => setClientIdDraft(e.target.value)}
              className="flex-1 min-w-0 border rounded px-2 py-1 text-sm"
              placeholder="client id"
              aria-label="Client ID"
            />
            <button
              type="button"
              onClick={handleSwitchClient}
              className="shrink-0 px-3 py-1.5 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
            >
              Switch client
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">Embed actions</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => callEmbedFn("onClickCreateMetric")}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
            >
              Create Metric
            </button>
            <button
              type="button"
              onClick={() => callEmbedFn("onClickManageMetrics")}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
            >
              Manage Metrics
            </button>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 border-b bg-white">
        <details>
          <summary className="text-xs font-medium text-gray-500 cursor-pointer select-none">
            Admin Theme JSON {adminThemeError && <span className="text-red-500 ml-2">{adminThemeError}</span>}
          </summary>
          <textarea
            className="mt-2 w-full h-40 font-mono text-xs border rounded p-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={adminThemeJson}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder={'Paste or edit adminThemeOptions JSON here.\nSelect a preset above to start from an example.'}
            spellCheck={false}
          />
        </details>
      </div>

      <div className="p-2 min-h-[70vh]">
        <dbn-dashboard
          ref={dashboardRef}
          token={token}
          dashboard-id={dashboardId}
          handle-server-event="databrainServerEvent"
          language={language}
          {...embedBoolAttrs}
          {...(resolvedAdminTheme ? { "admin-theme-options": resolvedAdminTheme } : {})}
        />
      </div>

      <div className="px-2 pb-6">
        {metricId ? (
          <div className="border rounded-lg bg-white p-2 overflow-hidden max-w-4xl">
            <dbn-metric token={token} metric-id={metricId} />
          </div>
        ) : (
          <p className="text-xs text-gray-500 px-1">
            Set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_METRIC_ID</code> in{' '}
            <code className="bg-gray-100 px-1 rounded">.env.local</code> to show a metric card below the dashboard.
          </p>
        )}
      </div>
    </main>
  );
}
