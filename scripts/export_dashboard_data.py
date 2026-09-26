"""Export the cleaned walks to JSON for the React dashboard.

Reads data/processed/clean_walks.csv and writes dashboard/src/data/walks.json
and regression.json. Run from anywhere: python3 scripts/export_dashboard_data.py
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data" / "processed" / "clean_walks.csv"
OUT_DIR = ROOT / "dashboard" / "src" / "data"

FIELDS = ["startDate", "distance_km", "duration", "calories_active", "speed", "heart_rate_average",
          "distance_band", "year", "season", "month", "day_name", "is_weekend", "hour", "time_of_day"]


def regression_stats(x, y, order=1):
    """Fit a polynomial with least squares and return its coefficients and R squared (same as eda.ipynb)."""
    coefs = np.polyfit(x, y, order)
    predicted = np.polyval(coefs, x)
    r2 = 1 - np.sum((y - predicted) ** 2) / np.sum((y - np.mean(y)) ** 2)
    return coefs, r2


def fit(df, x, y):
    (slope, intercept), r2 = regression_stats(df[x], df[y])
    return {"x": x, "y": y, "slope": round(slope, 4), "intercept": round(intercept, 4), "r2": round(r2, 4)}


def main():
    df = pd.read_csv(SOURCE)

    # Dates are stored with local UTC offsets, so parse through UTC back to local time
    df["startDate"] = pd.to_datetime(df["startDate"], utc=True).dt.tz_convert("America/Halifax")
    df = df.sort_values("startDate")

    walks = df[FIELDS].copy()
    walks["startDate"] = walks["startDate"].map(lambda d: d.isoformat())
    for col in ["distance_km", "duration", "calories_active", "speed", "heart_rate_average"]:
        walks[col] = walks[col].round(3)

    regression = {
        "calories": fit(df, "distance_km", "calories_total"),
        "duration": fit(df, "distance_km", "duration"),
        "points": df[["distance_km", "calories_total", "duration"]].round(3).to_dict(orient="records"),
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "walks.json").write_text(json.dumps(walks.to_dict(orient="records"), indent=1))
    (OUT_DIR / "regression.json").write_text(json.dumps(regression, indent=1))
    print(f"Wrote {len(walks)} walks to {OUT_DIR.relative_to(ROOT)}")
    print(f"Calories vs distance: R² {regression['calories']['r2']:.2f}, "
          f"Duration vs distance: R² {regression['duration']['r2']:.2f}")


if __name__ == "__main__":
    main()
