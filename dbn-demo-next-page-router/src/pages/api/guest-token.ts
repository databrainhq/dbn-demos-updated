import type { NextApiRequest, NextApiResponse } from 'next';

const apiToken = process.env.DATABRAIN_API_TOKEN || process.env.DATABRAIN_SERVICE_TOKEN || '';
const dataAppName = process.env.DATA_APP_NAME || '';
const API_BASE_URL = process.env.DATABRAIN_API_BASE_URL || 'https://api.usedatabrain.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!apiToken) {
      return res.status(200).json({ success: false, configured: false, message: 'Set DATABRAIN_API_TOKEN in .env.local' });
    }
    const { clientId, permissions, params, expiryTime } = req.body;
    if (!clientId) return res.status(400).json({ error: 'clientId is required' });

    const response = await fetch(`${API_BASE_URL}/api/v2/guest-token/create`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        dataAppName,
        ...(permissions && { permissions }),
        ...(params && { params }),
        ...(expiryTime && { expiryTime }),
      }),
    });
    const data = await response.json();
    if (response.ok && data.token) {
      return res.json({ success: true, guestToken: data.token, clientId });
    }
    return res.status(response.status >= 400 ? response.status : 400).json({
      error: data?.error?.message || 'Failed to create guest token',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to connect to DataBrain API', details: err.message });
  }
}
