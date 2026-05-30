# ADP IFVG + SI SMT (Gold)

10-year backtest of ADP Non-Farm Employment Change at 8:15 ET on GC futures, using the IFVG entry pattern with SI (Silver) SMT confirmation.

## Model

Same engine as the NQ variant (IFVG + sweep filter + tp1_be variant), executed on GC. Release time is 8:15 ET (15 min before the 8:30 batch); sweep window to ~11:15 ET, resolve by 16:00 ET.

## SMT pair

GC variants use SI (Silver) as SMT confirmation pair.

## Performance — GC 10y

- **no_be**: n=38, WR=32%, PF=0.88, net=-3.2 pts
- **be_50**: n=38, WR=29%, PF=0.55, net=-9.6 pts
- **tp1_be**: n=38, WR=37%, PF=0.70, net=-7.2 pts

SMT filter does not produce an edge on GC for ADP. Metals react less symmetrically than indices on private-sector employment proxies.

## Results

See the KPI band above and the By weekday / By year / Trade list tabs.
