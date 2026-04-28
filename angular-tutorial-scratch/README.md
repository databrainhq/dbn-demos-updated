# Angular Dashboard — Tutorial Starter (from scratch)

The companion repo for [**Angular Dashboard: The Complete 2026 Guide**](https://www.usedatabrain.com/blog/angular-dashboard).

This is the finished code the tutorial builds, wired into a runnable app. No backend required — a tiny Express mock server runs alongside `ng serve` so `npm install && npm start` gets you a working dashboard on `localhost:4200`.

**This starter is vendor-neutral.** It does not use `@databrainhq/plugin` or any Databrain APIs. For a pre-built embedded analytics integration, see the sibling [`dbn-demo-angular`](../dbn-demo-angular/) folder.

The React equivalent of this repo is [`react-tutorial-scratch`](../react-tutorial-scratch/) — same nine-step shape, just translated to idiomatic Angular.

## Stack

- **Angular 19** with standalone components and Signals
- **TypeScript 5.6**
- **Angular Material 19** for UI primitives
- **ng2-charts 7** + **Chart.js 4** for the revenue chart
- **@ngrx/signals** SignalStore for client state (auth)
- **HttpClient + Signals** for server state (dashboard metrics)
- **Express 5** for the mock API (replaces React's Vite middleware)

## Quick start

```bash
npm install
npm start
```

`npm start` runs two processes in parallel via `concurrently`:

- **`ng serve`** on `http://localhost:4200` (the Angular dev server, with `proxy.conf.json` forwarding `/api/*` to the mock backend)
- **`node mock-api.mjs`** on `http://localhost:5174` (Express mock API)

Open [http://localhost:4200](http://localhost:4200) — you should see the dashboard with 4 KPI cards and a revenue line chart, with a sidenav linking to a lazy-loaded Analytics route.

```bash
npm run build      # production bundle
npm run watch      # dev build with watch
npm run lint       # ng lint
npm run analyze    # source-map-explorer the production bundle
```

## Project layout

```
angular-tutorial-scratch/
├── angular.json                    # CLI workspace + production budgets
├── proxy.conf.json                 # /api/* → http://localhost:5174
├── mock-api.mjs                    # Express mock for /api/* (no DB)
├── package.json                    # `npm start` runs web + api in parallel
├── tsconfig*.json                  # strict TS + path aliases
├── src/
│   ├── main.ts                     # bootstrapApplication
│   ├── index.html                  # base HTML + Inter / Material Icons
│   ├── styles.css                  # tokens; Material theme handles the rest
│   └── app/
│       ├── app.config.ts           # provideRouter / provideHttpClient / provideAnimationsAsync
│       ├── app.routes.ts           # lazy loadComponent + canActivate guard
│       ├── app.component.ts        # shell that hosts the layout + <router-outlet>
│       ├── layout/
│       │   └── dashboard-layout.component.ts   # sidenav + toolbar (tutorial step 3)
│       ├── features/
│       │   ├── overview/
│       │   │   ├── overview.page.ts            # Overview composition + polling lifecycle
│       │   │   ├── metric-cards.component.ts   # 4 KPI cards (tutorial step 4)
│       │   │   └── revenue-chart.component.ts  # ng2-charts line chart (tutorial step 5)
│       │   └── analytics/
│       │       └── analytics.page.ts           # lazy route + @defer demo (step 7)
│       └── core/
│           ├── dashboard.service.ts            # HttpClient + signal cache (step 4)
│           ├── auth.store.ts                   # @ngrx/signals SignalStore (step 6)
│           ├── auth.guard.ts                   # canActivate role check (step 6)
│           ├── permission.directive.ts         # *appPermission="['admin']" (step 6)
│           └── realtime-metrics.service.ts     # WebSocket → signal cache (step 8, opt-in)
└── .editorconfig, .gitignore
```

## Mapping to the tutorial

Each numbered step in the guide corresponds to a file (or a few) in this repo. The filenames intentionally line up 1:1 with `react-tutorial-scratch/` so you can read both starters side-by-side.

| Tutorial step | Files | React sibling |
|---|---|---|
| 1. Set up Angular 19 + standalone + strict TS | `package.json`, `angular.json`, `tsconfig*.json`, `src/main.ts` | `vite.config.ts`, `tsconfig*.json`, `src/main.tsx` |
| 2. Install Material + ng2-charts + state libs | `package.json` deps, `src/styles.css`, `app.config.ts` | `package.json`, `src/index.css`, `components.json` |
| 3. Build the dashboard layout | `src/app/layout/dashboard-layout.component.ts` | `src/components/DashboardLayout.tsx` |
| 4. Fetch data with HttpClient + signals | `src/app/core/dashboard.service.ts`, `src/app/features/overview/metric-cards.component.ts` | `src/hooks/useDashboardData.ts`, `src/components/MetricCards.tsx` |
| 5. Add charts with ng2-charts | `src/app/features/overview/revenue-chart.component.ts` | `src/components/RevenueChart.tsx` |
| 6. Auth + RBAC | `src/app/core/auth.store.ts`, `src/app/core/auth.guard.ts`, `src/app/core/permission.directive.ts` | `src/hooks/useAuth.ts`, `src/components/PermissionGate.tsx` |
| 7. Performance: lazy routes + `@defer` + OnPush | `src/app/app.routes.ts` (`loadComponent`), `src/app/features/analytics/analytics.page.ts` (`@defer`) | `src/main.tsx`, route-level `React.lazy` (opt-in) |
| 8. Real-time WebSocket updates | `src/app/core/realtime-metrics.service.ts` (opt-in — needs a WebSocket endpoint) | `src/hooks/useRealtimeMetrics.ts` |
| 9. Putting it all together | `src/app/app.component.ts`, `src/app/app.routes.ts`, `src/app/features/overview/overview.page.ts` | `src/App.tsx`, `src/main.tsx` |

## Architectural notes

A few places where the Angular idiom genuinely diverges from the React one — worth flagging if you're reading both:

- **State.** TanStack Query → `DashboardService` (a Signal-backed cache with `staleTime`/`refetchInterval` semantics implemented by hand). Zustand → `@ngrx/signals` SignalStore. The shape (single source of truth, components subscribe by reading the signal) is the same; only the libraries differ.
- **Mock backend.** Vite has middleware as a first-class concept, so the React starter inlines `mock-api.ts` inside the Vite plugin pipeline. Angular's `ng serve` doesn't, so we run an Express server on :5174 and proxy `/api/*` to it via `proxy.conf.json`. Net effect from the dev's perspective is identical: `npm start`, no backend to stand up.
- **Lazy-loading.** React uses `React.lazy()` + `<Suspense>`. Angular uses `loadComponent` at the router level *and* `@defer` blocks at the template level. The Analytics route uses both — `loadComponent` lazy-loads the page, then `@defer (on viewport)` lazy-loads the chart bundle inside it.
- **Change detection.** Every component sets `changeDetection: OnPush` (the React Compiler does this implicitly in the React starter). With Signals, `OnPush` is essentially "always correct" — no manual `markForCheck()` needed.

## Mock API

The `/api/dashboard/metrics` endpoint returns slightly fluctuating revenue/user numbers (so the dashboard feels live), and `/api/auth/login` returns a fake `admin`-role JWT used by the Analytics route guard.

When you replace the mock with a real backend:

1. Change the proxy target in `proxy.conf.json` (or remove the proxy and configure CORS).
2. Delete `mock-api.mjs` and the `dev:api` script in `package.json`.
3. Update the `npm start` script back to plain `ng serve`.

## Production / SSR

- `npm run build` produces a static SPA bundle in `dist/angular-tutorial-scratch/browser/` deployable to any static host (Netlify, Cloudflare Pages, S3 + CloudFront).
- For SSR, run `ng add @angular/ssr` to scaffold the server entry, then `npm run build` produces both browser and server bundles. Wire up `npm run start:ssr` or deploy to a Node host.

## License

MIT.
