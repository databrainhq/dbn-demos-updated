"use client";
import "@databrainhq/plugin/web";
import { useEffect, useState, useCallback } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": any;
      "dbn-metric": any;
    }
  }
}

// Server event handler for TOKEN_EXPIRED
if (typeof window !== "undefined") {
  (window as any).databrainServerEvent = (event: any) => {
    if (event?.type === "TOKEN_EXPIRED") {
      console.warn("Databrain: guest token expired. Refresh the page.");
    }
  };
}

type ThemePreset = "none" | "light" | "dark";

const THEMES: Record<string, object> = {
  none: {},
  light: {
    colors: { primary: "#2563eb", background: "#ffffff", dark: "#0f172a", light: "#f8fafc" },
    typography: { fontFamily: "Inter", fontSize: "13px" },
  },
  dark: {
    colors: { primary: "#60a5fa", background: "#0f172a", dark: "#f8fafc", light: "#1e293b" },
    typography: { fontFamily: "Inter", fontSize: "13px" },
  },
};

export default function Home() {
  const dashboardId = process.env.NEXT_PUBLIC_DASHBOARD_ID || "";
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || "default";

  const [token, setToken] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "setup" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<ThemePreset>("none");

  const fetchToken = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/guest-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json();
      if (res.ok && data.configured === false) { setState("setup"); return; }
      if (res.ok && data.guestToken) { setToken(data.guestToken); setState("ready"); return; }
      setState("error");
      setError(data.error || "Failed to get guest token");
    } catch (e: any) {
      setState("error");
      setError(e.message || "Connection failed");
    }
  }, [clientId]);

  useEffect(() => { fetchToken(); }, [fetchToken]);

  if (state === "loading" || state === "idle") {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading dashboard…</div>;
  }

  if (state === "setup") {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Configure Databrain</h2>
        <p className="text-sm text-gray-600 mb-4">Set <code className="bg-gray-100 px-1 rounded">DATABRAIN_API_TOKEN</code> and <code className="bg-gray-100 px-1 rounded">DATA_APP_NAME</code> in <code className="bg-gray-100 px-1 rounded">.env.local</code>.</p>
        <button onClick={fetchToken} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Check again</button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button onClick={fetchToken} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Retry</button>
      </div>
    );
  }

  if (!dashboardId) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Set Dashboard ID</h2>
        <p className="text-sm text-gray-600">Set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_DASHBOARD_ID</code> in <code className="bg-gray-100 px-1 rounded">.env.local</code>.</p>
      </div>
    );
  }

  const themeJson = theme !== "none" ? JSON.stringify(THEMES[theme]) : undefined;

  return (
    <main className="min-h-screen">
      <div className="border-b p-3 flex items-center gap-3 bg-white">
        <span className="font-semibold text-sm">Databrain + Next.js (App Router)</span>
        <select value={theme} onChange={(e) => setTheme(e.target.value as ThemePreset)} className="ml-auto border rounded px-2 py-1 text-sm">
          <option value="none">Default theme</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div className="p-2 min-h-[90vh]">
        <dbn-dashboard
          token={token}
          dashboard-id={dashboardId}
          handle-server-event="databrainServerEvent"
          {...(themeJson ? { theme: themeJson } : {})}
        />
      </div>
    </main>
  );
}
