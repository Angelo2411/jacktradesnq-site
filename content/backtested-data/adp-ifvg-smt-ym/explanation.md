# ADP Employment · IFVG + SMT — YM (E-mini Dow)

10-year backtest of the IFVG reversal pattern on ADP Employment releases at 8:15 ET, using NQ (E-mini Nasdaq) SMT confirmation. Data: 2016-01-04 → 2024-12-31 (~9 years — 2025 data pull blocked by Databento budget).

## Setup
Same engine as the NQ variant (IFVG inversion + opposite-leg sweep filter), executed on YM (E-mini Dow futures, tick size 1.0 pt).

## SMT pair
YM-anchor variants use NQ as primary SMT confirmation. For the reverse pair (anchor=YM, smt=ES) see `adp-ifvg-smt-es-vs-ym`. For NQ anchor with YM SMT see `adp-ifvg-smt-nq-vs-ym`.

## Results (be_50 variant, both sides, SMT on)

- **N**: 48
- **Win rate**: 47.5%
- **Profit factor**: 1.60
- **Net P&L**: 230 pts

For no_be (no break-even stop) variant: PF 1.57, N 48, Net 249 pts.

See the KPI band and breakdown tabs above for full year-by-year and side-by-side stats.

Past performance ≠ future results.
