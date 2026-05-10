## 8:30 News Model — NFP IFVG + ES SMT

ICT post-news IFVG entry on the 8:30 ET NFP releases, with optional **ES SMT confirmation filter**. Window: 2019-05 → 2026-05 (7 years), official US Bureau of Labor Statistics release dates, **MNQ.c.0 continuous (Databento) — native micro-futures, 7-year history**.

### Cross-validate on TradingView

Open `MNQ1!` 1-minute on TradingView and load the Pine `news_nfp_ifvg_strategy` (in `~/pine-indicators/ict/`). MNQ1! ticker has matching 7-year history on TV — backtest results should align with the table below.

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
| 2019 | 6  | 2 | 4 | 33% | 0.94 | -2.0   |
| 2020 | 8  | 5 | 3 | 63% | 1.61 | +17.5  |
| 2021 | 6  | 4 | 2 | 67% | 1.50 | +8.5   |
| 2022 | 5  | 1 | 4 | 20% | 1.42 | +21.0  |
| 2023 | 10 | 2 | 8 | 20% | 0.32 | -115.2 |
| 2024 | 4  | 3 | 1 | 75% | 0.95 | -2.5   |
| 2025 | 11 | 3 | 8 | 27% | 0.83 | -34.2  |
| 2026 | 3  | 2 | 1 | 67% | 16.00| +63.8  |
| **Total** | **53** | **22** | **31** | **42%** | **0.92** | **-43.2** |
| **+ ES SMT confirmation** |  |  |  |  |  |  |
| 2019 | 4  | 2 | 2 | 50%  | 1.19 | +5.2   |
| 2020 | 6  | 4 | 2 | 67%  | 2.07 | +22.0  |
| 2021 | 6  | 4 | 2 | 67%  | 1.50 | +8.5   |
| 2022 | 4  | 1 | 3 | 25%  | 1.64 | +27.8  |
| 2023 | 9  | 2 | 7 | 22%  | 0.34 | -105.0 |
| 2024 | 4  | 3 | 1 | 75%  | 0.95 | -2.5   |
| 2025 | 6  | 3 | 3 | 50%  | 1.37 | +44.2  |
| 2026 | 3  | 2 | 1 | 67%  | 16.00| +63.8  |
| **Total** | **42** | **21** | **21** | **50%** | **1.15** | **+64.0** |

The ES SMT filter cuts **11 setups** — WR moves from 42% → 50%, PF from 0.92 → 1.15, net from -43 to +64 MNQ points across 53 NFP events over 7 years. 2023 is a clear outlier drag — even with SMT, that year alone cost -105 pts and dominates the long-run net.

### Why It Works

NFP is a high-correlation event — NQ and ES move in lockstep. When only NQ takes the level and ES refuses, the move is one-sided liquidity grab on NQ alone. ES not following = no broad index momentum = fakeout high probability.

### Disclaimer

Backtest on MNQ.c.0 continuous (Databento). Results vary by data feed (TV continuous adjustment differs from Databento). Sample size 53 trades is statistically thin; 2023 single-year drawdown shows the strategy is not robust without further filters. Treat as indicative not predictive. AI-assisted analysis — not financial advice.

<div data-explorer="nfp-ifvg-smt"></div>
