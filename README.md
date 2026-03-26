# Databrain Starter Templates

Official starter templates for embedding [Databrain](https://usedatabrain.com) dashboards and metrics into your application. Pick the template that matches your framework and get up and running in minutes.

## Choose Your Framework

| Template | Framework | What's Included |
|----------|-----------|-----------------|
| [dbn-demo-react](./dbn-demo-react) | React + Vite | Full showcase: dashboard, metric cards, theming, multi-tenant, AI chat, self-serve analytics, i18n, embed options |
| [dbn-demo-next-app-router](./dbn-demo-next-app-router) | Next.js (App Router) | API route for token generation, dashboard embed, theme toggle |
| [dbn-demo-next-page-router](./dbn-demo-next-page-router) | Next.js (Pages Router) | API route for token generation, dashboard embed |
| [dbn-demo-angular](./dbn-demo-angular) | Angular 15 | Attribute bindings, embed functions, server event handling |
| [dbn-demo-vue](./dbn-demo-vue) | Vue 3 + Vite | Reactive theming, self-serve metric creation, composables |
| [dbn-demo-svelte](./dbn-demo-svelte) | Svelte + Vite | Store-based token management, dashboard embed |
| [dbn-demo-solid](./dbn-demo-solid) | Solid + Vite | Signal-based reactivity, createResource token fetch |
| [dbn-demo-vanilla](./dbn-demo-vanilla) | Vanilla JS (CDN) | Zero bundler, script tag setup, theme toggle |

**Not sure which to pick?** Start with **React** for the most complete example, or choose the template matching your existing stack.

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

| Feature | React | Next.js App | Next.js Pages | Angular | Vue | Svelte | Solid | Vanilla |
|---------|:-----:|:-----------:|:-------------:|:-------:|:---:|:------:|:-----:|:-------:|
| Dashboard embed | Y | Y | Y | Y | Y | Y | Y | Y |
| Metric cards | Y | | | | | | | |
| Theming | Y | Y | | | Y | | | Y |
| Multi-tenant (RLS) | Y | | | | | | | |
| Embed options panel | Y | | | Y | | | | |
| Dashboard filters | Y | | | | | | | |
| AI Chat / Self-serve | Y | | | | Y | | | |
| i18n | Y | | | | | | | |
| Server event handling | Y | | | Y | | | | |
| Embed functions | Y | | | Y | Y | | | |
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
