# Skeleton Option: Minimal Embed-Only App

**This repo is now the skeleton.** It contains only the bare React app and backend APIs needed to embed a single DataBrain dashboard (guest-token + one `<dbn-dashboard>`). The notes below describe what was kept and what was removed.

## What to keep (minimal)

- **Frontend**
  - `src/App.tsx` — Simplify to a single view: one `<dbn-dashboard>` and one guest-token fetch. Remove sidebar nav for Reports, Ask AI, Create Dashboard, Settings; remove tenant/user switchers if you don’t need them.
  - `src/main.tsx`, `src/index.css`, Vite config, and the DataBrain plugin / web component setup.
  - One or two layout components if you keep a minimal shell (e.g. header + embed container).
- **Backend**
  - `backend/server.js` — Keep only: `POST /api/dashboard-guest-token` (or `POST /api/guest-token`), static/env config, and CORS. Remove routes for metric-data, metric-csv, ai-pilot, create-dashboard, embed list, etc., if you don’t need them.
  - `backend/.env` with `DATABRAIN_API_KEY` and `DATABRAIN_DATA_APP_NAME`.

## What you can remove or stub (for skeleton)

- **Frontend:** Reports page, Ask AI panel, Create Dashboard flow, DashboardSelector (if you hardcode one dashboard), TenantSwitcher, UserSwitcher, Settings, metric data modal, and any components used only by those flows.
- **Backend:** Routes such as `/api/metric-data`, `/api/metric-csv`, `/api/ai-pilot`, `/api/v2/create-dashboard`, `/api/v2/embed/list`, `/api/v2/dashboard-metrics`, etc., unless you plan to add those features later.

## Still use MCP + runbooks

Even for a skeleton, use **CUSTOMER_EMBED_LOGIC.md** and the **Databrain MCP server** to get your `embedId`, `dashboardId`, and env vars. Then point your minimal app at that single embed.

## Recommendation

Start from the **full template**; remove or hide features only when you know you don’t need them. The full app is the reference for patterns (guest token, multi-tenant, Reports, Ask AI, metric export).
