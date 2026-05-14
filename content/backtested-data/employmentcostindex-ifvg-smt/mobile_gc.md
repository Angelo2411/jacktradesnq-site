## 8:30 News Model — Employment Cost Index IFVG + SI SMT

ICT post-news IFVG entry on 8:30 ET Employment Cost Index (ECI) releases, with optional **SI SMT confirmation filter**. Tested 2016 → 2026 on GC 1m.

### Setup Logic

1. **Pre-news range** = high/low of the bars before 8:30 ET
2. **Sweep** = first 1-min bar (8:30→11:00 ET) that pokes above pre-news high or below pre-news low
3. **Side** = trade OPPOSITE of the sweep (sweep up → SHORT, sweep down → LONG)
4. **Entry** = bar that closes back inside the pre-news range (IFVG break)
5. **SL** = 1 tick beyond the sweep extreme + 0.10 (1 GC tick)
6. **TP** = opposite side of the pre-news range

### SI SMT Confirmation Filter

Take the trade **only if SI also reaches the same target** within 2h30 after the release. SI not following = fakeout, skip.

<div data-explorer="employmentcostindex-ifvg-smt"></div>

Without SI SMT: 7 trades, PF 3.71, net +5.7 GC pts. With SI SMT (2 trades): WR 100%, PF ∞, net +4.7 GC pts. Very small sample — quarterly release.

Sample size 7 trades — indicative not predictive.
