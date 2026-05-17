#!/usr/bin/env python3
"""
Build event_bars JSONs for 7 missing events × 2 assets (NQ + GC).

Outputs (14 files) → public/data/<short>_event_bars{,_gc}.json

Shape identical to cpi_event_bars.json:
  [{date, t0_iso, entry_price, bars: [{m, o, h, l, c}, ...]}]

Run with: /Users/angelo/monfxreplay-python/.venv/bin/python scripts/build_event_bars.py
"""
from __future__ import annotations

import json
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import duckdb
import polars as pl

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
NEWS_CSV = Path("/Users/angelo/news-cal-official/news_official_2016_2026.csv")
NQ_PARQUET = Path("/Users/angelo/backtesting/ict/data/NQ_1m_10y.parquet")
GC_PARQUET_GLOB = "/Users/angelo/backtesting-data/metals-fresh/GC_1m_part*.parquet"
OUT_DIR = Path("/Users/angelo/jtnq-hub-v3/public/data")

FROM_DATE = "2016-01-01"
TO_DATE = "2026-05-17"

ET = ZoneInfo("America/New_York")
UTC = timezone.utc
MIN_VALID_BARS = 15  # minimum bars to keep an event

# ---------------------------------------------------------------------------
# Event mapping: CSV event_type → output short name
# The canonical CSV uses no-space names (e.g. "JoblessClaims" not "Jobless Claims")
# ---------------------------------------------------------------------------
EVENT_MAP: dict[str, str] = {
    "PPI": "ppi",
    "PCE": "pce",
    "GDP": "gdp",
    "JoblessClaims": "joblessclaims",
    "RetailSales": "retailsales",
    "EmpireState": "empirestate",
    "EmploymentCostIndex": "employmentcostindex",
}

