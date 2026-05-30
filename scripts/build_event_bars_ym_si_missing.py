"""
Build the 9 missing event_bars JSONs for YM and SI 8:30 events.

Missing (per audit 2026-05-22):
  YM: joblessclaims, nfp, pce, ppi, retailsales
  SI: empirestate, nfp, pce, retailsales

Run with:
  /Users/angelo/monfxreplay-python/.venv/bin/python scripts/build_event_bars_ym_si_missing.py
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import duckdb

NEWS_CSV = Path("/Users/angelo/news-cal-official/news_official_2016_2026.csv")
YM_PARQUET = Path("/Users/angelo/backtesting/ict/data/YM_1m_10y.parquet")
SI_PARQUET = Path("/Users/angelo/backtesting/ict/data/metals/SI_1m_10y_real.parquet")
OUT_DIR = Path(__file__).parent.parent / "public" / "data"

FROM_DATE = "2016-01-01"
TO_DATE_YM = "2024-12-31"  # YM parquet ends 2024
TO_DATE_SI = "2026-05-22"

ET = ZoneInfo("America/New_York")
UTC = timezone.utc
MIN_VALID_BARS = 15

# (asset, parquet, to_date, event_type_csv, short_slug, release_h, release_m)
JOBS = [
    # YM (8:30 events)
    ("ym", YM_PARQUET, TO_DATE_YM, "JoblessClaims", "joblessclaims", 8, 30),
    ("ym", YM_PARQUET, TO_DATE_YM, "NFP",           "nfp",           8, 30),
    ("ym", YM_PARQUET, TO_DATE_YM, "PCE",           "pce",           8, 30),
    ("ym", YM_PARQUET, TO_DATE_YM, "PPI",           "ppi",           8, 30),
    ("ym", YM_PARQUET, TO_DATE_YM, "RetailSales",   "retailsales",   8, 30),
    # SI (8:30 events)
    ("si", SI_PARQUET, TO_DATE_SI, "EmpireState",   "empirestate",   8, 30),
    ("si", SI_PARQUET, TO_DATE_SI, "NFP",           "nfp",           8, 30),
    ("si", SI_PARQUET, TO_DATE_SI, "PCE",           "pce",           8, 30),
    ("si", SI_PARQUET, TO_DATE_SI, "RetailSales",   "retailsales",   8, 30),
]


def build_t0_utc(date_str: str, h: int, m: int) -> datetime:
    naive = datetime.strptime(date_str, "%Y-%m-%d")
    return naive.replace(hour=h, minute=m, tzinfo=ET).astimezone(UTC)


def load_dates(event_type: str, time_et: str, to_date: str) -> list[str]:
    import csv
    seen: set[str] = set()
    out: list[str] = []
    with open(NEWS_CSV, newline="") as f:
        for row in csv.DictReader(f):
            if row["event_type"].strip() != event_type:
                continue
            if row["time_et"].strip() != time_et:
                continue
            d = row["date"].strip()
            if d < FROM_DATE or d > to_date:
                continue
            if d in seen:
                continue
            seen.add(d)
            out.append(d)
    out.sort()
    return out


def main():
    import pandas as pd

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Round precision: 2 dp for index futures (YM), 4 dp for SI (silver)
    PRECISION = {"ym": 2, "si": 4}

    cached_cons: dict[str, duckdb.DuckDBPyConnection] = {}

    for asset, parquet, to_date, event_type, short, h, m in JOBS:
        if asset not in cached_cons:
            con = duckdb.connect()
            con.execute(
                f"CREATE VIEW {asset} AS SELECT ts, open, high, low, close FROM read_parquet('{parquet}')"
            )
            bounds = con.execute(f"SELECT min(ts), max(ts) FROM {asset}").fetchone()
            print(f"[{asset}] {parquet.name} → {bounds[0]} .. {bounds[1]}")
            cached_cons[asset] = con
        con = cached_cons[asset]

        time_et = f"{h:02d}:{m:02d}"
        dates = load_dates(event_type, time_et, to_date)
        print(f"\n  [{short}_{asset}] {len(dates)} events at {time_et}")

        prec = PRECISION[asset]
        bars_out = []
        skipped = 0

        for date_str in dates:
            t0 = build_t0_utc(date_str, h, m)

            df = con.execute(
                f"""
                SELECT ts, open, high, low, close FROM {asset}
                WHERE ts >= ? - INTERVAL 31 MINUTE AND ts <= ? + INTERVAL 306 MINUTE
                ORDER BY ts
                """,
                [t0, t0],
            ).fetchdf()

            if df.empty:
                skipped += 1
                continue

            t0_ts = pd.Timestamp(t0)
            df["ts_utc"] = pd.to_datetime(df["ts"], utc=True)

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

            bar_list = []
            for _, b in df.iterrows():
                offset = int((b["ts_utc"] - t0_ts).total_seconds() / 60)
                if -30 <= offset <= 305:
                    bar_list.append({
                        "m": offset,
                        "o": round(float(b["open"]), prec),
                        "h": round(float(b["high"]), prec),
                        "l": round(float(b["low"]), prec),
                        "c": round(float(b["close"]), prec),
                    })

            if len(bar_list) < MIN_VALID_BARS:
                skipped += 1
                continue

            bars_out.append({
                "date": date_str,
                "t0_iso": t0.isoformat(),
                "entry_price": round(entry_price, prec),
                "bars": bar_list,
            })

        out_path = OUT_DIR / f"{short}_event_bars_{asset}.json"
        out_path.write_text(json.dumps(bars_out, indent=2))
        size_kb = out_path.stat().st_size // 1024
        print(f"  → {out_path.name} ({len(bars_out)} events, {skipped} skipped, {size_kb}KB)")

    for con in cached_cons.values():
        con.close()


if __name__ == "__main__":
    main()
