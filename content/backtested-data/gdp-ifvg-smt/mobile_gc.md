## 8:30 News Model — GDP IFVG + SI SMT

ICT post-news IFVG entry on 8:30 ET GDP **advance releases** (1 per quarter — Jan/Apr/Jul/Oct, ~40 events). Tested 2016 → 2026 on GC 1m. SI SMT filter currently disabled (SI data unavailable for this re-run).

### Setup Logic

1. **Pre-news range** = high/low of the bars before 8:30 ET
2. **Sweep** = first 1-min bar (8:30→11:00 ET) that pokes above pre-news high or below pre-news low
3. **Side** = trade OPPOSITE of the sweep (sweep up → SHORT, sweep down → LONG)
4. **Entry** = bar that closes back inside the pre-news range (IFVG break)
5. **SL** = 1 tick beyond the sweep extreme + 0.10 (1 GC tick)
6. **TP** = opposite side of the pre-news range

### SI SMT Confirmation Filter — disabled

SI data was not available for this re-run, so the SMT toggle below shows zero trades when On. Read the baseline GC IFVG numbers with SMT off.

<div data-explorer="gdp-ifvg-smt"></div>

Baseline GC IFVG (no SMT): 18 trades, PF 0.44, net -15.5 GC pts. Small sample — treat with caution.

Sample size 18 trades — indicative not predictive.
