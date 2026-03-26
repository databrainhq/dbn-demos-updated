# Databrain + Vue 3 Demo

Embed a Databrain dashboard in a Vue 3 + Vite app with reactive theming and self-serve metric creation.

## Features

- Guest token fetched from Express backend
- Reactive theme toggle (light/dark) via `theme` attribute
- Embed functions (Create Metric, Manage Metrics) via shadow DOM
- `TOKEN_EXPIRED` server event handling

## Quick Start

```bash
git clone https://github.com/databrainhq/dbn-demo-vue.git
cd dbn-demo-vue
npm run setup    # Installs deps, copies .env files
# Edit backend/.env → set DATABRAIN_API_TOKEN and DATA_APP_NAME
# Edit .env → set VITE_DASHBOARD_ID
npm run dev      # Starts backend + frontend — http://localhost:5173
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABRAIN_API_TOKEN` | Yes | Per-data-app API token |
| `DATA_APP_NAME` | Yes | Data app name in Databrain |
| `PORT` | No | Backend port (default: `3002`) |

### Frontend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_DASHBOARD_ID` | Yes | Dashboard embed ID |

## Links

- [Databrain Docs](https://docs.usedatabrain.com)
- [Vue Framework Guide](https://docs.usedatabrain.com/developer-docs/framework-specific-guide)
