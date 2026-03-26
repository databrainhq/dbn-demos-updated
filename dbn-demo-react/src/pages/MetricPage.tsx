/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { DEFAULT_METRIC_ID, DEFAULT_DASHBOARD_ID } from "@/lib/config";
import { useGuestToken } from "@/lib/use-guest-token";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetricPage() {
  const metricId = DEFAULT_METRIC_ID;
  const { state, token, error, fetchToken } = useGuestToken();
  const [rendererType, setRendererType] = useState<"svg" | "canvas">("svg");
  const [variant, setVariant] = useState<"card" | "fullscreen">("card");
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(350);

  useEffect(() => { fetchToken(); }, [fetchToken]);

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

  if (!metricId) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Metric Embed</CardTitle>
            <CardDescription>Embed individual <code>&lt;dbn-metric&gt;</code> cards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Set <code className="bg-muted px-1 rounded">VITE_DEFAULT_METRIC_ID</code> in the root <code className="bg-muted px-1 rounded">.env</code> to
              a metric embed ID. You can find this in your Data App → Embed Info → Add New Embed → select metric type.
            </p>
            <p className="text-muted-foreground">
              The <code>&lt;dbn-metric&gt;</code> component accepts: <code>metric-id</code>, <code>width</code>, <code>height</code>,
              <code>variant</code> ("card" | "fullscreen"), <code>chart-renderer-type</code> ("svg" | "canvas"),
              <code>metric-filter-position</code>, <code>appearance-options</code>, <code>chart-appearance</code>, and all theming props.
            </p>
            <p>
              <a href="https://docs.usedatabrain.com/developer-docs/helpers/component-options-reference" target="_blank" rel="noopener" className="underline">Full component reference →</a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Example Code</CardTitle></CardHeader>
          <CardContent>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">{`<dbn-metric
  token={guestToken}
  metric-id="your-metric-embed-id"
  width={500}
  height={350}
  variant="card"
  chart-renderer-type="svg"
  metric-filter-position="outside"
  enable-multi-metric-filters
/>`}</pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "loading" || state === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground">Loading metric…</p>
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <label className="text-sm">
          Renderer:
          <select value={rendererType} onChange={(e) => setRendererType(e.target.value as any)} className="ml-1 border rounded px-2 py-1 text-sm">
            <option value="svg">SVG</option>
            <option value="canvas">Canvas</option>
          </select>
        </label>
        <label className="text-sm">
          Variant:
          <select value={variant} onChange={(e) => setVariant(e.target.value as any)} className="ml-1 border rounded px-2 py-1 text-sm">
            <option value="card">Card</option>
            <option value="fullscreen">Fullscreen</option>
          </select>
        </label>
        <label className="text-sm">
          Width:
          <input type="number" value={width} onChange={(e) => setWidth(+e.target.value)} className="ml-1 border rounded px-2 py-1 text-sm w-20" />
        </label>
        <label className="text-sm">
          Height:
          <input type="number" value={height} onChange={(e) => setHeight(+e.target.value)} className="ml-1 border rounded px-2 py-1 text-sm w-20" />
        </label>
      </div>

      <div className="border rounded-lg bg-white p-4 inline-block">
        <dbn-metric
          token={token}
          metric-id={metricId}
          width={width}
          height={height}
          variant={variant}
          chart-renderer-type={rendererType}
          metric-filter-position="outside"
          enable-multi-metric-filters
        />
      </div>
    </div>
  );
}
