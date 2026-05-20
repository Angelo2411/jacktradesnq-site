# PPI (Producer Price Index) · IFVG + SMT — YM (E-mini Dow)

10-year backtest of the IFVG reversal pattern on PPI releases at 8:30 ET, using NQ (E-mini Nasdaq) SMT confirmation. Data: 2016-01-04 → 2024-12-31 (~9 years — 2025 data pull blocked by Databento budget).

## Setup
Same engine as the NQ variant (IFVG inversion + opposite-leg sweep filter), executed on YM (E-mini Dow futures, tick size 1.0 pt).

## SMT pair
YM-anchor variants use NQ as primary SMT confirmation. For the reverse pair (anchor=YM, smt=ES) see `ppi-ifvg-smt-es-vs-ym`. For NQ anchor with YM SMT see `ppi-ifvg-smt-nq-vs-ym`.

## Results (be_50 variant, both sides, SMT on)

- **N**: 43
- **Win rate**: 58.1%
- **Profit factor**: 1.29
- **Net P&L**: 143 pts

For no_be (no break-even stop) variant: PF 1.14, N 43, Net 97 pts.

See the KPI band and breakdown tabs above for full year-by-year and side-by-side stats.

Past performance ≠ future results.
