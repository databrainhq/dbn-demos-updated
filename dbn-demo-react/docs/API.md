# Backend API Reference

Base URL: `http://localhost:3002` (or your deployed backend)

---

## GET /api/config/status

Check if the backend is configured.

**Response:**
```json
{ "isConfigured": true, "hasApiToken": true, "hasDataAppName": true, "apiBaseUrl": "https://api.usedatabrain.com" }
```

---

## POST /api/guest-token

Generate a guest token for embedding.

**Databrain API:** `POST /api/v2/guest-token/create`
**MCP equivalent:** `generate_guest_token`

**Request body:**
```json
{
  "clientId": "user-123",
  "permissions": {
    "isEnableManageMetrics": false,
    "isEnableCustomizeLayout": false,
    "isEnableUnderlyingData": false,
    "isEnableDownloadMetrics": false,
    "isShowSideBar": true,
    "isShowDashboardName": true
  },
  "params": {
    "appFilters": [{ "metricId": "metric-1", "values": { "country": "USA" } }],
    "dashboardAppFilters": [{ "dashboardId": "dash-1", "values": { "region": "North America" } }],
    "rlsSettings": [{ "metricId": "metric-1", "values": { "tenant_id": "abc" } }],
    "hideDashboardFilters": ["internal_filter"],
    "userIdentifier": "unique-user-id"
  },
  "expiryTime": 3600000,
  "datasourceName": "my-datasource"
}
```

Only `clientId` is required. All other fields are optional.

**Success response:**
```json
{ "success": true, "guestToken": "uuid-token-here", "clientId": "user-123" }
```

**Unconfigured response:**
```json
{ "success": false, "configured": false, "message": "Set DATABRAIN_API_TOKEN in backend/.env" }
```

---

## POST /api/dashboards

List datamarts for the configured data app.

**Databrain API:** `GET /api/v2/data-app/datamarts`
**MCP equivalent:** `list_datamarts`

No request body required.

**Response:** Proxied from Databrain API — array of datamart objects.

---

## POST /api/provision-dashboard

Create a per-client dashboard (multi-tenant provisioning).

**Databrain API:** `POST /api/v2/data-app/dashboard-embeds`
**MCP equivalent:** `create_dashboard_embed`

**Request body:**
```json
{
  "dashboardId": "client-abc-analytics",
  "clientId": "abc",
  "workspaceName": "my-workspace",
  "templateDashboardId": "master-template",
  "accessSettings": {
    "datamartName": "my-datamart",
    "isAllowMetricCreation": true,
    "isAllowMetricUpdate": true,
    "isAllowManageMetrics": true,
    "isAllowUnderlyingData": false,
    "isAllowAiPilot": false,
    "metricCreationMode": "DRAG_DROP"
  }
}
```

`dashboardId`, `clientId`, and `workspaceName` are required.

**Response:** Proxied from Databrain API.

---

## Error Responses

All endpoints may return:

```json
{ "error": "description", "details": "..." }
```

| Status | Cause |
|--------|-------|
| 400 | Missing required fields or invalid parameters |
| 401 | Invalid or expired API token |
| 500 | Failed to connect to Databrain API |
