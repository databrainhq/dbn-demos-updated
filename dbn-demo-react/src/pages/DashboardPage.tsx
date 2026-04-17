/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { DEFAULT_DASHBOARD_ID } from "@/lib/config";
import { useGuestToken } from "@/lib/use-guest-token";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_OPTIONS = {
  disableMetricCreation: false,
  disableMetricUpdation: false,
  disableMetricDeletion: false,
  disableLayoutCustomization: false,
  disableSaveLayout: false,
  disableScheduleEmailReports: false,
  disableManageMetrics: false,
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

const CUSTOM_CHART_SETTINGS = {
  margins: {
    marginTop: { defaultValue: 20, canEdit: true },
    marginBottom: { defaultValue: 8, canEdit: true },
    marginLeft: { defaultValue: 10, canEdit: true },
    marginRight: { defaultValue: 10, canEdit: true },
  },
  chartColors: {
    defaultValue: ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2"],
    canEdit: true,
  },
  legendSettings: {
    show: { defaultValue: true, canEdit: true },
    top: { defaultValue: 0, canEdit: true },
    left: { defaultValue: 0, canEdit: true },
    position: { defaultValue: "horizontal", canEdit: true },
    truncateLegendValue: { defaultValue: 20, canEdit: true },
    legendShape: { defaultValue: "roundRect", canEdit: true },
    customise: { defaultValue: true, canEdit: true },
    fixedPosition: { defaultValue: "bottom-center", canEdit: true },
    disableScroll: { defaultValue: false, canEdit: true },
    fontSize: { defaultValue: 12, canEdit: true },
    fontFamily: { defaultValue: "Inter", canEdit: true },
    fontWeight: { defaultValue: 400, canEdit: true },
    color: { defaultValue: "#111827", canEdit: true },
  },
  labelSettings: {
    show: { defaultValue: true, canEdit: true },
    position: { defaultValue: "outside", canEdit: true },
    truncateLabel: { defaultValue: false, canEdit: true },
    truncateLabelValue: { defaultValue: 12, canEdit: true },
    showLabelLine: { defaultValue: true, canEdit: true },
    isEnableValueSummation: { defaultValue: false, canEdit: true },
    showDimension: { defaultValue: true, canEdit: true },
    isDynamicPosition: { defaultValue: true, canEdit: true },
    showActualValue: { defaultValue: true, canEdit: true },
    XAxisStyle: {
      size: { defaultValue: 12, canEdit: true },
      family: { defaultValue: "Inter", canEdit: true },
      weight: { defaultValue: 500, canEdit: true },
      color: { defaultValue: "#334155", canEdit: true },
      axisName: { defaultValue: "", canEdit: true },
      axisPadding: { defaultValue: 0, canEdit: true },
      axisMargin: { defaultValue: 0, canEdit: true },
      axisNameConfig: {
        fontFamily: { defaultValue: "Inter", canEdit: true },
        fontSize: { defaultValue: 12, canEdit: true },
        fontWeight: { defaultValue: 500, canEdit: true },
      },
    },
    YAxisStyle: {
      size: { defaultValue: 12, canEdit: true },
      family: { defaultValue: "Inter", canEdit: true },
      weight: { defaultValue: 500, canEdit: true },
      color: { defaultValue: "#334155", canEdit: true },
      axisName: { defaultValue: "", canEdit: true },
      axisPadding: { defaultValue: 0, canEdit: true },
      axisMargin: { defaultValue: 0, canEdit: true },
      axisNameConfig: {
        fontFamily: { defaultValue: "Inter", canEdit: true },
        fontSize: { defaultValue: 12, canEdit: true },
        fontWeight: { defaultValue: 500, canEdit: true },
      },
    },
  },
  tooltipSettings: {
    labelStyle: {
      size: { defaultValue: 12, canEdit: true },
      family: { defaultValue: "Inter", canEdit: true },
      weight: { defaultValue: 400, canEdit: true },
      color: { defaultValue: "#111827", canEdit: true },
    },
    valueStyle: {
      size: { defaultValue: 12, canEdit: true },
      family: { defaultValue: "Inter", canEdit: true },
      weight: { defaultValue: 500, canEdit: true },
      color: { defaultValue: "#111827", canEdit: true },
    },
    tooltipHeader: {
      size: { defaultValue: 14, canEdit: true },
      family: { defaultValue: "Inter", canEdit: true },
      weight: { defaultValue: 600, canEdit: true },
      color: { defaultValue: "#111827", canEdit: true },
    },
  },
  axisSettings: {
    switchYaxis: {
      axis: { defaultValue: "left", canEdit: true },
    },
  },
  customSettings: {
    numberFormatter: { defaultValue: "", canEdit: true },
    isEnableLabelFormatting: { defaultValue: true, canEdit: true },
    isEnableCustomLimits: { defaultValue: true, canEdit: true },
    isEnableDynamicLimits: { defaultValue: true, canEdit: true },
    isEnableLogScale: { defaultValue: false, canEdit: true },
    isEnableTimezoneFormatting: { defaultValue: true, canEdit: true },
    isEnableBgColor: { defaultValue: false, canEdit: true },
    timeFormatter: { defaultValue: "yyyy-MM-dd", canEdit: true },
    customUppperLimit: { defaultValue: 1000, canEdit: true },
    customLowerLimit: { defaultValue: 0, canEdit: true },
    hideXSplitLines: { defaultValue: false, canEdit: true },
    hideYSplitLines: { defaultValue: false, canEdit: true },
    hideXAxisLines: { defaultValue: false, canEdit: true },
    hideYAxisLines: { defaultValue: false, canEdit: true },
    hideYAxisTicks: { defaultValue: false, canEdit: true },
    hideXAxisTicks: { defaultValue: false, canEdit: true },
    hideXAxisLabels: { defaultValue: false, canEdit: true },
    hideYAxisLabels: { defaultValue: false, canEdit: true },
    subHeaderShow: { defaultValue: true, canEdit: true },
    displayText: { defaultValue: "", canEdit: true },
    subHeaderAlignment: { defaultValue: "center", canEdit: true },
    isEnableLabelTooltip: { defaultValue: true, canEdit: true },
    showFullStacked: { defaultValue: false, canEdit: true },
    isEnableMeasureMode: { defaultValue: true, canEdit: true },
    cumulativeBar: { defaultValue: false, canEdit: true },
    enableTitleDesc: { defaultValue: true, canEdit: false },
    chartTitle: { defaultValue: "Please enter a title", canEdit: true },
    chartDesc: { defaultValue: "Please enter a description", canEdit: true },
    titlePosition: { defaultValue: "top", canEdit: true },
    labelPrefix: { defaultValue: "", canEdit: true },
    labelSuffix: { defaultValue: "", canEdit: true },
    barWidth: { defaultValue: 20, canEdit: true },
    barRadius: { defaultValue: [0, 0, 0, 0], canEdit: true },
    thresholdValues: {
      defaultValue: [{ upperLimit: 1000, lowerLimit: 0, label: "Low", color: "#00FF00" }],
      canEdit: true,
    },
    bgColorRules: {
      defaultValue: [{ type: "range", min: 0, max: 100, color: "#00FF00" }],
      canEdit: true,
    },
    combineMeasureChartType: {
      defaultValue: [{ axis: "left", measures: ["revenue"], chartTypes: [{ axis: "left", type: "bar" }] }],
      canEdit: true,
    },
    maxMinAvgSettings: {
      isEnableMax: { defaultValue: true, canEdit: true },
      isEnableMin: { defaultValue: true, canEdit: true },
      isEnableAvg: { defaultValue: true, canEdit: true },
      maxColor: { defaultValue: "#008000", canEdit: true },
      minColor: { defaultValue: "#FF0000", canEdit: true },
    },
    zoomSettings: {
      isZoomEnabled: { defaultValue: true, canEdit: true },
      zoomAxis: { defaultValue: "x", canEdit: true },
    },
    warningValue: {
      isEnable: { defaultValue: true, canEdit: true },
      limit: { defaultValue: 100, canEdit: true },
      color: { defaultValue: "#000000", canEdit: true },
      message: { defaultValue: "", canEdit: true },
      messageSize: { defaultValue: 12, canEdit: true },
    },
    dangerValue: {
      isEnable: { defaultValue: false, canEdit: true },
      limit: { defaultValue: 0, canEdit: true },
      message: { defaultValue: "", canEdit: true },
      messageSize: { defaultValue: 12, canEdit: true },
    },
  },
  tableSettings: {
    conditionalFormatting: {
      defaultValue: [
        {
          columnName: "status",
          rules: [
            {
              operator: "=",
              value: "Active",
              styles: { backgroundColor: "#00FF00", color: "#000000", isApplyBgColor: true },
            },
          ],
        },
      ],
      canEdit: true,
    },
    isEnableNumberFormatting: { defaultValue: true, canEdit: true },
    numberFormatting: {
      defaultValue: [{ columns: ["revenue"], formatter: "#,##0.00", suffix: "K", prefix: "$" }],
      canEdit: true,
    },
    isEnableTimezoneFormatting: { defaultValue: true, canEdit: true },
    timeFormatter: { defaultValue: "yyyy-MM-dd", canEdit: true },
  },
};

const DEFAULT_BOOLEAN_ATTRS: Record<string, boolean> = {
  "enable-download-csv": true,
  "enable-email-csv": true,
  "enable-download-all-metrics": true,
  "disable-fullscreen": false,
  "is-hide-table-preview": false,
  "is-hide-chart-settings": false,
  "enable-multi-metric-filters": true,
};

const SETTINGS_ICON = {
  name: "custom-settings",
  iconSvg:
    "<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M12 20h9'/><path d='M12 4h9'/><path d='M4 9h16'/><path d='M4 15h16'/><circle cx='8' cy='4' r='2'/><circle cx='16' cy='20' r='2'/><circle cx='6' cy='15' r='2'/><circle cx='18' cy='9' r='2'/></svg>",
};

declare global {
  interface Window {
    dbnChartClickHandler?: (data: unknown) => void;
  }
}

export default function DashboardPage() {
  const dashboardId = DEFAULT_DASHBOARD_ID;
  const { state, token, error, fetchToken } = useGuestToken();
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [attrs, setAttrs] = useState<Record<string, boolean>>(DEFAULT_BOOLEAN_ATTRS);
  const [language, setLanguage] = useState("en");
  const [showPanel, setShowPanel] = useState(true);
  const [enableCustomChartSettings, setEnableCustomChartSettings] = useState(true);
  const [enableChartClickHandler, setEnableChartClickHandler] = useState(true);
  const [enableSettingsIcon, setEnableSettingsIcon] = useState(true);
  const [lastChartClickPayload, setLastChartClickPayload] = useState("");

  useEffect(() => { fetchToken(); }, [fetchToken]);

  useEffect(() => {
    if (!enableChartClickHandler) {
      window.dbnChartClickHandler = undefined;
      return;
    }
    window.dbnChartClickHandler = (data: unknown) => {
      setLastChartClickPayload(JSON.stringify(data, null, 2));
    };
    return () => {
      window.dbnChartClickHandler = undefined;
    };
  }, [enableChartClickHandler]);

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
                <option value="en">English</option>
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
          <div className="space-y-1.5">
            <h3 className="font-semibold">v0.16.34 Features</h3>
            <label className="flex items-center gap-2 py-0.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={enableCustomChartSettings}
                onChange={() => setEnableCustomChartSettings((v) => !v)}
                className="rounded"
              />
              Use <code>custom-chart-settings</code>
            </label>
            <label className="flex items-center gap-2 py-0.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={enableChartClickHandler}
                onChange={() => setEnableChartClickHandler((v) => !v)}
                className="rounded"
              />
              Use <code>chart-click-function</code>
            </label>
            <label className="flex items-center gap-2 py-0.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={enableSettingsIcon}
                onChange={() => setEnableSettingsIcon((v) => !v)}
                className="rounded"
              />
              Use <code>settings-icon</code>
            </label>
          </div>
          {enableChartClickHandler && (
            <div>
              <h3 className="font-semibold mb-2">Last Chart Click</h3>
              {lastChartClickPayload ? (
                <pre className="rounded bg-muted p-2 text-[10px] leading-4 whitespace-pre-wrap break-all">
                  {lastChartClickPayload}
                </pre>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Click a chart datapoint to inspect payload.
                </p>
              )}
            </div>
          )}
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
            {...(enableSettingsIcon ? { "settings-icon": JSON.stringify(SETTINGS_ICON) } : {})}
            {...(enableChartClickHandler ? { "chart-click-function": "dbnChartClickHandler" } : {})}
            {...(
              enableCustomChartSettings
                ? { "custom-chart-settings": JSON.stringify(CUSTOM_CHART_SETTINGS) }
                : {}
            )}
          />
        </div>
      </div>
    </div>
  );
}
