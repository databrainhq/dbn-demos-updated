/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo, useCallback } from "react";
import { DEFAULT_DASHBOARD_ID } from "@/lib/config";
import { useGuestToken } from "@/lib/use-guest-token";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ADMIN_THEME_PRESETS,
  CHART_COLOR_PALETTES,
  COMPONENT_THEME_PRESETS,
  DEFAULT_ADMIN_THEME,
  DEFAULT_COMPONENT_THEME,
  type AdminThemePreset,
  type ComponentThemePreset,
} from "@/lib/theme-presets";

// ── code viewer with syntax highlighting ──

function CodeViewer({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="w-full h-full rounded-md bg-[#1e1e2e] text-[13px] leading-[1.6] font-mono overflow-auto flex">
      <div className="select-none text-right pr-3 pl-3 pt-3 pb-3 text-[#585872] border-r border-[#313147]" aria-hidden>
        {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <pre className="flex-1 p-3 m-0 overflow-x-auto"><code>{lines.map((line, i) => <div key={i}>{highlightLine(line)}</div>)}</code></pre>
    </div>
  );
}

function highlightLine(line: string): React.ReactNode {
  // Tag open/close
  if (/^<\/?[\w-]+/.test(line.trim())) {
    return highlightTag(line);
  }
  // Attribute line:  attr="value" or attr='value'
  const attrMatch = line.match(/^(\s*)([\w-]+)(=)('.*?'|".*?")?(.*)$/);
  if (attrMatch) {
    const [, indent, attr, eq, val, rest] = attrMatch;
    return (
      <>
        {indent}
        <span className="text-[#89b4fa]">{attr}</span>
        <span className="text-[#cdd6f4]">{eq}</span>
        {val && <span className="text-[#a6e3a1]">{val}</span>}
        {rest && <span className="text-[#cdd6f4]">{rest}</span>}
      </>
    );
  }
  return <span className="text-[#cdd6f4]">{line}</span>;
}

function highlightTag(line: string): React.ReactNode {
  const m = line.match(/^(\s*)(<\/?)(\s*)([\w-]+)(.*?)(>?)$/);
  if (!m) return <span className="text-[#cdd6f4]">{line}</span>;
  const [, indent, bracket, sp, tag, rest, close] = m;
  return (
    <>
      {indent}
      <span className="text-[#585872]">{bracket}</span>
      {sp}
      <span className="text-[#f38ba8]">{tag}</span>
      {rest && highlightAttrsInline(rest)}
      {close && <span className="text-[#585872]">{close}</span>}
    </>
  );
}

function highlightAttrsInline(s: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /([\w-]+)(=)('[^']*'|"[^"]*")/g;
  let last = 0;
  let match;
  while ((match = re.exec(s)) !== null) {
    if (match.index > last) parts.push(<span key={`t${last}`} className="text-[#cdd6f4]">{s.slice(last, match.index)}</span>);
    parts.push(
      <span key={`a${match.index}`}>
        <span className="text-[#89b4fa]">{match[1]}</span>
        <span className="text-[#cdd6f4]">{match[2]}</span>
        <span className="text-[#a6e3a1]">{match[3]}</span>
      </span>
    );
    last = re.lastIndex;
  }
  if (last < s.length) parts.push(<span key={`e${last}`} className="text-[#cdd6f4]">{s.slice(last)}</span>);
  return <>{parts}</>;
}

// ── tiny helpers ──

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="w-6 h-6 rounded border cursor-pointer p-0" />
      <span className="min-w-0 truncate">{label}</span>
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="#hex" className="w-20 border rounded px-1 py-0.5 text-xs font-mono" />
    </label>
  );
}

function NumberInput({ value, onChange, label, min, max, step }: { value: number | undefined; onChange: (v: number) => void; label: string; min?: number; max?: number; step?: number }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="min-w-0 truncate">{label}</span>
      <input type="number" value={value ?? ""} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step} className="w-16 border rounded px-1 py-0.5 text-xs" />
    </label>
  );
}

function TextInput({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder?: string }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="min-w-0 truncate whitespace-nowrap">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 min-w-0 border rounded px-1 py-0.5 text-xs" />
    </label>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-xs cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded" />
      <span>{label}</span>
    </label>
  );
}

function SelectInput({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: { value: string; label: string }[] }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="min-w-0 truncate whitespace-nowrap">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 border rounded px-1 py-0.5 text-xs">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function SectionHeader({ title, onReset }: { title: string; onReset?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      {onReset && <button onClick={onReset} className="text-[10px] text-muted-foreground hover:text-foreground underline">Reset</button>}
    </div>
  );
}

function PaletteSwatches({ colors }: { colors: string[] }) {
  return (
    <div className="flex gap-0.5">
      {colors.map((c, i) => (
        <div key={i} className="w-4 h-4 rounded-sm border" style={{ backgroundColor: c }} title={c} />
      ))}
    </div>
  );
}

// ── deep merge helper ──
function deepMerge(target: any, source: any): any {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) && target[key] && typeof target[key] === "object") {
      out[key] = deepMerge(target[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

function stripEmpty(obj: any): any {
  if (Array.isArray(obj)) return obj;
  if (obj && typeof obj === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === "" || v === null) continue;
      const cleaned = typeof v === "object" && !Array.isArray(v) ? stripEmpty(v) : v;
      if (typeof cleaned === "object" && !Array.isArray(cleaned) && Object.keys(cleaned).length === 0) continue;
      out[k] = cleaned;
    }
    return out;
  }
  return obj;
}

function setNested(obj: any, path: string, value: any): any {
  const next = JSON.parse(JSON.stringify(obj));
  const parts = path.split(".");
  let cursor = next;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cursor[parts[i]]) cursor[parts[i]] = {};
    cursor = cursor[parts[i]];
  }
  cursor[parts[parts.length - 1]] = value;
  return next;
}

const LEGEND_POSITIONS = [
  "", "top-left", "top-center", "top-right",
  "left-center", "right-center",
  "bottom-left", "bottom-center", "bottom-right",
];
const LEGEND_SHAPES = ["", "circle", "rect", "roundRect", "triangle", "diamond", "arrow", "none"];
const LABEL_POSITIONS = ["", "hidden", "top", "left", "right", "bottom", "inside"];
const RADIAL_POSITIONS = ["", "outside", "inside"];
const EXPORT_MSG_POSITIONS = ["", "bottom", "bottom-left", "bottom-right", "center", "top", "top-left", "top-right"];

