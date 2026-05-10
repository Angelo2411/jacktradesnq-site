## CPI IFVG + ES SMT — 8:30 News Model

ICT post-news IFVG entry on 8:30 ET CPI releases, with optional **ES SMT confirmation filter**. Window: 2022-09 → 2026-04, official US Bureau of Labor Statistics release dates, NQ continuous (Databento).

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

### Year-by-Year — Strategy Performance

| Year | Trades | W | L | WR | PF | Net (NQ pts) |
|------|--------|---|---|-----|------|--------------|
| **Baseline (no SMT filter)** |  |  |  |  |  |  |
| 2022 | 3  | 1 | 2 | 33% | 0.36 | -81.5  |
| 2023 | 10 | 4 | 6 | 40% | 0.99 | -1.25  |
| 2024 | 12 | 4 | 8 | 33% | 1.01 | +1.0   |
| 2025 | 10 | 4 | 6 | 40% | 1.81 | +123.5 |
| 2026 | 4  | 2 | 2 | 50% | 6.17 | +140.8 |
| **Total** | **39** | **15** | **24** | **38%** | **1.30** | **+182.5** |
| **+ ES SMT confirmation** |  |  |  |  |  |  |
| 2022 | 1  | 1 | 0 | 100% | —    | +45.3  |
| 2023 | 10 | 4 | 6 | 40%  | 0.99 | -1.25  |
| 2024 | 9  | 4 | 5 | 44%  | 2.13 | +86.0  |
| 2025 | 8  | 3 | 5 | 38%  | 2.16 | +79.75 |
| 2026 | 4  | 2 | 2 | 50%  | 6.17 | +140.8 |
| **Total** | **32** | **14** | **18** | **44%** | **2.08** | **+350.5** |

The ES SMT filter cut **7 setups (2022: 2, 2024: 3, 2025: 2)** — PF moves from 1.30 → 2.08, net from +182.5 to +350.5 NQ points on 85 CPI events.

### Why It Works

CPI is a high-correlation event — NQ and ES move in lockstep. When only NQ takes the level and ES refuses, the move is a one-sided liquidity grab on NQ alone. ES not following = no broad index momentum = fakeout high probability.

### Disclaimer

Backtest on NQ continuous (Databento). Results vary by data feed (TV continuous adjustment differs from Databento). Sample size 39 trades is statistically thin; treat as indicative not predictive.

<div data-explorer="cpi-ifvg-smt"></div>
