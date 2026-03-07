/* global process */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// When using MCP, only DATABRAIN_SERVICE_TOKEN is required. Legacy: DATABRAIN_API_KEY + DATABRAIN_DATA_APP_NAME.
const serviceToken = process.env.DATABRAIN_SERVICE_TOKEN || process.env.DATABRAIN_API_KEY;
const dataAppName = process.env.DATABRAIN_DATA_APP_NAME || '';
const raw = process.env.DATABRAIN_API_BASE_URL || 'https://api.usedatabrain.com';
const API_BASE_URL =
  raw === 'http://localhost:3000' || raw.startsWith('http://localhost:')
    ? 'https://api.usedatabrain.com'
    : raw;
const PORT = process.env.PORT || 3002;

app.get('/api/config/status', (req, res) => {
  res.json({
    isConfigured: !!serviceToken,
    hasServiceToken: !!serviceToken,
    apiBaseUrl: API_BASE_URL,
  });
});

app.post('/api/dashboard-guest-token', async (req, res) => {
  try {
    if (!serviceToken) {
      return res.status(200).json({
        success: false,
        configured: false,
        message: 'Skeleton is running. To embed a dashboard, set the service token in your MCP server settings.',
      });
    }
    const { clientId } = req.body;
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    const response = await fetch(`${API_BASE_URL}/api/v2/guest-token/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId,
        ...(dataAppName && { dataAppName }),
        permissions: {
          isEnableManageMetrics: false,
          isEnableCreateDashboardView: false,
          isEnableCustomizeLayout: false,
          isEnableUnderlyingData: false,
          isEnableDownloadMetrics: false,
          isShowSideBar: true,
          isShowDashboardName: true,
        },
      }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      res.json({ success: true, guestToken: data.token, clientId, dataAppName });
    } else {
      const isAuthError =
        data?.error?.code === 'AUTHENTICATION_ERROR' ||
        (data?.error?.message && String(data.error.message).toLowerCase().includes('invalid or expired'));
      if (isAuthError) {
        console.error('Guest token failed: API key invalid or expired. Use a valid key from your DataBrain Data App.');
      }
      res.status(response.status >= 400 ? response.status : 400).json({
        error: isAuthError
          ? 'Service token is invalid or expired. Set a valid service token in your MCP server settings.'
          : data?.error?.message || 'Failed to create guest token',
      });
    }
  } catch (err) {
    console.error('Guest token error:', err.message);
    res.status(500).json({
      error: 'Failed to connect to DataBrain API',
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    serviceToken
      ? 'DataBrain: configured (service token set)'
      : 'DataBrain: running (set service token in MCP settings to embed a dashboard)'
  );
});

export default app;
