/* eslint-disable @typescript-eslint/no-explicit-any */
import "@databrainhq/plugin/web";
import { useState, useEffect, useCallback } from "react";
import {
  API_BASE_URL,
  DATABRAIN_PLUGIN_BASE_URL,
  DEFAULT_CLIENT_ID,
  DEFAULT_DASHBOARD_ID,
} from "@/lib/config";

if (typeof window !== "undefined" && DATABRAIN_PLUGIN_BASE_URL) {
  (window as any).dbn = (window as any).dbn || {};
  (window as any).dbn.baseUrl = DATABRAIN_PLUGIN_BASE_URL;
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": any;
    }
  }
}

type Page = "home" | "dashboard";
type EmbedState = "idle" | "loading" | "setup" | "need-dashboard-id" | "ready" | "error";

function App() {
  const [page, setPage] = useState<Page>("home");
  const [embedState, setEmbedState] = useState<EmbedState>("idle");
  const [token, setToken] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const clientId = DEFAULT_CLIENT_ID;
  const dashboardId = DEFAULT_DASHBOARD_ID;

  const fetchToken = useCallback(async () => {
    setEmbedState("loading");
    setErrorMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard-guest-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: clientId || "default" }),
      });
      const data = await res.json();
      if (res.ok && data.configured === false) {
        setEmbedState("setup");
        return;
      }
      if (res.ok && data.guestToken) {
        setToken(data.guestToken);
        setEmbedState(dashboardId ? "ready" : "need-dashboard-id");
        return;
      }
      setEmbedState("error");
      setErrorMessage(data.error || "Failed to get guest token");
    } catch (e) {
      setEmbedState("error");
      setErrorMessage(e instanceof Error ? e.message : "Failed to connect to API");
    }
  }, [clientId, dashboardId]);

  // Only try to embed when user navigates to Dashboard
  useEffect(() => {
    if (page === "dashboard" && embedState === "idle") {
      fetchToken();
    }
  }, [page, embedState, fetchToken]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card px-4 py-3 flex items-center gap-4">
        <nav className="flex items-center gap-2">
          <Button
            variant={page === "home" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPage("home")}
          >
            Home
          </Button>
          <Button
            variant={page === "dashboard" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </Button>
        </nav>
        <span className="text-sm text-muted-foreground">DataBrain Embed Sample</span>
      </header>

      <main className="flex-1 p-6">
        {page === "home" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold">Welcome</h1>
            <p className="text-muted-foreground">
              This is a sample app. Use the <strong>Dashboard</strong> link above to embed a
              DataBrain dashboard. No config is required to run the app; when you open Dashboard,
              we’ll try to load the embed and show setup steps if needed.
            </p>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Getting started</CardTitle>
                <CardDescription>Configure via the Databrain MCP server</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>1. Add the Databrain MCP server in your IDE and set the service token in MCP settings.</p>
                <p>2. Use the runbooks in this repo (CUSTOMER_EMBED_LOGIC.md, LLM_INSTRUCTIONS.md) with the MCP server.</p>
                <p>3. Go to <Button variant="link" className="p-0 h-auto" onClick={() => setPage("dashboard")}>Dashboard</Button> to see the embed.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {page === "dashboard" && (
          <>
            {(embedState === "idle" || embedState === "loading") && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                <p className="text-muted-foreground">
                  {embedState === "idle" ? "Preparing…" : "Loading dashboard…"}
                </p>
              </div>
            )}
            {embedState === "setup" && (
              <div className="max-w-md mx-auto py-8">
                <Card>
                  <CardHeader>
                    <CardTitle>DataBrain Embed</CardTitle>
                    <CardDescription>No config required to run. To see a dashboard here:</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Set the service token in your <strong>MCP server settings</strong>, then use the runbooks in this repo with the Databrain MCP server to configure.
                    </p>
                    <Button onClick={fetchToken}>Check again</Button>
                  </CardContent>
                </Card>
              </div>
            )}
            {embedState === "need-dashboard-id" && (
              <div className="max-w-md mx-auto py-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Choose a dashboard</CardTitle>
                    <CardDescription>Set your dashboard embed ID in .env</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Set <code className="bg-muted px-1 rounded">VITE_DEFAULT_DASHBOARD_ID</code> in the root <code className="bg-muted px-1 rounded">.env</code> to the embed ID of the dashboard you want to show.
                    </p>
                    <Button onClick={fetchToken}>Check again</Button>
                  </CardContent>
                </Card>
              </div>
            )}
            {embedState === "error" && (
              <div className="max-w-md mx-auto py-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                    <CardDescription>Could not load dashboard</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{errorMessage}</p>
                    <Button onClick={fetchToken}>Retry</Button>
                  </CardContent>
                </Card>
              </div>
            )}
            {embedState === "ready" && token && dashboardId && (
              <div className="border rounded-lg bg-white min-h-[80vh] p-4">
                <dbn-dashboard token={token} dashboard-id={dashboardId} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
