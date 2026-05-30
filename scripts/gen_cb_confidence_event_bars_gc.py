"""Generate CB Consumer Confidence event_bars JSON for Gold (GC) — jtnq-hub-v3 calendar/trade overlay.

Output:
  ~/jtnq-hub-v3/public/data/cb_confidence_event_bars_gc.json

Pattern identique à gen_adp_event_bars_gc.py adapté pour
CB Consumer Confidence à 10:00 ET.
"""

from __future__ import annotations

import csv
import glob
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import polars as pl

GC_PARQUET_DIR = os.path.expanduser("~/backtesting-data/metals-fresh")
GC_PARQUET_GLOB = "GC_1m_part*.parquet"
NEWS_CSV = os.path.expanduser("~/news-cal-official/news_official_2016_2026.csv")
OUT_PATH = os.path.expanduser("~/jtnq-hub-v3/public/data/cb_confidence_event_bars_gc.json")

FROM_DATE = "2016-01-01"
TO_DATE = "2026-05-13"
MIN_VALID_BARS = 25

ET = ZoneInfo("America/New_York")
UTC = timezone.utc


def load_cb_confidence_events() -> list[dict]:
    events = []
    with open(NEWS_CSV, newline="") as f:
        for row in csv.DictReader(f):
            if row["event_type"].strip() != "CBConfidence":
                continue
            if row["time_et"].strip() != "10:00":
                continue
            date_str = row["date"].strip()
            if date_str < FROM_DATE or date_str > TO_DATE:
                continue
            events.append({"date": date_str})
    return events


def build_t0_utc(date_str: str) -> datetime:
    naive = datetime.strptime(date_str, "%Y-%m-%d")
    local = naive.replace(hour=10, minute=0, tzinfo=ET)
    return local.astimezone(UTC)


def extract_event_bars(df: pl.DataFrame, t0_utc: datetime) -> dict | None:
    t_start = t0_utc - timedelta(minutes=1)
    t_end = t0_utc + timedelta(minutes=30)
    window = df.filter(
        (pl.col("ts_event") >= t_start) & (pl.col("ts_event") <= t_end)
    ).sort("ts_event")
    if len(window) < MIN_VALID_BARS:
        return None
    bars = []
    entry_price = None
    for row in window.iter_rows(named=True):
        ts = row["ts_event"]
        m = int((ts - t0_utc).total_seconds() / 60)
        bars.append({
            "m": m,
            "o": round(row["open"], 2),
            "h": round(row["high"], 2),
            "l": round(row["low"], 2),
            "c": round(row["close"], 2),
        })
        if m == -1:
            entry_price = round(row["close"], 2)
    if entry_price is None and bars:
        entry_price = bars[0]["c"]
    return {
        "date": t0_utc.strftime("%Y-%m-%d"),
        "t0_iso": t0_utc.isoformat(),
        "entry_price": entry_price,
        "bars": bars,
    }


def main():
    files = sorted(glob.glob(os.path.join(GC_PARQUET_DIR, GC_PARQUET_GLOB)))
    if not files:
        print("ERROR: no GC parquet files found", file=sys.stderr)
        sys.exit(1)
    print(f"[load] {len(files)} GC parquet file(s)", file=sys.stderr)
    df = pl.concat([pl.read_parquet(f) for f in files])
    print(f"  {df.shape[0]:,} bars", file=sys.stderr)

    events = load_cb_confidence_events()
    print(f"[process] {len(events)} CBConfidence events 10:00 ET", file=sys.stderr)

    results = []
    skipped = 0
    for ev in events:
        t0 = build_t0_utc(ev["date"])
        data = extract_event_bars(df, t0)
        if data is None:
            skipped += 1
            continue
        results.append(data)

    print(f"  {len(results)} valid events ({skipped} skipped, <{MIN_VALID_BARS} bars)", file=sys.stderr)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(results, f, indent=2)
    size = os.path.getsize(OUT_PATH)
    print(f"  → {OUT_PATH} ({size:,} bytes)", file=sys.stderr)
    if results:
        avg = sum(len(r["bars"]) for r in results) / len(results)
        print(f"  avg bars: {avg:.1f}", file=sys.stderr)


if __name__ == "__main__":
    main()
