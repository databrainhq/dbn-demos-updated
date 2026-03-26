/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { DEFAULT_DASHBOARD_ID } from "@/lib/config";
import { useGuestToken } from "@/lib/use-guest-token";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MultiTenantPage() {
  const dashboardId = DEFAULT_DASHBOARD_ID;
  const { state, token, error, fetchToken } = useGuestToken();
  const [clientId, setClientId] = useState("client-a");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const loadForClient = async () => {
    const params: Record<string, any> = {};
    if (filterField && filterValue && dashboardId) {
      params.dashboardAppFilters = [{
        dashboardId,
        values: { [filterField]: filterValue },
      }];
    }
    await fetchToken({
      clientId,
      params: Object.keys(params).length ? params : undefined,
    });
  };

  if (!dashboardId) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Multi-Tenant Embedding</CardTitle>
            <CardDescription>Data isolation per client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>Set <code className="bg-muted px-1 rounded">VITE_DEFAULT_DASHBOARD_ID</code> to see a live preview.</p>
            <div className="space-y-3">
              <p><strong>clientId:</strong> Each guest token includes a <code>clientId</code> that Databrain uses for automatic data isolation. Client A only sees Client A's data.</p>
              <p><strong>RLS Settings:</strong> Pass <code>params.rlsSettings</code> in the guest token for row-level security per metric.</p>
              <p><strong>Dashboard App Filters:</strong> Pass <code>params.dashboardAppFilters</code> to pre-apply filters (string, multi-select, date range, number range).</p>
              <p><strong>Hide Filters:</strong> Pass <code>params.hideDashboardFilters</code> to hide specific filters from the UI.</p>
              <p><strong>Dashboard Provisioning:</strong> Create per-client dashboards via <code>POST /api/v2/data-app/dashboard-embeds</code> with <code>templateDashboardId</code>.</p>
            </div>
            <a href="https://docs.usedatabrain.com/developer-docs/security" target="_blank" rel="noopener" className="underline">Security & multi-tenancy docs →</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Client Switcher</CardTitle>
          <CardDescription>Switch clients to see data isolation. Each client gets a separate guest token.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Client ID</Label>
              <Input value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-40" placeholder="client-a" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Filter field (optional)</Label>
              <Input value={filterField} onChange={(e) => setFilterField(e.target.value)} className="w-40" placeholder="region" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Filter value (optional)</Label>
              <Input value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="w-40" placeholder="North America" />
            </div>
            <Button onClick={loadForClient}>Load Dashboard</Button>
          </div>
        </CardContent>
      </Card>

      {state === "loading" && (
        <div className="flex items-center gap-2 py-8 justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          <span className="text-muted-foreground">Loading for {clientId}…</span>
        </div>
      )}

      {state === "error" && (
        <Card><CardContent className="py-4"><p className="text-sm text-destructive">{error}</p></CardContent></Card>
      )}

      {state === "setup" && (
        <Card><CardContent className="py-4 text-sm"><p>Configure backend credentials first.</p></CardContent></Card>
      )}

      {state === "ready" && token && (
        <div className="border rounded-lg bg-white min-h-[70vh] p-4">
          <dbn-dashboard token={token} dashboard-id={dashboardId} />
        </div>
      )}
    </div>
  );
}
