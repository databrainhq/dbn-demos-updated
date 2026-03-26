/* eslint-disable @typescript-eslint/no-explicit-any */
import "@databrainhq/plugin/web";
import { useState, useEffect } from "react";
import { DATABRAIN_PLUGIN_BASE_URL } from "@/lib/config";

import { Button } from "@/components/ui/button";

import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
import MetricPage from "@/pages/MetricPage";
import ThemingPage from "@/pages/ThemingPage";
import MultiTenantPage from "@/pages/MultiTenantPage";
import SelfServePage from "@/pages/SelfServePage";

if (typeof window !== "undefined" && DATABRAIN_PLUGIN_BASE_URL) {
  (window as any).dbn = (window as any).dbn || {};
  (window as any).dbn.baseUrl = DATABRAIN_PLUGIN_BASE_URL;
}

// TOKEN_EXPIRED / server event handler
if (typeof window !== "undefined") {
  (window as any).databrainServerEvent = (event: any) => {
    if (event?.type === "TOKEN_EXPIRED") {
      console.warn("Databrain: guest token expired. Refresh to get a new one.");
    } else {
      console.log("Databrain server event:", event);
    }
  };
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": any;
      "dbn-metric": any;
    }
  }
}

type Page = "home" | "dashboard" | "metric" | "theming" | "multitenant" | "selfserve";

const NAV: { page: Page; label: string }[] = [
  { page: "home", label: "Home" },
  { page: "dashboard", label: "Dashboard" },
  { page: "metric", label: "Metric" },
  { page: "theming", label: "Theming" },
  { page: "multitenant", label: "Multi-Tenant" },
  { page: "selfserve", label: "AI & Self-Serve" },
];

function getPageFromHash(): Page {
  const hash = window.location.hash.replace("#", "");
  if (NAV.some((n) => n.page === hash)) return hash as Page;
  return "home";
}

function App() {
  const [page, setPage] = useState<Page>(getPageFromHash);

  useEffect(() => {
    const onHash = () => setPage(getPageFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (p: Page) => {
    window.location.hash = p;
    setPage(p);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <span className="font-semibold text-sm whitespace-nowrap mr-2">Databrain Demo</span>
        <nav className="flex items-center gap-1">
          {NAV.map((n) => (
            <Button
              key={n.page}
              variant={page === n.page ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate(n.page)}
              className="text-xs"
            >
              {n.label}
            </Button>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-4">
        {page === "home" && <HomePage />}
        {page === "dashboard" && <DashboardPage />}
        {page === "metric" && <MetricPage />}
        {page === "theming" && <ThemingPage />}
        {page === "multitenant" && <MultiTenantPage />}
        {page === "selfserve" && <SelfServePage />}
      </main>
    </div>
  );
}

export default App;
