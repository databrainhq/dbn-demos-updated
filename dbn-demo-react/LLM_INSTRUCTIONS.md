# Databrain MCP Server — LLM Instructions Manual

This guide is for LLMs (Claude, GPT, etc.) consuming the Databrain MCP server. It explains how to chain tools, handle choices, recover from errors, and deliver deterministic output.

---

## 1. Default Entry Point

**Always start with `setup_embed_interactive`** when the user wants to embed a dashboard. This orchestrator walks through the full flow interactively, handling choices and validation automatically.

```
setup_embed_interactive(step: "discover", state: {})
```

The orchestrator returns one of three signals:

| Signal | Meaning | What to do |
|--------|---------|------------|
| `CONFIRM_REQUIRED` | Only one option exists | Present it to the user and ask them to confirm before proceeding |
| `CHOICE_REQUIRED` | Multiple options exist | Present the list to the user, get their pick, call next step with `userChoice` |
| `COMPLETE` | Setup is done | Show the user the final JSON + env block |

### Full Step Sequence

```
discover → choose_app (if needed) → ensure_token → list_embeds → choose_embed (if needed) → validate → complete
```

Each step returns the next step name and an updated `state` object. Pass `state` back unchanged on every call.

---

## 2. Entity Model & Tool Dependencies

```
Datasource
  └── Datamart (table/view from the datasource)
        └── Semantic Layer (business metadata for AI features)

Data App (workspace container)
  ├── API Token (authenticates embed/API calls — scoped to this app)
  ├── Dashboard (created in Databrain UI, contains metrics)
  │     └── Metric (chart/visualization)
  ├── Embed (config linking dashboard to embeddable component)
  │     ├── Theme (visual styling — admin theme, component theme, chart appearance)
  │     ├── Options (display flags, permissions, loaders, messages)
  │     ├── Filters (global, metric-level, SQL-based, date presets)
  │     ├── Internationalization (language, translations, calendar)
  │     └── Guest Token (short-lived end-user auth)
  └── Datamarts (assigned to this data app)
```

### Auth Chain

```
Service Token (env var) → manages data apps, datasources, datamarts
API Token (per data app) → manages embeds, generates guest tokens
Guest Token (per end-user) → authenticates the web component
```

### Tool Dependency Graph

Tools that require `auth: 'service'` (Service Token):
- `list_datasources`, `create_datasource`, `sync_datasource`
- `list_data_apps`, `create_data_app`
- `create_api_token`, `list_api_tokens`, `rotate_api_token`
- `list_datamarts`, `create_datamart`
- `get_semantic_layer_status`, `generate_semantic_layer`

Tools that require `auth: 'api'` (API Token):
- `create_embed`, `list_embeds`, `get_embed_details`, `update_embed`, `delete_embed`, `rename_embed`
- `apply_embed_preset`, `customize_embed_theme`, `configure_chart_appearance`, `configure_embed_options`, `configure_filters`, `configure_internationalization`
- `generate_guest_token`, `generate_embed_code`
- `list_dashboards`, `list_metrics`, `query_metric_data`, `get_dashboard_data`, `ask_ai_pilot`, `download_metric_csv`
- `list_scheduled_reports`, `export_dashboard`, `import_dashboard`

**Critical rule:** You must have an API token before calling any `auth: 'api'` tool. Either:
1. The user set `DATABRAIN_API_TOKEN` in env, or
2. You called `create_api_token` earlier in the session (it auto-stores the token)

---

## 3. Common Workflows

### Workflow A: Embed a Dashboard (Interactive)

Use `setup_embed_interactive`. This is the recommended path — it handles everything.

### Workflow B: Embed a Dashboard (Manual)

If you need more control than the orchestrator provides:

```
1. list_data_apps()                    → pick a data app
2. create_api_token(dataAppName, name) → store the token securely
3. list_embeds(dataAppName)            → find existing embed, or:
   create_embed(dashboardId, ...)      → create a new one
4. generate_guest_token(clientId, dataAppName) → validate
5. generate_embed_code(embedId, framework)     → get frontend code
```

### Workflow C: Set Up from Scratch (Full Infrastructure)

Connect a database and build everything via AI — no UI needed:

```
1. create_datasource(type, credentials)    → connect database
2. sync_datasource(datasourceName)         → import table/column metadata
3. list_data_apps() or create_data_app()   → workspace container
4. list_datamarts() → create_datamart()    → curate tables for analytics
5. generate_semantic_layer(datamartId)      → enable AI chat (optional)
6. get_semantic_layer_status(datamartId)    → check progress
7. Continue with Workflow B to create embed
```

### Workflow D: Explore Available Data

```
1. list_datasources()    → connected databases
2. list_data_apps()      → workspace containers
3. list_datamarts()      → tables/views
4. list_dashboards()     → dashboards
5. list_embeds()         → existing embed configs
```

Call steps 1-4 in parallel for speed. Summarize by data app.

### Workflow E: Customize Theme & Appearance

Three approaches, from simplest to most granular:

