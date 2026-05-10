## CPI IFVG + ES SMT — 8:30 News Model

ICT post-news IFVG entry on 8:30 ET CPI releases, with optional **ES SMT confirmation filter**. Window: 2019-05 → 2026-05 (7 years), official US Bureau of Labor Statistics release dates, **MNQ.c.0 continuous (Databento) — native micro-futures, 7-year history**.

### Cross-validate on TradingView

Open `MNQ1!` 1-minute on TradingView and load the Pine `news_cpi_ifvg_strategy` (in `~/pine-indicators/ict/`). MNQ1! ticker has matching 7-year history on TV — backtest results should align with the table below.

### Setup Logic

1. **Pre-news range** = high/low of the 5 bars before 8:30 ET (the box price was trading in just before the news drops)
2. **Sweep** = first 1-minute bar between 8:30 and 11:00 ET where price pokes ABOVE the pre-news high, or BELOW the pre-news low. This is the initial spike reaction to the news, grabbing liquidity (stops) from one side of the pre-news box.
3. **Side** = trade in the OPPOSITE direction of the sweep. Sweep UP (high taken) → SHORT setup. Sweep DOWN (low taken) → LONG setup. The logic: the first move is usually a fakeout, the real move is the reverse.
4. **Entry** = bar where price closes back INSIDE the pre-news range (Inversion FVG break — confirms the fakeout). Fill at the close of that bar.
5. **SL** = 1 tick beyond the sweep extreme (for SHORT, 1 tick above the sweep high; for LONG, 1 tick below the sweep low)
6. **TP** = opposite side of the pre-news range (SHORT targets pre-low, LONG targets pre-high)

### ES SMT Confirmation Filter

Take the trade **only if ES (E-mini S&P 500) also reaches its target side** during the same 8:30→11:00 window.

- NQ SHORT (sweep UP) → ES must sweep its pre-news low at some point
- NQ LONG (sweep DOWN) → ES must sweep its pre-news high

If ES doesn't follow → fakeout, skip the trade.

### Year-by-Year — Strategy Performance (MNQ 7y)

| Year | Trades | W | L | WR | PF | Net (MNQ pts) |
|------|--------|---|---|-----|------|---------------|
| **Baseline (no SMT filter)** |  |  |  |  |  |  |
| 2019 | 4  | 3 | 1 | 75% | 4.43 | +12.0  |
| 2020 | 4  | 1 | 3 | 25% | 0.83 | -1.2   |
| 2021 | 4  | 2 | 2 | 50% | 0.33 | -65.0  |
| 2022 | 9  | 4 | 5 | 44% | 1.33 | +46.0  |
| 2023 | 10 | 4 | 6 | 40% | 1.25 | +32.2  |
| 2024 | 11 | 5 | 6 | 45% | 1.43 | +67.5  |
| 2025 | 11 | 5 | 6 | 45% | 1.82 | +138.5 |
| 2026 | 5  | 2 | 3 | 40% | 1.11 | +9.5   |
| **Total** | **58** | **26** | **32** | **45%** | **1.30** | **+239.5** |
| **+ ES SMT confirmation** |  |  |  |  |  |  |
| 2019 | 3  | 3 | 0 | 100% | —    | +15.5  |
| 2020 | 4  | 1 | 3 | 25%  | 0.83 | -1.2   |
| 2021 | 2  | 1 | 1 | 50%  | 0.77 | -6.5   |
| 2022 | 7  | 4 | 3 | 57%  | 4.28 | +141.8 |
| 2023 | 9  | 4 | 5 | 44%  | 1.40 | +45.8  |
| 2024 | 9  | 5 | 4 | 56%  | 2.94 | +149.0 |
| 2025 | 9  | 4 | 5 | 44%  | 2.09 | +93.0  |
| 2026 | 5  | 2 | 3 | 40%  | 1.11 | +9.5   |
| **Total** | **48** | **24** | **24** | **50%** | **2.00** | **+446.8** |

The ES SMT filter cuts **10 setups** — PF moves from 1.30 → 2.00, net from +239.5 to +446.8 MNQ points across 58 CPI events over 7 years.

### Why It Works

CPI is a high-correlation event — NQ and ES move in lockstep. When only NQ takes the level and ES refuses, the move is a one-sided liquidity grab on NQ alone. ES not following = no broad index momentum = fakeout high probability.

### Disclaimer

Backtest on MNQ.c.0 continuous (Databento). Results vary by data feed (TV continuous adjustment differs from Databento). Sample size 58 trades is statistically thin; treat as indicative not predictive. AI-assisted analysis — not financial advice.

<div data-explorer="cpi-ifvg-smt"></div>
