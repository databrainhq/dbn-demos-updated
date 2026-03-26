import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const apiToken = process.env.DATABRAIN_API_TOKEN || process.env.DATABRAIN_SERVICE_TOKEN;
const dataAppName = process.env.DATA_APP_NAME || '';
const API_BASE_URL = process.env.DATABRAIN_API_BASE_URL || 'https://api.usedatabrain.com';
const PORT = process.env.PORT || 3002;

app.get('/api/config/status', (_req, res) => {
  res.json({ isConfigured: !!apiToken && !!dataAppName, apiBaseUrl: API_BASE_URL });
});

app.post('/api/guest-token', async (req, res) => {
  try {
    if (!apiToken) {
      return res.status(200).json({ success: false, configured: false, message: 'Set DATABRAIN_API_TOKEN in backend/.env' });
    }
    const { clientId, permissions, params, expiryTime } = req.body;
    if (!clientId) return res.status(400).json({ error: 'clientId is required' });

    const response = await fetch(`${API_BASE_URL}/api/v2/guest-token/create`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        dataAppName: dataAppName || req.body.dataAppName,
        ...(permissions && { permissions }),
        ...(params && { params }),
        ...(expiryTime && { expiryTime }),
      }),
    });

    const data = await response.json();
    if (response.ok && data.token) {
      return res.json({ success: true, guestToken: data.token, clientId });
    }
    res.status(response.status >= 400 ? response.status : 400).json({
      error: data?.error?.message || 'Failed to create guest token',
    });
  } catch (err) {
    console.error('Guest token error:', err.message);
    res.status(500).json({ error: 'Failed to connect to DataBrain API', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(apiToken ? 'DataBrain: configured' : 'DataBrain: set DATABRAIN_API_TOKEN in .env');
});

export default app;
