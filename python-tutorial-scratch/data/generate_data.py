"""Generate a 50,000-row sample KPI dataset for the tutorial.

Run once:
    python data/generate_data.py

Re-run with a different seed/size by editing SEED and ROWS below.
The tutorial article uses a realistic dataset (vs. the 3-row toy data
the original page shipped with) so chart-rendering and st.cache_data
behaviour match what real dashboards see.
"""

from __future__ import annotations

import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

from faker import Faker

SEED = 42
ROWS = 50_000
START_DATE = datetime(2024, 1, 1)
END_DATE = datetime(2026, 4, 1)

REGIONS = ["North America", "Europe", "Asia Pacific", "Latin America", "MEA"]
PRODUCTS = [
    "Starter",
    "Growth",
    "Scale",
    "Enterprise",
    "Add-on: Analytics",
    "Add-on: AI",
]
CHANNELS = ["Direct", "Partner", "Self-serve", "Outbound"]


def main() -> None:
    Faker.seed(SEED)
    random.seed(SEED)
    fake = Faker()
    output_path = Path(__file__).parent / "sample_kpi_data.csv"

    days_span = (END_DATE - START_DATE).days

    with output_path.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "order_id",
                "order_date",
                "region",
                "product",
                "channel",
                "customer",
                "units",
                "unit_price",
                "revenue",
                "is_renewal",
            ]
        )

        for i in range(1, ROWS + 1):
            order_date = START_DATE + timedelta(days=random.randint(0, days_span))
            region = random.choice(REGIONS)
            product = random.choices(
                PRODUCTS,
                weights=[35, 30, 18, 7, 6, 4],
                k=1,
            )[0]
            channel = random.choice(CHANNELS)
            customer = fake.company()
            units = random.randint(1, 12)
            base_price = {
                "Starter": 49,
                "Growth": 199,
                "Scale": 499,
                "Enterprise": 1499,
                "Add-on: Analytics": 99,
                "Add-on: AI": 149,
            }[product]
            unit_price = round(base_price * random.uniform(0.85, 1.15), 2)
            revenue = round(units * unit_price, 2)
            is_renewal = random.random() < 0.32

            writer.writerow(
                [
                    f"ORD-{i:06d}",
                    order_date.strftime("%Y-%m-%d"),
                    region,
                    product,
                    channel,
                    customer,
                    units,
                    unit_price,
                    revenue,
                    is_renewal,
                ]
            )

    print(f"Wrote {ROWS:,} rows to {output_path}")


if __name__ == "__main__":
    main()
