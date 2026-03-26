const API_URL = 'http://localhost:3002';
const DASHBOARD_ID = ''; // Set your embed ID here
const METRIC_ID = ''; // Optional: metric embed ID for <dbn-metric> below the dashboard

const ADMIN_THEME_PRESETS = {
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

/** Enables Create / Manage metrics and related embed APIs when combined with guest-token permissions. */
const DASHBOARD_OPTIONS_JSON = JSON.stringify({
  showDashboardActions: true,
  disableMetricCreation: false,
  disableMetricUpdation: false,
  disableMetricDeletion: false,
  disableLayoutCustomization: false,
  disableManageMetrics: false,
});

const TOKEN_PERMISSIONS = {
  isEnableManageMetrics: true,
  isEnableCustomizeLayout: true,
  isEnableUnderlyingData: true,
  isEnableDownloadMetrics: true,
  isShowSideBar: true,
  isShowDashboardName: true,
};

const EMBED_BOOLEAN_ATTRS = [
  { checkboxId: 'opt-enable-download-csv', attr: 'enable-download-csv' },
  { checkboxId: 'opt-enable-email-csv', attr: 'enable-email-csv' },
  { checkboxId: 'opt-disable-fullscreen', attr: 'disable-fullscreen' },
];

window.databrainServerEvent = (event) => {
  if (event?.type === 'TOKEN_EXPIRED') {
    console.warn('Databrain: guest token expired.');
  }
};

let currentDashboard = null;
let currentMetric = null;

function showSetup(message) {
  document.getElementById('app').innerHTML = `
    <div class="setup">
      <h2>Configure Databrain</h2>
      <p>${message}</p>
      <button class="btn" onclick="location.reload()">Check again</button>
    </div>
  `;
  currentDashboard = null;
  currentMetric = null;
}

function showError(message) {
  document.getElementById('app').innerHTML = `
    <div class="setup">
      <h2 style="color:#dc2626;">Error</h2>
      <p>${message}</p>
      <button class="btn" onclick="location.reload()">Retry</button>
    </div>
  `;
  currentDashboard = null;
  currentMetric = null;
}

function buildGuestTokenBody() {
  const clientEl = document.getElementById('client-id-input');
  const fieldEl = document.getElementById('filter-field-input');
  const valueEl = document.getElementById('filter-value-input');
  const clientId = (clientEl?.value ?? 'default').trim() || 'default';
  const filterField = (fieldEl?.value ?? '').trim();
  const filterValue = (valueEl?.value ?? '').trim();

  const body = {
    clientId,
    permissions: TOKEN_PERMISSIONS,
  };

  if (filterField && filterValue && DASHBOARD_ID) {
    body.params = {
      dashboardAppFilters: [
        {
          dashboardId: DASHBOARD_ID,
          values: { [filterField]: filterValue },
        },
      ],
    };
  }

  return body;
}

async function requestGuestToken() {
  const res = await fetch(`${API_URL}/api/guest-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildGuestTokenBody()),
  });
  const data = await res.json();
  return { res, data };
}

function syncEmbedBooleanAttrs() {
  if (!currentDashboard) return;
  for (const { checkboxId, attr } of EMBED_BOOLEAN_ATTRS) {
    const cb = document.getElementById(checkboxId);
    if (cb?.checked) currentDashboard.setAttribute(attr, 'true');
    else currentDashboard.removeAttribute(attr);
  }
}

function syncLanguage() {
  if (!currentDashboard) return;
  const sel = document.getElementById('language-select');
  const v = sel?.value ?? '';
  if (!v || v === 'en') currentDashboard.removeAttribute('language');
  else currentDashboard.setAttribute('language', v);
}

function ensureAdminThemeKeys(raw) {
  return {
    general: raw.general || {},
    dashboard: raw.dashboard || {},
    cardTitle: raw.cardTitle || {},
    cardDescription: raw.cardDescription || {},
    chart: raw.chart || {},
    cardCustomization: raw.cardCustomization || {},
    ...raw,
  };
}

function syncAdminTheme() {
  if (!currentDashboard) return;
  const sel = document.getElementById('theme-select');
  const textarea = document.getElementById('admin-theme-json');
  const preset = sel?.value ?? '';

  if (textarea && textarea.value.trim()) {
    try {
      const parsed = JSON.parse(textarea.value);
      currentDashboard.setAttribute('admin-theme-options', JSON.stringify(ensureAdminThemeKeys(parsed)));
      return;
    } catch { /* fall through to preset */ }
  }

  if (preset && ADMIN_THEME_PRESETS[preset]) {
    currentDashboard.setAttribute('admin-theme-options', JSON.stringify(ensureAdminThemeKeys(ADMIN_THEME_PRESETS[preset])));
  } else {
    currentDashboard.removeAttribute('admin-theme-options');
  }
}

function onAdminPresetChange() {
  const sel = document.getElementById('theme-select');
  const textarea = document.getElementById('admin-theme-json');
  const errorEl = document.getElementById('admin-theme-error');
  const preset = sel?.value ?? '';
  if (errorEl) errorEl.textContent = '';
  if (preset && ADMIN_THEME_PRESETS[preset]) {
    if (textarea) textarea.value = JSON.stringify(ADMIN_THEME_PRESETS[preset], null, 2);
  } else {
    if (textarea) textarea.value = '';
  }
  syncAdminTheme();
}

function onAdminJsonInput() {
  const textarea = document.getElementById('admin-theme-json');
  const errorEl = document.getElementById('admin-theme-error');
  const sel = document.getElementById('theme-select');
  if (sel) sel.value = '';
  if (textarea && textarea.value.trim()) {
    try {
      JSON.parse(textarea.value);
      if (errorEl) errorEl.textContent = '';
    } catch {
      if (errorEl) errorEl.textContent = 'Invalid JSON';
    }
  } else {
    if (errorEl) errorEl.textContent = '';
  }
  syncAdminTheme();
}

function callEmbedFunction(fnName) {
  const el = currentDashboard;
  if (!el) return;
  const inner = el.shadowRoot?.querySelector('.dbn-dashboard');
  if (inner && typeof inner[fnName] === 'function') inner[fnName]();
  else console.warn(`Databrain: embed function ${fnName} is not available yet.`);
}

function renderDashboard(token, dashboardId) {
  const container = document.getElementById('app');
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.id = 'dashboard-container';

  const dash = document.createElement('dbn-dashboard');
  dash.setAttribute('token', token);
  dash.setAttribute('dashboard-id', dashboardId);
  dash.setAttribute('options', DASHBOARD_OPTIONS_JSON);
  dash.setAttribute('handle-server-event', 'databrainServerEvent');
  wrap.appendChild(dash);
  currentDashboard = dash;

  syncEmbedBooleanAttrs();
  syncLanguage();
  syncAdminTheme();

  if (METRIC_ID) {
    const metric = document.createElement('dbn-metric');
    metric.setAttribute('token', token);
    metric.setAttribute('metric-id', METRIC_ID);
    metric.setAttribute('width', '500');
    metric.setAttribute('height', '350');
    metric.setAttribute('variant', 'card');
    metric.setAttribute('chart-renderer-type', 'svg');
    metric.setAttribute('metric-filter-position', 'outside');
    metric.setAttribute('enable-multi-metric-filters', 'true');
    wrap.appendChild(metric);
    currentMetric = metric;
  } else {
    currentMetric = null;
  }

  container.appendChild(wrap);
}

async function switchClient() {
  if (!currentDashboard) return;
  const btn = document.getElementById('switch-client-btn');
  if (btn) btn.disabled = true;
  try {
    const { res, data } = await requestGuestToken();
    if (res.ok && data.guestToken) {
      currentDashboard.setAttribute('token', data.guestToken);
      if (currentMetric) currentMetric.setAttribute('token', data.guestToken);
      return;
    }
    console.error(data.error || 'Failed to refresh guest token');
  } catch (err) {
    console.error(err.message || 'Token refresh failed');
  } finally {
    if (btn) btn.disabled = false;
  }
}

function bindToolbar() {
  for (const { checkboxId } of EMBED_BOOLEAN_ATTRS) {
    document.getElementById(checkboxId)?.addEventListener('change', syncEmbedBooleanAttrs);
  }
  document.getElementById('language-select')?.addEventListener('change', syncLanguage);
  document.getElementById('theme-select')?.addEventListener('change', onAdminPresetChange);
  document.getElementById('admin-theme-json')?.addEventListener('input', onAdminJsonInput);
  document.getElementById('switch-client-btn')?.addEventListener('click', () => {
    switchClient();
  });
  document.getElementById('btn-create-metric')?.addEventListener('click', () => {
    callEmbedFunction('onClickCreateMetric');
  });
  document.getElementById('btn-manage-metrics')?.addEventListener('click', () => {
    callEmbedFunction('onClickManageMetrics');
  });
}

async function init() {
  bindToolbar();
  try {
    const { res, data } = await requestGuestToken();

    if (res.ok && data.configured === false) {
      showSetup(
        'Set <code>DATABRAIN_API_TOKEN</code> and <code>DATA_APP_NAME</code> in <code>backend/.env</code>.',
      );
      return;
    }
    if (res.ok && data.guestToken) {
      if (!DASHBOARD_ID) {
        showSetup(
          'Set the <code>DASHBOARD_ID</code> constant in <code>src/main.js</code> to your embed ID. Optionally set <code>METRIC_ID</code> for a metric card.',
        );
        return;
      }
      renderDashboard(data.guestToken, DASHBOARD_ID);
      return;
    }
    showError(data.error || 'Failed to get guest token');
  } catch (err) {
    showError(err.message || 'Connection failed');
  }
}

document.addEventListener('DOMContentLoaded', init);
