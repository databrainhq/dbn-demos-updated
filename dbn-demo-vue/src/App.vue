<script setup lang="ts">
import "@databrainhq/plugin/web";
import { ref, onMounted, computed } from "vue";

const API_URL = "http://localhost:3002";
const DASHBOARD_ID = import.meta.env.VITE_DASHBOARD_ID || "";
const METRIC_ID = (import.meta.env.VITE_METRIC_ID || "").trim();

const token = ref("");
const state = ref<"idle" | "loading" | "setup" | "ready" | "error">("idle");
const error = ref("");
const adminPreset = ref("");
const adminThemeJsonText = ref("");
const adminThemeError = ref("");

const clientId = ref("default");
const filterParamsJson = ref("");

const selectedLanguage = ref<"" | "en" | "fr" | "de" | "es">("");

const enableDownloadCsv = ref(false);
const enableEmailCsv = ref(false);
const disableFullscreen = ref(false);

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

function handlePresetChange(preset: string) {
  adminPreset.value = preset;
  adminThemeError.value = "";
  if (preset && ADMIN_THEME_PRESETS[preset]) {
    adminThemeJsonText.value = JSON.stringify(ADMIN_THEME_PRESETS[preset], null, 2);
  } else {
    adminThemeJsonText.value = "";
  }
}

function handleAdminJsonChange(val: string) {
  adminThemeJsonText.value = val;
  adminPreset.value = "";
  if (val.trim()) {
    try { JSON.parse(val); adminThemeError.value = ""; } catch { adminThemeError.value = "Invalid JSON"; }
  } else {
    adminThemeError.value = "";
  }
}

