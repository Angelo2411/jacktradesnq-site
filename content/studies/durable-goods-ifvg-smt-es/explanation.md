# Durable Goods Orders IFVG + NQ SMT — ES (S&P 500 Futures)

Durable Goods Orders drops at 8:30 ET. The release usually manipulates one side of the pre-news range, then distributes in the real direction: it runs the stops sitting above or below, then reverses.

The setup uses the pre-news high and low as targets, traded on S&P 500 (ES). Price sweeps one side, leaves an Inverse Fair Value Gap (IFVG) on the rejection — a gap that flips into support or resistance — and you enter when it breaks back inside the range, aiming for the opposite side's liquidity. An optional Nasdaq 100 (NQ) SMT filter only keeps the trade when the Nasdaq confirms the same move. Tested on 1-minute ES data, 2016 to 2026.

**Asset**: ES (S&P 500 E-mini futures, tick size 0.25 pt)
**SMT partner**: NQ (Nasdaq E-mini futures)
**Variants**: TP only, TP only + BE, TP1 + BE
**Date range**: 2016-2026 (10 years)

See the stats table on this page for full performance breakdown by year, variant, and SMT filter.
