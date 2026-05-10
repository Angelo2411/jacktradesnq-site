## 8:30 News Model — NFP IFVG + ES SMT

ICT post-news IFVG entry on the 8:30 ET NFP releases, with **ES SMT confirmation filter**. Sample: **28 NFP releases** (2022-09 → 2026-04, BLS-confirmed dates), NQ Databento continuous (NQ.c.0).

### Setup Logic

1. **Pre-news range** = high/low of 5 bars before 8:30 ET
2. **Sweep** = first bar 8:30→11:00 ET that breaks pre-high or pre-low
3. **Side** = opposite of sweep (sweep UP → SHORT, sweep DOWN → LONG)
4. **Entry** = bar where price closes back inside (Inversion FVG break), filled at close
5. **SL** = sweep price ± 1 tick / **TP** = opposite side of pre-news range
6. **No BE move** — BE@50% killed the strategy on this asymmetric R:R (-71 pts drag)

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

Backtest on Databento NQ continuous (NQ.c.0). Results vary by data feed (TV continuous adjustment differs from Databento). Sample size 28 trades is statistically thin; treat as indicative not predictive.

<div data-explorer="news-830-model"></div>
