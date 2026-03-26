/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { DEFAULT_DASHBOARD_ID } from "@/lib/config";
import { useGuestToken } from "@/lib/use-guest-token";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const THEMES: Record<string, object> = {
  none: {},
  light: {
    colors: {
      primary: "#2563eb", primaryLight: "#dbeafe", primaryDark: "#1e40af",
      secondary: "#64748b", secondaryLight: "#f1f5f9", secondaryDark: "#334155",
      background: "#ffffff", dark: "#0f172a", light: "#f8fafc",
    },
    typography: { fontFamily: "Inter", fontSize: "13px" },
  },
  dark: {
    colors: {
      primary: "#60a5fa", primaryLight: "#1e3a5f", primaryDark: "#93c5fd",
      secondary: "#94a3b8", secondaryLight: "#1e293b", secondaryDark: "#cbd5e1",
      background: "#0f172a", dark: "#f8fafc", light: "#1e293b",
    },
    typography: { fontFamily: "Inter", fontSize: "13px" },
  },
  brand: {
    colors: {
      primary: "#7c3aed", primaryLight: "#ede9fe", primaryDark: "#5b21b6",
      secondary: "#10b981", secondaryLight: "#d1fae5", secondaryDark: "#065f46",
      background: "#faf5ff", dark: "#1e1b4b", light: "#f5f3ff",
    },
    typography: { fontFamily: "system-ui", fontSize: "14px" },
    border: { radiusDefault: "8px", radiusMd: "12px" },
  },
};

export default function ThemingPage() {
  const dashboardId = DEFAULT_DASHBOARD_ID;
  const { state, token, error, fetchToken } = useGuestToken();
  const [selectedTheme, setSelectedTheme] = useState("none");
  const [themeName, setThemeName] = useState("");
  const [chartColors, setChartColors] = useState("");

  useEffect(() => { fetchToken(); }, [fetchToken]);

  if (!dashboardId) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theming</CardTitle>
            <CardDescription>Two ways to theme Databrain embeds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>Set <code className="bg-muted px-1 rounded">VITE_DEFAULT_DASHBOARD_ID</code> to see a live preview.</p>
            <div className="space-y-3">
              <p><strong>1. <code>theme</code> attribute (JSON):</strong> Pass a full theme object with <code>colors</code>, <code>border</code>, <code>typography</code>, <code>breakpoint</code>, <code>metricLayoutCols</code>, and <code>shadow</code>.</p>
              <p><strong>2. <code>theme-name</code> attribute:</strong> Reference a saved theme from your Databrain app settings (Data App → Theme Settings).</p>
              <p><strong>3. <code>chart-colors</code>:</strong> Array of color strings for chart elements.</p>
              <p><strong>4. CSS custom properties:</strong> <code>--metric-card-padding</code>, <code>--chart-height</code>, <code>--font-size-small</code>.</p>
            </div>
            <a href="https://docs.usedatabrain.com/guides/web-components/quick-start" target="_blank" rel="noopener" className="underline">Theme schema reference →</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "setup") {
    return (
      <div className="max-w-md mx-auto py-8">
        <Card>
          <CardHeader><CardTitle>Configure Backend</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Set backend credentials in <code className="bg-muted px-1 rounded">backend/.env</code>.</p>
            <Button onClick={() => fetchToken()}>Check again</Button>
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
          <CardContent><p className="text-sm">{error}</p><Button onClick={() => fetchToken()}>Retry</Button></CardContent>
        </Card>
      </div>
    );
  }

  const themeJson = selectedTheme !== "none" ? JSON.stringify(THEMES[selectedTheme]) : undefined;
  const colorsArray = chartColors
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <label className="text-sm">
          Theme preset:
          <select value={selectedTheme} onChange={(e) => setSelectedTheme(e.target.value)} className="ml-1 border rounded px-2 py-1 text-sm">
            {Object.keys(THEMES).map((k) => <option key={k} value={k}>{k === "none" ? "None (default)" : k}</option>)}
          </select>
        </label>
        <label className="text-sm">
          theme-name:
          <input type="text" value={themeName} onChange={(e) => setThemeName(e.target.value)} placeholder="saved theme name" className="ml-1 border rounded px-2 py-1 text-sm w-40" />
        </label>
        <label className="text-sm">
          chart-colors:
          <input type="text" value={chartColors} onChange={(e) => setChartColors(e.target.value)} placeholder="#FF6B6B, #4ECDC4, #45B7D1" className="ml-1 border rounded px-2 py-1 text-sm w-60" />
        </label>
      </div>

      <div className="border rounded-lg bg-white min-h-[70vh] p-4">
        <dbn-dashboard
          token={token}
          dashboard-id={dashboardId}
          {...(themeJson ? { theme: themeJson } : {})}
          {...(themeName ? { "theme-name": themeName } : {})}
          {...(colorsArray.length ? { "chart-colors": JSON.stringify(colorsArray) } : {})}
        />
      </div>
    </div>
  );
}
