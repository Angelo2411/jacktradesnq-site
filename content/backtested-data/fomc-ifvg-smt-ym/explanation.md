# FOMC (Federal Reserve meeting) · IFVG + SMT — YM (E-mini Dow)

10-year backtest of the IFVG reversal pattern on FOMC releases at 14:00 ET, using NQ (E-mini Nasdaq) SMT confirmation. Data: 2016-01-04 → 2024-12-31 (~9 years — 2025 data pull blocked by Databento budget).

## Setup
Same engine as the NQ variant (IFVG inversion + opposite-leg sweep filter), executed on YM (E-mini Dow futures, tick size 1.0 pt).

## SMT pair
YM-anchor variants use NQ as primary SMT confirmation. For the reverse pair (anchor=YM, smt=ES) see `fomc-ifvg-smt-es-vs-ym`. For NQ anchor with YM SMT see `fomc-ifvg-smt-nq-vs-ym`.

## Results (be_50 variant, both sides, SMT on)

- **N**: 33
- **Win rate**: 51.9%
- **Profit factor**: 1.91
- **Net P&L**: 647 pts

For no_be (no break-even stop) variant: PF 2.17, N 33, Net 941 pts.

See the KPI band and breakdown tabs above for full year-by-year and side-by-side stats.

Past performance ≠ future results.
