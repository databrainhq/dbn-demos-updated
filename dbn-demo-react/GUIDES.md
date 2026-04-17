# Databrain Feature Guides

Feature-by-feature cookbook for this demo. Each section maps to a demo page and shows both the code pattern and the MCP tool chain.

---

## 1. Dashboard Embed (basic)

**Demo page:** `#dashboard`

### Code

```jsx
<dbn-dashboard token={guestToken} dashboard-id="your-embed-id" />
```

### Backend

```js
// POST /api/guest-token
const body = { clientId: "user-123", dataAppName: "my-app" };
const res = await fetch("https://api.usedatabrain.com/api/v2/guest-token/create", {
  method: "POST",
  headers: { Authorization: `Bearer ${API_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const { token } = await res.json();
```

### MCP tool chain

```
generate_guest_token(clientId: "user-123", dataAppName: "my-app")
```

---

## 2. Embed Options & Customization

**Demo page:** `#dashboard` (options panel)

### `options` JSON (component attribute)

```json
{
  "disableMetricCreation": true,
  "disableMetricUpdation": true,
  "disableLayoutCustomization": true,
  "showDashboardActions": true,
  "hideDashboardName": false,
  "disableUnderlyingData": true,
  "shouldFitFullScreen": false
}
```

### Boolean attributes

```html
<dbn-dashboard
  enable-download-csv
  enable-email-csv
  disable-fullscreen
  is-hide-chart-settings
  enable-multi-metric-filters
/>
```

### Permissions (in guest token request)

```json
{
  "permissions": {
    "isEnableManageMetrics": true,
    "isEnableCustomizeLayout": true,
    "isEnableUnderlyingData": false,
    "isEnableDownloadMetrics": true,
    "isShowSideBar": true,
    "isShowDashboardName": true
  }
}
```

### MCP tool chain

```
update_embed(embedId: "...", body: { options: { ... } })
```

---

## 3. Metric Embed

**Demo page:** `#metric`

### Code

```jsx
<dbn-metric
  token={guestToken}
  metric-id="your-metric-embed-id"
  width={500}
  height={350}
  variant="card"
  chart-renderer-type="svg"
  metric-filter-position="outside"
  enable-multi-metric-filters
/>
```

### Finding a metric ID

In your Data App → Embed Info → Add New Embed → select embed type "metric" → choose dashboard and metric. The Embed ID shown is the `metric-id`.

---

## 4. Theming

**Demo page:** `#theming`

### Mechanism 1: `theme` attribute (JSON)

```jsx
<dbn-dashboard
  theme={JSON.stringify({
    colors: { primary: "#2563eb", background: "#ffffff", dark: "#0f172a" },
    typography: { fontFamily: "Inter", fontSize: "13px" },
    border: { radiusDefault: "5px" },
    shadow: { primary: "0 1px 3px rgba(0,0,0,0.1)" },
  })}
/>
```

### Mechanism 2: `theme-name` attribute

```jsx
<dbn-dashboard theme-name="My Saved Theme" />
```

Create themes in Data App → Theme Settings.

### Mechanism 3: `chart-colors`

```jsx
<dbn-dashboard chart-colors={JSON.stringify(["#FF6B6B", "#4ECDC4", "#45B7D1"])} />
```

### MCP tool chain

```
apply_embed_preset(embedId: "...", themePreset: "dark")
customize_embed_theme(embedId: "...", fonts: ..., colors: ...)
configure_chart_appearance(embedId: "...", colors: ...)
```

---

## 5. Multi-Tenant Data Isolation

**Demo page:** `#multitenant`

### Client ID isolation

```json
{ "clientId": "tenant-abc", "dataAppName": "my-app" }
```

Each `clientId` gets automatic data filtering at the database level.

### Dashboard app filters

```json
{
  "params": {
    "dashboardAppFilters": [{
      "dashboardId": "sales-dashboard",
      "values": { "region": "North America", "timePeriod": { "startDate": "2024-01-01", "endDate": "2024-12-31" } }
    }]
  }
}
```

### RLS settings

```json
{
  "params": {
    "rlsSettings": [{ "metricId": "metric-1", "values": { "customer_id": "abc" } }]
  }
}
```

### Hide filters from UI

```json
{ "params": { "hideDashboardFilters": ["internal_filter_1"] } }
```

### Per-client dashboard provisioning

```bash
POST /api/v2/data-app/dashboard-embeds
{
  "dashboardId": "client-abc-analytics",
  "clientId": "abc",
  "workspaceName": "my-workspace",
  "templateDashboardId": "master-template",
  "accessSettings": { "datamartName": "...", "isAllowMetricCreation": true }
}
```

### MCP tool chain

```
create_dashboard_embed(dashboardId: "...", clientId: "abc", workspaceName: "...", templateDashboardId: "...")
generate_guest_token(clientId: "abc", ...)
```

---

## 6. AI Chat & Self-Serve Analytics

**Demo page:** `#selfserve`

### Access settings for AI + self-serve

When creating the embed, set:

```json
{
  "accessSettings": {
    "isAllowAiPilot": true,
    "metricCreationMode": "CHAT",
    "isAllowMetricCreation": true,
    "isAllowMetricUpdate": true,
    "isAllowManageMetrics": true
  }
}
```

### Private metrics

```json
{ "params": { "userIdentifier": "unique-user-id-123" } }
```

### Embed functions (imperative API)

```js
const embed = document.querySelector("dbn-dashboard")
  ?.shadowRoot?.querySelector(".dbn-dashboard");

embed?.onClickCreateMetric();
embed?.onClickManageMetrics();
embed?.onClickScheduleReports();
embed?.onClickCustomizeLayout();
```

### MCP tool chain

```
update_embed(embedId: "...", body: { options: { isAllowMetricCreation: true, metricCreationMode: "CHAT" } })
generate_guest_token(..., params: { userIdentifier: "..." })
```

---

## 7. Internationalization

**Demo page:** `#dashboard` (i18n section in options panel)

```jsx
<dbn-dashboard
  language="fr"
  calendar-type="default"
  translations={JSON.stringify({ "Total": "Total", "Revenue": "Revenu" })}
/>
```

Supported languages: en, fr, es, de, it, pt, zh, ja, ko, hi, ar, ru.

### MCP tool chain

```
configure_internationalization(embedId: "...", language: "fr")
```

---

## 8. Server Event Handling

Handle token expiry and auth errors:

```js
window.databrainServerEvent = (event) => {
  if (event?.type === "TOKEN_EXPIRED") {
    // redirect to login or refresh token
  }
};
```

```html
<dbn-dashboard handle-server-event="databrainServerEvent" />
```

---

## 9. Setup from Scratch (MCP)

Full zero-to-embed flow using MCP tools:

1. `create_datasource` — connect your database
2. `sync_datasource` — refresh schema
3. `create_datamart` — define tables/columns
4. `create_workspace` — create workspace with datamart
5. `create_data_app` — create data app
6. `create_api_token` — generate API token
7. `create_embed` — create dashboard or metric embed
8. `generate_guest_token` — generate frontend auth token
9. `generate_embed_code` — get framework-specific code snippets

The assistant orchestrates these steps automatically based on your request.
