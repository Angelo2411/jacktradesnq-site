"""News 8:30 ET IFVG — V2 fixed engine.

Fixes vs V1:
1. DST-aware: 8:30 ET → UTC computed via zoneinfo (handles 12:30/13:30 UTC switch)
2. Dedup: 1 event per (date, ET_time)
3. No sweep cap: sweep can happen anywhere in [t0, 11:00 ET]
4. Entry at FVG break (not retest)
5. No silent drop

Output: stats per event_type + per year + globals.
"""
from __future__ import annotations
import csv
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone, time
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.dirname(__file__))
from data import load_bars

NEWS_CSV = os.path.expanduser("~/monfxreplay/data/news_red_folder_clean.csv")
ET = ZoneInfo("America/New_York")
TICK = 0.25
PRE_LOOKBACK_MIN = 5
TIMEOUT_SWEEP_HOUR_ET = 11   # if no sweep by 11:00 ET → skip
TIMEOUT_RESOLVE_HOUR_ET = 16  # if no SL/TP hit by 16:00 ET → timeout exit

# Event taxonomy: priority order for dedup (highest first)
EVENT_PRIORITY = [
    ("NFP", ["nonfarm", "non-farm", "nfp"]),
    ("CPI", ["cpi"]),
    ("PPI", ["ppi", "producer price"]),
    ("FOMC", ["fomc", "federal funds", "interest rate"]),
    ("PCE", ["pce"]),
    ("GDP", ["gdp"]),
    ("RetailSales", ["retail sales"]),
    ("CoreRetailSales", ["core retail"]),
    ("ISM", ["ism"]),
    ("EmpireState", ["empire state"]),
    ("UnemploymentRate", ["unemployment rate"]),
    ("AvgHourlyEarnings", ["average hourly", "avg hourly"]),
    ("JoblessClaims", ["initial jobless", "jobless claims"]),
]


def classify(event_str: str) -> str:
    s = event_str.lower()
    for label, keys in EVENT_PRIORITY:
        if any(k in s for k in keys):
            return label
    return "Other"


def event_priority_rank(label: str) -> int:
    for i, (l, _) in enumerate(EVENT_PRIORITY):
        if l == label:
            return i
    return 999


def load_830_events() -> list[dict]:
    """Load all High-impact events that release at 8:30 ET (handles DST automatically).
    Dedup by (date, ET time): keep highest-priority event_type when multiple.
    """
    by_key: dict[tuple, dict] = {}
    with open(NEWS_CSV, newline="") as f:
        reader = csv.DictReader(f)
        for r in reader:
            if r.get("impact", "").strip() != "High":
                continue
            time_str = r.get("time", "").strip()
            if time_str not in ("12:30", "13:30"):
                continue
            date_str = r.get("date", "").strip()
            try:
                hh, mm = time_str.split(":")
                naive_utc = datetime(
                    int(date_str[:4]), int(date_str[5:7]), int(date_str[8:10]),
                    int(hh), int(mm), tzinfo=timezone.utc
                )
            except Exception:
                continue
            # Convert to ET to verify it's 8:30 ET
            et_dt = naive_utc.astimezone(ET)
            if et_dt.time() != time(8, 30):
                continue  # wrong time after DST adjust
            label = classify(r["event"].strip())
            key = (date_str, time_str)
            if key in by_key:
                # Keep higher priority event_type
                if event_priority_rank(label) < event_priority_rank(by_key[key]["event_type"]):
                    by_key[key].update({"event_type": label, "event_raw": r["event"].strip()})
                continue
            by_key[key] = {
                "date": date_str,
                "t0_utc": int(naive_utc.timestamp()),
                "et_date": et_dt.strftime("%Y-%m-%d"),
                "event_type": label,
                "event_raw": r["event"].strip(),
            }
    out = sorted(by_key.values(), key=lambda x: x["t0_utc"])
    print(f"[load] {len(out)} unique 8:30 ET events (dedup by timestamp)", file=sys.stderr)
    return out


def find_3bar_fvg(a, b, c, direction: str):
    """Detect 3-bar FVG.
    direction='UP' (sweep UP context, track BULLISH FVG to be broken DOWN later):
      bullish FVG = c.low > a.high → zone [a.high, c.low]
    direction='DOWN' → bearish FVG: c.high < a.low → zone [c.high, a.low]
    """
    if direction == "UP":
        if c["low"] > a["high"]:
            return {"zone_low": a["high"], "zone_high": c["low"], "break_level": a["high"]}
    else:
        if c["high"] < a["low"]:
            return {"zone_low": c["high"], "zone_high": a["low"], "break_level": a["low"]}
    return None


