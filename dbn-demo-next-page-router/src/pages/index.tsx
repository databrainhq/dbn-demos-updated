import { useEffect, useState, useCallback } from "react";
import type { CSSProperties } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": any;
      "dbn-metric": any;
    }
  }
  interface Window {
    databrainServerEvent?: (event: { type?: string }) => void;
  }
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

const OPTIONS_JSON = JSON.stringify({ showDashboardActions: false });

const cardStyle: CSSProperties = {
  maxWidth: 420,
  margin: "64px auto",
  padding: 24,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
};

const codeStyle: CSSProperties = {
  background: "#f1f5f9",
  padding: "1px 6px",
  borderRadius: 4,
  fontSize: 13,
};

function callDashboardEmbedFn(fn: "onClickCreateMetric" | "onClickManageMetrics") {
  const el = document.querySelector("dbn-dashboard");
  const inner = el?.shadowRoot?.querySelector(".dbn-dashboard") as
    | Record<string, unknown>
    | undefined;
  if (inner && typeof inner[fn] === "function") {
    (inner[fn] as () => void)();
  }
}

export default function Home() {
  const dashboardId = process.env.NEXT_PUBLIC_DASHBOARD_ID || "";
  const metricId = process.env.NEXT_PUBLIC_METRIC_ID || "";
  const envClientId = process.env.NEXT_PUBLIC_CLIENT_ID || "default";

  const [clientId, setClientId] = useState(envClientId);
  const [clientDraft, setClientDraft] = useState(envClientId);
  const [token, setToken] = useState("");
  const [state, setState] = useState<
    "idle" | "loading" | "setup" | "ready" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [adminPreset, setAdminPreset] = useState("");
  const [adminThemeJson, setAdminThemeJson] = useState("");
  const [adminThemeError, setAdminThemeError] = useState("");
  const [language, setLanguage] = useState<"en" | "fr" | "de" | "es">("en");
  const [enableDownloadCsv, setEnableDownloadCsv] = useState(true);
  const [enableEmailCsv, setEnableEmailCsv] = useState(false);
  const [disableFullscreen, setDisableFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await import("@databrainhq/plugin/web");
      if (cancelled) return;
      window.databrainServerEvent = (event) => {
        if (event?.type === "TOKEN_EXPIRED") {
          console.warn("Databrain: guest token expired. Refresh the page.");
        }
      };
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchToken = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/guest-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json();
      if (res.ok && data.configured === false) {
        setState("setup");
        return;
      }
      if (res.ok && data.guestToken) {
        setToken(data.guestToken);
        setState("ready");
        return;
      }
      setState("error");
      setError(data.error || "Failed to get guest token");
    } catch (e: unknown) {
      setState("error");
      setError(e instanceof Error ? e.message : "Connection failed");
    }
  }, [clientId]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const onSwitchClient = () => {
    const next = clientDraft.trim() || "default";
    setClientDraft(next);
    setClientId(next);
  };

  const resolvedAdminTheme = (() => {
    let raw: any = null;
    if (adminThemeJson.trim()) {
      try { raw = JSON.parse(adminThemeJson); } catch { /* fall through */ }
    }
    if (!raw && adminPreset && ADMIN_THEME_PRESETS[adminPreset]) {
      raw = ADMIN_THEME_PRESETS[adminPreset];
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

  const toolbarStyle: CSSProperties = {
    borderBottom: "1px solid #e5e7eb",
    padding: "10px 12px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    background: "#ffffff",
    fontSize: 13,
  };

  const labelRowStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  };

  if (state === "loading" || state === "idle") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "#64748b",
        }}
      >
        Loading dashboard…
      </div>
    );
  }

  if (state === "setup") {
    return (
      <div style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Configure Databrain
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
          Set <code style={codeStyle}>DATABRAIN_API_TOKEN</code> and{" "}
          <code style={codeStyle}>DATA_APP_NAME</code> in{" "}
          <code style={codeStyle}>.env.local</code>.
        </p>
        <button
          type="button"
          onClick={fetchToken}
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Check again
        </button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div style={cardStyle}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
            color: "#dc2626",
          }}
        >
          Error
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
          {error}
        </p>
        <button
          type="button"
          onClick={fetchToken}
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardId) {
    return (
      <div style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Set Dashboard ID
        </h2>
        <p style={{ fontSize: 14, color: "#64748b" }}>
          Set <code style={codeStyle}>NEXT_PUBLIC_DASHBOARD_ID</code> in{" "}
          <code style={codeStyle}>.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={toolbarStyle}>
        <span style={{ fontWeight: 600, marginRight: 8 }}>
          Databrain + Next.js (Pages Router)
        </span>

        <label style={labelRowStyle}>
          Admin Theme
          <select
            value={adminPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 13,
            }}
          >
            <option value="">None (default)</option>
            {Object.keys(ADMIN_THEME_PRESETS).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>

        <label style={labelRowStyle}>
          <input
            type="checkbox"
            checked={enableDownloadCsv}
            onChange={(e) => setEnableDownloadCsv(e.target.checked)}
          />
          Download CSV
        </label>
        <label style={labelRowStyle}>
          <input
            type="checkbox"
            checked={enableEmailCsv}
            onChange={(e) => setEnableEmailCsv(e.target.checked)}
          />
          Email CSV
        </label>
        <label style={labelRowStyle}>
          <input
            type="checkbox"
            checked={disableFullscreen}
            onChange={(e) => setDisableFullscreen(e.target.checked)}
          />
          Disable fullscreen
        </label>

        <label style={labelRowStyle}>
          Language
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as "en" | "fr" | "de" | "es")
            }
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 13,
            }}
          >
            <option value="en">en</option>
            <option value="fr">fr</option>
            <option value="de">de</option>
            <option value="es">es</option>
          </select>
        </label>

        <label
          style={{
            ...labelRowStyle,
            flex: "1 1 200px",
            minWidth: 0,
          }}
        >
          Client ID
          <input
            type="text"
            value={clientDraft}
            onChange={(e) => setClientDraft(e.target.value)}
            placeholder="default"
            style={{
              flex: 1,
              minWidth: 100,
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 13,
            }}
          />
        </label>
        <button
          type="button"
          onClick={onSwitchClient}
          style={{
            padding: "4px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
            cursor: "pointer",
            background: "#fff",
          }}
        >
          Switch client
        </button>

        <button
          type="button"
          onClick={() => callDashboardEmbedFn("onClickCreateMetric")}
          style={{
            padding: "4px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
            cursor: "pointer",
            background: "#fff",
          }}
        >
          Create Metric
        </button>
        <button
          type="button"
          onClick={() => callDashboardEmbedFn("onClickManageMetrics")}
          style={{
            padding: "4px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
            cursor: "pointer",
            background: "#fff",
          }}
        >
          Manage Metrics
        </button>
      </div>

      <div style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb", background: "#fff" }}>
        <details>
          <summary style={{ fontSize: 12, color: "#64748b", cursor: "pointer", userSelect: "none" as const }}>
            Admin Theme JSON {adminThemeError && <span style={{ color: "#dc2626", marginLeft: 8 }}>{adminThemeError}</span>}
          </summary>
          <textarea
            style={{ marginTop: 8, width: "100%", height: 140, fontFamily: "monospace", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 6, padding: 8, background: "#f9fafb", resize: "vertical" as const }}
            value={adminThemeJson}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder={'Paste or edit adminThemeOptions JSON here.\nSelect a preset above to start from an example.'}
            spellCheck={false}
          />
        </details>
      </div>

      <div style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ flex: 1, minHeight: 360 }}>
          <dbn-dashboard
            token={token}
            dashboard-id={dashboardId}
            handle-server-event="databrainServerEvent"
            options={OPTIONS_JSON}
            language={language}
            {...(resolvedAdminTheme ? { "admin-theme-options": resolvedAdminTheme } : {})}
            {...(enableDownloadCsv ? { "enable-download-csv": true } : {})}
            {...(enableEmailCsv ? { "enable-email-csv": true } : {})}
            {...(disableFullscreen ? { "disable-fullscreen": true } : {})}
          />
        </div>

        {metricId ? (
          <section style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
              Metric embed (<code style={codeStyle}>NEXT_PUBLIC_METRIC_ID</code>)
            </p>
            <div style={{ display: "inline-block", border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, background: "#fff" }}>
              <dbn-metric
                token={token}
                metric-id={metricId}
                width={500}
                height={350}
                variant="card"
                chart-renderer-type="svg"
                metric-filter-position="outside"
                enable-multi-metric-filters
              />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
