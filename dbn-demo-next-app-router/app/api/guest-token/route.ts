import { NextResponse } from 'next/server';

const apiToken = process.env.DATABRAIN_API_TOKEN || process.env.DATABRAIN_SERVICE_TOKEN || '';
const dataAppName = process.env.DATA_APP_NAME || '';
const API_BASE_URL = process.env.DATABRAIN_API_BASE_URL || 'https://api.usedatabrain.com';

export async function POST(request: Request) {
  try {
    if (!apiToken) {
      return NextResponse.json({ success: false, configured: false, message: 'Set DATABRAIN_API_TOKEN in .env.local' });
    }
    const { clientId, permissions, params, expiryTime } = await request.json();
    if (!clientId) return NextResponse.json({ error: 'clientId is required' }, { status: 400 });

    const res = await fetch(`${API_BASE_URL}/api/v2/guest-token/create`, {
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
    const data = await res.json();
    if (res.ok && data.token) {
      return NextResponse.json({ success: true, guestToken: data.token, clientId });
    }
    return NextResponse.json({ error: data?.error?.message || 'Failed to create guest token' }, { status: res.status >= 400 ? res.status : 400 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to connect to DataBrain API', details: err.message }, { status: 500 });
  }
}
