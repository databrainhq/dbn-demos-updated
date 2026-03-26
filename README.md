# Databrain Demo Templates (Internal)

> **Internal maintainer reference.** Customers clone individual repos, not this monorepo.

## Demo Catalog

| Folder | Public Repo | Framework | Tier | Key Features |
|--------|------------|-----------|------|-------------|
| `dbn-demo-react/` | `databrainhq/dbn-demo-react` | React + Vite + Express | Hero | 6-page showcase: dashboard, metric, theming, multi-tenant, AI chat, embed options, MCP runbooks |
| `dbn-demo-next-app-router/` | `databrainhq/dbn-demo-next-app-router` | Next.js 14 App Router | Starter | Server action token fetch, dashboard embed, theme toggle |
| `dbn-demo-next-page-router/` | `databrainhq/dbn-demo-next-page-router` | Next.js 14 Pages Router | Starter | getServerSideProps token, API route, dashboard embed |
| `dbn-demo-angular/` | `databrainhq/dbn-demo-angular` | Angular 15 | Starter | Service-based token, rich attribute bindings, server events |
| `dbn-demo-vue/` | `databrainhq/dbn-demo-vue` | Vue 3 + Vite | Starter | Composable, reactive theming, self-serve metric creation |
| `dbn-demo-svelte/` | `databrainhq/dbn-demo-svelte` | Svelte + Vite | Starter | Svelte stores, token management, dashboard embed |
| `dbn-demo-solid/` | `databrainhq/dbn-demo-solid` | Solid + Vite | Starter | createResource token fetch, signals-based embed |
| `dbn-demo-vanilla/` | `databrainhq/dbn-demo-vanilla` | Vanilla JS (CDN) | Starter | Zero bundler, unpkg CDN, createElement pattern, theme toggle |

## Feature Matrix

| Feature | React | Next AR | Next PR | Angular | Vue | Svelte | Solid | Vanilla |
|---------|-------|---------|---------|---------|-----|--------|-------|---------|
| `<dbn-dashboard>` | Y | Y | Y | Y | Y | Y | Y | Y |
| `<dbn-metric>` | Y | - | - | - | - | - | - | - |
| Guest token (backend) | Y | Y | Y | Y | Y | Y | Y | Y |
| Theme (`theme`/`theme-name`) | Y | Y | - | - | Y | - | - | Y |
| Multi-tenant (RLS/filters) | Y | - | - | - | - | - | - | - |
| Embed options panel | Y | - | - | Y | - | - | - | - |
| Dashboard/App filters | Y | - | - | - | - | - | - | - |
| AI Chat / Self-serve | Y | - | - | - | Y | - | - | - |
| i18n (`language`/`translations`) | Y | - | - | - | - | - | - | - |
| Server event handling | Y | - | - | Y | - | - | - | - |
| Embed functions (shadow DOM) | Y | - | - | Y | Y | - | - | - |
| MCP runbooks | Y | - | - | - | - | - | - | - |
| Server actions/SSR | - | Y | Y | - | - | - | - | - |

## Plugin Version

All demos use `@databrainhq/plugin@^0.16.34`. To update across all demos:

```bash
# Check latest version
npm view @databrainhq/plugin version

# Update all package.json files
for dir in dbn-demo-*/; do
  if [ -f "$dir/package.json" ]; then
    cd "$dir" && npm install @databrainhq/plugin@latest && cd ..
  fi
done
```

## Environment Variables

All demos use the same backend env pattern:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABRAIN_API_TOKEN` | Per-data-app API token (from Data App > API Token tab) | - |
| `DATA_APP_NAME` | Name of the data app in Databrain | - |
| `DATABRAIN_API_BASE_URL` | Databrain API endpoint | `https://api.usedatabrain.com` |
| `PORT` | Backend server port | `3002` |

> `DATABRAIN_SERVICE_TOKEN` (org-level) also works for backward compatibility. The MCP server uses service tokens; backends use per-app API tokens.

## Publishing / Mirroring

Each `dbn-demo-*` folder is mirrored to its own public GitHub repo. The official Databrain docs at [docs.usedatabrain.com/developer-docs/framework-specific-guide](https://docs.usedatabrain.com/developer-docs/framework-specific-guide) link directly to these repos.
