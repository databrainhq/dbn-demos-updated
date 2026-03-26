<script lang="ts">
import '@databrainhq/plugin/web';
import { onMount } from 'svelte';

const API_URL = 'http://localhost:3002';
const DASHBOARD_ID = import.meta.env.VITE_DASHBOARD_ID || '';
const METRIC_ID = import.meta.env.VITE_METRIC_ID || '';

const ADMIN_THEME_PRESETS: Record<string, object> = {
  'Clean Light': {
    general: { name: 'Clean Light', fontFamily: 'Inter' },
    dashboard: { backgroundColor: '#ffffff', ctaColor: '#2563eb', ctaTextColor: '#ffffff', metricCardColor: '#ffffff' },
    cardTitle: { fontSize: '16px', fontWeight: '600', color: '#0f172a' },
    cardDescription: { fontSize: '13px', fontWeight: '400', color: '#64748b' },
    chart: { palettes: [{ name: 'Default', colors: ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'] }], selected: 'Default' },
    cardCustomization: { padding: '16px', borderRadius: '8px', shadow: '0 1px 3px rgba(0,0,0,0.1)' },
  },
  'Dark Mode': {
    general: { name: 'Dark Mode', fontFamily: 'Inter' },
    dashboard: { backgroundColor: '#0f172a', ctaColor: '#60a5fa', ctaTextColor: '#0f172a', metricCardColor: '#1e293b' },
    cardTitle: { fontSize: '16px', fontWeight: '600', color: '#f1f5f9' },
    cardDescription: { fontSize: '13px', fontWeight: '400', color: '#94a3b8' },
    chart: { palettes: [{ name: 'Neon', colors: ['#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#4ade80', '#22d3ee'] }], selected: 'Neon' },
    cardCustomization: { padding: '16px', borderRadius: '8px', shadow: '0 1px 3px rgba(0,0,0,0.4)', disableShadowOnHover: true },
  },
  'Corporate Blue': {
    general: { name: 'Corporate Blue', fontFamily: 'system-ui' },
    dashboard: { backgroundColor: '#f0f4f8', ctaColor: '#1e40af', ctaTextColor: '#ffffff', metricCardColor: '#ffffff' },
    cardTitle: { fontSize: '14px', fontWeight: '700', color: '#1e3a5f' },
    cardDescription: { fontSize: '12px', fontWeight: '400', color: '#475569' },
    chart: { palettes: [{ name: 'Corporate', colors: ['#1e40af', '#3b82f6', '#93c5fd', '#1d4ed8', '#60a5fa', '#bfdbfe'] }], selected: 'Corporate' },
    cardCustomization: { padding: '12px', borderRadius: '4px', shadow: '0 1px 2px rgba(0,0,0,0.06)' },
  },
  'Warm Brand': {
    general: { name: 'Warm Brand', fontFamily: 'Georgia' },
    dashboard: { backgroundColor: '#faf5ff', ctaColor: '#7c3aed', ctaTextColor: '#ffffff', metricCardColor: '#fefce8' },
    cardTitle: { fontSize: '18px', fontWeight: '600', color: '#4c1d95' },
    cardDescription: { fontSize: '14px', fontWeight: '400', color: '#6b21a8' },
    chart: { palettes: [{ name: 'Warm', colors: ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6'] }], selected: 'Warm' },
    cardCustomization: { padding: '20px', borderRadius: '16px', shadow: '0 4px 12px rgba(124,58,237,0.1)' },
  },
};
const ADMIN_PRESET_KEYS = Object.keys(ADMIN_THEME_PRESETS);

let token = '';
let state: 'idle' | 'loading' | 'setup' | 'ready' | 'error' = 'idle';
let error = '';

let adminPreset = '';
let adminThemeJsonText = '';
let adminThemeError = '';

function handlePresetChange(preset: string) {
  adminPreset = preset;
  adminThemeError = '';
  if (preset && ADMIN_THEME_PRESETS[preset]) {
    adminThemeJsonText = JSON.stringify(ADMIN_THEME_PRESETS[preset], null, 2);
  } else {
    adminThemeJsonText = '';
  }
}

function handleAdminJsonChange(val: string) {
  adminThemeJsonText = val;
  adminPreset = '';
  if (val.trim()) {
    try { JSON.parse(val); adminThemeError = ''; } catch { adminThemeError = 'Invalid JSON'; }
  } else {
    adminThemeError = '';
  }
}

$: resolvedAdminTheme = (() => {
  let raw: any = null;
  if (adminThemeJsonText.trim()) {
    try { raw = JSON.parse(adminThemeJsonText); } catch { /* fall through */ }
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

let enableDownloadCsv = false;
let enableEmailCsv = false;
let disableFullscreen = false;

let language: 'en' | 'fr' | 'de' | 'es' = 'en';

let clientIdDraft = 'default';
let activeClientId = 'default';

function installServerEventHandler() {
  (window as unknown as { databrainServerEvent?: (e: unknown) => void }).databrainServerEvent = (
    event: { type?: string } | unknown,
  ) => {
    const ev = event as { type?: string };
    if (ev?.type === 'TOKEN_EXPIRED') {
      console.warn('Databrain: guest token expired.');
    } else {
      console.log('Databrain server event:', event);
    }
  };
}

async function fetchToken() {
  state = 'loading';
  try {
    const res = await fetch(`${API_URL}/api/guest-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: activeClientId }),
    });
    const data = await res.json();
    if (res.ok && data.configured === false) {
      state = 'setup';
      return;
    }
    if (res.ok && data.guestToken) {
      token = data.guestToken;
      state = 'ready';
      return;
    }
    state = 'error';
    error = data.error || 'Failed to get guest token';
  } catch (e: unknown) {
    state = 'error';
    error = e instanceof Error ? e.message : 'Connection failed';
  }
}

function switchClient() {
  activeClientId = clientIdDraft.trim() || 'default';
  fetchToken();
}

function callEmbedFunction(fn: 'onClickCreateMetric' | 'onClickManageMetrics') {
  const el = document.querySelector('dbn-dashboard');
  const inner = el?.shadowRoot?.querySelector('.dbn-dashboard') as unknown as
    | Record<string, () => void>
    | undefined;
  if (inner && typeof inner[fn] === 'function') inner[fn]();
}

onMount(() => {
  installServerEventHandler();
  fetchToken();
});
</script>

{#if state === 'loading' || state === 'idle'}
  <div
    style="display:flex;align-items:center;justify-content:center;height:100vh;color:#666;"
  >
    Loading dashboard…
  </div>
{:else if state === 'setup'}
  <div
    style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;"
  >
    <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">
      Configure Databrain
    </h2>
    <p style="font-size:14px;color:#666;margin-bottom:16px;">
      Set <code>DATABRAIN_API_TOKEN</code> and <code>DATA_APP_NAME</code> in
      <code>backend/.env</code>.
    </p>
    <button
      type="button"
      on:click={fetchToken}
      style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;"
    >
      Check again
    </button>
  </div>
{:else if state === 'error'}
  <div
    style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;"
  >
    <h2 style="font-size:18px;font-weight:600;color:#dc2626;margin-bottom:8px;">
      Error
    </h2>
    <p style="font-size:14px;color:#666;margin-bottom:16px;">{error}</p>
    <button
      type="button"
      on:click={fetchToken}
      style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;"
    >
      Retry
    </button>
  </div>
{:else if state === 'ready'}
  <div style="height:100vh;display:flex;flex-direction:column;overflow:hidden;">
    <div
      style="border-bottom:1px solid #e5e7eb;padding:10px 12px;display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;background:#fff;"
    >
      <span style="font-weight:600;font-size:14px;">Databrain + Svelte</span>

      {#if !DASHBOARD_ID}
        <span style="font-size:12px;color:#b45309;background:#fffbeb;padding:4px 8px;border-radius:4px;">
          Set VITE_DASHBOARD_ID in .env
        </span>
      {/if}

      <label style="display:flex;align-items:center;gap:6px;font-size:13px;">
        Admin Theme
        <select
          value={adminPreset}
          on:change={(e) => handlePresetChange(e.currentTarget.value)}
          style="border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:13px;"
        >
          <option value="">None (default)</option>
          {#each ADMIN_PRESET_KEYS as k}
            <option value={k}>{k}</option>
          {/each}
        </select>
      </label>

      <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
        <input type="checkbox" bind:checked={enableDownloadCsv} />
        Download CSV
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
        <input type="checkbox" bind:checked={enableEmailCsv} />
        Email CSV
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
        <input type="checkbox" bind:checked={disableFullscreen} />
        Disable fullscreen
      </label>

      <label style="display:flex;align-items:center;gap:6px;font-size:13px;">
        Language
        <select
          bind:value={language}
          style="border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:13px;"
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
        </select>
      </label>

      <label
        style="display:flex;align-items:center;gap:6px;font-size:13px;flex-wrap:wrap;"
      >
        Client ID
        <input
          type="text"
          bind:value={clientIdDraft}
          style="border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:13px;min-width:120px;"
        />
      </label>
      <button
        type="button"
        on:click={switchClient}
        style="padding:4px 12px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;cursor:pointer;background:#fff;"
      >
        Switch client
      </button>

      <button
        type="button"
        on:click={() => callEmbedFunction('onClickCreateMetric')}
        style="padding:4px 12px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;cursor:pointer;background:#fff;"
      >
        Create Metric
      </button>
      <button
        type="button"
        on:click={() => callEmbedFunction('onClickManageMetrics')}
        style="padding:4px 12px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;cursor:pointer;background:#fff;"
      >
        Manage Metrics
      </button>
    </div>

    <div style="padding:8px 12px;border-bottom:1px solid #e5e7eb;background:#fff;">
      <details>
        <summary style="font-size:12px;color:#64748b;cursor:pointer;user-select:none;">
          Admin Theme JSON {#if adminThemeError}<span style="color:#dc2626;margin-left:8px;">{adminThemeError}</span>{/if}
        </summary>
        <textarea
          style="margin-top:8px;width:100%;height:140px;font-family:monospace;font-size:12px;border:1px solid #d1d5db;border-radius:6px;padding:8px;background:#f9fafb;resize:vertical;box-sizing:border-box;"
          value={adminThemeJsonText}
          on:input={(e) => handleAdminJsonChange(e.currentTarget.value)}
          placeholder={'Paste or edit adminThemeOptions JSON here.\nSelect a preset above to start from an example.'}
          spellcheck="false"
        />
      </details>
    </div>

    <div style="flex:1;overflow:auto;padding:8px;display:flex;flex-direction:column;gap:12px;">
      <div style="flex:1;min-height:320px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#fff;">
        <dbn-dashboard
          token={token}
          dashboard-id={DASHBOARD_ID}
          handle-server-event="databrainServerEvent"
          admin-theme-options={resolvedAdminTheme}
          language={language}
          enable-download-csv={enableDownloadCsv ? 'true' : undefined}
          enable-email-csv={enableEmailCsv ? 'true' : undefined}
          disable-fullscreen={disableFullscreen ? 'true' : undefined}
        />
      </div>

      {#if METRIC_ID}
        <div
          style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#fafafa;"
        >
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#374151;">
            Metric (VITE_METRIC_ID)
          </div>
          <dbn-metric
            token={token}
            metric-id={METRIC_ID}
            width={500}
            height={350}
            variant="card"
            chart-renderer-type="svg"
            metric-filter-position="outside"
          />
        </div>
      {/if}
    </div>
  </div>
{/if}