```
Option 1 — Quick preset:
  apply_embed_preset(embedId, themePreset: "dark")

Option 2 — Developer-friendly theme builder:
  customize_embed_theme(embedId, primaryColor: "#4F46E5", fontFamily: "Inter",
    cardBorderRadius: "12px", dashboardBackgroundColor: "#0F172A", ...)

Option 3 — Granular chart styling:
  configure_chart_appearance(embedId, legendPosition: "bottom-center",
    legendShape: "circle", labelPosition: "top",
    chartColors: ["#4F46E5", "#10B981", "#F59E0B"], ...)
```

Available theme presets: `light`, `dark`, `corporate`, `minimal`

`customize_embed_theme` covers:
- Colors (primary, background, text, CTA)
- Typography (font family, card title/description sizing)
- Cards (padding, border radius, shadow, stroke)
- Dashboard layout (background, select box styling)
- Chart (font, colors, palettes, tooltip fonts)
- Components (buttons, checkboxes, switches, breadcrumbs, filter badges)

`configure_chart_appearance` covers:
- Tooltip styles (header, label, value font config)
- Legend (position, shape, layout, font, truncation, scrolling)
- Axes (vertical/horizontal: lines, labels, ticks, names, fonts, colors)
- Labels (position on charts and radial charts)
- Margins (top, left, right, bottom)

### Workflow F: Configure Embed Options & Permissions

```
configure_embed_options(embedId,
  disableMetricCreation: true,
  enableDownloadCsv: true,
  enableDownloadAllPdf: true,
  hideDashboardName: true,
  disableMainLoader: true,
  tokenExpiryMessage: "Session expired. Please refresh.")
```

Covers ~30 flags: metric ops, layout, downloads, loaders, UI visibility, custom messages.

### Workflow G: Set Up Filters

```
configure_filters(embedId,
  stringFilters: [{ filterName: "Region", options: [...], defaultOption: "US" }],
  dateFilters: [{ filterName: "Date Range", startDate: "2024-01-01", endDate: "2024-12-31" }],
  sqlFilters: [{ filterName: "Company", sql: "SELECT name FROM companies", columnName: "name" }],
  hideDashboardFilters: ["internal_id"])
```

### Workflow H: Internationalization

```
configure_internationalization(embedId,
  language: "fr",
  calendarType: "default",
  translations: [
    { key: "Revenue", translations: { fr: "Revenus", es: "Ingresos" } },
    { key: "Total Sales", translations: { fr: "Ventes Totales", es: "Ventas Totales" } }
  ],
  tokenExpiryMessage: "Votre session a expiré.")
```

Supported languages: en, fr, es, de, it, pt, zh, ja, ko, hi, ar, ru.

### Workflow I: Role-Based Access

Same embed, different guest tokens:

```
Viewer:     generate_guest_token(clientId, dataAppName)  → minimal permissions
Analyst:    generate_guest_token(clientId, dataAppName, { permissions: { isEnableDownloadMetrics: true, isEnableUnderlyingData: true } })
Power User: generate_guest_token(clientId, dataAppName, { permissions: { isEnableMetricUpdation: true, isEnableCustomizeLayout: true } })
```

Guest tokens also support runtime overrides for:
- `theme` — override embed-level theme per user/role
- `accessSettings` — override embed-level access per user/role
- `appFilters` — server-side enforced filters (row-level security)
- `dashboardAppFilters` — per-dashboard filters
- `datasourceName` — multi-datasource routing

### Workflow J: Export/Import Dashboards

```
export_dashboard(dashboardId) → JSON blob
import_dashboard(targetDataAppName, dashboardJson) → new dashboard in target app
```

Useful for promoting dashboards between staging and production.

### Workflow K: AI-Powered Analytics

```
1. create_datamart(...)                          → curate tables
2. generate_semantic_layer(datamartId)            → auto-generate business metadata
3. get_semantic_layer_status(datamartId)           → wait for completion
4. ask_ai_pilot(embedId, question, clientId)      → natural language queries
```

Requires AI Pilot enabled on the embed (`configure_embed_options` or `apply_embed_preset(accessPreset: "ai-enabled")`).

---

## 4. Handling User Choices

When multiple options exist, always present them clearly with IDs:

```
I found 3 data apps:
1. **Production App** — ID: `abc123`
2. **Staging App** — ID: `def456`
3. **Demo App** — ID: `ghi789`

Which one would you like to use?
```

If only one option exists, confirm with the user before proceeding:

```
I found one data app: Production App (ID: abc123).
Is this the right one? I'll proceed with it once you confirm.
```

---

## 5. Tool Selection Guide

When the user asks about customization, use the right tool:

| User wants... | Use this tool |
|---------------|---------------|
| Quick theme (dark mode, light mode) | `apply_embed_preset` |
| Custom colors, fonts, card styling | `customize_embed_theme` |
| Chart legend, axes, tooltips, labels | `configure_chart_appearance` |
| Enable/disable downloads, metric ops | `configure_embed_options` |
| Dashboard filter defaults, SQL filters | `configure_filters` |
| Multi-language, translations | `configure_internationalization` |
| Raw theme/access JSON (advanced) | `update_embed` |
| Per-user permissions at runtime | `generate_guest_token` with permissions/theme/accessSettings |

