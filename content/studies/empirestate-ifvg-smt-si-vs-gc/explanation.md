# Empire State IFVG + GC SMT (Silver)

Empire State Manufacturing drops at 8:30 ET — one of the earliest regional factory reads each month. The release usually manipulates one side of the pre-news range, then distributes in the real direction: it runs the stops above or below, then reverses.

This study uses the pre-news high and low as targets, traded on Silver (SI). Price sweeps one side, leaves an Inverse Fair Value Gap (IFVG) on the rejection, and you enter when it breaks back inside the range, aiming for the opposite side's liquidity. An optional Gold (GC) SMT filter only keeps the trade when gold confirms the same move — both metals need to agree. Tested on 1-minute Silver data, 2016 to 2026.

## Model

Same engine as the NQ variant (IFVG inversion + opposite-leg sweep filter), executed on SI with GC as the SMT confirmation pair — the canonical precious-metals divergence.

## SMT pair

Equity events use ES/NQ/YM as the SMT pair. The metals variant pairs SI (Silver) with GC (Gold), the two correlated precious-metals contracts.

## Sample size

The SI×GC SMT divergence is a strict filter — valid setups are rare on a single event. Treat low-N results as early-sample, not statistically settled. See the By year / Trade list tabs for the full breakdown.

## Disclaimer

AI-assisted backtest analysis — not financial advice. Past performance does not predict future results.
