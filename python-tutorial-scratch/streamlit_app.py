"""Python Dashboard tutorial - companion Streamlit app.

Run:
    pip install -r requirements.txt
    python data/generate_data.py     # one-time, generates 50k-row CSV
    streamlit run streamlit_app.py
"""

from __future__ import annotations

from datetime import date
from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st

DATA_PATH = Path(__file__).parent / "data" / "sample_kpi_data.csv"

st.set_page_config(
    page_title="Revenue dashboard",
    page_icon=":bar_chart:",
    layout="wide",
)


@st.cache_data(show_spinner="Loading 50k rows...")
def load_data() -> pd.DataFrame:
    """Load the sample KPI data once and reuse across reruns.

    Without st.cache_data, Streamlit reruns the entire script on every
    widget change - which would mean re-parsing 50k rows of CSV every
    time the user moves a slider. This single decorator is the difference
    between "snappy" and "unusable" on a real dataset.
    """
    if not DATA_PATH.exists():
        st.error(
            "Sample data not found. Run `python data/generate_data.py` first."
        )
        st.stop()
    df = pd.read_csv(DATA_PATH, parse_dates=["order_date"])
    return df


def kpi_cards(df: pd.DataFrame) -> None:
    total_revenue = df["revenue"].sum()
    total_orders = len(df)
    avg_order_value = df["revenue"].mean()
    renewal_rate = df["is_renewal"].mean() * 100

    cols = st.columns(4)
    cols[0].metric("Total revenue", f"${total_revenue / 1_000_000:.2f}M")
    cols[1].metric("Orders", f"{total_orders:,}")
    cols[2].metric("Avg order value", f"${avg_order_value:,.0f}")
    cols[3].metric("Renewal rate", f"{renewal_rate:.1f}%")


def revenue_over_time(df: pd.DataFrame) -> None:
    monthly = (
        df.assign(month=df["order_date"].dt.to_period("M").dt.to_timestamp())
        .groupby("month", as_index=False)["revenue"]
        .sum()
    )
    fig = px.line(
        monthly,
        x="month",
        y="revenue",
        title="Revenue by month",
        markers=True,
    )
    fig.update_layout(height=380, margin=dict(l=10, r=10, t=50, b=10))
    st.plotly_chart(fig, use_container_width=True)


def revenue_by_region(df: pd.DataFrame) -> None:
    by_region = (
        df.groupby("region", as_index=False)["revenue"]
        .sum()
        .sort_values("revenue", ascending=False)
    )
    fig = px.bar(
        by_region,
        x="region",
        y="revenue",
        title="Revenue by region",
        text_auto=".2s",
    )
    fig.update_layout(height=380, margin=dict(l=10, r=10, t=50, b=10))
    st.plotly_chart(fig, use_container_width=True)


def top_customers(df: pd.DataFrame) -> None:
    top = (
        df.groupby("customer", as_index=False)["revenue"]
        .sum()
        .sort_values("revenue", ascending=False)
        .head(20)
    )
    st.subheader("Top 20 customers by revenue")
    st.dataframe(
        top.style.format({"revenue": "${:,.2f}"}),
        use_container_width=True,
        hide_index=True,
    )


def main() -> None:
    df = load_data()

    with st.sidebar:
        st.title("Revenue dashboard")
        st.caption("Companion app for the Python Dashboard 2026 guide")

        min_date: date = df["order_date"].min().date()
        max_date: date = df["order_date"].max().date()
        date_range = st.date_input(
            "Date range",
            value=(min_date, max_date),
            min_value=min_date,
            max_value=max_date,
        )

        regions = st.multiselect(
            "Regions",
            options=sorted(df["region"].unique()),
            default=sorted(df["region"].unique()),
        )

        products = st.multiselect(
            "Products",
            options=sorted(df["product"].unique()),
            default=sorted(df["product"].unique()),
        )

    if isinstance(date_range, tuple) and len(date_range) == 2:
        start, end = date_range
        mask = (
            (df["order_date"].dt.date >= start)
            & (df["order_date"].dt.date <= end)
            & (df["region"].isin(regions))
            & (df["product"].isin(products))
        )
        filtered = df.loc[mask]
    else:
        filtered = df

    if filtered.empty:
        st.warning("No data matches the current filters.")
        return

    kpi_cards(filtered)
    st.divider()

    left, right = st.columns(2)
    with left:
        revenue_over_time(filtered)
    with right:
        revenue_by_region(filtered)

    st.divider()
    top_customers(filtered)


if __name__ == "__main__":
    main()
