import { Component, AfterViewInit, OnInit } from '@angular/core';
import '@databrainhq/plugin/web';

// Server event handler for TOKEN_EXPIRED
(window as any).databrainServerEvent = (event: any) => {
  if (event?.type === 'TOKEN_EXPIRED') {
    console.warn('Databrain: guest token expired. Refresh the page.');
  }
};

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
      <div style="border-bottom:1px solid #e5e7eb;padding:12px;display:flex;align-items:center;gap:12px;background:white;">
        <span style="font-weight:600;font-size:14px;">Databrain + Angular</span>
        <label style="margin-left:auto;font-size:13px;">
          <input type="checkbox" [checked]="enableDownloadCsv" (change)="enableDownloadCsv = !enableDownloadCsv" /> Download CSV
        </label>
        <label style="font-size:13px;">
          <input type="checkbox" [checked]="enableEmailCsv" (change)="enableEmailCsv = !enableEmailCsv" /> Email CSV
        </label>
        <label style="font-size:13px;">
          <input type="checkbox" [checked]="disableFullscreen" (change)="disableFullscreen = !disableFullscreen" /> Disable Fullscreen
        </label>
        <button (click)="callEmbedFunction('onClickCreateMetric')" style="padding:4px 12px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;cursor:pointer;">Create Metric</button>
      </div>
      <div style="flex:1;padding:8px;">
        <dbn-dashboard
          [attr.token]="token"
          [attr.dashboard-id]="dashboardId"
          [attr.options]="optionsJson"
          [attr.enable-download-csv]="enableDownloadCsv || null"
          [attr.enable-email-csv]="enableEmailCsv || null"
          [attr.disable-fullscreen]="disableFullscreen || null"
          handle-server-event="databrainServerEvent"
        ></dbn-dashboard>
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
  state: 'idle' | 'loading' | 'setup' | 'ready' | 'error' = 'idle';
  errorMessage = '';
  enableDownloadCsv = true;
  enableEmailCsv = false;
  disableFullscreen = false;

  private apiUrl = 'http://localhost:3002';

  get optionsJson(): string {
    return JSON.stringify({ showDashboardActions: false });
  }

  ngOnInit() {
    this.dashboardId = this.getEnvOrDefault('dashboardId', '');
    this.fetchToken();
  }

  ngAfterViewInit() {}

  async fetchToken() {
    this.state = 'loading';
    try {
      const res = await fetch(`${this.apiUrl}/api/guest-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'default' }),
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

  callEmbedFunction(fn: string) {
    const el = document.querySelector('dbn-dashboard');
    const inner = el?.shadowRoot?.querySelector('.dbn-dashboard') as any;
    if (inner && typeof inner[fn] === 'function') inner[fn]();
  }

  private getEnvOrDefault(key: string, fallback: string): string {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get(key) || fallback;
  }
}
