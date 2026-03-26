# Databrain + Solid Demo

Embed a Databrain dashboard in a SolidJS + Vite app using `createResource` for reactive data fetching.

## Features

- Guest token fetched via `createResource` from Express backend
- Signals-based state management
- Setup/error states with helpful prompts

## Quick Start

```bash
git clone https://github.com/databrainhq/dbn-demo-solid.git
cd dbn-demo-solid
npm run setup    # Installs deps, copies .env files
# Edit backend/.env → set DATABRAIN_API_TOKEN and DATA_APP_NAME
# Edit .env → set VITE_DASHBOARD_ID
npm run dev      # Starts backend + frontend — http://localhost:3000
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

## How It Works

1. `backend/server.js` — Express API that generates guest tokens
2. `src/App.tsx` — SolidJS component using `createResource` for reactive token fetching and `Show` for conditional rendering

## Links

- [Databrain Docs](https://docs.usedatabrain.com)
- [SolidJS Framework Guide](https://docs.usedatabrain.com/developer-docs/framework-specific-guide)
