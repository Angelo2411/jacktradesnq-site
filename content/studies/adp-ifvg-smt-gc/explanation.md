10-year backtest of ADP Non-Farm Employment Change at 8:15 ET on GC futures, using the IFVG entry pattern with SI (Silver) SMT confirmation.

## Model

Same engine as the NQ variant (IFVG inversion + opposite-leg sweep filter + tp1_be variant), executed on GC. Release time is 8:15 ET (15 minutes before the regular 8:30 batch); sweep window extends to ~11:15 ET, resolve deadline 16:00 ET.

## SMT pair

NQ variants use ES as the SMT confirmation pair. GC variants use SI (Silver) — the closest correlated metals contract.

## Performance — GC 10y

Marginal — net negative on the SMT-filtered sample:

- **no_be**: n=38, WR=32%, PF=0.88, net=-3.2 pts
- **be_50**: n=38, WR=29%, PF=0.55, net=-9.6 pts
- **tp1_be**: n=38, WR=37%, PF=0.70, net=-7.2 pts

The SMT filter does not produce an edge on GC for ADP. ADP is a private-sector employment proxy released by ADP Research Institute; precious metals do not react with the same vol/liquidity profile as US index futures, and SI/GC correlation around this release is weaker than ES/NQ.

## Results

See the KPI band above and the By weekday / By year / Trade list tabs for full breakdown.
