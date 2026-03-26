# Databrain + Vanilla JS Demo

Embed a Databrain dashboard with zero frameworks — just HTML, vanilla JavaScript, and the Databrain plugin loaded from unpkg CDN.

## Features

- Zero bundler required (CDN-loaded plugin)
- Theme toggle (light/dark/default) via CSS theme switching
- `TOKEN_EXPIRED` server event handling
- `createElement` pattern for programmatic dashboard creation

## Quick Start

```bash
git clone https://github.com/databrainhq/dbn-demo-vanilla.git
cd dbn-demo-vanilla
npm run setup    # Installs deps, copies backend/.env
# Edit backend/.env → set DATABRAIN_API_TOKEN and DATA_APP_NAME
# Edit src/main.js → set DASHBOARD_ID
npm run dev      # Starts backend + frontend — http://localhost:5173
```

## Configuration

| Where | Variable | Description |
|-------|----------|-------------|
| `backend/.env` | `DATABRAIN_API_TOKEN` | Per-data-app API token |
| `backend/.env` | `DATA_APP_NAME` | Data app name in Databrain |
| `src/main.js` | `DASHBOARD_ID` | Dashboard embed ID |

## How It Works

1. `index.html` — Loads plugin from `unpkg.com/@databrainhq/plugin`, includes header with theme selector
2. `src/main.js` — Fetches guest token, creates `<dbn-dashboard>` element, handles theme switching
3. `backend/server.js` — Express API for guest token generation

## Links

- [Databrain Docs](https://docs.usedatabrain.com)
- [Web Component Quick Start](https://docs.usedatabrain.com/guides/web-components/quick-start)
