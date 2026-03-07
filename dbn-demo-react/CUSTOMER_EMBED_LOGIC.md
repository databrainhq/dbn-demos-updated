# Databrain Zero-to-Embed (LLM Instruction File)

**Customer goal:** Use this runbook with the **Databrain MCP server** so that after downloading the template repo, they can embed DataBrain dashboards and add advanced functionality (Reports, Ask AI, metric data, etc.).

You are an implementation assistant. Read this file and execute it directly. Your job is to configure one working Databrain dashboard embed from zero, then help customize it.

Follow the steps in order. Do not skip steps. Always confirm choices with the user, even when there is only one option.

---

## 0) What this runbook assumes

- You have Databrain MCP server connected.
- You have a **Service Token** available in the MCP environment.
- You want to embed exactly one dashboard in your app.
- Your app uses:
  - frontend `VITE_DBN_DASHBOARD_ID`
  - backend `POST /api/guest-token` for server-side guest token generation

---

## 1) Execution Rules (Mandatory)

1. Use the `setup_embed_interactive` MCP tool as your primary entry point.
2. Execute the orchestrator steps sequentially — it will guide you.
3. **Always confirm with the user** before proceeding, even when only one option exists. The orchestrator returns `CONFIRM_REQUIRED` for single-option scenarios — present it and wait for user confirmation.
4. Never place secrets in frontend config.
5. Treat API tokens as secret output (backend-only).
6. End with the exact output format in section 8.

---

## 2) MCP tool flow (using the orchestrator)

Call `setup_embed_interactive` repeatedly with the step name and accumulated state:

1. `step: "discover"` — lists data apps
   - If one app: confirms with user ("I found X — is this correct?")
   - If multiple: asks user to choose
2. `step: "choose_app"` — resolves user's choice (only if multiple apps)
3. `step: "ensure_token"` — checks if API token exists; creates one only if missing
4. `step: "list_embeds"` — lists embeds for the selected app
   - If one embed: confirms with user
   - If multiple: asks user to choose
5. `step: "choose_embed"` — resolves user's choice (only if multiple embeds)
6. `step: "validate"` — generates a minimal guest token to verify the pipeline works
   - Uses only `clientId` + `dataAppName` (no optional fields)
7. `step: "complete"` — returns final config block with all IDs and env vars

Pass the `state` object back unchanged on every call. The orchestrator tracks:
- `dataAppName`, `dataAppId`, `embedId`, `dashboardId`, `clientId`

### Important compatibility note
- In some environments, optional fields such as `allowedEmbeds` are rejected by the guest token endpoint.
- The orchestrator sends minimal payloads by default.

---

## 3) Values the LLM must produce

The LLM should return these exact values after the orchestrator completes:

- `dataAppName`
- `embedId`
- `dashboardId`
- `apiToken` (prefer existing token; create one only if missing)
- `clientId` default (for example `101`)

---

## 4) App config to set

Frontend:
- `VITE_DBN_DASHBOARD_ID=<dashboardId>`
- `VITE_DBN_GUEST_TOKEN_ENDPOINT=/api/guest-token`

Backend:
- `DATABRAIN_API_URL=https://api.usedatabrain.com`
- `DATABRAIN_API_TOKEN=<apiToken>`
- `DATABRAIN_DEFAULT_CLIENT_ID=<clientId>`
- `PORT=3011`

---

## 5) Runtime behavior

1. Frontend reads `VITE_DBN_DASHBOARD_ID`.
2. Frontend calls backend `POST /api/guest-token`.
3. Backend calls Databrain `/api/v2/guest-token/create` with API token.
4. Backend returns guest token.
5. Frontend renders:
   - `<dbn-dashboard token="..." dashboard-id="..." />`

---

## 6) Security requirements

- Never put `DATABRAIN_API_TOKEN` in frontend env vars.
- Keep API token in backend env/secret manager only.
- Generate guest token server-side per session/request.
- Never echo the Service Token to the user.
- Database credentials (if using `create_datasource`) should come from env vars, not hardcoded.

