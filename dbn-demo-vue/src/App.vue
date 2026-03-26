<script setup lang="ts">
import "@databrainhq/plugin/web";
import { ref, onMounted, computed } from "vue";

const API_URL = "http://localhost:3002";
const DASHBOARD_ID = import.meta.env.VITE_DASHBOARD_ID || "";

const token = ref("");
const state = ref<"idle" | "loading" | "setup" | "ready" | "error">("idle");
const error = ref("");
const selectedTheme = ref<"none" | "light" | "dark">("none");

const themes: Record<string, object> = {
  none: {},
  light: {
    colors: { primary: "#2563eb", background: "#ffffff", dark: "#0f172a", light: "#f8fafc" },
    typography: { fontFamily: "Inter", fontSize: "13px" },
  },
  dark: {
    colors: { primary: "#60a5fa", background: "#0f172a", dark: "#f8fafc", light: "#1e293b" },
    typography: { fontFamily: "Inter", fontSize: "13px" },
  },
};

const themeJson = computed(() =>
  selectedTheme.value !== "none" ? JSON.stringify(themes[selectedTheme.value]) : undefined
);

async function fetchToken() {
  state.value = "loading";
  try {
    const res = await fetch(`${API_URL}/api/guest-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: "default" }),
    });
    const data = await res.json();
    if (res.ok && data.configured === false) { state.value = "setup"; return; }
    if (res.ok && data.guestToken) { token.value = data.guestToken; state.value = "ready"; return; }
    state.value = "error";
    error.value = data.error || "Failed to get guest token";
  } catch (e: any) {
    state.value = "error";
    error.value = e.message || "Connection failed";
  }
}

function callEmbedFunction(fn: string) {
  const el = document.querySelector("dbn-dashboard");
  const inner = el?.shadowRoot?.querySelector(".dbn-dashboard") as any;
  if (inner && typeof inner[fn] === "function") inner[fn]();
}

// Server event handler
if (typeof window !== "undefined") {
  (window as any).databrainServerEvent = (event: any) => {
    if (event?.type === "TOKEN_EXPIRED") {
      console.warn("Databrain: guest token expired.");
    }
  };
}

onMounted(fetchToken);
</script>

<template>
  <div v-if="state === 'loading'" style="display:flex;align-items:center;justify-content:center;height:100vh;color:#666;">
    Loading dashboard…
  </div>

  <div v-else-if="state === 'setup'" style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
    <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">Configure Databrain</h2>
    <p style="font-size:14px;color:#666;margin-bottom:16px;">
      Set <code>DATABRAIN_API_TOKEN</code> and <code>DATA_APP_NAME</code> in <code>backend/.env</code>.
    </p>
    <button @click="fetchToken" style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;">Check again</button>
  </div>

  <div v-else-if="state === 'error'" style="max-width:400px;margin:64px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
    <h2 style="font-size:18px;font-weight:600;color:#dc2626;margin-bottom:8px;">Error</h2>
    <p style="font-size:14px;color:#666;margin-bottom:16px;">{{ error }}</p>
    <button @click="fetchToken" style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;">Retry</button>
  </div>

  <div v-else-if="state === 'ready'" style="height:100vh;display:flex;flex-direction:column;">
    <div style="border-bottom:1px solid #e5e7eb;padding:12px;display:flex;align-items:center;gap:12px;background:white;">
      <span style="font-weight:600;font-size:14px;">Databrain + Vue</span>
      <select v-model="selectedTheme" style="margin-left:auto;border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:13px;">
        <option value="none">Default theme</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <button @click="callEmbedFunction('onClickCreateMetric')" style="padding:4px 12px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;cursor:pointer;">
        Create Metric
      </button>
      <button @click="callEmbedFunction('onClickManageMetrics')" style="padding:4px 12px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;cursor:pointer;">
        Manage Metrics
      </button>
    </div>
    <div style="flex:1;padding:8px;">
      <dbn-dashboard
        :token="token"
        :dashboard-id="DASHBOARD_ID"
        :theme="themeJson"
        handle-server-event="databrainServerEvent"
      />
    </div>
  </div>
</template>
