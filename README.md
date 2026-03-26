# Databrain Starter Templates

Official starter templates for embedding [Databrain](https://usedatabrain.com) dashboards and metrics into your application. Pick the template that matches your framework and get up and running in minutes.

## Choose Your Framework

| Template | Framework | What's Included |
|----------|-----------|-----------------|
| [dbn-demo-react](./dbn-demo-react) | React + Vite | Multi-page showcase: dashboard, metric cards, theming, multi-tenant, AI chat, self-serve analytics, i18n, embed options |
| [dbn-demo-next-app-router](./dbn-demo-next-app-router) | Next.js (App Router) | API route, dashboard, metrics, theming, multi-tenant, i18n, embed options & functions |
| [dbn-demo-next-page-router](./dbn-demo-next-page-router) | Next.js (Pages Router) | API route, dashboard, metrics, theming, multi-tenant, i18n, embed options & functions |
| [dbn-demo-angular](./dbn-demo-angular) | Angular 15 | Dashboard, metrics, theming, multi-tenant, i18n, embed options & functions |
| [dbn-demo-vue](./dbn-demo-vue) | Vue 3 + Vite | Dashboard, metrics, theming, multi-tenant, i18n, embed options & functions |
| [dbn-demo-svelte](./dbn-demo-svelte) | Svelte + Vite | Dashboard, metrics, theming, multi-tenant, i18n, embed options & functions |
| [dbn-demo-solid](./dbn-demo-solid) | Solid + Vite | Dashboard, metrics, theming, multi-tenant, i18n, embed options & functions |
| [dbn-demo-vanilla](./dbn-demo-vanilla) | Vanilla JS (CDN) | Zero bundler, dashboard, metrics, theming, multi-tenant, i18n, embed options & functions |

**Not sure which to pick?** Start with **React** for the most complete multi-page reference app, or choose the template matching your existing stack — all templates include the same core features.

## Quick Start

Every template follows the same three steps:

```bash
cd dbn-demo-react        # or any template folder
npm run setup            # installs dependencies, creates .env from template
# Edit .env files with your Databrain credentials (see below)
npm run dev              # starts the app
```

## What You'll Need

You'll find these values in your [Databrain dashboard](https://app.usedatabrain.com):

| Variable | Where to find it |
|----------|-----------------|
| `DATABRAIN_API_TOKEN` | Data App > API Token tab |
| `DATA_APP_NAME` | The name of your data app |
| `Dashboard Embed ID` | Data App > Embeds tab |

Each template's README has the exact env variables and setup steps for that framework.

## Feature Comparison

Every template includes the full Databrain feature set. The React template uses a multi-page layout; all others demonstrate features on a single page with a toolbar.

| Feature | React | Next.js App | Next.js Pages | Angular | Vue | Svelte | Solid | Vanilla |
|---------|:-----:|:-----------:|:-------------:|:-------:|:---:|:------:|:-----:|:-------:|
| Dashboard embed | Y | Y | Y | Y | Y | Y | Y | Y |
| Metric cards | Y | Y | Y | Y | Y | Y | Y | Y |
| Theming | Y | Y | Y | Y | Y | Y | Y | Y |
| Multi-tenant (clientId) | Y | Y | Y | Y | Y | Y | Y | Y |
| Embed options (CSV, etc.) | Y | Y | Y | Y | Y | Y | Y | Y |
| i18n (language selector) | Y | Y | Y | Y | Y | Y | Y | Y |
| Server event handling | Y | Y | Y | Y | Y | Y | Y | Y |
| Embed functions | Y | Y | Y | Y | Y | Y | Y | Y |
| Dashboard filters | Y | Y | Y | Y | Y | Y | Y | Y |
| AI Chat / Self-serve | Y | | | | | | | |
| Server-side rendering | | Y | Y | | | | | |

## Documentation

- [Databrain Developer Docs](https://docs.usedatabrain.com)
- [Framework-Specific Guides](https://docs.usedatabrain.com/developer-docs/framework-specific-guide)
- [Guest Token API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token)
- [Component Options Reference](https://docs.usedatabrain.com/developer-docs/helpers/component-options-reference)
- [Theming Guide](https://docs.usedatabrain.com/developer-docs/helpers/theming)

## Need Help?

- Check the README inside each template for framework-specific instructions
- Visit [docs.usedatabrain.com](https://docs.usedatabrain.com) for full documentation
- Reach out to us at [support@usedatabrain.com](mailto:support@usedatabrain.com)