---

## 7) Troubleshooting checklist

- `Token endpoint responded with 500`
  - Check backend has `DATABRAIN_API_TOKEN`.
  - Check backend process restarted after env changes.
- `INVALID_DASHBOARD_ID`
  - Confirm `VITE_DBN_DASHBOARD_ID` is actual dashboard ID, not display name.
- HTML returned instead of JSON (`<!DOCTYPE html>...`)
  - Frontend proxy is pointing to wrong backend process/port.
- Config changes not reflected
  - Restart frontend/backend dev servers.
- `Missing or expired API token`
  - Re-run orchestrator from `step: "ensure_token"`.
- `No embed matches`
  - Re-run from `step: "list_embeds"` to see current embeds.
- `"embedId" is required`
  - Ensure `embedId` is being passed in the request body for metrics/query endpoints.

---

## 8) Expected LLM completion output

```text
Setup complete.

Selected:
- dataAppName: <value>
- embedId: <value>
- dashboardId: <value>
- clientId default: <value>

Set these values:
- DATABRAIN_API_TOKEN=<value>
- VITE_DBN_DASHBOARD_ID=<value>
- DATABRAIN_DEFAULT_CLIENT_ID=<value>
- DATABRAIN_API_URL=https://api.usedatabrain.com

Validation:
- generate_guest_token: success
```

---

## 9) Post-Setup: Customization

After the embed is working, offer the user these customization options. Ask which ones they'd like to configure.

### Theming

Apply a quick preset or build a custom theme:

```
# Quick preset (light, dark, corporate, minimal)
apply_embed_preset(embedId, themePreset: "dark")

# Custom theme
customize_embed_theme(embedId,
  primaryColor: "#4F46E5",
  fontFamily: "Inter",
  cardBorderRadius: "12px",
  dashboardBackgroundColor: "#F9FAFB",
  cardShadow: "0 1px 3px rgba(0,0,0,0.1)",
  chartColors: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"])
```

`customize_embed_theme` supports:
- **Colors**: primaryColor, backgroundColor, textColor, ctaColor, ctaTextColor
- **Typography**: fontFamily, cardTitleFontSize/Weight/Color, cardDescriptionFontSize/Weight/Color
- **Cards**: cardPadding, cardBorderRadius, cardShadow, disableShadowOnHover, disableCardStroke
- **Dashboard**: dashboardBackgroundColor, selectBoxSize/Variant/BorderRadius/TextColor
- **Chart**: chartFontFamily, chartFontColor, chartColors, custom palettes, tooltip font config
- **Components**: button colors, checkbox colors, switch colors, breadcrumb styling, filter badge colors

### Chart Appearance

Fine-tune chart visuals:

```
configure_chart_appearance(embedId,
  legendPosition: "bottom-center",
  legendShape: "circle",
  legendLayout: "horizontal",
  labelPosition: "top",
  chartColors: ["#4F46E5", "#10B981", "#F59E0B"])
```

Supports:
- **Tooltip**: header/label/value font styles (size, family, weight, color)
- **Legend**: position, shape (circle/rect/diamond/...), layout (horizontal/vertical), font, truncation, scrolling
- **Axes**: show/hide lines/labels/ticks, axis names, font config (vertical and horizontal independently)
- **Labels**: position (hidden/top/left/right/bottom/inside), radial chart position
- **Margins**: top, left, right, bottom

### Display Options & Permissions

Control what end users can see and do:

```
configure_embed_options(embedId,
  disableMetricCreation: true,
  disableMetricDeletion: true,
  enableDownloadCsv: true,
  enableDownloadAllPdf: true,
  hideDashboardName: false,
  disableUnderlyingData: true)
```