const resolvedAdminTheme = computed(() => {
  let raw: any = null;
  if (adminThemeJsonText.value.trim()) {
    try { raw = JSON.parse(adminThemeJsonText.value); } catch { /* fall through */ }
  }
  if (!raw && adminPreset.value && ADMIN_THEME_PRESETS[adminPreset.value]) {
    raw = ADMIN_THEME_PRESETS[adminPreset.value];
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
});

const embedBooleanAttrs = computed(() => {
  const o: Record<string, string> = {};
  if (enableDownloadCsv.value) o["enable-download-csv"] = "true";
  if (enableEmailCsv.value) o["enable-email-csv"] = "true";
  if (disableFullscreen.value) o["disable-fullscreen"] = "true";
  return o;
});

const languageAttr = computed(() =>
  selectedLanguage.value ? selectedLanguage.value : undefined
);

function parseFilterParams():
  | Record<string, unknown>
  | undefined
  | null {
  const raw = filterParamsJson.value.trim();
  if (!raw) return undefined;
  try {
    const p = JSON.parse(raw) as unknown;
    if (p && typeof p === "object" && !Array.isArray(p))
      return p as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}

async function fetchToken() {
  const params = parseFilterParams();
  if (filterParamsJson.value.trim() && params === null) {
    state.value = "error";
    error.value = "Invalid JSON in dashboard filter params";
    return;
  }

  state.value = "loading";
  try {
    const body: Record<string, unknown> = {
      clientId: clientId.value.trim() || "default",
    };
    if (params != null && Object.keys(params).length > 0) {
      body.params = params;
    }

    const res = await fetch(`${API_URL}/api/guest-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok && data.configured === false) {
      state.value = "setup";
      return;
    }
    if (res.ok && data.guestToken) {
      token.value = data.guestToken;
      state.value = "ready";
      return;
    }
    state.value = "error";
    error.value = data.error || "Failed to get guest token";
  } catch (e: any) {
    state.value = "error";
    error.value = e.message || "Connection failed";
  }
}

function switchClient() {
  fetchToken();
}

function callEmbedFunction(fn: string) {
  const el = document.querySelector("dbn-dashboard");
  const inner = el?.shadowRoot?.querySelector(".dbn-dashboard") as any;
  if (inner && typeof inner[fn] === "function") inner[fn]();
}

if (typeof window !== "undefined") {
  (window as any).databrainServerEvent = (event: any) => {
    if (event?.type === "TOKEN_EXPIRED") {
      console.warn("Databrain: guest token expired.");
    }
  };
}

onMounted(fetchToken);
</script>

<template>
  <div
    v-if="state === 'loading'"
    style="display:flex;align-items:center;justify-content:center;height:100vh;color:#666;"
  >
    Loading dashboard…
  </div>

  <div
    v-else-if="state === 'setup'"
    style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;"
  >
    <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">Configure Databrain</h2>
    <p style="font-size:14px;color:#666;margin-bottom:16px;">
      Set <code>DATABRAIN_API_TOKEN</code> and <code>DATA_APP_NAME</code> in
      <code>backend/.env</code>.
    </p>
    <button
      type="button"
      @click="fetchToken"
      style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;"
    >
      Check again
    </button>
  </div>

  <div
    v-else-if="state === 'error'"
    style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;"
  >
    <h2 style="font-size:18px;font-weight:600;color:#dc2626;margin-bottom:8px;">Error</h2>
    <p style="font-size:14px;color:#666;margin-bottom:16px;">{{ error }}</p>
    <button
      type="button"
      @click="fetchToken"
      style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;"
    >
      Retry
    </button>
  </div>

  <div v-else-if="state === 'ready'" style="height:100vh;display:flex;flex-direction:column;">
    <div
      style="border-bottom:1px solid #e5e7eb;padding:12px;display:flex;flex-wrap:wrap;align-items:flex-start;gap:12px;background:white;"
    >
      <span style="font-weight:600;font-size:14px;line-height:32px;">Databrain + Vue</span>

      <label style="display:flex;align-items:center;gap:6px;font-size:13px;line-height:32px;">
        <span>Admin Theme</span>
        <select
          :value="adminPreset"
          @change="handlePresetChange(($event.target as HTMLSelectElement).value)"
          style="border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:13px;"
        >
          <option value="">None (default)</option>
          <option v-for="k in Object.keys(ADMIN_THEME_PRESETS)" :key="k" :value="k">{{ k }}</option>
        </select>
      </label>

      <label style="display:flex;align-items:center;gap:6px;font-size:13px;line-height:32px;">
        <span>Language</span>
        <select
          v-model="selectedLanguage"
          style="border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:13px;"
        >
          <option value="">Default (en)</option>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="es">Spanish</option>
        </select>
      </label>

      <div
        style="display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;font-size:13px;border-left:1px solid #e5e7eb;padding-left:12px;margin-left:4px;"
      >
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
          <input v-model="enableDownloadCsv" type="checkbox" />
          <span>Download CSV</span>
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
          <input v-model="enableEmailCsv" type="checkbox" />
          <span>Email CSV</span>
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
          <input v-model="disableFullscreen" type="checkbox" />
          <span>Disable fullscreen</span>
        </label>
      </div>

      <div
        style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;border-left:1px solid #e5e7eb;padding-left:12px;margin-left:4px;"
      >
        <button
          type="button"
          @click="callEmbedFunction('onClickCreateMetric')"
          style="padding:4px 12px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;cursor:pointer;background:white;"
        >
          Create Metric
        </button>
        <button
          type="button"
          @click="callEmbedFunction('onClickManageMetrics')"
          style="padding:4px 12px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;cursor:pointer;background:white;"
        >
          Manage Metrics
        </button>
      </div>

      <div
        style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;width:100%;border-top:1px solid #f3f4f6;padding-top:10px;margin-top:4px;"
      >
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;flex:1;min-width:200px;">
          <span style="white-space:nowrap;">Client ID</span>
          <input
            v-model="clientId"
            type="text"
            style="flex:1;min-width:120px;border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:13px;"
            placeholder="default"
          />
        </label>
        <button
          type="button"
          @click="switchClient"
          style="padding:6px 14px;background:#2563eb;color:white;border:none;border-radius:4px;font-size:13px;cursor:pointer;"
        >
          Switch client
        </button>
      </div>

      <div style="width:100%;font-size:12px;color:#64748b;">
        <div style="margin-bottom:4px;">Guest token <code>params</code> (JSON, optional)</div>
        <textarea
          v-model="filterParamsJson"
          rows="3"
          style="width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:4px;padding:8px;font-size:12px;font-family:ui-monospace,monospace;resize:vertical;"
          placeholder='{ "dashboardAppFilters": [] }'
        />
      </div>
    </div>

    <div style="padding:8px 12px;border-bottom:1px solid #e5e7eb;background:#fff;">
      <details>
        <summary style="font-size:12px;color:#64748b;cursor:pointer;user-select:none;">
          Admin Theme JSON <span v-if="adminThemeError" style="color:#dc2626;margin-left:8px;">{{ adminThemeError }}</span>
        </summary>
        <textarea
          style="margin-top:8px;width:100%;height:140px;font-family:monospace;font-size:12px;border:1px solid #d1d5db;border-radius:6px;padding:8px;background:#f9fafb;resize:vertical;box-sizing:border-box;"
          :value="adminThemeJsonText"
          @input="handleAdminJsonChange(($event.target as HTMLTextAreaElement).value)"
          placeholder="Paste or edit adminThemeOptions JSON here.&#10;Select a preset above to start from an example."
          spellcheck="false"
        />
      </details>
    </div>

    <div style="flex:1;display:flex;flex-direction:column;min-height:0;">
      <div style="flex:1;min-height:200px;padding:8px;">
        <dbn-dashboard
          :token="token"
          :dashboard-id="DASHBOARD_ID"
          :admin-theme-options="resolvedAdminTheme"
          :language="languageAttr"
          handle-server-event="databrainServerEvent"
          v-bind="embedBooleanAttrs"
        />
      </div>

      <div
        v-if="METRIC_ID"
        style="border-top:1px solid #e5e7eb;padding:12px 8px;background:#fafafa;"
      >
        <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:#334155;">Metric (VITE_METRIC_ID)</div>
        <dbn-metric
          :token="token"
          :metric-id="METRIC_ID"
          :width="500"
          :height="350"
          variant="card"
          chart-renderer-type="svg"
          metric-filter-position="outside"
        />
      </div>
    </div>
  </div>
</template>
