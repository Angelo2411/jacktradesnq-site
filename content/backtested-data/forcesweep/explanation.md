## The setup

**ForceSweep** is the daily-streamed strategy of **[@SithHaters](https://x.com/SithHaters)** ([YouTube](https://www.youtube.com/@sithtrader/videos)) — a 10-min Opening Range Break on the **CME Globex** futures session, with a session-anchored VWAP retest entry. He runs it live every day at 5pm CT, mostly on NQ.

> **Reminder:** all of this is AI-generated backtest data. Numbers can be wrong. **Not financial advice.** Always re-verify before risking capital.

## The rules (mechanical version, exactly as published)

- **Session** — CME Globex, opens 18:00 ET (= 17:00 CT = 22:00 UTC), Sun → Thu. Friday Globex is closed; sessions are skipped.
- **Opening Range** — high and low of the **first 10 minutes** after the open.
- **Break** — any tick beyond the ORB high or low. **First break wins**, the opposite is ignored. Double-break (whipsaw) sessions are skipped.
- **Entry** — limit order at the **session-anchored VWAP** (anchored at the Globex open, re-priced each bar while pending).
- **Target** — session **HOD** (long) or **LOD** (short) at the moment of break. Locked once.
- **Stop** — symmetric: same distance as the target (**1:1 RR**).
- **Expiry** — pending limit cancelled if not filled by **09:30 ET next calendar day** (RTH open).
- **One trade per Globex session** — no re-entry after stop.

The author also describes a **discretionary post-mortem filter** (skip the trade if there's a gap fill + ATR spike + entry > 2h after the open) and an optional CVD/OrderFlow confirmation. **Neither is in this baseline** — the goal here is to backtest the published mechanical recipe before adding judgement.

## Data

NQ continuous futures, **1-minute bars, 2016-04-19 → 2026-12-31** (~10 years, ~3.46M bars). One backtest run, one set of rules, no parameter sweep.

## Headline results

| Metric | Value |
|---|---|
| Trades | **4,000** |
| Wins / Losses | 1,318 W / 2,682 L |
| Win Rate | **33.0%** |
| Profit Factor | **0.74** |
| Total PnL | **−5,300 pts** |
| Avg R per trade | **−0.34 R** |
| Max Drawdown | **−6,832 pts** |
| Avg MAE / MFE | 5.6 / 5.5 pts |
| Long / Short | 2,454 L / 1,546 S |

**The mechanical baseline is negative-expectancy.** Win rate sits at exactly the level where a 1:1 RR breaks even mathematically (50%) — except it doesn't reach 50%. With only 33% winners, the loser side wins.

## Why the mechanical version doesn't work

A few mechanical reasons jump out from the trade log:

1. **VWAP retest fills are unconditional.** The strategy posts a limit at VWAP regardless of how price got there. Many fills happen during sharp counter-trend pullbacks where the original break was a fakeout — by the time VWAP is tagged, momentum has already flipped against the bias.
2. **HOD/LOD-at-break locks the target before price has built structure.** When the break happens on the very first bar after the ORB, the "HOD" is essentially the break-bar high — only a few points beyond ORB. That makes the target tiny and the SL tiny, so a single noise wick stops the trade.
3. **No discretionary skip filter.** The author himself says he avoids trades where price is "gunning for a gap fill" or where the entry fires more than ~2 hours after the open. Those days bleed in this baseline.
4. **First break wins is too greedy.** Roughly half the sessions break one side of the ORB, retrace, then break the other side — the strategy commits early to a direction that gets invalidated minutes later.

## What this study is and isn't

**It is** — a fair, mechanical backtest of the rules SithTrader has published on X across 22 daily live streams. It's the "is the recipe alone enough?" question, answered. It isn't.

**It isn't** — a verdict on the trader. SithTrader runs this discretionary every day with manual filters (skip filters, CVD confirmation, gap-fill awareness) that are extremely hard to encode in a deterministic backtest. The edge, if there is one, lives in those decisions — not in the mechanical retest itself.

## Next steps

Before claiming the strategy is dead, the natural follow-up tests are:

- **Skip-filter v1**: drop sessions where the break happens > 90 min after the open OR where price is closer to a recent gap than to VWAP.
- **ATR cap**: skip sessions where ORB range > 1.5x the 20-day median (Sith's "vol exploding without retest" condition).
- **Tighten target**: instead of HOD/LOD-at-break, use HOD/LOD-at-fill. Often the trade waits 30-60 min for VWAP retest, and the session has built more range by then.
- **News filter**: exclude Globex sessions with overnight high-impact releases.

Each of these would be a separate, isolated test — adding one filter at a time, comparing the delta. That is **not** what this study did.

## Methodology

- Backtest engine: monfxreplay-python (polars + 1-min parquets, 9.4s per 10-year run).
- VWAP: cumulative `(typical × volume) / volume` from the 18:00 ET bar onwards.
- Limit re-pricing: every bar while pending, with SL/TP locked from the break-bar geometry.
- One pending limit at a time (engine OCO semantics). Position closes intrabar on first SL or TP touch.
- Live numbers + last-100 trades table on the [research dashboard](https://www.monfxreplay.com/backtested-data/forcesweep) (monfxreplay).

**This is an AI-assisted mechanical baseline. It is not financial advice. Backtest yourself before risking capital.**
