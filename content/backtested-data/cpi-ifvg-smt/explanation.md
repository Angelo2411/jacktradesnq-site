## CPI IFVG + ES SMT — 8:30 News Model

ICT post-news IFVG entry on 8:30 ET CPI releases, with optional **ES SMT confirmation filter**. Tested 2019 → 2026 on MNQ 1m.

### Setup Logic

Mark out the data high/low (range price was trading in right before 8:30 ET). Wait for price to sweep one side, then wait for an FVG to form on the rejection. Entry on the IFVG break (close back inside the range). SL on the sweep extreme. TP on the opposite liquidity.

### ES SMT Confirmation Filter

Take the trade **only if ES (E-mini S&P 500) also sweeps its target side** during the same 8:30→11:00 window.

- NQ SHORT (sweep UP) → ES must sweep its low
- NQ LONG (sweep DOWN) → ES must sweep its high

If ES doesn't follow → fakeout, skip the trade.

### Year-by-Year — Strategy Performance (MNQ 7y)

| Year | Trades | W | L | WR | PF | Net (MNQ pts) |
|------|--------|---|---|-----|------|---------------|
| **Baseline (no SMT filter)** |  |  |  |  |  |  |
| 2019 | 5  | 3 | 2  | 60% | 4.32 | +18.2  |
| 2020 | 5  | 2 | 3  | 40% | 0.46 | -8.8   |
| 2021 | 7  | 3 | 4  | 42% | 0.58 | -25.2  |
| 2022 | 14 | 5 | 9  | 35% | 2.31 | +175.2 |
| 2023 | 12 | 2 | 10 | 16% | 0.71 | -47.5  |
| 2024 | 14 | 3 | 11 | 21% | 0.76 | -55.2  |
| 2025 | 11 | 2 | 9  | 18% | 0.59 | -89.8  |
| 2026 | 7  | 4 | 3  | 57% | 1.23 | +19.5  |
| **Total** | **75** | **24** | **51** | **32%** | **0.98** | **-13.5** |
| **+ ES SMT confirmation** |  |  |  |  |  |  |
| 2019 | 4  | 2 | 2 | 50% | 3.27 | +12.5  |
| 2020 | 5  | 2 | 3 | 40% | 0.46 | -8.8   |
| 2021 | 5  | 3 | 2 | 60% | 0.81 | -8.2   |
| 2022 | 10 | 4 | 6 | 40% | 2.68 | +169.0 |
| 2023 | 7  | 2 | 5 | 28% | 1.96 | +55.8  |
| 2024 | 7  | 3 | 4 | 42% | 2.55 | +108.2 |
| 2025 | 7  | 2 | 5 | 28% | 3.87 | +97.0  |
| 2026 | 6  | 4 | 2 | 66% | 1.38 | +28.5  |
| **Total** | **51** | **22** | **29** | **43%** | **2.13** | **+454.0** |

Baseline alone has no edge (PF 0.98, slightly losing). The ES SMT filter is what carries it: cuts 24 setups, PF jumps 0.98 → 2.13, net -13.5 → +454 MNQ points across 75 CPI events.

### Why It Works

CPI is a high-correlation event — NQ and ES move in lockstep. When only NQ takes the level and ES refuses, the move is a one-sided liquidity grab on NQ alone. ES not following = no broad index momentum = fakeout high probability.

### Disclaimer

Sample size 51 SMT-filtered trades is statistically thin; treat as indicative not predictive. AI-assisted analysis — not financial advice.

<div data-explorer="cpi-ifvg-smt"></div>
