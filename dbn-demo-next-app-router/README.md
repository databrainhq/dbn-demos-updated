# Databrain + Next.js (App Router) Demo

Embed a Databrain dashboard in a Next.js 14 App Router project with built-in API routes for secure guest token generation and a theme toggle.

## Features

- Server-side guest token via `app/api/guest-token/route.ts`
- Theme toggle (light/dark) using the `theme` component attribute
- `TOKEN_EXPIRED` server event handling
- Setup/error states with helpful configuration prompts

## Quick Start

```bash
git clone https://github.com/databrainhq/dbn-demo-next-app-router.git
cd dbn-demo-next-app-router
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

1. `app/api/guest-token/route.ts` — Server-side API route that calls `POST /api/v2/guest-token/create`
2. `app/page.tsx` — Client component that fetches the token and renders `<dbn-dashboard>`
3. Theme presets are applied via the `theme` JSON attribute

## Links

- [Databrain Docs](https://docs.usedatabrain.com)
- [Next.js Framework Guide](https://docs.usedatabrain.com/developer-docs/framework-specific-guide)
- [Guest Token API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token)
