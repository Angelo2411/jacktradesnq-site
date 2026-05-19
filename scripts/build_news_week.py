#!/usr/bin/env python3
"""
Generate public/data/news-week.json from ~/jtnq-hub/data/upcoming_events.csv.
Covers the current ISO Mon-Fri week (ET). If run on weekend, snaps to next Mon-Fri.
No external deps — stdlib only.
"""
import csv
import json
import os
import sys
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

# ── Paths ────────────────────────────────────────────────────────────────────
CSV_SOURCE = Path("/Users/angelo/jtnq-hub/data/upcoming_events.csv")
OUTPUT     = Path("/Users/angelo/jtnq-hub-v3/public/data/news-week.json")

# ── Normalisation des noms d'événements ──────────────────────────────────────
EVENT_NORMALIZE = {
    "Core CPI":              "CPI",
    "Non-Farm Payrolls":     "NFP",
    "Initial Jobless Claims":"Jobless Claims",
    "Core Retail Sales":     "Retail Sales",
    "FOMC":                  "FOMC Statement",
}

# ── Canonical timing whitelist (ET, leading-zero stripped) ───────────────────
CANONICAL_TIME = {
    # 08:30 group
    "CPI": "8:30", "Core CPI": "8:30",
    "PPI": "8:30", "Core PPI": "8:30",
    "Retail Sales": "8:30", "Core Retail Sales": "8:30",
    "Jobless Claims": "8:30", "Initial Jobless Claims": "8:30",
    "NFP": "8:30", "Non-Farm Payrolls": "8:30",
    "PCE": "8:30", "Core PCE": "8:30",
    "Empire State Manufacturing Index": "8:30",
    "Philadelphia Fed Manufacturing Index": "8:30",
    "Employment Cost Index": "8:30",
    "GDP": "8:30",
    # 09:45 group
    "S&P Global Manufacturing PMI": "9:45",
    "S&P Global Services PMI": "9:45",
    "S&P Global Composite PMI": "9:45",
    # 10:00 group
    "ISM Manufacturing PMI": "10:00",
    "ISM Services PMI": "10:00",
    "ISM Non-Manufacturing PMI": "10:00",
    "CB Consumer Confidence": "10:00",
    # 14:00 group
    "FOMC Statement": "14:00",
    "FOMC": "14:00",
    "Federal Funds Rate": "14:00",
    # 10:30 group
    "Crude Oil Inventories": "10:30",
}

CANONICAL_WEEKDAY = {
    "NFP": 4,                  # Friday (0=Mon)
    "Non-Farm Payrolls": 4,
    "Jobless Claims": 3,       # Thursday
    "Initial Jobless Claims": 3,
    "FOMC Statement": 2,       # Wednesday
    "FOMC": 2,
}

# ── Compute Mon-Fri of current ET week ───────────────────────────────────────
def get_week_bounds() -> tuple[date, date]:
    ET = ZoneInfo("America/New_York")
    today = datetime.now(ET).date()
    # Monday = weekday 0; Sat=5, Sun=6
    wd = today.weekday()  # Mon=0 … Sun=6
    if wd < 5:            # weekday → current week
        monday = today - timedelta(days=wd)
    else:                 # weekend → next week
        monday = today + timedelta(days=(7 - wd))
    friday = monday + timedelta(days=4)
    return monday, friday

def strip_leading_zero(t: str) -> str:
    """'08:30' → '8:30', '14:00' stays '14:00'."""
    if t.startswith("0"):
        return t[1:]
    return t

def validate_event(raw_event: str, raw_time: str, ev_date: date) -> tuple[bool, str]:
    """Check canonical time and weekday for known events. Returns (ok, reason)."""
    time_str = strip_leading_zero(raw_time.strip())

    canonical_t = CANONICAL_TIME.get(raw_event)
    if canonical_t is not None and time_str != canonical_t:
        return False, f"event '{raw_event}' has time {time_str}, canonical {canonical_t}"

    canonical_wd = CANONICAL_WEEKDAY.get(raw_event)
    if canonical_wd is not None and ev_date.weekday() != canonical_wd:
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        got = day_names[ev_date.weekday()]
        exp = day_names[canonical_wd]
        return False, f"event '{raw_event}' on {got} ({ev_date}), canonical weekday {exp}"

    return True, ""

