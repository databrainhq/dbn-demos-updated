# Backend API Reference

Complete reference for the DataBrain Demo backend API endpoints.

---

## Base URL

```
http://localhost:3002
```

For production, replace with your deployed backend URL.

---

## Configuration Endpoints

### Check Configuration Status

```http
GET /api/config/status
```

**Description:** Check if the backend is configured with valid credentials.

**Response:**
```json
{
  "isConfigured": true,
  "hasApiKey": true,
  "hasDataAppName": true,
  "workspaceName": "Demo Workspace"
}
```

---

### Update Configuration

```http
POST /api/config/update
```

**Description:** Update configuration at runtime (alternative to .env file).

**Request Body:**
```json
{
  "apiToken": "your-api-token",
  "dataAppName": "your-data-app-name",
  "apiBaseUrl": "https://api.usedatabrain.com",
  "workspaceName": "Demo Workspace"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "config": {
    "hasApiToken": true,
    "hasDataAppName": true,
    "apiBaseUrl": "https://api.usedatabrain.com",
    "workspaceName": "Demo Workspace"
  }
}
```

**Error Response:**
```json
{
  "error": "Validation failed",
  "details": "API token is invalid"
}
```

---

### Validate Configuration

```http
POST /api/config/validate
```

**Description:** Validate credentials against DataBrain API without saving.

**Request Body:**
```json
{
  "apiToken": "your-api-token",
  "dataAppName": "your-data-app-name"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Credentials are valid"
}
```

---

## DataBrain Integration Endpoints

### Generate Guest Token

```http
POST /api/dashboard-guest-token
```

**Description:** Generate a guest token for secure dashboard access.

**Request Body:**
```json
{
  "clientId": "101",
  "customerId": "101-1",
  "dashboardIds": ["chat-mode-dash"],
  "userPersona": "Store Manager",
  "filterFieldName": "store_name",
  "filterValue": "Ramirez Ltd"
}
```

**Parameters:**
- `clientId` (string, required) - Top-level tenant ID
- `customerId` (string, optional) - Customer ID for row-level filtering
- `dashboardIds` (array, optional) - Array of dashboard IDs to filter
- `userPersona` (string, optional) - User role/persona for logging
- `filterFieldName` (string, optional) - Field name for dashboard app filter
- `filterValue` (string, optional) - Value for dashboard app filter

**Response:**
```json
{
  "success": true,
  "guestToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600000,
  "clientId": "101",
  "dashboardIds": ["chat-mode-dash"],
  "hasDashboardAppFilters": true,
  "filterDetails": {
    "field": "store_name",
    "value": "Ramirez Ltd",
    "appliedToDashboards": ["chat-mode-dash"],
    "totalDashboards": 1
  },
  "message": "Guest token created successfully..."
}
```

**Error Response:**
```json
{
  "error": "API Key not configured",
  "details": "Please set DATABRAIN_API_KEY..."
}
```

---

### Fetch Dashboards

```http
POST /api/v2/dashboards
```

**Description:** Fetch all available dashboards from DataBrain.

**Request Body:**
```json
{
  "clientId": "101"
}
```

