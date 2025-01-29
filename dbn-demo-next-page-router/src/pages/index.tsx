"use client";
import { useEffect, useState } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": any;
      "dbn-metric": any;
    }
  }
}


export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [dashboardId, setDashboardId] = useState<string | null>(null);

  useEffect(() => {
    // Import web component
    import('@databrainhq/plugin/web');

    // Get URL parameters
    const url = new URL(window.location.href);
    setToken(url.searchParams.get("token"));
    setDashboardId(url.searchParams.get("dashboardId"));
  }, []);

  if (!token || !dashboardId) {
    return null;
  }

  return (
    <main className="h-screen w-full">
      <dbn-dashboard token={token} dashboard-id={dashboardId} />
    </main>
  );
}
