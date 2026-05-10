ICT post-news IFVG entry on 8:30 ET NFP releases, with optional **ES SMT confirmation filter**. Tested 2019 → 2026 on MNQ 1m.

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
| 2019 | 5  | 3 | 2 | 60% | 1.98 | +19.5  |
| 2020 | 7  | 5 | 2 | 71% | 3.22 | +61.5  |
| 2021 | 6  | 3 | 3 | 50% | 1.12 | +3.5   |
| 2022 | 6  | 0 | 6 | 0%  | 0.00 | -115.8 |
| 2023 | 10 | 3 | 7 | 30% | 1.45 | +63.8  |
| 2024 | 8  | 1 | 7 | 12% | 0.67 | -24.2  |
| 2025 | 9  | 2 | 7 | 22% | 0.76 | -50.0  |
| 2026 | 3  | 1 | 2 | 33% | 0.03 | -7.5   |
| **Total** | **54** | **18** | **36** | **33%** | **0.92** | **-49.2** |
| **+ ES SMT confirmation** |  |  |  |  |  |  |
| 2019 | 3  | 3 | 0 | 100% | —    | +39.5  |
| 2020 | 4  | 4 | 0 | 100% | —    | +84.5  |
| 2021 | 5  | 2 | 3 | 40%  | 0.48 | -14.5  |
| 2022 | 1  | 0 | 1 | 0%   | 0.00 | -12.5  |
| 2023 | 4  | 2 | 2 | 50%  | 4.55 | +150.0 |
| 2024 | 3  | 1 | 2 | 33%  | 2.61 | +30.2  |
| 2025 | 4  | 2 | 2 | 50%  | 3.02 | +103.2 |
| 2026 | 2  | 1 | 1 | 50%  | 0.05 | -4.8   |
| **Total** | **26** | **15** | **11** | **57%** | **3.38** | **+375.8** |

Baseline alone has no edge (PF 0.92, slight loss). The ES SMT filter is what carries it: cuts 28 setups, PF jumps 0.92 → 3.38, net -49 → +376 MNQ points across 54 NFP events. 2022 (0/6 baseline) was the worst year, mostly cut by SMT (1 trade kept).

### Why It Works

NQ and ES are highly correlated indices. When NQ reaches the target side but ES doesn't follow during the same window, the move is a one-sided drift — likely a fakeout for the broader market. Filtering for ES confirmation keeps only setups where both indices participate in the reversal.

### Disclaimer

Sample size 26 SMT-filtered trades is statistically thin; treat as indicative not predictive. AI-assisted analysis — not financial advice.

<div data-explorer="nfp-ifvg-smt"></div>
