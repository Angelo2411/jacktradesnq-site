## The setup

**Globex IB** is the daily setup of **[@_Ash_Trades_](https://x.com/_Ash_Trades_)** ([Unicorn University](https://unicornuniversity.com)) and **[@VClouette](https://x.com/VClouette)** — both prop-firm traders publishing this same recipe on X. The idea: trade the **first hour of the CME Globex futures session** (the Initial Balance) as a mean-reversion / range setup, with bias derived from which extreme of the IB was set first.

> **Reminder:** all of this is AI-generated backtest data. Numbers can be wrong. **Not financial advice.** Always re-verify before risking capital.

## The rules (mechanical version, exactly as published)

- **Session** — CME Globex, opens **22:00 UTC** (≈ 17:00 CT / 18:00 ET DST). Friday + Saturday opens skipped (Globex closed weekends).
- **Initial Balance** — first **60 minutes** of Globex (22:00 → 23:00 UTC). IB high and IB low captured at 23:00 UTC.
- **Bias** — which extreme set first?
  - **Low timestamp < High timestamp → bias LONG**
  - **High timestamp < Low timestamp → bias SHORT**
  - Same minute (rare) → session skipped.
- **Entry** — limit order posted at 23:00 UTC.
  - **IB50** (the principal variant): entry at the IB midpoint, `(IB_high + IB_low) / 2`. R:R = **1:1**.
  - **IB25** (more selective, juicier): entry at 25% retrace from the entry side — `IB_low + 0.25 × range` for long, `IB_high − 0.25 × range` for short. R:R = **1:3**.
- **SL / TP** — SL = opposite IB extreme. TP = same-side IB extreme. R:R is fixed by construction.
- **Expiry** — limit cancelled if not filled by **14:30 UTC next calendar day** (= 9:30 ET, RTH NY open).
- **One trade per Globex session** — no re-entry after stop.

Ash also describes a discretionary overlay: HTF bias (Daily / H1 +FVG), 15M Key Level, SMT divergence between NQ and ES, and a 1M Breaker + FVG entry trigger ("Unicorn Model"). **None of those filters are in this baseline** — the goal here is to backtest the published mechanical recipe before adding judgement.

## Data

NQ continuous futures, **1-minute bars, 2016-04-19 → 2026-12-31** (~10 years, ~3.46M bars). One backtest run per variant (IB50, IB25), no parameter sweep.

## Headline results

| Metric | IB50 (1:1 R:R) | IB25 (1:3 R:R) |
|---|---|---|
| Trades | **1,554** | **1,467** |
| Wins / Losses | 746 W / 808 L | 380 W / 1,087 L |
| Win Rate | **48.0%** | **25.9%** |
| Profit Factor | **0.90** | **1.07** |
| Total PnL | **−1,265 pts** | **+587 pts** |
| Avg R per trade | **−0.04 R** | **+0.04 R** |
| Max Drawdown | −1,591 pts | −666 pts |
| Avg MAE / MFE | 11.9 / 10.8 pts | 7.5 / 10.8 pts |
| Long / Short | 783 L / 771 S | 732 L / 735 S |

**IB50 is essentially break-even.** With a 1:1 R:R you need WR > 50% to be profitable. The strategy reaches 48.0% — close, but the spread costs the difference.

**IB25 is marginally positive.** A 25.9% WR at 1:3 R:R is the math of the variant (break-even = 25%). The +587 pts over 10 years is real but extremely thin (≈ +59 pts/year on NQ) and any added friction (commissions, slippage on a limit during volatile retracements, missed fills) erases it.

## Why the mechanical version is borderline

Two structural reasons jump out from the trade log:

1. **Bias by first-extreme is a coin flip on noisy IBs.** When the IB is tight and indecisive, the "low first / high first" determination is set by a single noise wick. The bias is then random and the entry is just a midpoint mean-reversion bet.
2. **No HTF or session context.** The strategy fires every Sun→Thu Globex regardless of NFP / FOMC / CPI / overnight gap-and-go. Ash discretionary skips at least half of these days based on his daily recap posts.

The IB25 variant survives only because the 1:3 R:R is forgiving — even a 27% WR pushes PF above 1.0. But the edge is too thin to be useful as-is.

## What this study is and isn't

**It is** — a fair, mechanical backtest of the rules Ash_Trades and VClouette publish daily on X. It's the "is the recipe alone enough?" question, answered: barely, for IB25 only.

**It isn't** — a verdict on the traders. Ash runs this as a **discretionary process** with a daily checklist (HTF bias + 15M Key Level + SMT + 1M Breaker/FVG/CSD). The edge, if there is one, lives in those filters — not in the mechanical "buy the IB midpoint" baseline.

## Next steps

Before claiming the strategy is dead, the natural follow-up tests are:

- **HTF bias filter**: only take longs when Daily is in a Daily bullish FVG (and vice versa for shorts).
- **News skip**: drop sessions with high-impact red folder news in the next 16h post-IB.
- **SMT confirmation**: only fire if NQ and ES disagree on the IB extremes (proxy for divergence).
- **Time-of-bias filter**: drop sessions where the "first extreme" is set in the first 5 minutes (= probably noise, not directional commitment).

Each would be a separate, isolated test — adding one filter at a time, comparing the delta. That is **not** what this study did.

## Methodology

- Backtest engine: monfxreplay-python (polars + 1-min parquets, ~16s per 10-year run).
- IB window detected by UTC bar hour (22:00 → 23:00 UTC, fixed — DST shifts ignored, matching how Globex actually keeps its 22:00 UTC anchor in standard time and 23:00 UTC during DST… we use the standard 22:00 UTC anchor across the full 10y window for consistency).
- Bias resolved by comparing the timestamps of the bar that printed IB_high vs IB_low.
- One pending limit at a time. Position closes intrabar on first SL or TP touch.
- Live numbers + last-100 trades + IB50/IB25 toggle on the [research dashboard](https://www.monfxreplay.com/backtested-data/globex-ib-ash) (monfxreplay).

**This is an AI-assisted mechanical baseline. It is not financial advice. Backtest yourself before risking capital.**
