#!/usr/bin/env python3
"""
POC: regen cpi_event_bars.json (NQ only) with wider window T-30min → T+150min.

Run with: /Users/angelo/monfxreplay-python/.venv/bin/python scripts/build_event_bars_cpi_test.py
"""
from __future__ import annotations

import csv
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import duckdb
import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
NEWS_CSV = Path("/Users/angelo/news-cal-official/news_official_2016_2026.csv")
NQ_PARQUET = Path("/Users/angelo/backtesting/ict/data/NQ_1m_10y.parquet")
NQ_FALLBACK = Path("/Users/angelo/winning-day-algo/data/NQ_1m_10y_concat.parquet")
OUT_DIR = Path("/Users/angelo/jtnq-hub-v3/public/data")
OUT_FILE = OUT_DIR / "cpi_event_bars.json"
BACKUP_FILE = Path("/tmp/cpi_event_bars-narrow.bak.json")

FROM_DATE = "2016-01-01"
TO_DATE = "2026-05-18"

ET = ZoneInfo("America/New_York")
UTC = timezone.utc

# Window: T-30 → T+150 (180 min total)
PRE_MIN = 30
POST_MIN = 150
MIN_VALID_BARS = 15   # same as original build_event_bars.py


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def build_t0_utc(date_str: str) -> datetime:
    """Convert YYYY-MM-DD → 8:30 ET in UTC (DST-aware)."""
    naive = datetime.strptime(date_str, "%Y-%m-%d")
    local_830 = naive.replace(hour=8, minute=30, tzinfo=ET)
    return local_830.astimezone(UTC)


def load_cpi_dates() -> list[str]:
    """Load CPI dates from news CSV, deduped by date, 8:30 ET only."""
    seen: set[str] = set()
    dates: list[str] = []

    with open(NEWS_CSV, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            date_str = row["date"].strip()
            time_et = row["time_et"].strip()
            event_type = row["event_type"].strip()

            if event_type not in {"CPI", "Core CPI"}:
                continue
            if time_et != "08:30":
                continue
            if date_str < FROM_DATE or date_str > TO_DATE:
                continue
            if date_str in seen:
                continue

            seen.add(date_str)
            dates.append(date_str)

    dates.sort()
    print(f"  CPI dates loaded: {len(dates)} ({dates[0]} → {dates[-1]})")
    return dates


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    t_start = time.time()
    print("=== build_event_bars_cpi_test.py ===")
    print(f"Window: T-{PRE_MIN}min → T+{POST_MIN}min")

    # Backup existing
    if OUT_FILE.exists():
        import shutil
        shutil.copy2(OUT_FILE, BACKUP_FILE)
        print(f"Backup → {BACKUP_FILE}")

    # Resolve parquet
    nq_parquet = NQ_PARQUET if NQ_PARQUET.exists() else NQ_FALLBACK
    print(f"NQ parquet: {nq_parquet}")

    # Load events
    print("\n[load] Reading news CSV...")
    dates = load_cpi_dates()

    # Connect duckdb
    print("\n[NQ] Connecting duckdb...")
    con = duckdb.connect()
    con.execute(
        f"CREATE VIEW nq AS SELECT ts, open, high, low, close "
        f"FROM read_parquet('{nq_parquet}')"
    )
    bounds = con.execute("SELECT min(ts), max(ts) FROM nq").fetchone()
    print(f"  Bar range: {bounds[0]} → {bounds[1]}")

    bars_out: list[dict] = []
    skipped = 0

    for date_str in dates:
        t0 = build_t0_utc(date_str)

        df = con.execute(
            """
            SELECT ts, open, high, low, close
            FROM nq
            WHERE ts >= ? - INTERVAL 31 MINUTE
              AND ts <= ? + INTERVAL 151 MINUTE
            ORDER BY ts
            """,
            [t0, t0],
        ).fetchdf()

        if df.empty:
            skipped += 1
            continue

        t0_ts = pd.Timestamp(t0)
        df["ts_utc"] = pd.to_datetime(df["ts"], utc=True)

        # entry_price = close of bar at t0-1min (m=-1)
        t0_minus_1 = t0_ts - pd.Timedelta(minutes=1)
        entry_match = df[df["ts_utc"] == t0_minus_1]
        if entry_match.empty:
            pre_t0 = df[df["ts_utc"] < t0_ts]
            if pre_t0.empty:
                skipped += 1
                continue
            entry_price = float(pre_t0.iloc[-1]["close"])
        else:
            entry_price = float(entry_match.iloc[0]["close"])

        # Build bars m=-30 to m=+150
        bar_list: list[dict] = []
        for _, b in df.iterrows():
            offset = int((b["ts_utc"] - t0_ts).total_seconds() / 60)
            if -PRE_MIN <= offset <= POST_MIN:
                bar_list.append({
                    "m": offset,
                    "o": round(float(b["open"]), 2),
                    "h": round(float(b["high"]), 2),
                    "l": round(float(b["low"]), 2),
                    "c": round(float(b["close"]), 2),
                })

        if len(bar_list) < MIN_VALID_BARS:
            skipped += 1
            continue

        bars_out.append({
            "date": date_str,
            "t0_iso": t0.isoformat(),
            "entry_price": round(entry_price, 2),
            "bars": bar_list,
        })

    con.close()

    OUT_FILE.write_text(json.dumps(bars_out, indent=2))
    size_kb = OUT_FILE.stat().st_size // 1024
    elapsed = time.time() - t_start

    print(f"\n[done] {len(bars_out)} events written, {skipped} skipped")
    print(f"  → {OUT_FILE} ({size_kb}KB)")
    print(f"  Elapsed: {elapsed:.1f}s")


if __name__ == "__main__":
    main()
