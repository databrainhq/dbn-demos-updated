# Databrain MCP and Advanced App Features

This app uses **Databrain’s MCP server** for setup and customization (from Cursor/IDE) and **backend routes** that mirror the MCP tool behavior so the React app can offer the same capabilities at runtime.

## MCP server (Cursor / IDE)

- **When to use:** Initial embed setup, theme/customization, listing apps/embeds/dashboards, generating guest tokens, configuring filters/i18n, AI Pilot setup.
- **Docs in this repo:**
  - `CUSTOMER_EMBED_LOGIC.md` — Zero-to-embed runbook and customization (theming, chart appearance, options, filters, i18n, AI Pilot).
  - `LLM_INSTRUCTIONS.md` — How to chain MCP tools, handle choices, and recover from errors.

**Entry point:** Use the `setup_embed_interactive` MCP tool with `step: "discover"` and pass the returned `state` through the flow until `complete`. Then set env vars and optional customization (e.g. `apply_embed_preset`, `customize_embed_theme`, `configure_embed_options`, `configure_filters`, `configure_internationalization`).

## Backend routes (advanced features in the app)

These endpoints call the Databrain API with the same parameters as the MCP tools so the UI can offer:

| Feature        | Backend route        | MCP tool / API              | Frontend usage                    |
|----------------|----------------------|-----------------------------|-----------------------------------|
| **Ask AI Pilot** | `POST /api/ai-pilot` | `ask_ai_pilot`              | **Ask AI** in sidebar → question → answer |
| **Metric data**  | `POST /api/metric-data` | `query_metric_data` / `POST /api/v2/dataApp/query` | **Reports** → select metric → “View data” |
| **Metric CSV**   | `POST /api/metric-csv`  | `download_metric_csv`       | **Reports** → select metric → “Export CSV” |
| **Dashboard metrics** | `POST /api/v2/dashboard-metrics` | (list metrics for embed) | **Reports** page metric list      |

### Required env (backend)

- `DATABRAIN_API_KEY` — API token for the data app (used for guest tokens and for metric/AI endpoints).
- `DATABRAIN_DATA_APP_NAME` — Data app name.
- `DATABRAIN_API_BASE_URL` — Optional; defaults to `https://api.usedatabrain.com`.

### AI Pilot

- Backend calls `POST {DATABRAIN_API_BASE_URL}/api/v2/dataApp/ai/ask` with `embedId`, `question`, `clientId`.
- If your Databrain environment uses a different path, update the URL in `backend/server.js` for the `/api/ai-pilot` handler.
- The embed must have **AI Pilot enabled** and a **semantic layer** configured (see `CUSTOMER_EMBED_LOGIC.md` § AI-Powered Analytics).

### Metric data and CSV

- Both use the DataBrain **query** API: `POST /api/v2/dataApp/query` with `embedId`, `metricId`, `clientId` (and optional `filters`, `limit`, `offset`).
- CSV is generated from the same query result on the backend and returned with `Content-Disposition: attachment`.

## Summary

- **MCP:** Use for one-off setup, theming, and configuration; keep tokens and secrets out of the frontend.
- **App:** Uses the backend routes above to provide Ask AI, View metric data, and Export CSV so users get “advanced” functionality without calling MCP from the browser.
