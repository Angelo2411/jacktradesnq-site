# Conference Board Consumer Confidence · IFVG + SMT — YM (E-mini Dow)

10-year backtest of the IFVG reversal pattern on Conference Board Consumer Confidence releases at 10:00 ET, using NQ (E-mini Nasdaq) SMT confirmation. Data: 2016-01-04 → 2024-12-31 (~9 years — 2025 data pull blocked by Databento budget).

## Setup
Same engine as the NQ variant (IFVG inversion + opposite-leg sweep filter), executed on YM (E-mini Dow futures, tick size 1.0 pt).

## SMT pair
YM-anchor variants use NQ as primary SMT confirmation. For the reverse pair (anchor=YM, smt=ES) see `cb-confidence-ifvg-smt-es-vs-ym`. For NQ anchor with YM SMT see `cb-confidence-ifvg-smt-nq-vs-ym`.

## Results (be_50 variant, both sides, SMT on)

- **N**: 40
- **Win rate**: 60.0%
- **Profit factor**: 1.46
- **Net P&L**: 171 pts

For no_be (no break-even stop) variant: PF 1.36, N 40, Net 241 pts.

See the KPI band and breakdown tabs above for full year-by-year and side-by-side stats.

Past performance ≠ future results.