Available flags (~30 total):
- **Metric ops**: disableMetricCreation, disableMetricUpdation, disableMetricDeletion, disableManageMetrics
- **Layout**: disableLayoutCustomization, disableSaveLayout
- **Downloads**: enableDownloadCsv, enableEmailCsv, enableDownloadAllMetrics, enableDownloadAllPdf, disableDownloadPng, disableDownloadDataNoFilters
- **UI**: hideDashboardName, hideMetricCardShadow, disableMetricCardBorder, disableFullscreen, shouldFitFullScreen, showDashboardActions
- **Loaders**: disableMainLoader, disableMetricLoader
- **Data**: disableUnderlyingData, isShowNoDataFoundScreen
- **Other**: disableScheduleEmailReports, isStickyDashboardFilters, enableMultiMetricFilters
- **Messages**: tokenExpiryMessage, tokenAbsentMessage

### Filters

Set up default filter values and options:

```
configure_filters(embedId,
  stringFilters: [{
    filterName: "Region",
    options: [
      { value: "US", label: "United States" },
      { value: "EU", label: "Europe" },
      { value: "APAC", label: "Asia Pacific" }
    ],
    defaultOption: "US"
  }],
  dateFilters: [{
    filterName: "Date Range",
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  }],
  hideDashboardFilters: ["internal_id"])
```

Also supports:
- **Number filters**: with min/max defaults
- **SQL-based filters**: for large option sets (`sql` + `columnName`)
- **Date presets**: custom date picker options
- **Metric filter position**: inside or outside the card
- **Multi-metric filters**: cross-metric filter interactions

### Internationalization

Support multiple languages:

```
configure_internationalization(embedId,
  language: "fr",
  translations: [
    { key: "Revenue", translations: { fr: "Revenus", es: "Ingresos", de: "Einnahmen" } },
    { key: "Total Sales", translations: { fr: "Ventes Totales", es: "Ventas Totales", de: "Gesamtumsatz" } }
  ])
```

Supported languages: en, fr, es, de, it, pt, zh, ja, ko, hi, ar, ru.
Calendar types: default, ind (Indian).

### Role-Based Access via Guest Token

Different permissions per user role — same embed, different tokens:

```
# Viewer — minimal permissions
generate_guest_token(clientId, dataAppName)

# Analyst — can export
generate_guest_token(clientId, dataAppName, {
  permissions: { isEnableDownloadMetrics: true, isEnableUnderlyingData: true }
})

# Power User — can edit
generate_guest_token(clientId, dataAppName, {
  permissions: { isEnableMetricUpdation: true, isEnableCustomizeLayout: true }
})
```

Guest tokens also support runtime overrides:
- `theme` — per-user theme (overrides embed-level theme)
- `accessSettings` — per-user permissions
- `appFilters` — server-side enforced row-level security filters
- `dashboardAppFilters` — per-dashboard filters
- `datasourceName` — multi-datasource routing

### AI-Powered Analytics

Enable natural language data queries:

```
1. generate_semantic_layer(datamartId)          → auto-generate business metadata
2. get_semantic_layer_status(datamartId)         → wait for completion
3. apply_embed_preset(embedId, accessPreset: "ai-enabled")  → enable AI features
4. ask_ai_pilot(embedId, "What was total revenue last month?", clientId)
```

---

## 10) Generating Frontend Code

After setup and customization, generate copy-paste-ready code:

```
generate_embed_code(embedId, framework: "react")
```

Supported frameworks: `react`, `nextjs`, `vue`, `angular`, `svelte`, `solidjs`, `vanilla`.

This generates:
1. Install command
2. Backend route for guest token generation
3. Frontend component with the web component
4. Setup instructions

---

## 11) Full Infrastructure Setup (Optional)

If the user needs to connect a database from scratch (no existing datasource):

```
1. create_datasource(type: "postgres", credentials: { host, port, username, password, database, name })
2. sync_datasource(datasourceName)              → import table/column metadata
3. create_data_app(name)                        → workspace container
4. create_datamart(name, datasourceName, tableList, relationships)  → curate tables
5. Continue with the orchestrator (section 2) to create embed
```

Supported database types: postgres, snowflake, bigquery, mysql, redshift, cockroachdb, mssql, clickhouse, singlestore, mongodb, databricks, elasticsearch, opensearch, firebolt, athena, trino, awss3, csv.
