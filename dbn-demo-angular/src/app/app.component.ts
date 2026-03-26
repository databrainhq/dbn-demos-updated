import { Component, AfterViewInit, OnInit } from '@angular/core';
import '@databrainhq/plugin/web';

// Server event handler for TOKEN_EXPIRED
(window as any).databrainServerEvent = (event: any) => {
  if (event?.type === 'TOKEN_EXPIRED') {
    console.warn('Databrain: guest token expired. Refresh the page.');
  }
};

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

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="state === 'loading'" style="display:flex;align-items:center;justify-content:center;height:100vh;color:#666;">
      Loading dashboard…
    </div>

    <div *ngIf="state === 'setup'" style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">Configure Databrain</h2>
      <p style="font-size:14px;color:#666;margin-bottom:16px;">
        Set <code>DATABRAIN_API_TOKEN</code> and <code>DATA_APP_NAME</code> in <code>backend/.env</code>, then start the backend.
      </p>
      <button (click)="fetchToken()" style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;">Check again</button>
    </div>

    <div *ngIf="state === 'error'" style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="font-size:18px;font-weight:600;color:#dc2626;margin-bottom:8px;">Error</h2>
      <p style="font-size:14px;color:#666;margin-bottom:16px;">{{ errorMessage }}</p>
      <button (click)="fetchToken()" style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;">Retry</button>
    </div>

    <div *ngIf="state === 'ready'" style="height:100vh;display:flex;flex-direction:column;">
      <div style="border-bottom:1px solid #e5e7eb;padding:12px;display:flex;flex-wrap:wrap;align-items:flex-start;gap:16px;background:white;">
        <span style="font-weight:600;font-size:14px;align-self:center;">Databrain + Angular</span>

        <div style="display:flex;flex-direction:column;gap:4px;border-left:1px solid #e5e7eb;padding-left:12px;min-width:140px;">
          <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.02em;">Admin Theme</span>
          <select
            [value]="adminPreset"
            (change)="onAdminPresetChange($event)"
            style="border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:13px;max-width:180px;"
          >
            <option value="">None (default)</option>
            <option *ngFor="let k of adminPresetKeys" [value]="k">{{ k }}</option>
          </select>
        </div>

        <div style="display:flex;flex-direction:column;gap:6px;border-left:1px solid #e5e7eb;padding-left:12px;">
          <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.02em;">Options</span>
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;cursor:pointer;">
              <input type="checkbox" [checked]="enableDownloadCsv" (change)="enableDownloadCsv = !enableDownloadCsv" /> Download CSV
            </label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;cursor:pointer;">
              <input type="checkbox" [checked]="enableEmailCsv" (change)="enableEmailCsv = !enableEmailCsv" /> Email CSV
            </label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;cursor:pointer;">
              <input type="checkbox" [checked]="disableFullscreen" (change)="disableFullscreen = !disableFullscreen" /> Disable Fullscreen
            </label>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:4px;border-left:1px solid #e5e7eb;padding-left:12px;">
          <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.02em;">i18n</span>
          <select
            [value]="language"
            (change)="onLanguageChange($event)"
            style="border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:13px;"
          >
            <option value="en">English (en)</option>
            <option value="fr">Français (fr)</option>
            <option value="de">Deutsch (de)</option>
            <option value="es">Español (es)</option>
          </select>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;border-left:1px solid #e5e7eb;padding-left:12px;flex:1;min-width:220px;">
          <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.02em;">Multi-Tenant</span>
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
            <label style="font-size:12px;color:#475569;display:flex;align-items:center;gap:6px;">
              Client ID
              <input
                type="text"
                [value]="clientId"
                (input)="clientId = ($any($event.target).value)"
                style="border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:13px;width:140px;"
              />
            </label>
            <button
              type="button"
              (click)="switchClient()"
              style="padding:4px 12px;background:#0f172a;color:white;border:none;border-radius:4px;font-size:13px;cursor:pointer;"
            >
              Switch client
            </button>
          </div>
          <label style="font-size:12px;color:#475569;display:flex;flex-direction:column;gap:4px;">
            Dashboard filters (JSON <code>params</code> for guest token)
            <textarea
              [value]="paramsJson"
              (input)="paramsJson = $any($event.target).value"
              rows="2"
              placeholder='{"filterId": "value"}'
              style="border:1px solid #d1d5db;border-radius:4px;padding:6px 8px;font-size:12px;font-family:monospace;width:100%;max-width:360px;resize:vertical;"
            ></textarea>
          </label>
        </div>

        <div style="display:flex;flex-direction:column;gap:6px;border-left:1px solid #e5e7eb;padding-left:12px;">
          <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.02em;">Actions</span>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <button type="button" (click)="callEmbedFunction('onClickCreateMetric')" style="padding:4px 12px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;cursor:pointer;background:white;">
              Create Metric
            </button>
            <button type="button" (click)="callEmbedFunction('onClickManageMetrics')" style="padding:4px 12px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;cursor:pointer;background:white;">
              Manage Metrics
            </button>
          </div>
        </div>
      </div>

      <div style="padding:8px 12px;border-bottom:1px solid #e5e7eb;background:#fff;">
        <details>
          <summary style="font-size:12px;color:#64748b;cursor:pointer;user-select:none;">
            Admin Theme JSON <span *ngIf="adminThemeError" style="color:#dc2626;margin-left:8px;">{{ adminThemeError }}</span>
          </summary>
          <textarea
            style="margin-top:8px;width:100%;height:140px;font-family:monospace;font-size:12px;border:1px solid #d1d5db;border-radius:6px;padding:8px;background:#f9fafb;resize:vertical;box-sizing:border-box;"
            [value]="adminThemeJsonText"
            (input)="onAdminJsonChange($any($event.target).value)"
            placeholder="Paste or edit adminThemeOptions JSON here.&#10;Select a preset above to start from an example."
            spellcheck="false"
          ></textarea>
        </details>
      </div>

      <div style="flex:1;padding:8px;overflow:auto;display:flex;flex-direction:column;gap:12px;min-height:0;">
        <dbn-dashboard
          [attr.token]="token"
          [attr.dashboard-id]="dashboardId"
          [attr.options]="optionsJson"
          [attr.admin-theme-options]="resolvedAdminTheme"
          [attr.language]="language"
          [attr.enable-download-csv]="enableDownloadCsv || null"
          [attr.enable-email-csv]="enableEmailCsv || null"
          [attr.disable-fullscreen]="disableFullscreen || null"
          handle-server-event="databrainServerEvent"
        ></dbn-dashboard>
        <div *ngIf="metricId" style="min-height:360px;border:1px solid #e5e7eb;border-radius:8px;padding:8px;background:#fafafa;">
          <div style="font-size:12px;color:#64748b;margin-bottom:8px;">Metric (<code>?metricId=</code>)</div>
          <dbn-metric
            [attr.token]="token"
            [attr.metric-id]="metricId"
            width="500"
            height="350"
            variant="card"
            chart-renderer-type="svg"
          ></dbn-metric>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    code { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 13px; }
  `],
})
export class AppComponent implements OnInit, AfterViewInit {
  token = '';
  dashboardId = '';
  metricId = '';
  state: 'idle' | 'loading' | 'setup' | 'ready' | 'error' = 'idle';
  errorMessage = '';
  enableDownloadCsv = true;
  enableEmailCsv = false;
  disableFullscreen = false;
  adminPreset = '';
  adminThemeJsonText = '';
  adminThemeError = '';
  adminPresetKeys = ADMIN_PRESET_KEYS;
  language = 'en';
  clientId = 'default';
  paramsJson = '';

  private apiUrl = 'http://localhost:3002';

  get optionsJson(): string {
    return JSON.stringify({ showDashboardActions: false });
  }

  get resolvedAdminTheme(): string | null {
    let raw: any = null;
    if (this.adminThemeJsonText.trim()) {
      try { raw = JSON.parse(this.adminThemeJsonText); } catch { /* fall through */ }
    }
    if (!raw && this.adminPreset && ADMIN_THEME_PRESETS[this.adminPreset]) {
      raw = ADMIN_THEME_PRESETS[this.adminPreset];
    }
    if (!raw) return null;
    return JSON.stringify({
      general: raw.general || {},
      dashboard: raw.dashboard || {},
      cardTitle: raw.cardTitle || {},
      cardDescription: raw.cardDescription || {},
      chart: raw.chart || {},
      cardCustomization: raw.cardCustomization || {},
      ...raw,
    });
  }

  onAdminPresetChange(ev: Event) {
    const val = (ev.target as HTMLSelectElement).value;
    this.adminPreset = val;
    this.adminThemeError = '';
    if (val && ADMIN_THEME_PRESETS[val]) {
      this.adminThemeJsonText = JSON.stringify(ADMIN_THEME_PRESETS[val], null, 2);
    } else {
      this.adminThemeJsonText = '';
    }
  }

  onAdminJsonChange(val: string) {
    this.adminThemeJsonText = val;
    this.adminPreset = '';
    if (val.trim()) {
      try { JSON.parse(val); this.adminThemeError = ''; } catch { this.adminThemeError = 'Invalid JSON'; }
    } else {
      this.adminThemeError = '';
    }
  }

  ngOnInit() {
    this.dashboardId = this.getQueryParam('dashboardId', '');
    this.metricId = this.getQueryParam('metricId', '');
    this.fetchToken();
  }

  ngAfterViewInit() {}

  onLanguageChange(ev: Event) {
    this.language = (ev.target as HTMLSelectElement).value;
  }

  switchClient() {
    this.fetchToken();
  }

  async fetchToken() {
    this.state = 'loading';
    const params = this.parseParamsBody();
    try {
      const body: Record<string, unknown> = { clientId: this.clientId || 'default' };
      if (params !== undefined) body.params = params;

      const res = await fetch(`${this.apiUrl}/api/guest-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.configured === false) { this.state = 'setup'; return; }
      if (res.ok && data.guestToken) { this.token = data.guestToken; this.state = 'ready'; return; }
      this.state = 'error';
      this.errorMessage = data.error || 'Failed to get guest token';
    } catch (e: any) {
      this.state = 'error';
      this.errorMessage = e.message || 'Connection failed';
    }
  }

  private parseParamsBody(): Record<string, unknown> | undefined {
    const raw = this.paramsJson.trim();
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      /* omit invalid params */
    }
    return undefined;
  }

  callEmbedFunction(fn: string) {
    const el = document.querySelector('dbn-dashboard');
    const inner = el?.shadowRoot?.querySelector('.dbn-dashboard') as any;
    if (inner && typeof inner[fn] === 'function') inner[fn]();
  }

  private getQueryParam(key: string, fallback: string): string {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get(key) || fallback;
  }
}
