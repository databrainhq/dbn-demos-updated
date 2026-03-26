/* global process */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// DATABRAIN_API_TOKEN is the per-data-app token (recommended).
// DATABRAIN_SERVICE_TOKEN also works for backward compat / MCP workflows.
const apiToken = process.env.DATABRAIN_API_TOKEN || process.env.DATABRAIN_SERVICE_TOKEN || process.env.DATABRAIN_API_KEY;
const dataAppName = process.env.DATA_APP_NAME || process.env.DATABRAIN_DATA_APP_NAME || '';
const raw = process.env.DATABRAIN_API_BASE_URL || 'https://api.usedatabrain.com';
const API_BASE_URL = raw.startsWith('http://localhost:') ? 'https://api.usedatabrain.com' : raw;
const PORT = process.env.PORT || 3002;

// ---------------------------------------------------------------------------
// GET /api/config/status — health check
// ---------------------------------------------------------------------------
app.get('/api/config/status', (_req, res) => {
  res.json({
    isConfigured: !!apiToken && !!dataAppName,
    hasApiToken: !!apiToken,
    hasDataAppName: !!dataAppName,
    apiBaseUrl: API_BASE_URL,
  });
});

// ---------------------------------------------------------------------------
// POST /api/guest-token — generate a guest token
//
// Databrain API: POST /api/v2/guest-token/create
// Docs: https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token
// MCP equivalent: generate_guest_token
//
// Required: clientId, dataAppName
// Optional: params (appFilters, dashboardAppFilters, rlsSettings,
//           hideDashboardFilters, userIdentifier),
//           permissions, expiryTime, datasourceName
// ---------------------------------------------------------------------------
app.post('/api/guest-token', async (req, res) => {
  try {
    if (!apiToken) {
      return res.status(200).json({
        success: false,
        configured: false,
        message: 'Set DATABRAIN_API_TOKEN in backend/.env to generate guest tokens.',
      });
    }

    const { clientId, permissions, params, expiryTime, datasourceName } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    const body = {
      clientId,
      dataAppName: dataAppName || req.body.dataAppName,
      ...(permissions && { permissions }),
      ...(params && { params }),
      ...(expiryTime && { expiryTime }),
      ...(datasourceName && { datasourceName }),
    };

    const response = await fetch(`${API_BASE_URL}/api/v2/guest-token/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      return res.json({ success: true, guestToken: data.token, clientId });
    }

    const isAuthError =
      data?.error?.code === 'AUTHENTICATION_ERROR' ||
      String(data?.error?.message || '').toLowerCase().includes('invalid or expired');

    res.status(response.status >= 400 ? response.status : 400).json({
      error: isAuthError
        ? 'API token is invalid or expired. Regenerate in DataBrain Data App > API Token.'
        : data?.error?.message || 'Failed to create guest token',
    });
  } catch (err) {
    console.error('Guest token error:', err.message);
    res.status(500).json({ error: 'Failed to connect to DataBrain API', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/dashboards — list dashboards for the data app
//
// Uses the guest token API indirectly; dashboards are discovered via embeds.
// In practice, list the embeds from your data app to find dashboard IDs.
// MCP equivalent: list_dashboards
// ---------------------------------------------------------------------------
app.post('/api/dashboards', async (req, res) => {
  try {
    if (!apiToken) {
      return res.status(400).json({ error: 'DATABRAIN_API_TOKEN not configured' });
    }

    const response = await fetch(`${API_BASE_URL}/api/v2/data-app/datamarts`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('List dashboards error:', err.message);
    res.status(500).json({ error: 'Failed to list dashboards', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/provision-dashboard — create a per-client dashboard
//
// Databrain API: POST /api/v2/data-app/dashboard-embeds
// Docs: https://docs.usedatabrain.com/developer-docs/helpers/api-reference/create-dashboard-embed
// MCP equivalent: create_dashboard_embed
//
// Multi-tenant use case: clone a template dashboard for each client.
// ---------------------------------------------------------------------------
app.post('/api/provision-dashboard', async (req, res) => {
  try {
    if (!apiToken) {
      return res.status(400).json({ error: 'DATABRAIN_API_TOKEN not configured' });
    }

    const { dashboardId, clientId, workspaceName, templateDashboardId, accessSettings } = req.body;

    if (!dashboardId || !clientId || !workspaceName) {
      return res.status(400).json({ error: 'dashboardId, clientId, and workspaceName are required' });
    }

    const body = {
      dashboardId,
      clientId,
      workspaceName,
      ...(templateDashboardId && { templateDashboardId }),
      accessSettings: {
        datamartName: accessSettings?.datamartName || '',
        isAllowMetricCreation: accessSettings?.isAllowMetricCreation ?? true,
        isAllowMetricUpdate: accessSettings?.isAllowMetricUpdate ?? true,
        isAllowMetricDeletion: accessSettings?.isAllowMetricDeletion ?? false,
        isAllowMetricLayoutChange: accessSettings?.isAllowMetricLayoutChange ?? true,
        isAllowManageMetrics: accessSettings?.isAllowManageMetrics ?? true,
        isAllowUnderlyingData: accessSettings?.isAllowUnderlyingData ?? false,
        isAllowEmailReports: accessSettings?.isAllowEmailReports ?? false,
        isAllowCreateDashboardView: accessSettings?.isAllowCreateDashboardView ?? true,
        isAllowAiPilot: accessSettings?.isAllowAiPilot ?? false,
        metricCreationMode: accessSettings?.metricCreationMode || 'DRAG_DROP',
        ...accessSettings,
      },
    };

    const response = await fetch(`${API_BASE_URL}/api/v2/data-app/dashboard-embeds`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Provision dashboard error:', err.message);
    res.status(500).json({ error: 'Failed to provision dashboard', details: err.message });
  }
});

// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(apiToken ? 'DataBrain: configured' : 'DataBrain: set DATABRAIN_API_TOKEN in .env');
});

export default app;