---

## 6. Security Guardrails

1. **Never echo the Service Token.** It's in env vars and used internally — never show it to the user.
2. **API Token is shown once.** When `create_api_token` returns the key, warn the user: _"Save this securely. It will not be shown again. Store it backend-side only."_
3. **Guest Tokens are short-lived.** Always explain that guest tokens should be generated server-side per user session.
4. **Never put API tokens in frontend code.** The `generate_embed_code` tool generates backend routes that handle token exchange server-side.
5. **Database credentials are sensitive.** When using `create_datasource`, remind users to use environment variables for credentials, not hardcoded values.

---

## 7. Error Recovery

### Common Errors and What to Do

| Error | Cause | Recovery |
|-------|-------|----------|
| `MISSING_TOKEN: DATABRAIN_API_TOKEN is required` | No API token configured | Call `create_api_token` first |
| `MISSING_TOKEN: DATABRAIN_SERVICE_TOKEN is required` | No service token in env | Ask user to set `DATABRAIN_SERVICE_TOKEN` in their MCP config |
| `HTTP 401 / INVALID_SERVICE_TOKEN` | Service token expired or wrong | Ask user to generate a new one at Settings > Service Tokens |
| `HTTP 404` on embed/dashboard | Invalid ID | Re-run the corresponding `list_*` tool to get valid IDs |
| `HTTP 409` | Resource already exists | Use a different name, or list existing resources first |
| `HTTP 422` | Invalid parameters | Check required fields — the error message usually says which field is wrong |
| `HTTP 429` | Rate limited | Wait a moment, then retry |
| `HTTP 5xx` | Server issue | Retry after a few seconds |
| `NETWORK_ERROR / ECONNREFUSED` | Can't reach API | Check `DATABRAIN_API_URL` is correct and the service is running |
| Proxy/stale process errors | MCP server restart needed | Ask user to restart the MCP server |

### Error Recovery Pattern

```
1. Read the error message — it includes a "Hint" with the recommended action
2. If it's an auth error → fix the token situation first
3. If it's a 404 → re-list resources to get valid IDs
4. If it's a 422 → check the parameter schema
5. Never retry more than once without changing something
```

---

## 8. Resources (Context Documents)

Read these resources for deep reference when the user asks detailed questions:

| Resource URI | When to read |
|-------------|--------------|
| `databrain://getting-started` | First-time setup, entity model questions |
| `databrain://embedding-guide` | How embedding works, framework patterns |
| `databrain://web-component-reference` | `<dbn-dashboard>` attributes and props |
| `databrain://theme-reference` | Custom theme JSON schema |
| `databrain://self-serve-reference` | All access/permission flags |
| `databrain://filter-reference` | Filter types and operators |
| `databrain://semantic-layer-guide` | Setting up AI chat features |
| `databrain://multi-tenancy-guide` | Row-level security with `clientId` |
| `databrain://api-reference` | Raw API endpoints |

---

## 9. Prompts (Pre-built Workflows)

| Prompt | When to suggest |
|--------|----------------|
| `explore-data` | User wants to understand what's in their workspace |

For embedding dashboards, use the `setup_embed_interactive` tool instead — it replaces the old `embed-dashboard` prompt with a structured, stateful flow.

---

## 10. Expected Output Format

When completing an embed setup (whether via orchestrator or manual), always end with a deterministic block:

```json
{
  "dataAppName": "My App",
  "dataAppId": "abc123",
  "embedId": "emb_456",
  "dashboardId": "dash_789",
  "clientId": "test-user"
}
```

```env
DATABRAIN_DATA_APP_NAME=My App
DATABRAIN_EMBED_ID=emb_456
DATABRAIN_DASHBOARD_ID=dash_789
DATABRAIN_CLIENT_ID=test-user
DATABRAIN_API_TOKEN=<paste-token-from-create-step>
```

Then suggest next steps:
1. `generate_embed_code` for frontend integration code
2. `generate_guest_token` with real `clientId` per end-user
3. `customize_embed_theme` or `apply_embed_preset` for theming
4. `configure_embed_options` for permissions and display flags
5. `configure_filters` for dashboard filter defaults
6. `configure_internationalization` for multi-language support

---

## 11. Tips for Efficient Tool Usage

- **Parallel calls:** `list_data_apps`, `list_datasources`, `list_dashboards`, and `list_datamarts` can all be called in parallel — they're independent reads.
- **Caching:** List tools cache results (5-10 min). Mutating tools (`create_embed`, `delete_embed`, etc.) automatically invalidate relevant caches.
- **Minimal payloads:** When validating guest tokens, send only `clientId` + `dataAppName`. Add optional params only when specifically needed.
- **Don't guess IDs:** Always list first, then use the returned IDs. Dashboard IDs, embed IDs, and data app IDs are server-generated.
- **Theme layering:** Themes cascade: embed config → guest token → web component. Use `customize_embed_theme` for defaults, guest token `theme` for per-user overrides.
- **Customization is incremental:** All customization tools merge with existing config. You don't need to send the full theme — just the properties you want to change.
