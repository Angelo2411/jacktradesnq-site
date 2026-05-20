# ISM Services PMI · IFVG + SMT — YM (E-mini Dow)

10-year backtest of the IFVG reversal pattern on ISM Services PMI releases at 10:00 ET, using NQ (E-mini Nasdaq) SMT confirmation. Data: 2016-01-04 → 2024-12-31 (~9 years — 2025 data pull blocked by Databento budget).

## Setup
Same engine as the NQ variant (IFVG inversion + opposite-leg sweep filter), executed on YM (E-mini Dow futures, tick size 1.0 pt).

## SMT pair
YM-anchor variants use NQ as primary SMT confirmation. For the reverse pair (anchor=YM, smt=ES) see `ism-services-ifvg-smt-es-vs-ym`. For NQ anchor with YM SMT see `ism-services-ifvg-smt-nq-vs-ym`.

## Results (be_50 variant, both sides, SMT on)

- **N**: 44
- **Win rate**: 40.6%
- **Profit factor**: 1.62
- **Net P&L**: 415 pts

For no_be (no break-even stop) variant: PF 1.70, N 44, Net 604 pts.

See the KPI band and breakdown tabs above for full year-by-year and side-by-side stats.

Past performance ≠ future results.
