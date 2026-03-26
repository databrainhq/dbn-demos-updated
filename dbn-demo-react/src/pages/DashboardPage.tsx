/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { DEFAULT_DASHBOARD_ID } from "@/lib/config";
import { useGuestToken } from "@/lib/use-guest-token";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_OPTIONS = {
  disableMetricCreation: true,
  disableMetricUpdation: true,
  disableMetricDeletion: true,
  disableLayoutCustomization: true,
  disableSaveLayout: true,
  disableScheduleEmailReports: true,
  disableManageMetrics: true,
  hideDashboardName: false,
  hideMetricCardShadow: false,
  showDashboardActions: true,
  disableUnderlyingData: true,
  shouldFitFullScreen: false,
  disableMainLoader: false,
  disableMetricLoader: false,
};

const BOOLEAN_ATTRS = [
  { key: "enable-download-csv", label: "Download CSV" },
  { key: "enable-email-csv", label: "Email CSV" },
  { key: "enable-download-all-metrics", label: "Download All Metrics" },
  { key: "disable-fullscreen", label: "Disable Fullscreen" },
  { key: "is-hide-table-preview", label: "Hide Table Preview" },
  { key: "is-hide-chart-settings", label: "Hide Chart Settings" },
  { key: "enable-multi-metric-filters", label: "Multi-Metric Filters" },
];

export default function DashboardPage() {
  const dashboardId = DEFAULT_DASHBOARD_ID;
  const { state, token, error, fetchToken } = useGuestToken();
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [attrs, setAttrs] = useState<Record<string, boolean>>({});
  const [language, setLanguage] = useState("");
  const [showPanel, setShowPanel] = useState(true);

  useEffect(() => { fetchToken(); }, [fetchToken]);

  const toggleOption = (key: string) => {
    setOptions((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAttr = (key: string) => {
    setAttrs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (state === "setup") {
    return (
      <div className="max-w-md mx-auto py-8">
        <Card>
          <CardHeader><CardTitle>Configure Backend</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Set <code className="bg-muted px-1 rounded">DATABRAIN_API_TOKEN</code> and <code className="bg-muted px-1 rounded">DATA_APP_NAME</code> in <code className="bg-muted px-1 rounded">backend/.env</code>.</p>
            <Button onClick={() => fetchToken()}>Check again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="max-w-md mx-auto py-8">
        <Card>
          <CardHeader><CardTitle className="text-destructive">Error</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => fetchToken()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardId) {
    return (
      <div className="max-w-md mx-auto py-8">
        <Card>
          <CardHeader><CardTitle>Set Dashboard ID</CardTitle><CardDescription>No embed ID configured</CardDescription></CardHeader>
          <CardContent className="text-sm">
            <p>Set <code className="bg-muted px-1 rounded">VITE_DEFAULT_DASHBOARD_ID</code> in the root <code className="bg-muted px-1 rounded">.env</code> to an embed ID from your Databrain Data App.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "loading" || state === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  const optionsJson = JSON.stringify(options);
  const boolAttrs: Record<string, string> = {};
  for (const a of BOOLEAN_ATTRS) {
    if (attrs[a.key]) boolAttrs[a.key] = "true";
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-64px)]">
      {showPanel && (
        <aside className="w-72 shrink-0 overflow-y-auto border-r p-4 space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Options JSON</h3>
            <p className="text-xs text-muted-foreground mb-2">Passed via the <code>options</code> attribute.</p>
            {Object.entries(options).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2 py-0.5 cursor-pointer">
                <input type="checkbox" checked={val as boolean} onChange={() => toggleOption(key)} className="rounded" />
                <span className="text-xs">{key}</span>
              </label>
            ))}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Boolean Attributes</h3>
            <p className="text-xs text-muted-foreground mb-2">HTML attributes on <code>&lt;dbn-dashboard&gt;</code>.</p>
            {BOOLEAN_ATTRS.map((a) => (
              <label key={a.key} className="flex items-center gap-2 py-0.5 cursor-pointer">
                <input type="checkbox" checked={!!attrs[a.key]} onChange={() => toggleAttr(a.key)} className="rounded" />
                <span className="text-xs">{a.label}</span>
              </label>
            ))}
          </div>
          <div>
            <h3 className="font-semibold mb-2">i18n</h3>
            <label className="text-xs">
              Language:
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="ml-2 border rounded px-1 py-0.5 text-xs">
                <option value="">default (en)</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="hi">Hindi</option>
                <option value="ar">Arabic</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="it">Italian</option>
              </select>
            </label>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="outline" size="sm" onClick={() => setShowPanel(!showPanel)}>
            {showPanel ? "Hide" : "Show"} Options
          </Button>
          <span className="text-xs text-muted-foreground">Embed ID: {dashboardId}</span>
        </div>

        <div className="flex-1 border rounded-lg bg-white overflow-hidden">
          <dbn-dashboard
            token={token}
            dashboard-id={dashboardId}
            options={optionsJson}
            {...boolAttrs}
            {...(language ? { language } : {})}
          />
        </div>
      </div>
    </div>
  );
}
