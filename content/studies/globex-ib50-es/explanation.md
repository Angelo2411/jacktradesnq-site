## Overview

The **Globex IB50** strategy trades the 10-minute initial balance formed between 18:00 and 18:10 ET — the first ten minutes of the Globex reopen.

- **IB**: the high-low range of 18:00–18:10 ET.
- **Bias**: a break of either IB extreme arms the session bias (break high → long, break low → short).
- **Entry**: at the 50% retracement of the IB range.
- **Stop-loss**: the IB extreme on the entry side.
- **Take-profit**: a multiple (the TP extension) of the mid-to-extreme distance.

One trade per session, flat before 02:00 ET.

> **TP extension legend** — 1.0 = TP at opposite IB extreme (RR 1:1). 1.5 / 1.75 / 2.0 = TP extended to that multiple of the mid-to-extreme distance, SL unchanged.

## Performance

Trailing 12 months (TP 1.75): **181 trades, profit factor 1.08, net +36.6 points**, win rate 38%. Only marginally positive — ES is the weakest of the index variants. Published for completeness; the edge is too thin to lean on alone.

## Methodology

- **Data**: Databento 1-minute futures, April 2016 – May 2026.
- **Simulation**: event-driven, fill at the exact mid of the entry bar. No slippage, no commissions.
- **Risk-reward**: strict — SL and TP fixed at entry, no trailing, no partials.

All metrics from the raw trade log. The framework is identical across assets; only the instrument changes.
