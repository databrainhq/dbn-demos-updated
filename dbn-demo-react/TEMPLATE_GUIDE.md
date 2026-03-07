# DataBrain Customer Template — Setup Guide

**Goal:** You download this repo → connect to the **Databrain MCP server** → embed DataBrain dashboards → add advanced functionality (Reports, Ask AI, metric data, CSV export, Create Dashboard).

This guide walks you through that flow. The MCP server + runbooks in this repo get you from zero to a working embed and env config; the app already includes the advanced features—you just wire it to your DataBrain workspace.

---

## What You Get

| Option | What it is | Best for |
|--------|------------|----------|
| **Full template** (this repo) | Working app with dashboard embed, Reports, Ask AI, metric data/CSV export, Create Dashboard, multi-tenant UI | Customers who want a reference implementation and to try all features before customizing |
| **Skeleton** | Minimal app (embed + guest token only) | Customers who want the smallest starting point; see [Skeleton option](#skeleton-option) below |

**Recommendation:** Start with the **full template**. Run it, try Reports, Ask AI, and metric export. Then remove or simplify the parts you don’t need. Use the MCP server + runbooks for one-off setup and customization (themes, filters, i18n, etc.).

---

## Customer flow (download → MCP → embed → advanced)

### Step 1: Download

```bash
git clone <this-repo-url>
cd dbn-demo-react
npm install
cd backend && npm install && cd ..
```

### Step 2: Connect to the Databrain MCP server

1. **Add the Databrain MCP server** in your IDE (e.g. Cursor). Configure it with your DataBrain service token or API token as required by the MCP server.
2. **Open the runbooks** in this repo and run them with the MCP server:
   - **[CUSTOMER_EMBED_LOGIC.md](./CUSTOMER_EMBED_LOGIC.md)** — Zero-to-embed: discover data app → choose embed → ensure token → validate → get env vars. Also covers customization (theming, filters, i18n, AI Pilot).
   - **[LLM_INSTRUCTIONS.md](./LLM_INSTRUCTIONS.md)** — How to chain MCP tools and handle errors.

Start with `setup_embed_interactive` (step `"discover"`). The orchestrator returns the IDs and env values you need.

### Step 3: Embed dashboards and env

1. Copy the env block from the runbook (or MCP output) into:
   - `backend/.env` — from `backend/env.example` (e.g. `DATABRAIN_API_KEY`, `DATABRAIN_DATA_APP_NAME`, `DATABRAIN_TEMPLATE_DASHBOARD_ID`, etc.).
   - Root `.env` — from `.env.example` (e.g. `VITE_API_URL`, `VITE_DATABRAIN_PLUGIN_URL`, `VITE_DEFAULT_DASHBOARD_ID`, etc.).
2. Run the app (Step 4). The app will embed your DataBrain dashboards and expose advanced features.

### Step 4: Run the app and use advanced functionality

```bash
# Terminal 1 — backend
cd backend && npm start

# Terminal 2 — frontend (from repo root)
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`). You get:

- **Embedded dashboards** — DataBrain component with guest token from your backend.
- **Reports** — List metrics, view metric data, export CSV.
- **Ask AI** — AI Pilot (if enabled on your embed).
- **Create Dashboard** — Create new dashboards from the UI.

Customize or remove any of these as needed; the runbooks and MCP server can also help with theming, filters, and i18n.

---

## What’s in This Repo

- **Frontend (React + Vite)**  
  - Dashboard embed (DataBrain web component)  
  - Reports (metric list, view data, export CSV)  
  - Ask AI (AI Pilot)  
  - Create Dashboard, tenant/user switchers, Settings  

- **Backend (Node/Express)**  
  - Guest token generation  
  - Metric data query and CSV export  
  - AI Pilot proxy  
  - Embed/dashboard list and create  

- **Docs and runbooks**  
  - **CUSTOMER_EMBED_LOGIC.md** — Embed setup and customization (for use with MCP).  
  - **LLM_INSTRUCTIONS.md** — MCP tool chains and behavior (for you or an LLM).  
  - **MCP_AND_ADVANCED_FEATURES.md** — How backend routes map to MCP/DataBrain APIs.  
  - **README.md**, **CONFIGURATION.md**, **QUICK_START.md** — General setup and usage.

---

## Skeleton Option

If you want a **minimal app** (only embed + guest token):

1. Keep: `src/App.tsx` (simplified to one dashboard view), guest token fetch, `backend` (only guest-token and env).
2. Remove or stub: Reports, Ask AI, Create Dashboard, tenant switcher, metric data/CSV endpoints you don’t need.
3. Use **CUSTOMER_EMBED_LOGIC.md** and the MCP server to get `embedId`, `dashboardId`, and env vars; then point the minimal app at that embed.

You can also keep the full template and hide nav items or routes until you need them.

---

## Giving This to Customers: Checklist

When you hand this repo to a customer:

- [ ] They have (or create) a DataBrain account and a Data App.
- [ ] They clone this repo and set `DATABRAIN_API_KEY` and `DATABRAIN_DATA_APP_NAME` in `backend/.env`.
- [ ] They run backend + frontend and see the embedded dashboard (and optionally Reports, Ask AI, etc.).
- [ ] **Optional:** They add the Databrain MCP server in their IDE and use **CUSTOMER_EMBED_LOGIC.md** + **LLM_INSTRUCTIONS.md** for setup and customization (themes, filters, i18n, AI Pilot).

So: **give them the full template + MCP access + these prompts/runbooks.** The “skeleton” is an optional path you document (e.g. in this guide), not a separate repo they must use.

---

## Summary

**Goal for customers:** Download this repo → connect to the Databrain MCP server → embed DataBrain dashboards → add advanced functionality.

| Question | Answer |
|----------|--------|
| Skeleton only or full app? | **Full template** as default; skeleton option is documented for minimal embed-only. |
| MCP? | **Yes** — customers connect the Databrain MCP server in their IDE for setup and customization. |
| Runbooks? | **Yes** — **CUSTOMER_EMBED_LOGIC.md** and **LLM_INSTRUCTIONS.md** are the canonical runbooks to use with MCP. |
| Where to start? | Download → connect MCP → run runbooks to get env values → set `.env` → run app → use embedded dashboards and advanced features. |
