## 8:30 News Model — Empire State IFVG + ES SMT

ICT post-news IFVG entry on 8:30 ET Empire State releases, with optional **ES SMT confirmation filter**. Tested 2016 → 2026 on NQ 1m.

### Setup Logic

1. **Pre-news range** = high/low of the 5 bars before 8:30 ET
2. **Sweep** = first 1-min bar (8:30→11:00 ET) that pokes above pre-news high or below pre-news low
3. **Side** = trade OPPOSITE of the sweep (sweep up → SHORT, sweep down → LONG)
4. **Entry** = bar that closes back inside the pre-news range (IFVG break)
5. **SL** = 1 tick beyond the sweep extreme
6. **TP** = opposite side of the pre-news range

### ES SMT Confirmation Filter

Take the trade **only if ES also reaches its target side** during the same 8:30→11:00 window. ES not following = fakeout, skip.


ES SMT filter cut 8 setups — PF 0.39 → 0.81, net -122 → -18 NQ pts on 34 Empire State events. No positive edge found.

Sample size 26 trades — indicative not predictive.