def process_event(ev: dict, bars_idx: dict[int, dict]) -> dict:
    t0 = ev["t0_utc"]
    et_date = ev["et_date"]
    out = {
        "date": ev["date"],
        "et_date": et_date,
        "event_type": ev["event_type"],
        "t0_utc": t0,
        "year": et_date[:4],
    }
    # Pre-news 5 bars
    pre_bars = []
    for i in range(PRE_LOOKBACK_MIN, 0, -1):
        b = bars_idx.get(t0 - i * 60)
        if b is not None:
            pre_bars.append(b)
    if len(pre_bars) < 3:
        out["result"] = "SKIP_NO_PRE"; return out
    pre_high = max(b["high"] for b in pre_bars)
    pre_low = min(b["low"] for b in pre_bars)
    out["pre_high"] = pre_high
    out["pre_low"] = pre_low

    # Sweep deadline = 11:00 ET same day → UTC
    deadline_et = datetime.combine(
        datetime.strptime(et_date, "%Y-%m-%d").date(),
        time(TIMEOUT_SWEEP_HOUR_ET, 0),
        tzinfo=ET,
    )
    sweep_deadline_ts = int(deadline_et.timestamp())
    resolve_deadline_ts = int(deadline_et.replace(hour=TIMEOUT_RESOLVE_HOUR_ET).timestamp())

    # Find first sweep wick (any bar in [t0, sweep_deadline])
    sweep_dir = None
    sweep_price = None
    sweep_ts = None
    cur = t0
    while cur <= sweep_deadline_ts:
        b = bars_idx.get(cur)
        if b is not None:
            up = b["high"] > pre_high
            dn = b["low"] < pre_low
            if up and dn:
                # Both in same bar: pick the larger excursion (V1 convention preserved)
                if (b["high"] - pre_high) >= (pre_low - b["low"]):
                    sweep_dir, sweep_price = "UP", b["high"]
                else:
                    sweep_dir, sweep_price = "DOWN", b["low"]
                sweep_ts = cur
                break
            if up:
                sweep_dir, sweep_price, sweep_ts = "UP", b["high"], cur
                break
            if dn:
                sweep_dir, sweep_price, sweep_ts = "DOWN", b["low"], cur
                break
        cur += 60
    if sweep_dir is None:
        out["result"] = "SKIP_NO_SWEEP"; return out
    out["sweep_dir"] = sweep_dir
    out["sweep_price"] = sweep_price
    out["sweep_minute_off"] = (sweep_ts - t0) // 60

    # Track FVGs from sweep_ts to sweep_deadline. Entry at FIRST FVG break (close past break_level).
    side = "SHORT" if sweep_dir == "UP" else "LONG"
    out["side"] = side
    sl = sweep_price + TICK if sweep_dir == "UP" else sweep_price - TICK
    tp = pre_low if sweep_dir == "UP" else pre_high
    out["sl"] = sl
    out["tp"] = tp

    # Build 1m bar list from sweep_ts to sweep_deadline (inclusive)
    scan_bars = []
    cur = sweep_ts
    while cur <= sweep_deadline_ts:
        b = bars_idx.get(cur)
        if b is not None:
            scan_bars.append({"ts": cur, **b})
        cur += 60
    if len(scan_bars) < 3:
        out["result"] = "SKIP_NO_SCAN_BARS"; return out

    pending_fvgs: list[dict] = []
    entry_ts = None
    entry_price = None
    ifvg_zone = None
    for n, bar in enumerate(scan_bars):
        # Check break of any pending FVG: close past break_level
        for fvg in pending_fvgs:
            if sweep_dir == "UP":
                if bar["close"] < fvg["break_level"]:
                    entry_ts = bar["ts"]
                    entry_price = bar["close"]  # entry at break bar close
                    ifvg_zone = (fvg["zone_low"], fvg["zone_high"])
                    break
            else:
                if bar["close"] > fvg["break_level"]:
                    entry_ts = bar["ts"]
                    entry_price = bar["close"]
                    ifvg_zone = (fvg["zone_low"], fvg["zone_high"])
                    break
        if entry_ts is not None:
            break
        # Form new FVG from triplet (n-2, n-1, n) if contiguous 1m
        if n >= 2:
            a = scan_bars[n - 2]; b_ = scan_bars[n - 1]; c = scan_bars[n]
            if (b_["ts"] - a["ts"] == 60) and (c["ts"] - b_["ts"] == 60):
                fvg = find_3bar_fvg(a, b_, c, sweep_dir)
                if fvg is not None:
                    pending_fvgs.append(fvg)

    if entry_ts is None:
        out["result"] = "SKIP_NO_IFVG"; return out

    # Sanity: entry must be on correct side of SL/TP
    if side == "SHORT":
        if entry_price >= sl or entry_price <= tp:
            out["result"] = "SKIP_ENTRY_OUT_OF_RANGE"; return out
    else:
        if entry_price <= sl or entry_price >= tp:
            out["result"] = "SKIP_ENTRY_OUT_OF_RANGE"; return out

    out["entry_ts"] = entry_ts
    out["entry_price"] = entry_price
    out["ifvg_zone_low"] = ifvg_zone[0]
    out["ifvg_zone_high"] = ifvg_zone[1]
    out["entry_minute_off"] = (entry_ts - t0) // 60
    out["risk_pts"] = abs(entry_price - sl)
    out["reward_pts"] = abs(entry_price - tp)
    out["rr_planned"] = out["reward_pts"] / out["risk_pts"] if out["risk_pts"] > 0 else None

    # Resolve forward
    cur = entry_ts + 60
    mfe = 0.0
    mae = 0.0
    exit_ts = None
    exit_price = None
    result = None
    while cur <= resolve_deadline_ts:
        b = bars_idx.get(cur)
        if b is not None:
            if side == "SHORT":
                # MFE = how low it went (favorable)
                fav = entry_price - b["low"]
                adv = b["high"] - entry_price
                if fav > mfe: mfe = fav
                if adv > mae: mae = adv
                hit_sl = b["high"] >= sl
                hit_tp = b["low"] <= tp
                if hit_sl and hit_tp:
                    result, exit_price = "LOSS", sl  # worst-case honest
                elif hit_sl:
                    result, exit_price = "LOSS", sl
                elif hit_tp:
                    result, exit_price = "WIN", tp
            else:
                fav = b["high"] - entry_price
                adv = entry_price - b["low"]
                if fav > mfe: mfe = fav
                if adv > mae: mae = adv
                hit_sl = b["low"] <= sl
                hit_tp = b["high"] >= tp
                if hit_sl and hit_tp:
                    result, exit_price = "LOSS", sl
                elif hit_sl:
                    result, exit_price = "LOSS", sl
                elif hit_tp:
                    result, exit_price = "WIN", tp
            if result is not None:
                exit_ts = cur
                break
        cur += 60
    if result is None:
        # Timeout exit at last available bar close ≤ resolve_deadline
        last = scan_bars_last_close(bars_idx, resolve_deadline_ts, entry_ts)
        if last is None:
            out["result"] = "SKIP_NO_RESOLVE"; return out
        exit_ts, exit_price = last
        result = "TIMEOUT"

    pts = (entry_price - exit_price) if side == "SHORT" else (exit_price - entry_price)
    out["exit_ts"] = exit_ts
    out["exit_price"] = exit_price
    out["result"] = result
    out["pts"] = round(pts, 2)
    out["mfe_pts"] = round(mfe, 2)
    out["mae_pts"] = round(mae, 2)
    out["duration_min"] = (exit_ts - entry_ts) // 60
    return out


