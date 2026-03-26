# Databrain + Next.js (Pages Router) Demo

Embed a Databrain dashboard in a Next.js Pages Router project with API route for secure guest token generation.

## Features

- Server-side guest token via `pages/api/guest-token.ts`
- Dynamic web component import (SSR-safe)
- `TOKEN_EXPIRED` server event handling
- Setup/error states with helpful configuration prompts

## Quick Start

```bash
git clone https://github.com/databrainhq/dbn-demo-next-page-router.git
cd dbn-demo-next-page-router
npm run setup    # Installs deps, copies .env.example → .env.local
# Edit .env.local → set DATABRAIN_API_TOKEN, DATA_APP_NAME, NEXT_PUBLIC_DASHBOARD_ID
npm run dev      # http://localhost:3000
```

## Environment Variables (`.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABRAIN_API_TOKEN` | Yes | Per-data-app API token |
| `DATA_APP_NAME` | Yes | Data app name in Databrain |
| `DATABRAIN_API_BASE_URL` | No | API endpoint (default: `https://api.usedatabrain.com`) |
| `NEXT_PUBLIC_DASHBOARD_ID` | Yes | Dashboard embed ID |
| `NEXT_PUBLIC_CLIENT_ID` | No | Client ID for guest tokens (default: `default`) |

## How It Works

1. `pages/api/guest-token.ts` — API route that calls `POST /api/v2/guest-token/create`
2. `pages/index.tsx` — Client page that dynamically imports the plugin and renders `<dbn-dashboard>`

## Links

- [Databrain Docs](https://docs.usedatabrain.com)
- [Next.js Framework Guide](https://docs.usedatabrain.com/developer-docs/framework-specific-guide)
- [Guest Token API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token)
