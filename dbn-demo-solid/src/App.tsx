import type { Component } from "solid-js";
import { createSignal, createResource, Show } from "solid-js";
import "@databrainhq/plugin/web";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": any;
      "dbn-metric": any;
    }
  }
}

const API_URL = "http://localhost:3002";
const DASHBOARD_ID = import.meta.env.VITE_DASHBOARD_ID || "";

async function fetchGuestToken(clientId: string) {
  const res = await fetch(`${API_URL}/api/guest-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId }),
  });
  const data = await res.json();
  if (res.ok && data.configured === false) return { state: "setup" as const };
  if (res.ok && data.guestToken) return { state: "ready" as const, token: data.guestToken };
  return { state: "error" as const, error: data.error || "Failed to get guest token" };
}

const App: Component = () => {
  const [clientId] = createSignal("default");
  const [result] = createResource(clientId, fetchGuestToken);

  return (
    <div style="height:100vh;display:flex;flex-direction:column;">
      <div style="border-bottom:1px solid #e5e7eb;padding:12px;display:flex;align-items:center;gap:12px;background:white;">
        <span style="font-weight:600;font-size:14px;">Databrain + Solid</span>
      </div>

      <Show when={result.loading}>
        <div style="display:flex;align-items:center;justify-content:center;flex:1;color:#666;">Loading dashboard…</div>
      </Show>

      <Show when={result()?.state === "setup"}>
        <div style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
          <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">Configure Databrain</h2>
          <p style="font-size:14px;color:#666;">Set <code>DATABRAIN_API_TOKEN</code> and <code>DATA_APP_NAME</code> in <code>backend/.env</code>.</p>
        </div>
      </Show>

      <Show when={result()?.state === "error"}>
        <div style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
          <h2 style="font-size:18px;font-weight:600;color:#dc2626;">Error</h2>
          <p style="font-size:14px;color:#666;">{(result() as any)?.error}</p>
        </div>
      </Show>

      <Show when={result()?.state === "ready" && DASHBOARD_ID}>
        <div style="flex:1;padding:8px;">
          <dbn-dashboard token={(result() as any)?.token} dashboard-id={DASHBOARD_ID} />
        </div>
      </Show>

      <Show when={result()?.state === "ready" && !DASHBOARD_ID}>
        <div style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
          <h2 style="font-size:18px;font-weight:600;">Set Dashboard ID</h2>
          <p style="font-size:14px;color:#666;">Set <code>VITE_DASHBOARD_ID</code> in <code>.env</code>.</p>
        </div>
      </Show>
    </div>
  );
};

export default App;
