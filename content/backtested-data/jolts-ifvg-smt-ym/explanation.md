# JOLTS · IFVG + SMT — YM (E-mini Dow)

10-year backtest of the IFVG reversal pattern on JOLTS releases at 10:00 ET, using NQ (E-mini Nasdaq) as the SMT confirmation leg.

## Model

Same engine as the NQ variant (IFVG inversion + opposite-leg sweep filter + tp1_be variant), executed on YM (E-mini Dow futures, tick size 1.0 pt).

## SMT pair

YM variants use NQ as the SMT confirmation pair — the most correlated US equity index futures contract. A sweep on NQ confirms the reversal signal on YM before entry is taken.

## Results

See the KPI band above and the By weekday / By year / Trade list tabs for full breakdown.

Past performance does not guarantee future results. Backtest uses historical data only.
