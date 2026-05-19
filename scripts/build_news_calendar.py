#!/usr/bin/env python3
"""
Generate public/data/news-calendar.json — multi-week US economic calendar.

Window: previous week (Mon) → 4 weeks after current week (Sun).
Source: ~/jtnq-hub/data/news_red_folder_full.csv (long-horizon master CSV).
Falls back to ~/jtnq-hub/data/upcoming_events.csv for the current/next week
if the master CSV is missing future entries.

Both source CSVs mix ET and UTC times for the same canonical event types.
We re-stamp the time to the canonical ET time when we recognise the event
(safe — the canonical map is the same one already used by build_news_week.py).
Unknown / non-canonical events are kept as-is with the raw CSV time.

Output schema:
{
  "generated_at":  ISO UTC,
  "window_start":  YYYY-MM-DD (Monday of prev week),
  "window_end":    YYYY-MM-DD (Sunday, current week + 4),
  "events": [
    { "date": "2026-05-20", "day": "Wed 20", "time": "14:00",
      "event": "FOMC Statement", "imp": "High", "weekday": 2 }
  ]
}
"""

import csv
import json
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

# ── Paths ────────────────────────────────────────────────────────────────────
SRC_FULL     = Path("/Users/angelo/jtnq-hub/data/news_red_folder_full.csv")
SRC_UPCOMING = Path("/Users/angelo/jtnq-hub/data/upcoming_events.csv")
OUTPUT       = Path("/Users/angelo/jtnq-hub-v3/public/data/news-calendar.json")

# ── Normalisation des noms d'événements ──────────────────────────────────────
EVENT_NORMALIZE = {
    "Core CPI":                  "CPI",
    "Non-Farm Payrolls":         "NFP",
    "Initial Jobless Claims":    "Jobless Claims",
    "Core Retail Sales":         "Retail Sales",
    "FOMC":                      "FOMC Statement",
    "Fed Rate Decision":         "FOMC Statement",
    "ISM Non-Manufacturing PMI": "ISM Services PMI",
    "UoM Consumer Sentiment":    "University of Michigan Consumer Sentiment",
}

# ── FF red folder whitelist (drop everything else: Crude/PMI/Bond/etc.) ──────
# Names below are POST-normalisation canonical strings.
BACKTESTED_EVENTS = {
    # backtested
    "CPI", "NFP", "PPI", "PCE", "GDP",
    "Jobless Claims", "Retail Sales",
    "Empire State Manufacturing Index",
    "Employment Cost Index",
    "FOMC Statement", "Federal Funds Rate", "FOMC Minutes",
    # FF red folder, not backtested yet (visible with "No backtest yet"):
    "Unemployment Rate",
    "Average Hourly Earnings",
    "ISM Manufacturing PMI",
    "ISM Services PMI",
    "ADP Non-Farm Employment Change",
    "JOLTS Job Openings",
    "CB Consumer Confidence",
    "Philadelphia Fed Manufacturing Index",
    "Durable Goods Orders", "Core Durable Goods Orders",
    "Existing Home Sales", "New Home Sales",
    "Trade Balance",
    "University of Michigan Consumer Sentiment",
}

# ── Canonical timing whitelist (ET, leading-zero stripped) ───────────────────
CANONICAL_TIME = {
    "CPI": "8:30",
    "PPI": "8:30",
    "Retail Sales": "8:30",
    "Jobless Claims": "8:30",
    "NFP": "8:30",
    "PCE": "8:30",
    "Empire State Manufacturing Index": "8:30",
    "Philadelphia Fed Manufacturing Index": "8:30",
    "Employment Cost Index": "8:30",
    "GDP": "8:30",
    "S&P Global Manufacturing PMI": "9:45",
    "S&P Global Services PMI": "9:45",
    "S&P Global Composite PMI": "9:45",
    "ISM Manufacturing PMI": "10:00",
    "ISM Services PMI": "10:00",
    "ISM Non-Manufacturing PMI": "10:00",
    "CB Consumer Confidence": "10:00",
    "Existing Home Sales": "10:00",
    "FOMC Statement": "14:00",
    "Federal Funds Rate": "14:00",
    "Crude Oil Inventories": "10:30",
    "10-Year Note Auction": "13:00",
    "30y Bond Auction": "13:00",
}


