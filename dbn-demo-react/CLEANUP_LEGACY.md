# Template Cleanup — Legacy & Consistency

This doc summarizes cleanup done to make the repo a clear **customer template** and what is intentionally left in place.

---

## Cleanup completed

### 1. **Single API base URL (frontend)**

- **Added** `src/lib/config.ts`: `API_BASE_URL` and `DATABRAIN_PLUGIN_BASE_URL` from env (`VITE_API_URL`, `VITE_DATABRAIN_PLUGIN_URL`) with sensible defaults.
- **Replaced** all hardcoded `http://localhost:3002` (and the plugin’s `localhost:3000`) in:
  - `App.tsx`, `Reports.tsx`, `CreateDashboard.tsx`, `DashboardSelector.tsx`, `Settings.tsx`, `AiPilotPanel.tsx`, `DashboardActions.tsx`
- **Defaults:** Backend `http://localhost:3002`, DataBrain plugin `https://api.usedatabrain.com`.
- **Customer:** Set `VITE_API_URL` (and optionally `VITE_DATABRAIN_PLUGIN_URL`) in root `.env` if the backend or DataBrain URL differs. See root `.env.example`.

### 2. **Backend port and env.example**

- **Aligned** `backend/env.example`: `PORT=3002` (was 3001). Backend already defaulted to 3002 in code.
- Docs that still say 3001 can be updated to 3002 where they refer to “backend port”.

### 3. **Demo-only logic removed**

- **Removed** the `clientId.startsWith('Team ')` warning in `backend/server.js`. Any tenant ID format is accepted.

### 4. **DataBrain plugin base URL**

- **Default** for `window.dbn.baseUrl` is now `https://api.usedatabrain.com` (no longer `localhost:3000`). Override with `VITE_DATABRAIN_PLUGIN_URL` if needed.

### 5. **Dead code removed**

- **Removed** `src/components/WidgetManager.tsx`. It was never imported and called backend routes (`/api/dashboard-widgets`, `/api/create-widget`, etc.) that do not exist. Removing it avoids confusion and 404s.

---

## Intentionally kept (optional / reference)

### **DashboardActions.tsx**

- **Status:** Not mounted in the current app (not used in `App.tsx`).
- **Backend:** Uses real routes: `/api/v2/copy-dashboard`, `/api/v2/publish-dashboard`.
- **Use:** Keep as reference or mount when you need “Copy dashboard” / “Publish dashboard” in the UI. It now uses `API_BASE_URL` from config.

### **Sample dashboards fallback (backend)**

- If the DataBrain dashboards API fails, the backend may return a small sample list so the app doesn’t break. You can change this to return an empty array or a strict error for production.

### **Console logging (backend)**

- `server.js` still has `console.log` / `console.warn` for startup and debugging. For production you can gate these with a `DEBUG` or `NODE_ENV` check.

---

## Summary

| Item                         | Action |
|-----------------------------|--------|
| Frontend API URL             | Centralized in `src/lib/config.ts`, env-driven |
| Backend PORT                 | 3002 in code and `backend/env.example` |
| clientId "Team" warning     | Removed |
| WidgetManager                | Removed (dead code, no backend) |
| DashboardActions             | Kept; optional, uses real APIs |
| Plugin base URL              | Default production; override via env |
