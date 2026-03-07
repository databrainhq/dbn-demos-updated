# DataBrain Embed Skeleton (MCP)

Bare React app that embeds a single DataBrain dashboard. **The skeleton app loads with no config** — no service token or .env required to run. When you want to show a dashboard, configure via the Databrain MCP server (set the service token in MCP settings and use the runbooks).

**Flow:** Run the app (it loads as-is) → when ready, add the Databrain MCP server, set the service token in MCP settings → use the runbooks to configure and embed a dashboard.

---

## Quick start

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd dbn-demo-react
   npm install && cd backend && npm install && cd ..
   ```

2. **Run (no config required)**

   ```bash
   cd backend && npm start   # Terminal 1 — API on port 3002
   npm run dev               # Terminal 2 — frontend (e.g. http://localhost:5173)
   ```

   The app loads and shows setup instructions. To see a dashboard:

3. **Configure via MCP**

   - Add the **Databrain MCP server** in your IDE (e.g. Cursor).
   - Set the service token in your **MCP server settings** (that’s the only credential).
   - Use [CUSTOMER_EMBED_LOGIC.md](CUSTOMER_EMBED_LOGIC.md) and [LLM_INSTRUCTIONS.md](LLM_INSTRUCTIONS.md) with the MCP server to configure embeds and get your dashboard ID.

---

## What’s included

- **Backend** (Node/Express): `GET /api/config/status`, `POST /api/dashboard-guest-token` (calls DataBrain when a token is configured).
- **Frontend** (React + Vite): one page that requests a guest token and renders a single `<dbn-dashboard>`. Loads with no config; shows a short “how to embed” message until you configure via MCP.

---

## Env (optional)

No .env or service token is required to load the app. When you want to embed a dashboard, set the service token in **MCP server settings**.

| Where | Purpose |
|--------|---------|
| **MCP server settings** | Set the service token when you want to embed a dashboard. |
| `backend/.env` | Optional: `PORT`, or `DATABRAIN_SERVICE_TOKEN` if your workflow writes it here. |
| Root `.env` | Optional: `VITE_API_URL`, `VITE_DEFAULT_DASHBOARD_ID`, etc. |

---

## Troubleshooting

- **Setup screen** — The app has loaded; no token required. To embed a dashboard, set the service token in your MCP server settings and use the runbooks.
- **"Service token is invalid or expired"** — Regenerate in DataBrain (Settings > Service Tokens) and update in your MCP server settings.
- **"Failed to connect to API"** — Start the backend (`cd backend && npm start`) and ensure the frontend points at it (default `http://localhost:3002`).
- **"Choose a dashboard"** — Set `VITE_DEFAULT_DASHBOARD_ID` in `.env` or let MCP configure the embed.

---

## Docs

- [CUSTOMER_EMBED_LOGIC.md](CUSTOMER_EMBED_LOGIC.md) — Runbook for embedding and customization (use with Databrain MCP).
- [LLM_INSTRUCTIONS.md](LLM_INSTRUCTIONS.md) — MCP tool chains and behavior.
- [DataBrain docs](https://docs.usedatabrain.com) — API reference, embedding guide, plugin.

---

## Project structure

```
dbn-demo-react/
├── src/
│   ├── App.tsx              # Single page: fetch token, render dbn-dashboard (or setup screen)
│   ├── lib/config.ts        # Reads VITE_* from .env (optional)
│   └── components/ui/       # Minimal UI (button, card) for setup/loading/errors
├── backend/
│   ├── server.js            # Guest-token + config/status; no token = setup response
│   └── env.example
├── .env.example
└── README.md
```

---

**DataBrain:** [docs](https://docs.usedatabrain.com) · [app](https://app.usedatabrain.com)
