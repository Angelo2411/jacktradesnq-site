## 8:30 News Model — Jobless Claims IFVG + ES SMT

ICT post-news IFVG entry on 8:30 ET Jobless Claims releases, with optional **ES SMT confirmation filter**. Tested 2016 → 2026 on NQ 1m.

### Setup Logic

1. **Pre-news range** = high/low of the 5 bars before 8:30 ET
2. **Sweep** = first 1-min bar (8:30→11:00 ET) that pokes above pre-news high or below pre-news low
3. **Side** = trade OPPOSITE of the sweep (sweep up → SHORT, sweep down → LONG)
4. **Entry** = bar that closes back inside the pre-news range (IFVG break)
5. **SL** = 1 tick beyond the sweep extreme
6. **TP** = opposite side of the pre-news range

### ES SMT Confirmation Filter

Take the trade **only if ES also reaches its target side** during the same 8:30→11:00 window. ES not following = fakeout, skip.


ES SMT filter cut 37 setups — PF 1.00 → 2.35, net +1 → +406 NQ pts on 159 Jobless Claims events.

Sample size 122 trades — indicative not predictive.
