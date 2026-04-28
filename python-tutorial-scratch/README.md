# Python Dashboard — Tutorial Starter (from scratch)

The companion repo for [**Python Dashboard: The Complete 2026 Guide (Streamlit, Dash, Gradio)**](https://www.usedatabrain.com/how-to/create-python-dashboard).

This is the finished Streamlit dashboard the tutorial builds, wired into a runnable app. No backend required — a 50,000-row CSV ships with the repo (regenerable from `data/generate_data.py`), and `pip install -r requirements.txt && streamlit run streamlit_app.py` gets you a working dashboard on `localhost:8501`.

**This starter is vendor-neutral.** It does not use `@databrainhq/plugin` or any Databrain APIs. For the Databrain-embed pattern (Python backend + web component), see the sibling `dbn-demo-streamlit/` folder when published, or the [Embedded Analytics in Python guide](https://www.usedatabrain.com/blog/embedded-analytics-python).

## Stack

- **Streamlit ≥ 1.55** (the dashboard runtime — chosen as the primary 2026 default per the article; Streamlit ships every two weeks under Snowflake)
- **Pandas ≥ 2.2** (data loading and aggregation; pandas 3.0 makes copy-on-write the default)
- **Plotly ≥ 6** (interactive charts — `px.line` and `px.bar`; v6 is the current major)
- **Faker ≥ 30** (realistic 50k-row sample dataset, replaces the 3-row toy data the original article shipped with)
- **Python 3.13** (current stable; Streamlit's hard floor is 3.10, Streamlit Community Cloud also runs on 3.13)

A Dash 3.x port lives in the Dash walkthrough section of the article inline; if/when there's enough demand, a `dash-app/` sibling folder can be added here.

## Quick start

```bash
python3.13 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python data/generate_data.py        # one-time, generates 50k-row CSV (~4.3MB)
streamlit run streamlit_app.py
```

Open [http://localhost:8501](http://localhost:8501) — you should see:

- A **sidebar** with date-range, region, and product filters
- Four **KPI cards** (total revenue, orders, average order value, renewal rate)
- A **line chart** of revenue by month
- A **bar chart** of revenue by region
- A **top-20 customers** table

Move any filter and the whole dashboard updates — Streamlit reruns the script top-to-bottom on every interaction. The 50k-row CSV is loaded once and cached via `@st.cache_data`, so the rerun is fast.

> **Want a screenshot?** Run the app, then capture from your browser. A pre-baked `screenshot.png` may be added in a future commit.

## Project layout

```
python-tutorial-scratch/
├── streamlit_app.py            # The full app (sidebar, KPIs, charts, table)
├── requirements.txt            # Pinned dependencies
├── .python-version             # Pins to Python 3.13
├── .streamlit/
│   └── config.toml             # Theme tokens (primary color, font)
├── data/
│   ├── generate_data.py        # One-shot script to (re)generate sample CSV
│   └── sample_kpi_data.csv     # 50k-row dataset (generated, not committed)
├── .gitignore
└── README.md                   # this file
```

## Mapping to the tutorial

Each major section of the [Python Dashboard 2026 Guide](https://www.usedatabrain.com/how-to/create-python-dashboard) corresponds to a function or block in `streamlit_app.py`:

| Article section | File / function |
|---|---|
| Step 1: Install Streamlit + dependencies | `requirements.txt`, `.python-version` |
| Step 2: Generate or bring real data | `data/generate_data.py`, `data/sample_kpi_data.csv` |
| Step 3: Set up the page + theme | `st.set_page_config(...)`, `.streamlit/config.toml` |
| Step 4: Cache the data load | `load_data()` with `@st.cache_data` |
| Step 5: Build the KPI cards | `kpi_cards(df)` |
| Step 6: Add charts with Plotly Express | `revenue_over_time(df)`, `revenue_by_region(df)` |
| Step 7: Filter bar in the sidebar | `with st.sidebar:` block in `main()` |
| Step 8: Top-customers table | `top_customers(df)` |
| Step 9: Run + deploy | this README's "Deploy" section |

## Why `@st.cache_data` matters

This single decorator is the single biggest performance fix you'll make in any Streamlit dashboard. Streamlit reruns the entire script on every widget interaction. Without `@st.cache_data`, the 50k-row CSV gets re-parsed on every slider drag — which feels broken. With it, the load happens once and the parsed DataFrame is reused.

The article's "What actually breaks in production" section walks through three more Streamlit gotchas in the same vein (`st.session_state` for filter persistence across reruns, multi-user state collisions, cold-start latency on free tiers).

## Deploy

### Streamlit Community Cloud (easiest, free)

1. Push this repo to GitHub.
2. Go to [share.streamlit.io](https://share.streamlit.io), connect your GitHub.
3. Select this repo, set **Main file path** to `streamlit_app.py`.
4. Hit Deploy. Cold start takes ~30s on the free tier; subsequent loads are fast.

The 50k-row CSV is included via `data/sample_kpi_data.csv` — no extra upload step. For larger datasets, fetch from S3 / DuckDB / a database in `load_data()`.

### Hugging Face Spaces (free, good for AI-augmented dashboards)

1. Create a new Space → SDK: **Streamlit**.
2. Push this repo to the Space's git remote.
3. Spaces auto-detects `streamlit_app.py` and `requirements.txt` and runs it.

### Render / Fly.io / Docker (production)

Add a `Procfile` (`web: streamlit run streamlit_app.py --server.port $PORT --server.address 0.0.0.0`) for Render, or a one-line `Dockerfile` (`FROM python:3.12-slim` + copy + pip install + CMD streamlit run) for Fly.io / your own Kubernetes. The article's deployment section has the full snippets.

## Next steps

- **Replace the sample data** with a real source: change `load_data()` to `pd.read_sql(...)` against your warehouse, or `pd.read_parquet("s3://...")` against a data lake.
- **Add multi-page navigation:** create a `pages/` directory next to `streamlit_app.py` — Streamlit auto-discovers it.
- **Add session-state filters that persist across page navigation:** wrap the filter values in `st.session_state["region_filter"]` so they survive the rerun.
- **Embed an analytics platform** (Databrain, Metabase) inside the Streamlit app via `st.components.v1.html`. The [Embedded Analytics in Python guide](https://www.usedatabrain.com/blog/embedded-analytics-python) covers the FastAPI/Django/Flask token pattern that goes alongside.

## License

MIT.
