This study tests a reversal entry on Gold (GC) futures triggered by Job Openings (JOLTS) — the monthly labor-market report on openings and turnover released at 10:00 ET. After the release sweeps a pre-news level, you wait for an Inverse Fair Value Gap (IFVG) to form, then enter when price breaks back inside the range, with a Silver (SI) SMT Divergence (SMT) confirmation filter. Tested across 10 years of GC data.

## Model

Same engine as the NQ variant (IFVG inversion + opposite-leg sweep filter + "TP1 + BE" variant), executed on GC. Release time is 10:00 ET (BLS, monthly Tuesday or Wednesday); sweep window extends to 12:00 ET, resolve deadline 16:00 ET.

## SMT pair

NQ variants use ES as the SMT confirmation pair. GC variants use SI (Silver) — the closest correlated metals contract.

## Performance — GC 10y

> **Variant legend** — **TP only** = full SL stays through, no break-even move. **TP only + BE** = once price reaches halfway from entry to TP, stop moves to entry (break-even). **TP1 + BE** = close 50% of size at the first TP (halfway to full TP), then move stop to entry on the rest.

Net positive across all three variants on the SMT-filtered sample:

- **TP only**: n=27, WR=44%, PF=1.67, net=+18.8 pts
- **TP only + BE**: n=27, WR=43%, PF=1.68, net=+16.4 pts
- **TP1 + BE**: n=27, WR=59%, PF=2.17, net=+23.9 pts

The SMT filter behaves better on GC than on NQ for JOLTS — metals show a cleaner reaction to labor-supply data when SI confirms the move. Sample size remains small (n=27), so the edge is indicative, not predictive.

## Results

See the stat band above and the By weekday / By year / Trade list tabs for full breakdown.