# ── Window bounds (ET): Mon of prev week → Sun of current week + 4 ──────────
def get_window_bounds() -> tuple[date, date]:
    ET = ZoneInfo("America/New_York")
    today = datetime.now(ET).date()
    wd = today.weekday()                                  # Mon=0 .. Sun=6
    monday_this_week = today - timedelta(days=wd)
    window_start = monday_this_week - timedelta(days=7)   # prev Monday
    window_end   = monday_this_week + timedelta(days=4 * 7 + 6)  # +4 weeks, Sunday
    return window_start, window_end


def strip_leading_zero(t: str) -> str:
    """'08:30' → '8:30', '14:00' stays '14:00'."""
    if not t:
        return t
    if t.startswith("0"):
        return t[1:]
    return t


def load_events(src: Path, window_start: date, window_end: date) -> list[dict]:
    """Read a CSV, filter to window, return raw rows."""
    if not src.exists():
        return []
    rows: list[dict] = []
    with src.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            try:
                d = date.fromisoformat(r["date"].strip())
            except (KeyError, ValueError):
                continue
            if not (window_start <= d <= window_end):
                continue
            rows.append({
                "date":   d,
                "time":   r.get("time", "").strip(),
                "impact": r.get("impact", "").strip().capitalize(),
                "event":  r.get("event", "").strip(),
            })
    return rows


def main() -> None:
    if not SRC_FULL.exists() and not SRC_UPCOMING.exists():
        print(f"FATAL: no source CSV found ({SRC_FULL} / {SRC_UPCOMING})", file=sys.stderr)
        sys.exit(1)

    window_start, window_end = get_window_bounds()

    # Merge both sources (full master + upcoming refresh). De-dupe on (date, event).
    rows  = load_events(SRC_FULL, window_start, window_end)
    rows += load_events(SRC_UPCOMING, window_start, window_end)

    events: list[dict] = []
    seen: set[tuple] = set()

    for r in rows:
        raw_event = r["event"]
        if not raw_event:
            continue

        norm_event = EVENT_NORMALIZE.get(raw_event, raw_event)

        # FF red folder whitelist: drop Crude Oil/Bond/PMI medium/etc.
        if norm_event not in BACKTESTED_EVENTS:
            continue

        # Canonical ET time override (handles UTC entries in master CSV)
        canonical_t = CANONICAL_TIME.get(norm_event) or CANONICAL_TIME.get(raw_event)
        time_str = canonical_t if canonical_t else strip_leading_zero(r["time"])

        # Dedupe: same date+event collapses regardless of time source
        key = (r["date"].isoformat(), norm_event)
        if key in seen:
            continue
        seen.add(key)

        day_label = r["date"].strftime("%a %-d")  # e.g. "Wed 20"

        events.append({
            "date":    r["date"].isoformat(),
            "day":     day_label,
            "time":    time_str,
            "event":   norm_event,
            "imp":     r["impact"] or "High",
            "weekday": r["date"].weekday(),  # Mon=0 .. Sun=6
        })

    # Sort by (date, hour, minute)
    def sort_key(e: dict) -> tuple:
        h, m = e["time"].split(":") if ":" in e["time"] else ("0", "0")
        return (e["date"], int(h), int(m))

    events.sort(key=sort_key)

    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    output = {
        "generated_at": now_utc,
        "window_start": window_start.isoformat(),
        "window_end":   window_end.isoformat(),
        "source":       "news_red_folder_full.csv + upcoming_events.csv",
        "events":       events,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"OK — {len(events)} events written to {OUTPUT}")
    print(f"     Window {window_start} → {window_end}  ({(window_end - window_start).days + 1} days)")


if __name__ == "__main__":
    main()