def main() -> None:
    ET = ZoneInfo("America/New_York")

    # ── Pre-check 1: source CSV exists ───────────────────────────────────────
    if not CSV_SOURCE.exists():
        print(f"FATAL: source CSV missing: {CSV_SOURCE}", file=sys.stderr)
        sys.exit(1)

    # ── Pre-check 2: CSV not stale (> 8 days = 192h) ─────────────────────────
    # update_news_pine cron runs weekly (Sunday 22h). Give 1 extra day buffer.
    age_h = (time.time() - os.path.getmtime(CSV_SOURCE)) / 3600
    if age_h > 192:
        print(f"FATAL: source CSV stale ({age_h:.1f}h old, max 192h)", file=sys.stderr)
        sys.exit(1)

    # ── Pre-check 3: header exact ─────────────────────────────────────────────
    with open(CSV_SOURCE) as f:
        header = f.readline().strip()
    if header != "date,time,impact,event":
        print(f"FATAL: header mismatch: '{header}'", file=sys.stderr)
        sys.exit(1)

    # ── Pre-check 4: at least 3 events in next 30 days ───────────────────────
    now_et = datetime.now(ET).date()
    horizon = now_et + timedelta(days=30)
    with open(CSV_SOURCE) as f:
        all_rows = list(csv.DictReader(f))
    in_horizon = [
        r for r in all_rows
        if now_et <= datetime.strptime(r["date"], "%Y-%m-%d").date() <= horizon
    ]
    if len(in_horizon) < 3:
        print(
            f"FATAL: only {len(in_horizon)} events in next 30d — scraper likely returned empty page",
            file=sys.stderr,
        )
        sys.exit(1)

    # ── Compute week bounds ───────────────────────────────────────────────────
    monday, friday = get_week_bounds()

    events: list[dict] = []
    seen: set[tuple] = set()

    with CSV_SOURCE.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_date  = row["date"].strip()
            raw_time  = row["time"].strip()
            raw_impact= row["impact"].strip()
            raw_event = row["event"].strip()

            # Parse date
            try:
                ev_date = date.fromisoformat(raw_date)
            except ValueError:
                continue

            # Filter to current week Mon-Fri
            if not (monday <= ev_date <= friday):
                continue

            # ── Canonical timing + weekday check ─────────────────────────────
            ok, reason = validate_event(raw_event, raw_time, ev_date)
            if not ok:
                print(f"FATAL: {reason}", file=sys.stderr)
                sys.exit(1)

            # Normalize event name
            norm_event = EVENT_NORMALIZE.get(raw_event, raw_event)

            # Capitalize impact
            impact = raw_impact.capitalize()

            # day label: "Wed 20"  (%-d = no leading zero on Linux/Mac)
            day_label = ev_date.strftime("%a %-d")

            # Strip leading zero from time
            time_str = strip_leading_zero(raw_time)

            # Dedupe
            key = (day_label, time_str, norm_event)
            if key in seen:
                continue
            seen.add(key)

            events.append({
                "day":   day_label,
                "time":  time_str,
                "event": norm_event,
                "imp":   impact,
            })

    # Sort: by ISO date asc then time asc
    def sort_key(e: dict) -> tuple:
        # Reconstruct sortable date from day label (day number) + week_start
        day_num = int(e["day"].split(" ")[1])
        ev_date = date(monday.year, monday.month, 1)
        # Find the date whose day == day_num within Mon-Fri range
        for d in (monday + timedelta(i) for i in range(5)):
            if d.day == day_num:
                ev_date = d
                break
        time_parts = e["time"].split(":")
        return (ev_date.isoformat(), int(time_parts[0]), int(time_parts[1]))

    events.sort(key=sort_key)

    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    output = {
        "generated_at": now_utc,
        "week_start":   monday.isoformat(),
        "week_end":     friday.isoformat(),
        "source":       "investing.com via fetch_investing_calendar.py",
        "events":       events,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"OK — {len(events)} events written to {OUTPUT}")
    print(f"     Week {monday} → {friday}")

if __name__ == "__main__":
    main()
