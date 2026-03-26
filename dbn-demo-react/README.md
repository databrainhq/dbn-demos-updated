# Databrain React Demo — Hero Reference App

The most comprehensive Databrain embedding template. A multi-page React + Vite app with an Express backend showcasing every major Databrain capability: dashboard embedding, metric cards, theming, multi-tenant data isolation, AI chat, self-serve analytics, and MCP-driven setup.

## What This Demo Shows

- **Dashboard Embed** — `<dbn-dashboard>` with a full options panel (CSV export, fullscreen, i18n, chart settings, server events)
- **Metric Embed** — `<dbn-metric>` cards with configurable size, renderer, variant, and filters
- **Theming** — Live theme switcher using `theme` JSON, `theme-name` presets, and `chart-colors`
- **Multi-Tenant** — Client switcher with `clientId`, dashboard app filters, and RLS
- **AI Chat & Self-Serve** — Metric creation (drag-and-drop or chat), AI pilot, imperative embed functions via shadow DOM
- **MCP Runbooks** — Step-by-step tool chains for automated setup, branding, filters, i18n, and self-serve

## Quick Start

```bash
git clone https://github.com/databrainhq/dbn-demo-react.git
cd dbn-demo-react
npm run setup    # Installs deps, copies .env files
# Edit backend/.env → set DATABRAIN_API_TOKEN and DATA_APP_NAME
# Edit .env → set VITE_DEFAULT_DASHBOARD_ID to your embed ID
npm run dev      # Starts backend + frontend together
```

Open http://localhost:5173. The app works without credentials — each page shows explanatory content with code snippets. To see live embeds, configure the env files.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABRAIN_API_TOKEN` | Yes | Per-data-app API token from Data App > API Token |
| `DATA_APP_NAME` | Yes | Data app name in your Databrain workspace |
| `DATABRAIN_API_BASE_URL` | No | API endpoint (default: `https://api.usedatabrain.com`) |
| `PORT` | No | Backend port (default: `3002`) |

### Frontend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend URL (default: `http://localhost:3002`) |
| `VITE_DATABRAIN_PLUGIN_URL` | No | Plugin base URL (default: `https://api.usedatabrain.com`) |
| `VITE_DEFAULT_CLIENT_ID` | No | Default client ID for guest tokens (default: `default`) |
| `VITE_DEFAULT_DASHBOARD_ID` | Yes | Dashboard embed ID from your Data App |
| `VITE_DEFAULT_METRIC_ID` | No | Metric embed ID (for the Metric page) |

## Project Structure

```
dbn-demo-react/
├── src/
│   ├── App.tsx                 # Router with 6 pages + server event handler
│   ├── pages/
│   │   ├── HomePage.tsx        # Feature catalog + MCP setup guide
│   │   ├── DashboardPage.tsx   # Dashboard embed + options panel + i18n
│   │   ├── MetricPage.tsx      # <dbn-metric> with size/renderer/variant controls
│   │   ├── ThemingPage.tsx     # theme JSON, theme-name, chart-colors
│   │   ├── MultiTenantPage.tsx # Client switcher, dashboard app filters, RLS
│   │   └── SelfServePage.tsx   # AI pilot, metric creation, embed functions
│   ├── lib/
│   │   ├── config.ts           # Reads VITE_* from .env
│   │   └── use-guest-token.ts  # Shared hook for token fetching
│   └── components/ui/          # shadcn/ui primitives
├── backend/
│   ├── server.js               # 4 routes: guest-token, dashboards, provision, status
│   ├── package.json
│   └── .env.example
├── .env.example
├── GUIDES.md                   # MCP cookbook and feature guides
├── LLM_INSTRUCTIONS.md         # MCP agent playbook
└── docs/API.md                 # Backend API reference
```

## Backend API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/config/status` | Health check — shows if API token is configured |
| `POST` | `/api/guest-token` | Generate a guest token (accepts permissions, params, expiryTime) |
| `POST` | `/api/dashboards` | List datamarts for the configured data app |
| `POST` | `/api/provision-dashboard` | Create a per-client dashboard (multi-tenant provisioning) |

See [`docs/API.md`](docs/API.md) for full request/response schemas.

## MCP Setup

Add the **Databrain MCP server** in your IDE and set the service token. Then use:

- [`CUSTOMER_EMBED_LOGIC.md`](CUSTOMER_EMBED_LOGIC.md) — Zero-to-embed runbook
- [`LLM_INSTRUCTIONS.md`](LLM_INSTRUCTIONS.md) — Agent playbook for MCP tool chains
- [`GUIDES.md`](GUIDES.md) — Feature-by-feature cookbook

## Links

- [Databrain Docs](https://docs.usedatabrain.com)
- [Production Embedding Guide](https://docs.usedatabrain.com/developer-docs/embedding-setup/step-by-step-guide)
- [Component Options Reference](https://docs.usedatabrain.com/developer-docs/helpers/component-options-reference)
- [Guest Token API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token)
- [Databrain App](https://app.usedatabrain.com)
