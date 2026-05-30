# FOMC IFVG + SI SMT (Gold)

The FOMC statement drops at 14:00 ET. The release bar usually manipulates one side of the pre-news range, then distributes in the real direction: it runs the stops sitting above or below, then reverses.

This study uses the pre-news high and low as targets, traded on Gold (GC). Price sweeps one side, leaves an Inverse Fair Value Gap (IFVG) on the rejection, and you enter when it breaks back inside the range, aiming for the opposite side's liquidity. An optional Silver (SI) SMT filter only keeps the trade when silver confirms the same move. Tested on 1-minute Gold data, 2016 to 2026.

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
