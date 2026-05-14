## 8:30 News Model — GC IFVG + SI SMT

ICT post-news IFVG entry on 8:30 ET releases, with optional **SI SMT confirmation filter**. Window: 2016-01 → 2026-05, GC continuous.

### Setup Logic

1. **Pre-news range** = high/low of the 8:30 ET release bar on GC
2. **Sweep** = first 1-min bar (8:30→11:00 ET) that pokes above pre-news high or below pre-news low
3. **Side** = trade OPPOSITE of the sweep (sweep up → SHORT, sweep down → LONG)
4. **Entry** = bar that closes back inside the pre-news range (IFVG break)
5. **SL** = 1 tick (0.10 GC pt) beyond the sweep extreme
6. **TP** = opposite side of the pre-news range

### SI SMT Confirmation Filter

Take the trade **only if SI also reaches its target side** during the same 8:30→11:00 window. Missing SI bar = no confirmation (not a signal).

<div data-explorer="gc-ifvg-smt"></div>

No significant edge on Gold across 9 event types. NFP isolated: 8 trades / PF 6.18 / +31.6 GC pts (low sample). Overall SMT-filtered: 52 trades / PF 0.977 / -1.4 GC pts.

Sample size 52 SMT trades — indicative not predictive.