def scan_bars_last_close(bars_idx: dict, deadline_ts: int, after_ts: int):
    cur = deadline_ts
    while cur > after_ts:
        b = bars_idx.get(cur)
        if b is not None:
            return cur, b["close"]
        cur -= 60
    return None


def aggregate(events: list[dict]) -> dict:
    res = defaultdict(int)
    pts_win = pts_loss = pts_to = 0.0
    rrs = []
    durations = []
    for e in events:
        r = e.get("result", "?")
        res[r] += 1
        if r == "WIN":
            pts_win += e["pts"]; rrs.append(e["rr_planned"] or 0); durations.append(e["duration_min"])
        elif r == "LOSS":
            pts_loss += e["pts"]; rrs.append(e["rr_planned"] or 0); durations.append(e["duration_min"])
        elif r == "TIMEOUT":
            pts_to += e["pts"]; durations.append(e["duration_min"])
    traded = res["WIN"] + res["LOSS"]
    pf = pts_win / abs(pts_loss) if pts_loss < 0 else (float("inf") if pts_win > 0 else 0)
    return {
        "total": sum(res.values()),
        "wins": res["WIN"], "losses": res["LOSS"], "timeouts": res["TIMEOUT"],
        "skip_no_pre": res["SKIP_NO_PRE"], "skip_no_sweep": res["SKIP_NO_SWEEP"],
        "skip_no_ifvg": res["SKIP_NO_IFVG"], "skip_entry_oor": res["SKIP_ENTRY_OUT_OF_RANGE"],
        "skip_no_scan": res["SKIP_NO_SCAN_BARS"], "skip_no_resolve": res["SKIP_NO_RESOLVE"],
        "traded": traded,
        "win_rate": (res["WIN"] / traded) if traded else 0,
        "profit_factor": round(pf, 3),
        "total_pts": round(pts_win + pts_loss + pts_to, 2),
        "expectancy_pts_per_traded": round((pts_win + pts_loss) / traded, 2) if traded else 0,
        "avg_pts_win": round(pts_win / res["WIN"], 2) if res["WIN"] else 0,
        "avg_pts_loss": round(pts_loss / res["LOSS"], 2) if res["LOSS"] else 0,
        "avg_rr": round(sum(rrs) / len(rrs), 2) if rrs else 0,
        "avg_duration": round(sum(durations) / len(durations), 1) if durations else 0,
    }