**Response:**
```json
{
  "success": true,
  "dashboards": [
    {
      "id": "dashboard-1",
      "name": "Sales Dashboard",
      "description": "Sales analytics",
      "embedId": "chat-mode-dash",
      "isDashboard": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Create Dashboard

```http
POST /api/v2/create-dashboard
```

**Description:** Create a new dashboard.

**Request Body:**
```json
{
  "dashboardName": "My Custom Dashboard",
  "description": "Custom analytics dashboard",
  "clientId": "101",
  "datamartName": "Sales Management Datamart",
  "userIdentifier": "Ramirez Ltd"
}
```

**Response:**
```json
{
  "success": true,
  "dashboardId": "my-custom-dashboard-1234567890",
  "embedId": "embed-id-xyz",
  "dashboardName": "My Custom Dashboard",
  "description": "Custom analytics dashboard",
  "message": "Dashboard created successfully"
}
```

---

### Copy Dashboard

```http
POST /api/v2/copy-dashboard
```

**Description:** Create a copy of an existing dashboard.

**Request Body:**
```json
{
  "sourceDashboardId": "chat-mode-dash",
  "newDashboardName": "My Dashboard Copy",
  "newDescription": "Copy of template dashboard",
  "clientId": "101",
  "workspaceName": "Demo Workspace"
}
```

**Response:**
```json
{
  "success": true,
  "dashboardId": "my-dashboard-copy-1234567890",
  "embedId": "embed-id-abc",
  "dashboardName": "My Dashboard Copy"
}
```

---

### Publish Dashboard

```http
POST /api/v2/publish-dashboard
```

**Description:** Publish a dashboard to make it visible to others.

**Request Body:**
```json
{
  "embedId": "embed-id-xyz",
  "clientId": "101",
  "dashboardId": "my-custom-dashboard-1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "dashboardId": "my-custom-dashboard-1234567890",
  "message": "Dashboard published successfully"
}
```

---

### List Dashboard Embeds

```http
POST /api/list-embeds
```

**Description:** List all dashboard embeds for the Data App.

**Request Body:**
```json
{
  "clientId": "101"
}
```

**Response:**
```json
{
  "success": true,
  "embeds": [
    {
      "embedId": "chat-mode-dash",
      "name": "Main Dashboard",
      "dashboardId": "dashboard-123",
      "isTemplate": true
    },
    {
      "embedId": "user-dashboard-1",
      "name": "Custom Dashboard",
      "dashboardId": "dashboard-456",
      "userIdentifier": "Ramirez Ltd"
    }
  ]
}
```

---

### Delete Dashboard Embed

```http
POST /api/delete-embed
```

**Description:** Delete a dashboard embed.

**Request Body:**
```json
{
  "embedId": "embed-id-to-delete"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Embed deleted successfully"
}
```

---

## Widget Management Endpoints

### Fetch Dashboard Widgets

```http
POST /api/dashboard-widgets
```

**Description:** Fetch all widgets for a specific dashboard.

**Request Body:**
```json
{
  "dashboardId": "chat-mode-dash",
  "clientId": "101"
}
```

**Response:**
```json
{
  "success": true,
  "widgets": [
    {
      "id": "widget-1",
      "name": "Sales Chart",
      "type": "bar",
      "config": {...}
    }
  ]
}
```

---

### Create Widget

```http
POST /api/create-widget
```

**Description:** Create a new custom widget.

**Request Body:**
```json
{
  "dashboardId": "chat-mode-dash",
  "widgetConfig": {
    "name": "My Custom Widget",
    "type": "line",
    "dataSource": "sales_data",
    "xAxis": "date",
    "yAxis": "revenue"
  },
  "clientId": "101"
}
```

**Response:**
```json
{
  "success": true,
  "widgetId": "widget-123",
  "message": "Widget created successfully"
}
```

---

### Update Widget

```http
POST /api/update-widget
```

**Description:** Update an existing widget.

**Request Body:**
```json
{
  "widgetId": "widget-123",
  "dashboardId": "chat-mode-dash",
  "widgetConfig": {
    "name": "Updated Widget Name",
    "type": "bar"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Widget updated successfully"
}
```

---

### Delete Widget

```http
POST /api/delete-widget
```

**Description:** Delete a widget.

**Request Body:**
```json
{
  "widgetId": "widget-123",
  "dashboardId": "chat-mode-dash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Widget deleted successfully"
}
```

---

## Reports Endpoints

### Fetch Dashboard Metrics

```http
POST /api/v2/dashboard-metrics
```

**Description:** Fetch all metrics/reports for a dashboard.

**Request Body:**
```json
{
  "dashboardId": "chat-mode-dash",
  "workspaceName": "Demo Workspace"
}
```

**Response:**
```json
{
  "success": true,
  "metrics": [
    {
      "id": "metric-1",
      "name": "Total Sales",
      "type": "kpi",
      "value": 125000
    },
    {
      "id": "metric-2",
      "name": "Monthly Revenue",
      "type": "chart",
      "chartType": "line"
    }
  ]
}
```

---

## Datamart Endpoints

### List Datamarts

```http
GET /api/datamarts/list
```

**Description:** Fetch all available datamarts from DataBrain.

**Response:**
```json
{
  "success": true,
  "datamarts": [
    {
      "name": "Sales Management Datamart",
      "schemaName": "public",
      "tableName": "sales_data"
    },
    {
      "name": "Customer Analytics Datamart",
      "schemaName": "analytics",
      "tableName": "customer_data"
    }
  ]
}
```

---

## Error Responses

All endpoints may return these common error responses:

### API Key Not Configured
```json
{
  "error": "API Key not configured",
  "details": "Please set DATABRAIN_API_KEY environment variable."
}
```

### Data App Name Not Configured
```json
{
  "error": "Data App Name not configured",
  "details": "Please set DATABRAIN_DATA_APP_NAME environment variable."
}
```

### Invalid Request
```json
{
  "error": "Invalid request",
  "details": "clientId is required"
}
```

### DataBrain API Error
```json
{
  "error": "DataBrain API error",
  "details": "Failed to create dashboard",
  "databrainError": {...}
}
```

---

## Authentication

All requests to DataBrain API are authenticated using the API token from the Data App. The token is configured in the backend environment variables and is **never exposed to the frontend**.

### Security Notes

1. **Never expose API token in frontend code**
2. **Always validate on backend** before making DataBrain API calls
3. **Use guest tokens** for frontend dashboard access
4. **Guest tokens expire** after the configured time (default: 1 hour)

---

## Rate Limiting

The backend doesn't implement rate limiting, but DataBrain API may have rate limits. Consider implementing:

- Request queuing
- Caching frequently accessed data
- Rate limiting middleware

---

## Testing

### Health Check

```bash
curl http://localhost:3002/api/config/status
```

### Test Guest Token Generation

```bash
curl -X POST http://localhost:3002/api/dashboard-guest-token \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "101",
    "dashboardIds": ["chat-mode-dash"]
  }'
```

---

## Additional Resources

- **Configuration:** [../CONFIGURATION.md](../CONFIGURATION.md)
- **Developer Reference:** [DEVELOPER.md](DEVELOPER.md)
- **DataBrain API Docs:** [docs.usedatabrain.com](https://docs.usedatabrain.com)
- **Guest Token API:** [Token API Reference](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token)

---

**Need help?** Check the [troubleshooting section](../QUICK_START.md#troubleshooting) or contact support@usedatabrain.com

