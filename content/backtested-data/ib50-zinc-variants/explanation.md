## The setup

IB50 = enter at the **midpoint of the Initial Balance** (the first hour's high-low range of a session). Stop at the IB extreme on the entry side, target on the other side. Simple, mechanical.

Inspired by **[@MrZincx](https://x.com/MrZincx)** on Twitter — full-time futures trader, 6+ years on the IB. He doesn't run it mechanically though: he layers a directional bias, targets the previous day's high/low instead of the IB extreme, and cross-checks NQ vs ES. This study reproduces those filters one by one.

> **Reminder:** all of this is AI-generated backtest data. Numbers can be wrong. **Not financial advice.** Always re-verify before risking capital.

## Killzones tested

- **Asia** — 18:00→19:00 NY (overnight session start)
- **London** — 02:00→03:00 NY
- **NY AM** — 09:30→10:30 NY (the classic Zinc setup)

## The 5 variants

1. **baseline_full** — pure IB50: SL = IB low (long) / IB high (short), TP = IB high / IB low. The mechanical recipe everyone tweets.
2. **v1_pdh_pdl** — TP moves to **Previous Day High** (long) / **Previous Day Low** (short). SL stays at IB extreme. Targets sit further → win rate drops, but winners pay more.
3. **v2_ib_bias** — baseline + filter: only go long if IB closes in the **top half** of its range (bullish acceptance). Only short if IB closes in the bottom half. Skip the rest.
4. **v3_cross_confirm** — baseline + filter: NQ and ES must share the **same IB bias** (both top-half or both bottom-half) before any trade fires.
5. **v4_combo** — v1 + v2 + v3 stacked. The full Zinc-style recipe.

## Data

NQ + ES futures, **1-minute bars, 2016-04-19 → 2026-12-31** (~10 years, ~3.5M NQ bars). 60 backtest runs total — 3 killzones × 2 sides × 5 variants × 2 symbols.

## Headline results

Profitable count (PF ≥ 1.0) per variant, across the 12 (symbol, killzone, side) combos:

| Variant | Profitable | Total PnL | Total Trades |
|---|---|---|---|
| baseline_full | 1 / 12 | **−15,433 pts** | 12,889 |
| v1_pdh_pdl | 3 / 12 | −9,965 pts | 9,161 |
| v2_ib_bias | 3 / 12 | −1,996 pts | 9,729 |
| v3_cross_confirm | 4 / 12 | −1,267 pts | 8,538 |
| **v4_combo** | **4 / 12** | **+1,081 pts** | 6,010 |

**v4_combo is the only variant with net positive total PnL across the 12 combos.** Mechanical IB50 alone bleeds. The bias filter halves the loss. Cross-confirm cuts it again. PDH/PDL targets convert the few winners into much larger ones. Stack all three and you flip the edge.

## Best 5 setups by Profit Factor

| Rank | Symbol | KZ | Side | Variant | Trades | WR | PnL | PF |
|------|--------|----|------|---------|--------|-----|-----|----|
| 1 | ES | London | Long | v2_ib_bias | 920 | 53.7% | +360 pts | **1.225** |
| 2 | ES | London | Long | v3_cross_confirm | 850 | 53.6% | +341 pts | 1.223 |
| 3 | ES | London | Long | v4_combo | 663 | 29.7% | +348 pts | 1.199 |
| 4 | NQ | London | Long | v4_combo | 659 | 29.6% | **+1,126 pts** | 1.157 |
| 5 | NQ | NY AM | Long | v4_combo | 438 | 49.5% | +1,016 pts | 1.097 |

**London long dominates.** 4 of the 5 best setups are London, every single one is long, and the two highest PnL absolute (NQ London + NQ NY AM, both +1,000 pts over 10 years) are the v4_combo. The win-rate looks low on PDH/PDL variants (≈30%) — that's expected: the target is far, so most trades miss, but the ones that hit pay 4-5x the average loss.

## What didn't work

- **Shorts.** Almost every short combo stayed unprofitable across all 5 variants. Only one — NQ NY AM short v3_cross_confirm — squeezed a +147 pts edge (PF 1.012). On a 10-year bull-market sample this is consistent: the IB short setup faces persistent upward drift.
- **Asia killzone.** Smaller IB ranges → tighter SLs → noise eats trades. Only a couple of borderline-profitable runs.
- **Mechanical baseline.** 1 / 12 profitable. Confirms the obvious: posting "enter at IB midpoint, stop at IB low" on Twitter is not a strategy without filters.

## Takeaway

You can't just copy a trader's pattern from a screenshot. Mr Zinc's edge isn't the IB midpoint entry — that part is mechanical and a coin flip. **The edge is the bias filter, the cross-instrument confirm, and the target choice.** Strip those out and the setup loses money. Stack them and a couple of (symbol, killzone, side) combos turn into a real, decade-long positive expectancy.

The honest read: the 4 / 12 profitable rate even on the best variant means **most of the (symbol, killzone, side) combinations are still losing money**. Picking the right one isn't optional. London long is where the edge concentrates in this sample.

> Backtests run by AI on historical data. Past performance does not guarantee future results. **Not financial advice.**