def main():
    events = load_830_events()
    print(f"[main] loading NQ 1m bars 2016-2026...", file=sys.stderr)
    bars_raw = load_bars("NQ", "2016-04-19", "2026-12-31")
    if hasattr(bars_raw, "iter_rows"):
        bars_idx = {int(r["ts"]): {k: r[k] for k in ("open","high","low","close")} for r in bars_raw.iter_rows(named=True)}
    else:
        bars_idx = {int(r["ts"]): {k: r[k] for k in ("open","high","low","close")} for r in bars_raw}
    print(f"[main] {len(bars_idx)} 1m bars indexed", file=sys.stderr)

    results = []
    for i, ev in enumerate(events):
        r = process_event(ev, bars_idx)
        results.append(r)
        if (i + 1) % 200 == 0:
            print(f"[run] {i+1}/{len(events)}", file=sys.stderr)

    summary = aggregate(results)
    by_event = {}
    for et in set(r["event_type"] for r in results):
        sub = [r for r in results if r["event_type"] == et]
        by_event[et] = {**aggregate(sub), "n": len(sub)}
    by_year = {}
    for yr in sorted(set(r["year"] for r in results)):
        sub = [r for r in results if r["year"] == yr]
        by_year[yr] = aggregate(sub)

    out = {
        "params": {
            "tick_size": TICK, "pre_lookback_min": PRE_LOOKBACK_MIN,
            "timeout_sweep_et": TIMEOUT_SWEEP_HOUR_ET, "timeout_resolve_et": TIMEOUT_RESOLVE_HOUR_ET,
            "entry": "FVG break (close past break_level)",
            "sl": "sweep_price ± tick", "tp": "opposite pre_news_range edge",
        },
        "summary": summary, "by_event_type": by_event, "by_year": by_year,
        "events": results,
    }
    out_path = "results/news_830_v2.json"
    os.makedirs("results", exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2, default=str)
    print(f"[done] wrote {out_path}", file=sys.stderr)
    print(json.dumps(summary, indent=2))
    print("\n=== BY EVENT_TYPE (sorted by total_pts desc) ===")
    sorted_et = sorted(by_event.items(), key=lambda x: x[1]["total_pts"], reverse=True)
    print(f"{'Event':22s} {'n':>4} {'W':>4} {'L':>4} {'T':>3} {'WR':>6} {'PF':>6} {'TotPts':>8} {'AvgW':>6} {'AvgL':>6}")
    for et, s in sorted_et:
        print(f"{et:22s} {s['n']:>4} {s['wins']:>4} {s['losses']:>4} {s['timeouts']:>3} "
              f"{s['win_rate']:>6.2%} {s['profit_factor']:>6.2f} {s['total_pts']:>+8.1f} "
              f"{s['avg_pts_win']:>6.1f} {s['avg_pts_loss']:>6.1f}")


if __name__ == "__main__":
    main()
