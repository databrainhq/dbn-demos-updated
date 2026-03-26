# Databrain + Svelte Demo

Embed a Databrain dashboard in a Svelte + Vite app with secure backend token generation.

## Features

- Guest token fetched from Express backend
- Clean Svelte reactivity with onMount lifecycle
- Setup/error states with helpful prompts

## Quick Start

```bash
git clone https://github.com/databrainhq/dbn-demo-svelte.git
cd dbn-demo-svelte
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
- [Svelte Framework Guide](https://docs.usedatabrain.com/developer-docs/framework-specific-guide)
