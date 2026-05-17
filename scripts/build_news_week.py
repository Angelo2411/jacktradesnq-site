#!/usr/bin/env python3
"""
Generate public/data/news-week.json from ~/jtnq-hub/data/upcoming_events.csv.
Covers the current ISO Mon-Fri week (ET). If run on weekend, snaps to next Mon-Fri.
No external deps — stdlib only.
"""
import csv
import json
import sys
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

def main() -> None:
    if not CSV_SOURCE.exists():
        print(f"ERROR: source CSV not found: {CSV_SOURCE}", file=sys.stderr)
        sys.exit(1)

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
