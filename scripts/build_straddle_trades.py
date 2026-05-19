#!/usr/bin/env python3
"""
Per-trade Straddle backtest output for hub chart.

For each (event, X, Y) combo × each date in <event>_event_bars.json:
  - entry_price = close of m=-1 bar
  - buy_stop = entry + X ; sell_stop = entry - X
  - tp_buy   = buy_stop + Y ; tp_sell  = sell_stop - Y
  - OCO trigger at m=0 release bar (heuristic for same-bar ambiguity)
  - Track TP / expiry in last bar
  - Output {date, entry_price, X, Y, buy_stop, sell_stop, tp_buy, tp_sell,
            filled_side, fill_ts, fill_price, exit_ts, exit_price, pnl,
            outcome: 'no_fill'|'tp_hit'|'expired_long_win'|'expired_long_loss'|'expired_short_win'|'expired_short_loss'}

Outputs:
  public/data/cpi-straddle-trades.json
  public/data/nfp-straddle-trades.json

Each file shape:
  { event, generated_at, combos: [{X, Y, trades: [trade, ...]}, ...] }

Run with: /Users/angelo/monfxreplay-python/.venv/bin/python scripts/build_straddle_trades.py
"""
from __future__ import annotations
import json
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

OUT_DIR = Path("/Users/angelo/jtnq-hub-v3/public/data")

CPI_COMBOS = [(X, Y) for X in [25, 30, 35, 40] for Y in [15, 20, 25]]
NFP_COMBOS = [(X, Y) for X in [45, 60, 80, 100, 120, 150] for Y in [20, 30, 50, 75]]


def simulate_trade(event_entry: dict, X: int, Y: int) -> dict | None:
    """Return per-trade record for one event × one combo."""
    bars = event_entry.get("bars") or []
    entry_price = event_entry.get("entry_price")
    t0_iso = event_entry.get("t0_iso")
    if not bars or entry_price is None or not t0_iso:
        return None

    t0 = datetime.fromisoformat(t0_iso.replace("Z", "+00:00"))

    buy_stop = entry_price + X
    sell_stop = entry_price - X
    tp_buy = buy_stop + Y
    tp_sell = sell_stop - Y

    def m_to_iso(m: int) -> str:
        return (t0 + timedelta(minutes=m)).isoformat()

    release_idx = next((i for i, b in enumerate(bars) if b.get("m") == 0), None)
    if release_idx is None:
        return None

    filled = None
    fill_price = None
    fill_ts = None
    b = bars[release_idx]

    long_trig = b["h"] >= buy_stop
    short_trig = b["l"] <= sell_stop
    if long_trig and short_trig:
        # OHLC heuristic: smaller distance from open = reached first
        if abs(b["o"] - b["h"]) < abs(b["o"] - b["l"]):
            short_trig = False
        else:
            long_trig = False
    if long_trig:
        filled = "long"
        fill_price = buy_stop
        fill_ts = m_to_iso(b["m"])
    elif short_trig:
        filled = "short"
        fill_price = sell_stop
        fill_ts = m_to_iso(b["m"])

    base = {
        "date": event_entry["date"],
        "ts": t0.isoformat(),
        "entry_price": round(entry_price, 2),
        "X": X,
        "Y": Y,
        "buy_stop": round(buy_stop, 2),
        "sell_stop": round(sell_stop, 2),
        "tp_buy": round(tp_buy, 2),
        "tp_sell": round(tp_sell, 2),
    }

    if filled is None:
        return {
            **base,
            "filled_side": None,
            "fill_ts": None,
            "fill_price": None,
            "exit_ts": None,
            "exit_price": None,
            "pnl": 0.0,
            "outcome": "no_fill",
        }

    # Check TP on release bar itself (same-bar)
    if filled == "long" and b["h"] >= tp_buy:
        return {
            **base,
            "filled_side": "long",
            "fill_ts": fill_ts,
            "fill_price": round(fill_price, 2),
            "exit_ts": m_to_iso(b["m"]),
            "exit_price": round(tp_buy, 2),
            "pnl": float(Y),
            "outcome": "tp_hit",
        }
    if filled == "short" and b["l"] <= tp_sell:
        return {
            **base,
            "filled_side": "short",
            "fill_ts": fill_ts,
            "fill_price": round(fill_price, 2),
            "exit_ts": m_to_iso(b["m"]),
            "exit_price": round(tp_sell, 2),
            "pnl": float(Y),
            "outcome": "tp_hit",
        }

    # Scan forward bars
    for bb in bars[release_idx + 1:]:
        if filled == "long" and bb["h"] >= tp_buy:
            return {
                **base,
                "filled_side": "long",
                "fill_ts": fill_ts,
                "fill_price": round(fill_price, 2),
                "exit_ts": m_to_iso(bb["m"]),
                "exit_price": round(tp_buy, 2),
                "pnl": float(Y),
                "outcome": "tp_hit",
            }
        if filled == "short" and bb["l"] <= tp_sell:
            return {
                **base,
                "filled_side": "short",
                "fill_ts": fill_ts,
                "fill_price": round(fill_price, 2),
                "exit_ts": m_to_iso(bb["m"]),
                "exit_price": round(tp_sell, 2),
                "pnl": float(Y),
                "outcome": "tp_hit",
            }

    # Expired: filled but TP never hit → exit at last bar close
    last = bars[-1]
    last_close = last["c"]
    pnl = last_close - fill_price if filled == "long" else fill_price - last_close
    outcome = (
        "expired_long_win" if filled == "long" and pnl > 0 else
        "expired_long_loss" if filled == "long" else
        "expired_short_win" if filled == "short" and pnl > 0 else
        "expired_short_loss"
    )
    return {
        **base,
        "filled_side": filled,
        "fill_ts": fill_ts,
        "fill_price": round(fill_price, 2),
        "exit_ts": m_to_iso(last["m"]),
        "exit_price": round(last_close, 2),
        "pnl": round(pnl, 2),
        "outcome": outcome,
    }


def build_for_event(event_short: str, bars_path: Path, combos: list[tuple[int, int]], out_path: Path) -> None:
    print(f"[{event_short}] loading {bars_path.name}...")
    events = json.loads(bars_path.read_text())
    print(f"  {len(events)} dates")
    out_combos = []
    for X, Y in combos:
        trades = []
        for ev in events:
            t = simulate_trade(ev, X, Y)
            if t is not None:
                trades.append(t)
        out_combos.append({"X": X, "Y": Y, "trades": trades})
    payload = {
        "event": event_short.upper(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "combos": out_combos,
    }
    out_path.write_text(json.dumps(payload, indent=2))
    size_kb = out_path.stat().st_size // 1024
    print(f"  → {out_path} ({size_kb}KB) — {len(out_combos)} combos")


def main() -> None:
    t_start = time.time()
    build_for_event(
        "cpi",
        OUT_DIR / "cpi_event_bars.json",
        CPI_COMBOS,
        OUT_DIR / "cpi-straddle-trades.json",
    )
    build_for_event(
        "nfp",
        OUT_DIR / "nfp_event_bars.json",
        NFP_COMBOS,
        OUT_DIR / "nfp-straddle-trades.json",
    )
    print(f"\nElapsed: {time.time() - t_start:.1f}s")


if __name__ == "__main__":
    main()
