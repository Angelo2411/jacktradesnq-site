## 8:30 News Model — NFP IFVG + ES SMT

ICT post-news IFVG entry on the 8:30 ET NFP releases, with optional **ES SMT confirmation filter**. Window: 2022-09 → 2026-04, official US Bureau of Labor Statistics release dates, NQ continuous (Databento).

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
| 2022 | 2  | 0 | 2 | 0%  | 0.00 | -20.5  |
| 2023 | 11 | 3 | 8 | 27% | 0.96 | -6.0   |
| 2024 | 4  | 3 | 1 | 75% | 0.92 | -3.8   |
| 2025 | 9  | 4 | 5 | 44% | 1.46 | +61.3  |
| 2026 | 2  | 1 | 1 | 50% | 0.62 | -2.3   |
| **Total** | **28** | **11** | **17** | **39%** | **1.08** | **+28.8** |
| **+ ES SMT confirmation** |  |  |  |  |  |  |
| 2022 | 1  | 0 | 1 | 0%  | 0.00 | -13.8  |
| 2023 | 9  | 3 | 6 | 33% | 1.65 | +57.8  |
| 2024 | 4  | 3 | 1 | 75% | 0.92 | -3.8   |
| 2025 | 5  | 4 | 1 | 80% | 3.16 | +133.0 |
| 2026 | 2  | 1 | 1 | 50% | 0.62 | -2.3   |
| **Total** | **21** | **11** | **10** | **52%** | **1.79** | **+171.0** |

The ES SMT filter cut **7 LOSSES, 0 WINS** — all 7 skips were trades where NQ swept but ES never reached its target. PF moves from 1.08 → 1.79, net from +29 to +171 NQ points over 7 years.

### Why It Works

NFP is a high-correlation event — NQ and ES move in lockstep. When only NQ takes the level and ES refuses, the move is one-sided liquidity grab on NQ alone. ES not following = no broad index momentum = fakeout high probability.

### Disclaimer

Backtest on NQ continuous (Databento). Results vary by data feed (TV continuous adjustment differs from Databento). Sample size 28 trades is statistically thin; treat as indicative not predictive.

<div data-explorer="nfp-ifvg-smt"></div>