// ── main page ──

export default function ThemingPage() {
  const dashboardId = DEFAULT_DASHBOARD_ID;
  const { state, token, error, fetchToken } = useGuestToken();

  // ── Admin theme options state ──
  const [adminTheme, setAdminTheme] = useState<AdminThemePreset>({ ...DEFAULT_ADMIN_THEME });
  const [adminPreset, setAdminPreset] = useState("");

  // ── Component theme state ──
  const [componentTheme, setComponentTheme] = useState<ComponentThemePreset>({ ...DEFAULT_COMPONENT_THEME });
  const [componentPreset, setComponentPreset] = useState("");

  // ── Chart colors (inside options) ──
  const [chartColorPalette, setChartColorPalette] = useState("");
  const [customChartColors, setCustomChartColors] = useState("");

  // ── Chart appearance (inside options) ──
  const [chartAppearance, setChartAppearance] = useState<any>({});

  // ── Theme name (saved theme) ──
  const [themeName, setThemeName] = useState("");

  // ── Boolean appearance/behavior flags ──
  const [boolFlags, setBoolFlags] = useState({
    hideMetricCardShadow: false,
    disableMetricCardBorder: false,
    isHideChartSettings: false,
    isHideTablePreview: false,
    disableFullscreen: false,
    isStickyDashboardFilters: false,
    enableTitleClickFullscreen: false,
    enableDownloadCsv: false,
    enableEmailCsv: false,
    disableDownloadPng: false,
    enableDownloadAllMetrics: false,
    enableDownloadAllPdf: false,
    enableMultiMetricFilters: false,
  });

  // ── Extra options fields ──
  const [optionFlags, setOptionFlags] = useState({
    shouldFitFullScreen: false,
    disableMainLoader: false,
    disableMetricLoader: false,
    isShowNoDataFoundScreen: false,
    disableDownloadUnderlyingDataNoFilters: false,
    disableDownloadDataNoFilters: false,
  });
  const [exportMsgPosition, setExportMsgPosition] = useState("");
  const [hideDatePickerOptions, setHideDatePickerOptions] = useState("");

  // ── Other props ──
  const [longDescWidth, setLongDescWidth] = useState("");
  const [longDescFontColor, setLongDescFontColor] = useState("");
  const [noDataImg, setNoDataImg] = useState("");
  const [noDataFoundSvg, setNoDataFoundSvg] = useState("");
  const [optionsIcon, setOptionsIcon] = useState("");
  const [customChartSettingsJson, setCustomChartSettingsJson] = useState("");
  const [customChartSettingsError, setCustomChartSettingsError] = useState("");

  // ── JSON editor state ──
  const [jsonTab, setJsonTab] = useState<"adminTheme" | "theme" | "options" | "embedCode">("adminTheme");
  const [jsonEditorValue, setJsonEditorValue] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  useEffect(() => { fetchToken(); }, [fetchToken]);

  // ── computed prop values ──

  const adminThemeJson = useMemo(() => {
    const cleaned = stripEmpty(adminTheme);
    const hasContent = Object.values(cleaned).some((v) =>
      typeof v === "object" && v !== null ? Object.keys(v).length > 0 : !!v
    );
    if (!hasContent) return undefined;
    return {
      general: cleaned.general || {},
      dashboard: cleaned.dashboard || {},
      cardTitle: cleaned.cardTitle || {},
      cardDescription: cleaned.cardDescription || {},
      chart: cleaned.chart || {},
      cardCustomization: cleaned.cardCustomization || {},
    };
  }, [adminTheme]);

  const componentThemeJson = useMemo(() => {
    const cleaned = stripEmpty(componentTheme);
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }, [componentTheme]);

  const chartColors = useMemo(() => {
    if (chartColorPalette && CHART_COLOR_PALETTES[chartColorPalette]) {
      return CHART_COLOR_PALETTES[chartColorPalette];
    }
    if (customChartColors.trim()) {
      return customChartColors.split(",").map((c) => c.trim()).filter(Boolean);
    }
    return undefined;
  }, [chartColorPalette, customChartColors]);

  const chartAppearanceJson = useMemo(() => {
    const cleaned = stripEmpty(chartAppearance);
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }, [chartAppearance]);

  const optionsJson = useMemo(() => {
    const opts: any = {};
    if (chartColors) opts.chartColors = chartColors;
    if (chartAppearanceJson) opts.chartAppearance = chartAppearanceJson;
    if (boolFlags.hideMetricCardShadow) opts.hideMetricCardShadow = true;
    if (boolFlags.disableMetricCardBorder) opts.disableMetricCardBorder = true;
    if (optionFlags.shouldFitFullScreen) opts.shouldFitFullScreen = true;
    if (optionFlags.disableMainLoader) opts.disableMainLoader = true;
    if (optionFlags.disableMetricLoader) opts.disableMetricLoader = true;
    if (optionFlags.isShowNoDataFoundScreen) opts.isShowNoDataFoundScreen = true;
    if (optionFlags.disableDownloadUnderlyingDataNoFilters) opts.disableDownloadUnderlyingDataNoFilters = true;
    if (optionFlags.disableDownloadDataNoFilters) opts.disableDownloadDataNoFilters = true;
    if (exportMsgPosition) opts.exportMsgPosition = exportMsgPosition;
    if (hideDatePickerOptions.trim()) {
      opts.hideDatePickerOptions = hideDatePickerOptions.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return Object.keys(opts).length > 0 ? opts : undefined;
  }, [chartColors, chartAppearanceJson, boolFlags, optionFlags, exportMsgPosition, hideDatePickerOptions]);

  const longDescConfig = useMemo(() => {
    if (!longDescWidth && !longDescFontColor) return undefined;
    const cfg: any = {};
    if (longDescWidth) cfg.width = longDescWidth;
    if (longDescFontColor) cfg.fontColor = longDescFontColor;
    return cfg;
  }, [longDescWidth, longDescFontColor]);

  const parsedCustomChartSettings = useMemo(() => {
    if (!customChartSettingsJson.trim()) return undefined;
    try {
      const p = JSON.parse(customChartSettingsJson);
      return p;
    } catch {
      return undefined;
    }
  }, [customChartSettingsJson]);

  // ── JSON editor sync ──

  const currentJsonForTab = useCallback(() => {
    if (jsonTab === "adminTheme") return adminThemeJson ? JSON.stringify(adminThemeJson, null, 2) : "{}";
    if (jsonTab === "theme") return componentThemeJson ? JSON.stringify(componentThemeJson, null, 2) : "{}";
    return optionsJson ? JSON.stringify(optionsJson, null, 2) : "{}";
  }, [jsonTab, adminThemeJson, componentThemeJson, optionsJson]);

  useEffect(() => {
    setJsonEditorValue(currentJsonForTab());
    setJsonError("");
  }, [currentJsonForTab]);

  const applyJsonEdit = () => {
    try {
      const parsed = JSON.parse(jsonEditorValue);
      setJsonError("");
      if (jsonTab === "adminTheme") {
        setAdminTheme(deepMerge(DEFAULT_ADMIN_THEME, parsed));
        setAdminPreset("");
      } else if (jsonTab === "theme") {
        setComponentTheme(parsed);
        setComponentPreset("");
      } else {
        if (parsed.chartColors) {
          setCustomChartColors(parsed.chartColors.join(", "));
          setChartColorPalette("");
        }
        if (parsed.chartAppearance) setChartAppearance(parsed.chartAppearance);
        setBoolFlags((prev) => ({
          ...prev,
          hideMetricCardShadow: !!parsed.hideMetricCardShadow,
          disableMetricCardBorder: !!parsed.disableMetricCardBorder,
        }));
        setOptionFlags((prev) => ({
          ...prev,
          shouldFitFullScreen: !!parsed.shouldFitFullScreen,
          disableMainLoader: !!parsed.disableMainLoader,
          disableMetricLoader: !!parsed.disableMetricLoader,
          isShowNoDataFoundScreen: !!parsed.isShowNoDataFoundScreen,
          disableDownloadUnderlyingDataNoFilters: !!parsed.disableDownloadUnderlyingDataNoFilters,
          disableDownloadDataNoFilters: !!parsed.disableDownloadDataNoFilters,
        }));
        if (parsed.exportMsgPosition) setExportMsgPosition(parsed.exportMsgPosition);
        if (parsed.hideDatePickerOptions) setHideDatePickerOptions(parsed.hideDatePickerOptions.join(", "));
      }
    } catch {
      setJsonError("Invalid JSON");
    }
  };

  // ── admin theme helpers ──

  const updateAdmin = (path: string, value: any) => {
    setAdminPreset("");
    setAdminTheme((prev) => setNested(prev, path, value));
  };

  const loadAdminPreset = (name: string) => {
    setAdminPreset(name);
    if (name && ADMIN_THEME_PRESETS[name]) {
      setAdminTheme(JSON.parse(JSON.stringify(ADMIN_THEME_PRESETS[name])));
    } else {
      setAdminTheme({ ...DEFAULT_ADMIN_THEME });
    }
  };

  // ── component theme helpers ──

  const updateComponent = (path: string, value: any) => {
    setComponentPreset("");
    setComponentTheme((prev) => setNested(prev, path, value));
  };

  const loadComponentPreset = (name: string) => {
    setComponentPreset(name);
    if (name && COMPONENT_THEME_PRESETS[name]) {
      setComponentTheme(JSON.parse(JSON.stringify(COMPONENT_THEME_PRESETS[name])));
    } else {
      setComponentTheme({ ...DEFAULT_COMPONENT_THEME });
    }
  };

  // ── chartAppearance helpers ──

  const updateCA = (path: string, value: any) => {
    setChartAppearance((prev: any) => setNested(prev, path, value));
  };
  const getCA = (path: string): any => {
    const parts = path.split(".");
    let cur: any = chartAppearance;
    for (const p of parts) { cur = cur?.[p]; }
    return cur;
  };

  // ── web component attributes ──

  const dashboardAttrs = useMemo(() => {
    const attrs: Record<string, string> = {};
    if (adminThemeJson) attrs["admin-theme-options"] = JSON.stringify(adminThemeJson);
    if (componentThemeJson) attrs.theme = JSON.stringify(componentThemeJson);
    if (optionsJson) attrs.options = JSON.stringify(optionsJson);
    if (themeName) attrs["theme-name"] = themeName;
    if (longDescConfig) attrs["long-description-config"] = JSON.stringify(longDescConfig);
    if (parsedCustomChartSettings) attrs["custom-chart-settings"] = JSON.stringify(parsedCustomChartSettings);
    if (noDataImg) attrs["no-data-img"] = noDataImg;
    if (noDataFoundSvg) attrs["no-data-found-svg"] = noDataFoundSvg;
    if (optionsIcon) attrs["options-icon"] = optionsIcon;
    if (boolFlags.isHideChartSettings) attrs["is-hide-chart-settings"] = "true";
    if (boolFlags.isHideTablePreview) attrs["is-hide-table-preview"] = "true";
    if (boolFlags.disableFullscreen) attrs["disable-fullscreen"] = "true";
    if (boolFlags.isStickyDashboardFilters) attrs["is-sticky-dashboard-filters"] = "true";
    if (boolFlags.enableTitleClickFullscreen) attrs["enable-title-click-fullscreen"] = "true";
    if (boolFlags.enableDownloadCsv) attrs["enable-download-csv"] = "true";
    if (boolFlags.enableEmailCsv) attrs["enable-email-csv"] = "true";
    if (boolFlags.disableDownloadPng) attrs["disable-download-png"] = "true";
    if (boolFlags.enableDownloadAllMetrics) attrs["enable-download-all-metrics"] = "true";
    if (boolFlags.enableDownloadAllPdf) attrs["enable-download-all-pdf"] = "true";
    if (boolFlags.enableMultiMetricFilters) attrs["enable-multi-metric-filters"] = "true";
    return attrs;
  }, [adminThemeJson, componentThemeJson, optionsJson, themeName, longDescConfig, parsedCustomChartSettings, noDataImg, noDataFoundSvg, optionsIcon, boolFlags]);

  // ── embed code snippet ──

  const embedCode = useMemo(() => {
    const indent = "  ";
    const lines: string[] = ["<dbn-dashboard"];
    lines.push(`${indent}token="${token}"`);
    lines.push(`${indent}dashboard-id="${dashboardId}"`);

    for (const [attr, val] of Object.entries(dashboardAttrs)) {
      if (val === "true") {
        lines.push(`${indent}${attr}="true"`);
      } else if (val.startsWith("{") || val.startsWith("[")) {
        lines.push(`${indent}${attr}='${val}'`);
      } else {
        lines.push(`${indent}${attr}="${val}"`);
      }
    }
    lines.push("></dbn-dashboard>");
    return lines.join("\n");
  }, [token, dashboardId, dashboardAttrs]);

  // ── copy all config ──

  const copyConfig = () => {
    const config: any = {};
    if (adminThemeJson) config.adminThemeOptions = adminThemeJson;
    if (componentThemeJson) config.theme = componentThemeJson;
    if (optionsJson) config.options = optionsJson;
    if (themeName) config.themeName = themeName;
    if (longDescConfig) config.longDescriptionConfig = longDescConfig;
    if (parsedCustomChartSettings) config.customChartSettings = parsedCustomChartSettings;
    if (noDataImg) config.noDataImg = noDataImg;
    if (noDataFoundSvg) config.noDataFoundSvg = noDataFoundSvg;
    if (optionsIcon) config.optionsIcon = optionsIcon;
    const ba: any = {};
    for (const [k, v] of Object.entries(boolFlags)) { if (v) ba[k] = true; }
    if (Object.keys(ba).length) config.booleanAttributes = ba;
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  };

  // ── render: loading/error states ──

  if (!dashboardId) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader><CardTitle>Theming Playground</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p>Set <code className="bg-muted px-1 rounded">VITE_DEFAULT_DASHBOARD_ID</code> in <code className="bg-muted px-1 rounded">.env</code> to see a live preview.</p>
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
        <p className="text-muted-foreground">Loading...</p>
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

  // ── Axis controls helper (reused for horizontal + vertical) ──
  const AxisControls = ({ prefix, label }: { prefix: string; label: string }) => (
    <>
      <SectionHeader title={label} onReset={() => setChartAppearance((p: any) => { const n = { ...p }; delete n[prefix]; return n; })} />
      <Toggle checked={!!getCA(`${prefix}.hideAxisLines`)} onChange={(v) => updateCA(`${prefix}.hideAxisLines`, v)} label="Hide axis lines" />
      <Toggle checked={!!getCA(`${prefix}.hideSplitLines`)} onChange={(v) => updateCA(`${prefix}.hideSplitLines`, v)} label="Hide split lines" />
      <Toggle checked={!!getCA(`${prefix}.hideAxisLabels`)} onChange={(v) => updateCA(`${prefix}.hideAxisLabels`, v)} label="Hide axis labels" />
      <Toggle checked={!!getCA(`${prefix}.hideAxisTicks`)} onChange={(v) => updateCA(`${prefix}.hideAxisTicks`, v)} label="Hide axis ticks" />
      <TextInput label="Axis Name" value={getCA(`${prefix}.axisName`) || ""} onChange={(v) => updateCA(`${prefix}.axisName`, v)} placeholder="" />
      <NumberInput label="Name Offset" value={getCA(`${prefix}.axisNameOffset`)} onChange={(v) => updateCA(`${prefix}.axisNameOffset`, v)} />
      <NumberInput label="Label Margin" value={getCA(`${prefix}.axisLabelMargin`)} onChange={(v) => updateCA(`${prefix}.axisLabelMargin`, v)} />
      <NumberInput label="Font Size" value={getCA(`${prefix}.fontSize`)} onChange={(v) => updateCA(`${prefix}.fontSize`, v)} min={6} max={48} />
      <TextInput label="Font Family" value={getCA(`${prefix}.fontFamily`) || ""} onChange={(v) => updateCA(`${prefix}.fontFamily`, v)} placeholder="Inter" />
      <NumberInput label="Font Weight" value={getCA(`${prefix}.fontWeight`)} onChange={(v) => updateCA(`${prefix}.fontWeight`, v)} min={100} max={900} step={100} />
      <ColorInput label="Color" value={getCA(`${prefix}.color`) || ""} onChange={(v) => updateCA(`${prefix}.color`, v)} />
      <ColorInput label="Axis Color" value={getCA(`${prefix}.axisColor`) || ""} onChange={(v) => updateCA(`${prefix}.axisColor`, v)} />
    </>
  );

  // ── Tooltip font group helper ──
  const TooltipFontGroup = ({ prefix, label }: { prefix: string; label: string }) => (
    <>
      <p className="text-[10px] font-medium text-muted-foreground mt-1">{label}</p>
      <div className="grid grid-cols-2 gap-1">
        <NumberInput label="Size" value={getCA(`${prefix}.size`)} onChange={(v) => updateCA(`${prefix}.size`, v)} min={6} max={48} />
        <NumberInput label="Weight" value={getCA(`${prefix}.weight`)} onChange={(v) => updateCA(`${prefix}.weight`, v)} min={100} max={900} step={100} />
      </div>
      <TextInput label="Family" value={getCA(`${prefix}.family`) || ""} onChange={(v) => updateCA(`${prefix}.family`, v)} placeholder="Inter" />
      <ColorInput label="Color" value={getCA(`${prefix}.color`) || ""} onChange={(v) => updateCA(`${prefix}.color`, v)} />
    </>
  );

  // ── main layout ──

  return (
    <div className="flex gap-4 h-[calc(100vh-64px)]">
      {/* LEFT: controls */}
      <aside className="w-80 shrink-0 overflow-y-auto border-r pr-3 space-y-1">

        {/* ════ Admin Theme Options ════ */}
        <details open>
          <summary className="cursor-pointer py-2 text-sm font-semibold border-b select-none">Admin Theme Options</summary>
          <div className="py-2 space-y-3">
            <div>
              <label className="text-xs">
                Load preset:
                <select value={adminPreset} onChange={(e) => loadAdminPreset(e.target.value)} className="ml-1 border rounded px-1 py-0.5 text-xs">
                  <option value="">Custom</option>
                  {Object.keys(ADMIN_THEME_PRESETS).map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </label>
            </div>

            <SectionHeader title="General" onReset={() => { updateAdmin("general.name", ""); updateAdmin("general.fontFamily", ""); }} />
            <TextInput label="Font Family" value={adminTheme.general.fontFamily} onChange={(v) => updateAdmin("general.fontFamily", v)} placeholder="Inter" />

            <SectionHeader title="Dashboard" onReset={() => setAdminTheme((p) => ({ ...p, dashboard: {} }))} />
            <ColorInput label="Background" value={adminTheme.dashboard.backgroundColor || ""} onChange={(v) => updateAdmin("dashboard.backgroundColor", v)} />
            <ColorInput label="CTA Color" value={adminTheme.dashboard.ctaColor || ""} onChange={(v) => updateAdmin("dashboard.ctaColor", v)} />
            <ColorInput label="CTA Text" value={adminTheme.dashboard.ctaTextColor || ""} onChange={(v) => updateAdmin("dashboard.ctaTextColor", v)} />
            <ColorInput label="Card Color" value={adminTheme.dashboard.metricCardColor || ""} onChange={(v) => updateAdmin("dashboard.metricCardColor", v)} />
            <ColorInput label="Select Text" value={adminTheme.dashboard.selectBoxTextColor || ""} onChange={(v) => updateAdmin("dashboard.selectBoxTextColor", v)} />
            <div className="flex gap-2">
              <label className="text-xs flex items-center gap-1">
                Size:
                <select value={adminTheme.dashboard.selectBoxSize || "medium"} onChange={(e) => updateAdmin("dashboard.selectBoxSize", e.target.value)} className="border rounded px-1 py-0.5 text-xs">
                  <option value="small">small</option>
                  <option value="medium">medium</option>
                  <option value="large">large</option>
                </select>
              </label>
              <label className="text-xs flex items-center gap-1">
                Variant:
                <select value={adminTheme.dashboard.selectBoxVariant || "static"} onChange={(e) => updateAdmin("dashboard.selectBoxVariant", e.target.value)} className="border rounded px-1 py-0.5 text-xs">
                  <option value="static">static</option>
                  <option value="floating">floating</option>
                </select>
              </label>
            </div>
            <TextInput label="Select Radius" value={adminTheme.dashboard.selectBoxBorderRadius || ""} onChange={(v) => updateAdmin("dashboard.selectBoxBorderRadius", v)} placeholder="6px" />

            <SectionHeader title="Card Title" onReset={() => setAdminTheme((p) => ({ ...p, cardTitle: {} }))} />
            <TextInput label="Font Size" value={adminTheme.cardTitle.fontSize || ""} onChange={(v) => updateAdmin("cardTitle.fontSize", v)} placeholder="16px" />
            <TextInput label="Font Weight" value={adminTheme.cardTitle.fontWeight || ""} onChange={(v) => updateAdmin("cardTitle.fontWeight", v)} placeholder="600" />
            <ColorInput label="Color" value={adminTheme.cardTitle.color || ""} onChange={(v) => updateAdmin("cardTitle.color", v)} />

            <SectionHeader title="Card Description" onReset={() => setAdminTheme((p) => ({ ...p, cardDescription: {} }))} />
            <TextInput label="Font Size" value={adminTheme.cardDescription.fontSize || ""} onChange={(v) => updateAdmin("cardDescription.fontSize", v)} placeholder="13px" />
            <TextInput label="Font Weight" value={adminTheme.cardDescription.fontWeight || ""} onChange={(v) => updateAdmin("cardDescription.fontWeight", v)} placeholder="400" />
            <ColorInput label="Color" value={adminTheme.cardDescription.color || ""} onChange={(v) => updateAdmin("cardDescription.color", v)} />

            <SectionHeader title="Card Customization" onReset={() => setAdminTheme((p) => ({ ...p, cardCustomization: {} }))} />
            <TextInput label="Padding" value={adminTheme.cardCustomization.padding || ""} onChange={(v) => updateAdmin("cardCustomization.padding", v)} placeholder="16px" />
            <TextInput label="Border Radius" value={adminTheme.cardCustomization.borderRadius || ""} onChange={(v) => updateAdmin("cardCustomization.borderRadius", v)} placeholder="8px" />
            <TextInput label="Shadow" value={adminTheme.cardCustomization.shadow || ""} onChange={(v) => updateAdmin("cardCustomization.shadow", v)} placeholder="0 1px 3px rgba(0,0,0,0.1)" />
            <Toggle checked={!!adminTheme.cardCustomization.disableShadowOnHover} onChange={(v) => updateAdmin("cardCustomization.disableShadowOnHover", v)} label="Disable hover shadow" />
            <Toggle checked={!!adminTheme.cardCustomization.disableStroke} onChange={(v) => updateAdmin("cardCustomization.disableStroke", v)} label="Disable stroke" />
            <Toggle checked={!!adminTheme.cardCustomization.metricStrokeColor} onChange={(v) => updateAdmin("cardCustomization.metricStrokeColor", v)} label="Metric stroke color" />
          </div>
        </details>

        {/* ════ Chart Colors ════ */}
        <details>
          <summary className="cursor-pointer py-2 text-sm font-semibold border-b select-none">Chart Colors</summary>
          <div className="py-2 space-y-3">
            <label className="text-xs">
              Palette:
              <select value={chartColorPalette} onChange={(e) => { setChartColorPalette(e.target.value); setCustomChartColors(""); }} className="ml-1 border rounded px-1 py-0.5 text-xs">
                <option value="">Custom / None</option>
                {Object.keys(CHART_COLOR_PALETTES).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
            {chartColorPalette && CHART_COLOR_PALETTES[chartColorPalette] && (
              <PaletteSwatches colors={CHART_COLOR_PALETTES[chartColorPalette]} />
            )}
            <TextInput label="Custom" value={customChartColors} onChange={(v) => { setCustomChartColors(v); setChartColorPalette(""); }} placeholder="#FF6B6B, #4ECDC4, #45B7D1" />
            {chartColors && <PaletteSwatches colors={chartColors} />}
          </div>
        </details>

        {/* ════ Chart Appearance ════ */}
        <details>
          <summary className="cursor-pointer py-2 text-sm font-semibold border-b select-none">Chart Appearance</summary>
          <div className="py-2 space-y-3">
            <SectionHeader title="Tooltip" onReset={() => setChartAppearance((p: any) => { const n = { ...p }; delete n.chartTooltip; return n; })} />
            <TooltipFontGroup prefix="chartTooltip.labelStyle" label="Label Style" />
            <TooltipFontGroup prefix="chartTooltip.valueStyle" label="Value Style" />
            <TooltipFontGroup prefix="chartTooltip.tooltipHeader" label="Header Style" />

            <SectionHeader title="Labels" onReset={() => setChartAppearance((p: any) => { const n = { ...p }; delete n.chartLabel; return n; })} />
            <SelectInput label="Position" value={getCA("chartLabel.position") || ""} onChange={(v) => updateCA("chartLabel.position", v)} options={LABEL_POSITIONS.map((p) => ({ value: p, label: p || "(default)" }))} />
            <SelectInput label="Radial Position" value={getCA("chartLabel.radialChartposition") || ""} onChange={(v) => updateCA("chartLabel.radialChartposition", v)} options={RADIAL_POSITIONS.map((p) => ({ value: p, label: p || "(default)" }))} />

            <SectionHeader title="Margins" onReset={() => setChartAppearance((p: any) => { const n = { ...p }; delete n.chartMargin; return n; })} />
            <div className="grid grid-cols-2 gap-1">
              <NumberInput label="Top" value={getCA("chartMargin.marginTop")} onChange={(v) => updateCA("chartMargin.marginTop", v)} />
              <NumberInput label="Right" value={getCA("chartMargin.marginRight")} onChange={(v) => updateCA("chartMargin.marginRight", v)} />
              <NumberInput label="Bottom" value={getCA("chartMargin.marginBottom")} onChange={(v) => updateCA("chartMargin.marginBottom", v)} />
              <NumberInput label="Left" value={getCA("chartMargin.marginLeft")} onChange={(v) => updateCA("chartMargin.marginLeft", v)} />
            </div>

            <SectionHeader title="Legend" onReset={() => setChartAppearance((p: any) => { const n = { ...p }; delete n.chartLegend; return n; })} />
            <Toggle checked={getCA("chartLegend.show") ?? true} onChange={(v) => updateCA("chartLegend.show", v)} label="Show legend" />
            <SelectInput label="Fixed Position" value={getCA("chartLegend.fixedPosition") || ""} onChange={(v) => updateCA("chartLegend.fixedPosition", v)} options={LEGEND_POSITIONS.map((p) => ({ value: p, label: p || "(default)" }))} />
            <Toggle checked={!!getCA("chartLegend.enableVariablePosition")} onChange={(v) => updateCA("chartLegend.enableVariablePosition", v)} label="Variable position" />
            <div className="grid grid-cols-2 gap-1">
              <NumberInput label="Top" value={getCA("chartLegend.top")} onChange={(v) => updateCA("chartLegend.top", v)} />
              <NumberInput label="Left" value={getCA("chartLegend.left")} onChange={(v) => updateCA("chartLegend.left", v)} />
            </div>
            <Toggle checked={!!getCA("chartLegend.disableLegendScrolling")} onChange={(v) => updateCA("chartLegend.disableLegendScrolling", v)} label="Disable scrolling" />
            <SelectInput label="Appearance" value={getCA("chartLegend.legendAppearance") || ""} onChange={(v) => updateCA("chartLegend.legendAppearance", v)} options={[{ value: "", label: "(default)" }, { value: "horizontal", label: "horizontal" }, { value: "vertical", label: "vertical" }]} />
            <NumberInput label="Truncate" value={getCA("chartLegend.truncateLegend")} onChange={(v) => updateCA("chartLegend.truncateLegend", v)} min={0} />
            <SelectInput label="Shape" value={getCA("chartLegend.legendShape") || ""} onChange={(v) => updateCA("chartLegend.legendShape", v)} options={LEGEND_SHAPES.map((s) => ({ value: s, label: s || "(default)" }))} />
            <NumberInput label="Font Size" value={getCA("chartLegend.fontSize")} onChange={(v) => updateCA("chartLegend.fontSize", v)} min={6} max={48} />
            <NumberInput label="Font Weight" value={getCA("chartLegend.fontWeight")} onChange={(v) => updateCA("chartLegend.fontWeight", v)} min={100} max={900} step={100} />
            <TextInput label="Font Family" value={getCA("chartLegend.fontFamily") || ""} onChange={(v) => updateCA("chartLegend.fontFamily", v)} placeholder="Inter" />
            <ColorInput label="Color" value={getCA("chartLegend.color") || ""} onChange={(v) => updateCA("chartLegend.color", v)} />

            <AxisControls prefix="verticalAxis" label="Vertical Axis" />
            <AxisControls prefix="horizontalAxis" label="Horizontal Axis" />
          </div>
        </details>

        {/* ════ Component Theme ════ */}
        <details>
          <summary className="cursor-pointer py-2 text-sm font-semibold border-b select-none">Component Theme (CSS vars)</summary>
          <div className="py-2 space-y-3">
            <label className="text-xs">
              Preset:
              <select value={componentPreset} onChange={(e) => loadComponentPreset(e.target.value)} className="ml-1 border rounded px-1 py-0.5 text-xs">
                <option value="">Custom</option>
                {Object.keys(COMPONENT_THEME_PRESETS).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>

            <SectionHeader title="Button" onReset={() => setComponentTheme((p) => { const n = { ...p }; delete n.button; return n; })} />
            <ColorInput label="Primary" value={componentTheme.button?.primary || ""} onChange={(v) => updateComponent("button.primary", v)} />
            <ColorInput label="Primary Text" value={componentTheme.button?.primaryText || ""} onChange={(v) => updateComponent("button.primaryText", v)} />
            <ColorInput label="Secondary" value={componentTheme.button?.secondary || ""} onChange={(v) => updateComponent("button.secondary", v)} />
            <ColorInput label="Secondary Text" value={componentTheme.button?.secondaryText || ""} onChange={(v) => updateComponent("button.secondaryText", v)} />

            <SectionHeader title="Checkbox" />
            <ColorInput label="Checked" value={componentTheme.checkbox?.checked || ""} onChange={(v) => updateComponent("checkbox.checked", v)} />
            <ColorInput label="Unchecked" value={componentTheme.checkbox?.unChecked || ""} onChange={(v) => updateComponent("checkbox.unChecked", v)} />

            <SectionHeader title="Switch" />
            <ColorInput label="Enabled" value={componentTheme.switch?.enabled || ""} onChange={(v) => updateComponent("switch.enabled", v)} />
            <ColorInput label="Disabled" value={componentTheme.switch?.disabled || ""} onChange={(v) => updateComponent("switch.disabled", v)} />

            <SectionHeader title="Drill Breadcrumbs" />
            <TextInput label="Font Family" value={componentTheme.drillBreadCrumbs?.fontFamily || ""} onChange={(v) => updateComponent("drillBreadCrumbs.fontFamily", v)} placeholder="Inter" />
            <ColorInput label="Font Color" value={componentTheme.drillBreadCrumbs?.fontColor || ""} onChange={(v) => updateComponent("drillBreadCrumbs.fontColor", v)} />
            <ColorInput label="Active Color" value={componentTheme.drillBreadCrumbs?.activeColor || ""} onChange={(v) => updateComponent("drillBreadCrumbs.activeColor", v)} />

            <SectionHeader title="Multi-Select Filter" />
            <ColorInput label="Badge Color" value={componentTheme.multiSelectFilterDropdown?.badgeColor || ""} onChange={(v) => updateComponent("multiSelectFilterDropdown.badgeColor", v)} />
            <ColorInput label="Badge Text" value={componentTheme.multiSelectFilterDropdown?.badgeTextColor || ""} onChange={(v) => updateComponent("multiSelectFilterDropdown.badgeTextColor", v)} />

            <SectionHeader title="Date Picker" />
            <ColorInput label="Color" value={componentTheme.datePickerColor || ""} onChange={(v) => updateComponent("datePickerColor", v)} />

            <SectionHeader title="Breakpoints" onReset={() => setComponentTheme((p) => { const n = { ...p }; delete n.breakpoint; return n; })} />
            <div className="grid grid-cols-2 gap-1">
              <NumberInput label="xl" value={componentTheme.breakpoint?.xl} onChange={(v) => updateComponent("breakpoint.xl", v)} min={0} />
              <NumberInput label="lg" value={componentTheme.breakpoint?.lg} onChange={(v) => updateComponent("breakpoint.lg", v)} min={0} />
              <NumberInput label="md" value={componentTheme.breakpoint?.md} onChange={(v) => updateComponent("breakpoint.md", v)} min={0} />
              <NumberInput label="sm" value={componentTheme.breakpoint?.sm} onChange={(v) => updateComponent("breakpoint.sm", v)} min={0} />
              <NumberInput label="xs" value={componentTheme.breakpoint?.xs} onChange={(v) => updateComponent("breakpoint.xs", v)} min={0} />
            </div>

            <SectionHeader title="Metric Layout Cols" onReset={() => setComponentTheme((p) => { const n = { ...p }; delete n.metricLayoutCols; return n; })} />
            <div className="grid grid-cols-2 gap-1">
              <NumberInput label="xl" value={componentTheme.metricLayoutCols?.xl} onChange={(v) => updateComponent("metricLayoutCols.xl", v)} min={1} max={12} />
              <NumberInput label="lg" value={componentTheme.metricLayoutCols?.lg} onChange={(v) => updateComponent("metricLayoutCols.lg", v)} min={1} max={12} />
              <NumberInput label="md" value={componentTheme.metricLayoutCols?.md} onChange={(v) => updateComponent("metricLayoutCols.md", v)} min={1} max={12} />
              <NumberInput label="sm" value={componentTheme.metricLayoutCols?.sm} onChange={(v) => updateComponent("metricLayoutCols.sm", v)} min={1} max={12} />
              <NumberInput label="xs" value={componentTheme.metricLayoutCols?.xs} onChange={(v) => updateComponent("metricLayoutCols.xs", v)} min={1} max={12} />
              <NumberInput label="xxs" value={componentTheme.metricLayoutCols?.xxs} onChange={(v) => updateComponent("metricLayoutCols.xxs", v)} min={1} max={12} />
            </div>
          </div>
        </details>

        {/* ════ Dashboard Behavior Toggles ════ */}
        <details>
          <summary className="cursor-pointer py-2 text-sm font-semibold border-b select-none">Dashboard Toggles</summary>
          <div className="py-2 space-y-2">
            <SectionHeader title="Visibility" />
            <Toggle checked={boolFlags.isHideChartSettings} onChange={(v) => setBoolFlags((p) => ({ ...p, isHideChartSettings: v }))} label="Hide chart settings" />
            <Toggle checked={boolFlags.isHideTablePreview} onChange={(v) => setBoolFlags((p) => ({ ...p, isHideTablePreview: v }))} label="Hide table preview" />
            <Toggle checked={boolFlags.disableFullscreen} onChange={(v) => setBoolFlags((p) => ({ ...p, disableFullscreen: v }))} label="Disable fullscreen" />
            <Toggle checked={boolFlags.enableTitleClickFullscreen} onChange={(v) => setBoolFlags((p) => ({ ...p, enableTitleClickFullscreen: v }))} label="Title click fullscreen" />
            <Toggle checked={boolFlags.isStickyDashboardFilters} onChange={(v) => setBoolFlags((p) => ({ ...p, isStickyDashboardFilters: v }))} label="Sticky dashboard filters" />
            <Toggle checked={boolFlags.enableMultiMetricFilters} onChange={(v) => setBoolFlags((p) => ({ ...p, enableMultiMetricFilters: v }))} label="Multi-metric filters" />

            <SectionHeader title="Card Appearance" />
            <Toggle checked={boolFlags.hideMetricCardShadow} onChange={(v) => setBoolFlags((p) => ({ ...p, hideMetricCardShadow: v }))} label="Hide card shadow" />
            <Toggle checked={boolFlags.disableMetricCardBorder} onChange={(v) => setBoolFlags((p) => ({ ...p, disableMetricCardBorder: v }))} label="Disable card border" />

            <SectionHeader title="Download & Export" />
            <Toggle checked={boolFlags.enableDownloadCsv} onChange={(v) => setBoolFlags((p) => ({ ...p, enableDownloadCsv: v }))} label="Enable CSV download" />
            <Toggle checked={boolFlags.enableEmailCsv} onChange={(v) => setBoolFlags((p) => ({ ...p, enableEmailCsv: v }))} label="Enable CSV email" />
            <Toggle checked={boolFlags.disableDownloadPng} onChange={(v) => setBoolFlags((p) => ({ ...p, disableDownloadPng: v }))} label="Disable PNG download" />
            <Toggle checked={boolFlags.enableDownloadAllMetrics} onChange={(v) => setBoolFlags((p) => ({ ...p, enableDownloadAllMetrics: v }))} label="Download all metrics" />
            <Toggle checked={boolFlags.enableDownloadAllPdf} onChange={(v) => setBoolFlags((p) => ({ ...p, enableDownloadAllPdf: v }))} label="Download all PDF" />
          </div>
        </details>

        {/* ════ Options Flags ════ */}
        <details>
          <summary className="cursor-pointer py-2 text-sm font-semibold border-b select-none">Options &amp; Behavior</summary>
          <div className="py-2 space-y-2">
            <Toggle checked={optionFlags.shouldFitFullScreen} onChange={(v) => setOptionFlags((p) => ({ ...p, shouldFitFullScreen: v }))} label="Fit full screen" />
            <Toggle checked={optionFlags.disableMainLoader} onChange={(v) => setOptionFlags((p) => ({ ...p, disableMainLoader: v }))} label="Disable main loader" />
            <Toggle checked={optionFlags.disableMetricLoader} onChange={(v) => setOptionFlags((p) => ({ ...p, disableMetricLoader: v }))} label="Disable metric loader" />
            <Toggle checked={optionFlags.isShowNoDataFoundScreen} onChange={(v) => setOptionFlags((p) => ({ ...p, isShowNoDataFoundScreen: v }))} label="Show no-data screen" />
            <Toggle checked={optionFlags.disableDownloadUnderlyingDataNoFilters} onChange={(v) => setOptionFlags((p) => ({ ...p, disableDownloadUnderlyingDataNoFilters: v }))} label="Disable DL underlying (no filters)" />
            <Toggle checked={optionFlags.disableDownloadDataNoFilters} onChange={(v) => setOptionFlags((p) => ({ ...p, disableDownloadDataNoFilters: v }))} label="Disable DL data (no filters)" />
            <SelectInput label="Export msg position" value={exportMsgPosition} onChange={setExportMsgPosition} options={EXPORT_MSG_POSITIONS.map((p) => ({ value: p, label: p || "(none)" }))} />
            <TextInput label="Hide date pickers" value={hideDatePickerOptions} onChange={setHideDatePickerOptions} placeholder="Last 7 Days, Last 30 Days" />
            <p className="text-[10px] text-muted-foreground">Comma-separated date picker option names to hide.</p>
          </div>
        </details>

        {/* ════ Other Props ════ */}
        <details>
          <summary className="cursor-pointer py-2 text-sm font-semibold border-b select-none">Other Props</summary>
          <div className="py-2 space-y-3">
            <SectionHeader title="Long Description Config" />
            <TextInput label="Width" value={longDescWidth} onChange={setLongDescWidth} placeholder="300px" />
            <ColorInput label="Font Color" value={longDescFontColor} onChange={setLongDescFontColor} />

            <SectionHeader title="Custom Images" />
            <TextInput label="No-data image URL" value={noDataImg} onChange={setNoDataImg} placeholder="https://..." />
            <TextInput label="No-data SVG URL" value={noDataFoundSvg} onChange={setNoDataFoundSvg} placeholder="https://..." />

            <SectionHeader title="Icon Style" />
            <SelectInput label="Options icon" value={optionsIcon} onChange={setOptionsIcon} options={[{ value: "", label: "(default)" }, { value: "kebab-menu-vertical", label: "kebab-menu-vertical" }, { value: "download", label: "download" }]} />
          </div>
        </details>

        {/* ════ Theme Name ════ */}
        <details>
          <summary className="cursor-pointer py-2 text-sm font-semibold border-b select-none">Saved Theme Name</summary>
          <div className="py-2 space-y-2">
            <TextInput label="theme-name" value={themeName} onChange={setThemeName} placeholder="my-saved-theme" />
            <p className="text-[10px] text-muted-foreground">Overrides adminThemeOptions when set. Must match a theme saved in your Databrain admin.</p>
          </div>
        </details>

        {/* ════ Custom Chart Settings (JSON) ════ */}
        <details>
          <summary className="cursor-pointer py-2 text-sm font-semibold border-b select-none">Custom Chart Settings (JSON)</summary>
          <div className="py-2 space-y-2">
            <p className="text-[10px] text-muted-foreground">Advanced: per-metric chart overrides. Paste a CustomChartSettingsType JSON object.</p>
            <textarea
              className="w-full h-24 font-mono text-xs border rounded p-2 resize-none bg-muted/30"
              value={customChartSettingsJson}
              onChange={(e) => {
                setCustomChartSettingsJson(e.target.value);
                if (e.target.value.trim()) {
                  try { JSON.parse(e.target.value); setCustomChartSettingsError(""); } catch { setCustomChartSettingsError("Invalid JSON"); }
                } else {
                  setCustomChartSettingsError("");
                }
              }}
              placeholder='{ "chartColors": { "defaultValue": ["#f00"], "canEdit": false } }'
              spellCheck={false}
            />
            {customChartSettingsError && <span className="text-[10px] text-destructive">{customChartSettingsError}</span>}
          </div>
        </details>

        {/* ── Copy button ── */}
        <div className="pt-2 pb-4 border-t">
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={copyConfig}>
            Copy Full Config to Clipboard
          </Button>
        </div>
      </aside>

      {/* RIGHT: preview + JSON editor */}
      <div className="flex-1 flex flex-col min-w-0 gap-3">
        {/* Dashboard preview */}
        <div className="flex-1 border rounded-lg bg-white overflow-hidden min-h-0">
          <dbn-dashboard
            token={token}
            dashboard-id={dashboardId}
            handle-server-event="databrainServerEvent"
            {...dashboardAttrs}
          />
        </div>

        {/* JSON editor panel */}
        <div className="h-56 shrink-0 border rounded-lg bg-card flex flex-col">
          <Tabs value={jsonTab} onValueChange={(v) => setJsonTab(v as any)} className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 pt-2">
              <TabsList className="h-7">
                <TabsTrigger value="adminTheme" className="text-xs px-2 py-0.5">adminThemeOptions</TabsTrigger>
                <TabsTrigger value="theme" className="text-xs px-2 py-0.5">theme</TabsTrigger>
                <TabsTrigger value="options" className="text-xs px-2 py-0.5">options</TabsTrigger>
                <TabsTrigger value="embedCode" className="text-xs px-2 py-0.5">Embed Code</TabsTrigger>
              </TabsList>
              {jsonTab !== "embedCode" ? (
                <>
                  <Button variant="outline" size="sm" className="text-[10px] h-6 px-2 ml-auto" onClick={applyJsonEdit}>
                    Apply JSON
                  </Button>
                  {jsonError && <span className="text-[10px] text-destructive">{jsonError}</span>}
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-6 px-2 ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(embedCode);
                      setCopyFeedback("Copied!");
                      setTimeout(() => setCopyFeedback(""), 2000);
                    }}
                  >
                    {copyFeedback || "Copy to Clipboard"}
                  </Button>
                </>
              )}
            </div>
            {jsonTab === "embedCode" ? (
              <div className="flex-1 min-h-0 px-3 pb-2">
                <CodeViewer code={embedCode} />
              </div>
            ) : (
              <TabsContent value={jsonTab} className="flex-1 min-h-0 px-3 pb-2">
                <textarea
                  className="w-full h-full font-mono text-xs border rounded p-2 resize-none bg-muted/30 focus:outline-none focus:ring-1 focus:ring-ring"
                  value={jsonEditorValue}
                  onChange={(e) => setJsonEditorValue(e.target.value)}
                  spellCheck={false}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
