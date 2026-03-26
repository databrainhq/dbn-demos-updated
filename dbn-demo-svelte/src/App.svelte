<script lang="ts">
import '@databrainhq/plugin/web';
import { onMount } from 'svelte';

const API_URL = 'http://localhost:3002';
const DASHBOARD_ID = import.meta.env.VITE_DASHBOARD_ID || '';

let token = '';
let state: 'idle' | 'loading' | 'setup' | 'ready' | 'error' = 'idle';
let error = '';

async function fetchToken() {
  state = 'loading';
  try {
    const res = await fetch(`${API_URL}/api/guest-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: 'default' }),
    });
    const data = await res.json();
    if (res.ok && data.configured === false) { state = 'setup'; return; }
    if (res.ok && data.guestToken) { token = data.guestToken; state = 'ready'; return; }
    state = 'error';
    error = data.error || 'Failed to get guest token';
  } catch (e: any) {
    state = 'error';
    error = e.message || 'Connection failed';
  }
}

onMount(fetchToken);
</script>

{#if state === 'loading' || state === 'idle'}
  <div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#666;">
    Loading dashboard…
  </div>
{:else if state === 'setup'}
  <div style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
    <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">Configure Databrain</h2>
    <p style="font-size:14px;color:#666;margin-bottom:16px;">
      Set <code>DATABRAIN_API_TOKEN</code> and <code>DATA_APP_NAME</code> in <code>backend/.env</code>.
    </p>
    <button on:click={fetchToken} style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;">Check again</button>
  </div>
{:else if state === 'error'}
  <div style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
    <h2 style="font-size:18px;font-weight:600;color:#dc2626;margin-bottom:8px;">Error</h2>
    <p style="font-size:14px;color:#666;margin-bottom:16px;">{error}</p>
    <button on:click={fetchToken} style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;">Retry</button>
  </div>
{:else if state === 'ready'}
  <div style="height:100vh;display:flex;flex-direction:column;">
    <div style="border-bottom:1px solid #e5e7eb;padding:12px;display:flex;align-items:center;gap:12px;background:white;">
      <span style="font-weight:600;font-size:14px;">Databrain + Svelte</span>
    </div>
    <div style="flex:1;padding:8px;">
      <dbn-dashboard token={token} dashboard-id={DASHBOARD_ID} />
    </div>
  </div>
{/if}
