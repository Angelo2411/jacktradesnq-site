"""
Build SI event_bars JSONs for 7 IFVG-SMT events.

Outputs 7 files → public/data/<short>_event_bars_si.json

Same shape as *_event_bars_es.json:
  [{date, t0_iso, entry_price, bars: [{m, o, h, l, c}, ...]}]

SI tick: 0.005 (Comex silver mini)
Data:    ~/backtesting/ict/data/metals/SI_1m_10y_real.parquet (bbo-1m real, 2016-2026)

Run with: /Users/angelo/monfxreplay-python/.venv/bin/python scripts/build_event_bars_si.py
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import duckdb

NEWS_CSV   = Path("/Users/angelo/news-cal-official/news_official_2016_2026.csv")
SI_PARQUET = Path("/Users/angelo/backtesting/ict/data/metals/SI_1m_10y_real.parquet")
OUT_DIR    = Path(__file__).parent.parent / "public" / "data"

FROM_DATE = "2016-01-01"
TO_DATE   = "2026-05-22"

ET  = ZoneInfo("America/New_York")
UTC = timezone.utc

MIN_VALID_BARS   = 15
LOW_SAMPLE_THRESH = 30   # flag low_sample:true if fewer event days

# (event_type CSV, output slug, release_h, release_m)
EVENTS = [
    ("CBConfidence", "cb_confidence",  10,  0),
    ("CPI",          "cpi",             8, 30),
    ("DurableGoods", "durable_goods",   8, 30),
    ("FOMC",         "fomc",           14,  0),
    ("ISMMfg",       "ism_mfg",        10,  0),
    ("ISMServices",  "ism_services",   10,  0),
    ("PhillyFed",    "philly_fed",      8, 30),
]


def build_t0_utc(date_str: str, h: int, m: int) -> datetime:
    naive = datetime.strptime(date_str, "%Y-%m-%d")
    return naive.replace(hour=h, minute=m, tzinfo=ET).astimezone(UTC)


def load_dates(event_type: str, time_et: str) -> list[str]:
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
            if d < FROM_DATE or d > TO_DATE:
                continue
            if d in seen:
                continue
            seen.add(d)
            out.append(d)
    out.sort()
    return out


def main() -> None:
    if not SI_PARQUET.exists():
        raise FileNotFoundError(f"SI parquet not found: {SI_PARQUET}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"[SI] Connecting duckdb to {SI_PARQUET.name}...")
    con = duckdb.connect()
    con.execute(
        f"CREATE VIEW si AS SELECT ts, open, high, low, close "
        f"FROM read_parquet('{SI_PARQUET}')"
    )
    bounds = con.execute("SELECT min(ts), max(ts) FROM si").fetchone()
    print(f"  Bar range: {bounds[0]} → {bounds[1]}")

    for event_type, short, h, m in EVENTS:
        time_et = f"{h:02d}:{m:02d}"
        dates   = load_dates(event_type, time_et)
        print(f"\n  [{short}_si] {len(dates)} events at {time_et}")

        bars_out: list[dict] = []
        skipped = 0

        for date_str in dates:
            t0 = build_t0_utc(date_str, h, m)

            df = con.execute(
                """
                SELECT ts, open, high, low, close FROM si
                WHERE ts >= ? - INTERVAL 31 MINUTE
                  AND ts <= ? + INTERVAL 306 MINUTE
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

            t0_minus_1  = t0_ts - pd.Timedelta(minutes=1)
            entry_match = df[df["ts_utc"] == t0_minus_1]

            if entry_match.empty:
                pre_t0 = df[df["ts_utc"] < t0_ts]
                if pre_t0.empty:
                    skipped += 1
                    continue
                entry_price = float(pre_t0.iloc[-1]["close"])
            else:
                entry_price = float(entry_match.iloc[0]["close"])

            bar_list: list[dict] = []
            for _, b in df.iterrows():
                offset = int((b["ts_utc"] - t0_ts).total_seconds() / 60)
                if -30 <= offset <= 305:
                    bar_list.append({
                        "m": offset,
                        "o": round(float(b["open"]), 4),
                        "h": round(float(b["high"]), 4),
                        "l": round(float(b["low"]),  4),
                        "c": round(float(b["close"]), 4),
                    })

            if len(bar_list) < MIN_VALID_BARS:
                skipped += 1
                continue

            bars_out.append({
                "date":        date_str,
                "t0_iso":      t0.isoformat(),
                "entry_price": round(entry_price, 4),
                "bars":        bar_list,
            })

        low_sample = len(bars_out) < LOW_SAMPLE_THRESH

        out_path = OUT_DIR / f"{short}_event_bars_si.json"

        # Wrap in dict with meta when low_sample, otherwise keep list for schema compat
        if low_sample:
            payload = {
                "low_sample": True,
                "event_count": len(bars_out),
                "events": bars_out,
            }
            print(f"  ⚠ low_sample ({len(bars_out)} events < {LOW_SAMPLE_THRESH})")
        else:
            payload = bars_out  # type: ignore[assignment]

        out_path.write_text(json.dumps(payload, indent=2))
        size_kb = out_path.stat().st_size // 1024
        print(
            f"  → {out_path.name} "
            f"({len(bars_out)} events, {skipped} skipped, {size_kb}KB"
            f"{', LOW SAMPLE' if low_sample else ''})"
        )

    con.close()
    print("\n[SI] Done.")


if __name__ == "__main__":
    main()
