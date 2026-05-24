## Overview

The **Globex IB50** strategy trades the 10-minute initial balance formed between 18:00 and 18:10 ET on NQ futures. The structure is simple:

- **IB**: The high-low range from 18:00–18:10 ET.
- **Bias**: A break of either IB extreme arms the session bias — break above the IB high looks long; break below the IB low looks short.
- **Entry**: At the 50% retracement of the IB range (midpoint).
- **Stop-loss**: The IB extreme on the entry side (IB high for longs, IB low for shorts).
- **Take-profit**: A multiple of the IB mid-to-extreme distance; the multiplier is the TP extension. Risk-reward scales linearly with TP extension.

Only one trade per session. If neither extreme breaks, or if the breakout retraces past 50% without triggering, the session is skipped. All positions are flat before 02:00 ET.

> **TP extension legend** — 1.0 = TP at opposite IB extreme (RR 1:1). 1.5 / 1.75 / 2.0 = TP extended to that multiple of the mid-to-extreme distance, SL unchanged.

## Performance

The strategy has been backtested on 1-minute NQ data from Databento covering April 2016 through May 2026. Over 10 years, the edge is marginal — the strategy performs well in some regimes and poorly in others. It is **not** a structural, all-weather edge.

**Trailing 12 months** (TP 1.75): 187 trades, profit factor 1.20, net +420 points. The edge strengthens on a 6-month lookback (profit factor ~1.45) but disappears entirely at 24 months (profit factor ~1.0).

The takeaway is straightforward: trade the current regime, not the 2016 market. The IB50 framework performs when intraday range expansion is prevalent and breaks of the overnight initial balance tend not to reverse. In low-range, mean-reverting conditions it underperforms.

## Methodology

- **Data**: Databento 1-minute NQ futures, April 2016 – May 2026.
- **Simulation**: Event-driven backtest; fill at the exact mid of the entry bar. No slippage, no commissions.
- **Risk-reward**: Strict — SL and TP levels are fixed at entry. No trailing stops, no partials.
- **Drawdown**: Maximum drawdown over 12 months (TP 1.75) is approximately 331 points.

All metrics are from the raw trade log. No smoothing, no survivorship bias removal, no curve-fitting beyond selecting the four TP extension variants presented here.
