# React Dashboard — Tutorial Starter (from scratch)

The companion repo for [**React Dashboard: The Complete 2026 Guide**](https://www.usedatabrain.com/how-to/create-react-dashboard).

This is the finished code the tutorial builds, wired into a runnable app. No backend required — a Vite middleware serves mock dashboard metrics so `npm install && npm run dev` gets you a working dashboard on `localhost:5173`.

**This starter is vendor-neutral.** It does not use `@databrainhq/plugin` or any Databrain APIs. For a pre-built embedded analytics integration, see the sibling [`dbn-demo-react`](../dbn-demo-react/) folder.

## Stack

- **Vite 6** (bundler)
- **React 19** with the React Compiler
- **TypeScript 5.7**
- **shadcn/ui** component primitives (`Card`, `Button`, `Skeleton`)
- **Tailwind CSS 4**
- **TanStack Query 5** for server state
- **Zustand 5** for client state
- **Recharts 2** for charts

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you should see the dashboard with 4 KPI cards and a revenue line chart.

```bash
npm run build    # type-check + production bundle
npm run preview  # serve the production build
npm run lint     # lint src/
```

## Project layout

```
react-tutorial-scratch/
├── index.html                    # Vite entry
├── mock-api.ts                   # Vite middleware serving /api/*
├── vite.config.ts                # React plugin + mock-api plugin + @/ alias
├── src/
│   ├── main.tsx                  # QueryClientProvider root
│   ├── App.tsx                   # DashboardLayout + MetricCards + RevenueChart
│   ├── index.css                 # Tailwind + CSS variables
│   ├── lib/
│   │   └── utils.ts              # cn() helper
│   ├── components/
│   │   ├── DashboardLayout.tsx   # Sidebar + header + main grid (tutorial step 3)
│   │   ├── MetricCards.tsx       # 4 KPI cards (tutorial step 4)
│   │   ├── RevenueChart.tsx      # Recharts line chart (tutorial step 5)
│   │   ├── PermissionGate.tsx    # RBAC gate (tutorial step 6)
│   │   └── ui/                   # shadcn/ui primitives
│   │       ├── card.tsx
│   │       ├── button.tsx
│   │       └── skeleton.tsx
│   └── hooks/
│       ├── useDashboardData.ts   # TanStack Query fetcher (tutorial step 4)
│       ├── useAuth.ts            # Zustand auth store (tutorial step 6)
│       └── useRealtimeMetrics.ts # WebSocket cache updater (tutorial step 8)
└── tsconfig*.json, postcss.config.js, components.json
```

## Mapping to the tutorial

Each numbered step in the guide corresponds to a file (or a few) in this repo:

| Tutorial step | Files |
|---|---|
| 1. Set up Vite + React 19 + TypeScript | `package.json`, `vite.config.ts`, `tsconfig*.json` |
| 2. Install component library and data layer | `package.json` dependencies, `src/index.css`, `components.json` |
| 3. Build the dashboard layout | `src/components/DashboardLayout.tsx`, `src/components/ui/button.tsx` |
| 4. Fetch data with TanStack Query | `src/hooks/useDashboardData.ts`, `src/components/MetricCards.tsx` |
| 5. Add charts with Recharts | `src/components/RevenueChart.tsx` |
| 6. Authentication and RBAC | `src/hooks/useAuth.ts`, `src/components/PermissionGate.tsx` |
| 7. Performance optimization | `src/main.tsx` (query config), `vite.config.ts` (code splitting is opt-in — see below) |
| 8. Real-time data updates | `src/hooks/useRealtimeMetrics.ts` (opt-in — needs a WebSocket endpoint) |
| 9. Putting it all together | `src/App.tsx`, `src/main.tsx` |

## Mock API

The `/api/dashboard/metrics` and `/api/auth/login` endpoints are served by Vite middleware (`mock-api.ts`) during dev. Metrics fluctuate slightly on each request to simulate live data. There is no persistence — `npm run build` / `npm run preview` drops the mock layer.

When you replace the mock with a real backend, swap the `fetchDashboardMetrics` URL in `src/hooks/useDashboardData.ts` and delete `mock-api.ts` + its import in `vite.config.ts`.

## Next steps

- **Route-level code splitting (step 7 of the tutorial):** wrap each page with `React.lazy(() => import(...))` inside a `Suspense` boundary. A small `src/pages/` scaffold is left to you — it's two lines of change per page.
- **Real-time data:** point `useRealtimeMetrics('wss://...')` at a WebSocket endpoint and mount it once at the top level.
- **Deploy:** the production bundle is a static site — deploy `dist/` to Netlify, Vercel, Cloudflare Pages, or any static host.

## License

MIT.
