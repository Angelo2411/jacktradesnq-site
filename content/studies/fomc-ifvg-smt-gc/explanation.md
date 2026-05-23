# FOMC IFVG + SI SMT (Gold)

10-year backtest of the FOMC statement at 14:00 ET on GC futures, using the IFVG entry pattern with SI (Silver) SMT confirmation.

## Model

Same engine as the NQ variant (IFVG inversion + opposite-leg sweep filter + "TP1 + BE" variant), executed on GC. Release time is 14:00 ET (not 8:30 ET); sweep window extends to ~17:00 ET, resolve deadline 21:00 ET.

## SMT pair

NQ variants use ES as the SMT confirmation pair. GC variants use SI (Silver) — the closest correlated metals contract.

## Performance — GC 10y

> **Variant legend** — **TP only** = full SL stays through, no break-even move. **TP only + BE** = once price reaches halfway from entry to TP, stop moves to entry (break-even). **TP1 + BE** = close 50% of size at the first TP (halfway to full TP), then move stop to entry on the rest.

Marginal — sample size limited (15 trades over 10y with SMT-on):

- **TP only**: n=15, WR=27%, PF=0.75, net=-5.5 pts
- **TP only + BE**: n=15, WR=29%, PF=1.31, net=+3.9 pts
- **TP1 + BE**: n=15, WR=33%, PF=1.06, net=+0.8 pts

Net result hovers near breakeven on the SMT-filtered sample. Setup count is low because FOMC is monthly (8x/year) and pre-news liquidity sweeps on GC are less frequent than on NQ.

## Results

See the stat band above and the By weekday / By year / Trade list tabs for full breakdown.
