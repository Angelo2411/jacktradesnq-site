# Retail Sales IFVG + GC SMT (Silver)

This study tests a reversal entry on Silver (SI) futures triggered by Retail Sales — the monthly consumer spending report released at 8:30 ET. After the release sweeps a pre-news level, you wait for an Inverse Fair Value Gap (IFVG) to form, then enter when price breaks back inside the range, with a Gold (GC) SMT Divergence (SMT) confirmation filter requiring both metals to agree. Tested across 10 years of SI data.

## Model

Same engine as the NQ variant (IFVG inversion + opposite-leg sweep filter), executed on SI with GC as the SMT confirmation pair — the canonical precious-metals divergence.

## SMT pair

Equity events use ES/NQ/YM as the SMT pair. The metals variant pairs SI (Silver) with GC (Gold), the two correlated precious-metals contracts.

## Sample size

The SI×GC SMT divergence is a strict filter — valid setups are rare on a single event. Treat low-N results as early-sample, not statistically settled. See the By year / Trade list tabs for the full breakdown.

## Disclaimer

AI-assisted backtest analysis — not financial advice. Past performance does not predict future results.
