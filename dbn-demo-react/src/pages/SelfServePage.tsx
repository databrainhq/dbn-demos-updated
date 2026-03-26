/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { DEFAULT_DASHBOARD_ID } from "@/lib/config";
import { useGuestToken } from "@/lib/use-guest-token";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SELF_SERVE_TOKEN_OPTS = {
  permissions: {
    isEnableManageMetrics: true,
    isEnableCustomizeLayout: true,
    isEnableUnderlyingData: true,
    isEnableDownloadMetrics: true,
    isShowSideBar: true,
    isShowDashboardName: true,
  },
  params: { userIdentifier: "demo-user-1" },
};

export default function SelfServePage() {
  const dashboardId = DEFAULT_DASHBOARD_ID;
  const { state, token, error, fetchToken } = useGuestToken();
  const dashRef = useRef<HTMLElement>(null);
  const [metricCreationMode, setMetricCreationMode] = useState<"DRAG_DROP" | "CHAT">("DRAG_DROP");
  const [aiPilot, setAiPilot] = useState(false);

  const loadToken = () => fetchToken(SELF_SERVE_TOKEN_OPTS);

  useEffect(() => { loadToken(); }, [fetchToken]);

  const callEmbedFunction = (fn: string) => {
    const el = dashRef.current;
    if (!el) return;
    const inner = (el as any).shadowRoot?.querySelector(".dbn-dashboard");
    if (inner && typeof inner[fn] === "function") {
      inner[fn]();
    } else {
      console.warn(`Embed function ${fn} not available yet.`);
    }
  };

  if (!dashboardId) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Chat & Self-Serve Analytics</CardTitle>
            <CardDescription>Let end users create their own metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>Set <code className="bg-muted px-1 rounded">VITE_DEFAULT_DASHBOARD_ID</code> to see a live preview.</p>
            <div className="space-y-3">
              <p><strong>AI Pilot:</strong> Set <code>isAllowAiPilot: true</code> in access settings to enable natural-language data querying.</p>
              <p><strong>Metric Creation Mode:</strong> <code>"DRAG_DROP"</code> for visual builder, <code>"CHAT"</code> for AI-powered creation.</p>
              <p><strong>Private Metrics:</strong> Pass <code>params.userIdentifier</code> in the guest token so users can create private metrics.</p>
              <p><strong>Embed Functions:</strong> Call imperative functions on the embed via shadow DOM:</p>
              <ul className="list-disc pl-5">
                <li><code>onClickCreateMetric()</code></li>
                <li><code>onClickManageMetrics()</code></li>
                <li><code>onClickScheduleReports()</code></li>
                <li><code>onClickCustomizeLayout()</code></li>
              </ul>
            </div>
            <a href="https://docs.usedatabrain.com/developer-docs/helpers/end-user-metric-creation" target="_blank" rel="noopener" className="underline">End user metric creation docs →</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "loading" || state === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="max-w-md mx-auto py-8">
        <Card>
          <CardHeader><CardTitle className="text-destructive">Error</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{error}</p><Button onClick={loadToken}>Retry</Button></CardContent>
        </Card>
      </div>
    );
  }

  if (state === "setup") {
    return (
      <div className="max-w-md mx-auto py-8">
        <Card>
          <CardHeader><CardTitle>Configure Backend</CardTitle></CardHeader>
          <CardContent className="text-sm"><p>Set backend credentials in <code className="bg-muted px-1 rounded">backend/.env</code>.</p></CardContent>
        </Card>
      </div>
    );
  }

  const options = JSON.stringify({
    showDashboardActions: true,
    disableMetricCreation: false,
    disableMetricUpdation: false,
    disableMetricDeletion: false,
    disableLayoutCustomization: false,
    disableManageMetrics: false,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Self-Serve Controls</CardTitle>
          <CardDescription>Trigger embed actions programmatically and configure AI features.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => callEmbedFunction("onClickCreateMetric")}>Create Metric</Button>
            <Button variant="outline" size="sm" onClick={() => callEmbedFunction("onClickManageMetrics")}>Manage Metrics</Button>
            <Button variant="outline" size="sm" onClick={() => callEmbedFunction("onClickScheduleReports")}>Schedule Reports</Button>
            <Button variant="outline" size="sm" onClick={() => callEmbedFunction("onClickCustomizeLayout")}>Customize Layout</Button>
            <span className="border-l mx-2" />
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={aiPilot} onChange={() => setAiPilot(!aiPilot)} />
              AI Pilot
            </label>
            <select value={metricCreationMode} onChange={(e) => setMetricCreationMode(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
              <option value="DRAG_DROP">Drag & Drop</option>
              <option value="CHAT">Chat</option>
            </select>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            AI Pilot and metric creation mode are configured in access settings when creating the embed, not at runtime.
            The toggles above are for reference — they require re-provisioning the dashboard embed with the updated settings.
          </p>
        </CardContent>
      </Card>

      <div className="border rounded-lg bg-white min-h-[70vh] p-4">
        <dbn-dashboard
          ref={dashRef}
          token={token}
          dashboard-id={dashboardId}
          options={options}
        />
      </div>
    </div>
  );
}
