# Databrain + Angular Demo

Embed a Databrain dashboard in an Angular 15 app with an Express backend for secure guest token generation.

## Features

- Guest token fetched from Express backend
- Rich attribute bindings (options, boolean attributes)
- Embed functions via shadow DOM (Create Metric, Manage Metrics)
- `TOKEN_EXPIRED` server event handling
- Toggleable CSV download, email, and fullscreen options

## Quick Start

```bash
git clone https://github.com/databrainhq/dbn-demo-angular.git
cd dbn-demo-angular
npm run setup    # Installs deps, copies backend/.env.example → backend/.env
# Edit backend/.env → set DATABRAIN_API_TOKEN and DATA_APP_NAME
npm run dev      # Starts backend + frontend together
# Open http://localhost:4200?dashboardId=your-embed-id
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABRAIN_API_TOKEN` | Yes | Per-data-app API token |
| `DATA_APP_NAME` | Yes | Data app name in Databrain |
| `DATABRAIN_API_BASE_URL` | No | API endpoint (default: `https://api.usedatabrain.com`) |
| `PORT` | No | Backend port (default: `3002`) |

Dashboard ID is passed via URL query param: `?dashboardId=your-embed-id`

## How It Works

1. `backend/server.js` — Express API that generates guest tokens
2. `src/app/app.component.ts` — Angular component with inline template, fetches token, renders `<dbn-dashboard>` with attribute bindings

## Links

- [Databrain Docs](https://docs.usedatabrain.com)
- [Component Options Reference](https://docs.usedatabrain.com/developer-docs/helpers/component-options-reference)
