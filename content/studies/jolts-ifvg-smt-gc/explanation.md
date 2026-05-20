10-year backtest of JOLTS Job Openings at 10:00 ET on GC futures, using the IFVG entry pattern with SI (Silver) SMT confirmation.

## Model

Same engine as the NQ variant (IFVG inversion + opposite-leg sweep filter + tp1_be variant), executed on GC. Release time is 10:00 ET (BLS, monthly Tuesday or Wednesday); sweep window extends to 12:00 ET, resolve deadline 16:00 ET.

## SMT pair

NQ variants use ES as the SMT confirmation pair. GC variants use SI (Silver) — the closest correlated metals contract.

## Performance — GC 10y

Net positive across all three variants on the SMT-filtered sample:

- **no_be**: n=27, WR=44%, PF=1.67, net=+18.8 pts
- **be_50**: n=27, WR=43%, PF=1.68, net=+16.4 pts
- **tp1_be**: n=27, WR=59%, PF=2.17, net=+23.9 pts

The SMT filter behaves better on GC than on NQ for JOLTS — metals show a cleaner reaction to labor-supply data when SI confirms the move. Sample size remains small (n=27), so the edge is indicative, not predictive.

## Results

See the KPI band above and the By weekday / By year / Trade list tabs for full breakdown.