# Short names already generated (skip to avoid touching existing files)
SKIP_SHORTS: set[str] = {"cpi", "nfp"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def build_t0_utc(date_str: str) -> datetime:
    """Convert YYYY-MM-DD → 8:30 ET in UTC (DST-aware)."""
    naive = datetime.strptime(date_str, "%Y-%m-%d")
    local_830 = naive.replace(hour=8, minute=30, tzinfo=ET)
    return local_830.astimezone(UTC)


def load_events() -> dict[str, list[str]]:
    """
    Load news CSV and return {short_name: [date_str, ...]} deduped by (date, short).
    All events at time_et == '08:30'. Skips outside FROM_DATE..TO_DATE.
    """
    import csv
    seen: dict[tuple[str, str], bool] = {}  # (date, short) → True
    result: dict[str, list[str]] = {short: [] for short in set(EVENT_MAP.values())}

    with open(NEWS_CSV, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            date_str = row["date"].strip()
            time_et = row["time_et"].strip()
            event_type = row["event_type"].strip()

            if time_et != "08:30":
                continue
            if date_str < FROM_DATE or date_str > TO_DATE:
                continue

            short = EVENT_MAP.get(event_type)
            if short is None:
                continue

            key = (date_str, short)
            if key in seen:
                continue  # dedupe: keep first occurrence per (date, short)
            seen[key] = True
            result[short].append(date_str)

    for short, dates in result.items():
        print(f"  {short}: {len(dates)} events in CSV")

    return result


# ---------------------------------------------------------------------------
# NQ extraction (duckdb — matches existing nfp_event_bars.py pattern)
# ---------------------------------------------------------------------------

def build_nq_bars(events_by_short: dict[str, list[str]]) -> None:
    print("\n[NQ] Connecting duckdb to NQ parquet...")
    con = duckdb.connect()
    con.execute(
        f"CREATE VIEW nq AS SELECT ts, open, high, low, close, volume "
        f"FROM read_parquet('{NQ_PARQUET}')"
    )
    bounds = con.execute("SELECT min(ts), max(ts) FROM nq").fetchone()
    print(f"  Bar range: {bounds[0]} → {bounds[1]}")

    for short, dates in events_by_short.items():
        if short in SKIP_SHORTS:
            continue

        out_path = OUT_DIR / f"{short}_event_bars.json"
        bars_out: list[dict] = []
        skipped = 0

        for date_str in sorted(dates):
            t0 = build_t0_utc(date_str)

            df = con.execute(
                """
                SELECT ts, open, high, low, close
                FROM nq
                WHERE ts >= ? - INTERVAL 31 MINUTE AND ts <= ? + INTERVAL 90 MINUTE
                ORDER BY ts
                """,
                [t0, t0],
            ).fetchdf()

            if df.empty:
                skipped += 1
                continue

            import pandas as pd
            t0_ts = pd.Timestamp(t0)
            df["ts_utc"] = pd.to_datetime(df["ts"], utc=True)

            # entry_price = close of bar at t0-1min (m=-1)
            t0_minus_1 = t0_ts - pd.Timedelta(minutes=1)
            entry_match = df[df["ts_utc"] == t0_minus_1]
            if entry_match.empty:
                # fallback: use close of earliest bar before t0
                pre_t0 = df[df["ts_utc"] < t0_ts]
                if pre_t0.empty:
                    skipped += 1
                    continue
                entry_price = float(pre_t0.iloc[-1]["close"])
            else:
                entry_price = float(entry_match.iloc[0]["close"])

            # Build bars m=-1 to m=+90
            bar_list: list[dict] = []
            for _, b in df.iterrows():
                offset = int((b["ts_utc"] - t0_ts).total_seconds() / 60)
                if -1 <= offset <= 90:
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

        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(bars_out, indent=2))
        n = len(bars_out)
        size_kb = out_path.stat().st_size // 1024
        print(f"  [NQ] {short}: {n} events written, {skipped} skipped → {out_path.name} ({size_kb}KB)")
        if n == 0:
            print(f"  !!! WARNING: 0 events for {short} NQ — check event_type mapping")

    con.close()


# ---------------------------------------------------------------------------
# GC extraction (polars — matches gen_event_bars_gc.py pattern)
# ---------------------------------------------------------------------------

def build_gc_bars(events_by_short: dict[str, list[str]]) -> None:
    import glob as globmod

    print("\n[GC] Loading GC parquet files...")
    gc_files = sorted(globmod.glob(GC_PARQUET_GLOB))
    if not gc_files:
        print("ERROR: no GC parquet files found")
        return
    print(f"  {len(gc_files)} files")

    df_gc = pl.concat([pl.read_parquet(f) for f in gc_files])
    print(f"  {df_gc.shape[0]:,} bars loaded")

    for short, dates in events_by_short.items():
        if short in SKIP_SHORTS:
            continue

        out_path = OUT_DIR / f"{short}_event_bars_gc.json"
        bars_out: list[dict] = []
        skipped = 0

        for date_str in sorted(dates):
            t0 = build_t0_utc(date_str)
            t_start = t0 - timedelta(minutes=1)   # m=-1
            t_end = t0 + timedelta(minutes=90)

            window = df_gc.filter(
                (pl.col("ts_event") >= t_start) & (pl.col("ts_event") <= t_end)
            ).sort("ts_event")

            if len(window) < MIN_VALID_BARS:
                skipped += 1
                continue

            bar_list: list[dict] = []
            entry_price: float | None = None

            for row in window.iter_rows(named=True):
                ts = row["ts_event"]
                # ts_event is datetime[ns, UTC] — already UTC-aware
                if hasattr(ts, "tzinfo") and ts.tzinfo is None:
                    from datetime import timezone as _tz
                    ts = ts.replace(tzinfo=_tz.utc)
                offset = int((ts - t0).total_seconds() / 60)
                if -1 <= offset <= 90:
                    bar_list.append({
                        "m": offset,
                        "o": round(row["open"], 2),
                        "h": round(row["high"], 2),
                        "l": round(row["low"], 2),
                        "c": round(row["close"], 2),
                    })
                    if offset == -1:
                        entry_price = round(row["close"], 2)

            if len(bar_list) < MIN_VALID_BARS:
                skipped += 1
                continue

            # fallback entry_price if no m=-1 bar
            if entry_price is None and bar_list:
                entry_price = bar_list[0]["c"]

            bars_out.append({
                "date": date_str,
                "t0_iso": t0.isoformat(),
                "entry_price": entry_price,
                "bars": bar_list,
            })

        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(bars_out, indent=2))
        n = len(bars_out)
        size_kb = out_path.stat().st_size // 1024
        print(f"  [GC] {short}: {n} events written, {skipped} skipped → {out_path.name} ({size_kb}KB)")
        if n == 0:
            print(f"  !!! WARNING: 0 events for {short} GC — check event_type mapping")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    t_start = time.time()
    print(f"=== build_event_bars.py ===")
    print(f"NEWS_CSV: {NEWS_CSV}")
    print(f"OUT_DIR:  {OUT_DIR}")
    print(f"Date range: {FROM_DATE} → {TO_DATE}")
    print(f"Skipping (already generated): {SKIP_SHORTS}")
    print()

    print("[load] Reading news CSV...")
    events_by_short = load_events()

    build_nq_bars(events_by_short)
    build_gc_bars(events_by_short)

    elapsed = time.time() - t_start
    print(f"\n=== Done in {elapsed:.1f}s ===")

    # Summary
    nq_files = sorted(OUT_DIR.glob("*_event_bars.json"))
    gc_files = sorted(OUT_DIR.glob("*_event_bars_gc.json"))
    print(f"NQ files ({len(nq_files)}): {[f.name for f in nq_files]}")
    print(f"GC files ({len(gc_files)}): {[f.name for f in gc_files]}")
    print(f"Total event_bars files: {len(nq_files) + len(gc_files)}")


if __name__ == "__main__":
    main()
