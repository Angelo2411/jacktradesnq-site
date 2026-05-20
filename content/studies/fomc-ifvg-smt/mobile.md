## FOMC IFVG + ES SMT — 14:00 News Model

ICT post-news IFVG entry on 14:00 ET FOMC statements, with optional **ES SMT confirmation filter**. Window: 2016-04 → 2026-05, NQ continuous.

### Setup Logic

1. **Release bar** = the 14:00 ET 1-min candle (high/low define the range)
2. **Sweep** = first 1-min bar after 14:00 (14:01→17:00 ET) that pokes above release high or below release low
3. **Side** = trade OPPOSITE of the sweep (sweep up → SHORT, sweep down → LONG)
4. **Entry** = bar that closes back inside the release range (IFVG break)
5. **SL** = 1 tick beyond the sweep extreme
6. **TP** = opposite side of the release range

### ES SMT Confirmation Filter

Take the trade **only if ES also reaches its target side** during the same 14:01→17:00 window. ES not following = fakeout, skip.

ES SMT filter cut 9 setups — no_be PF 1.26 → 1.92, net +104 → +241 NQ pts on 87 FOMC events (35 setups before filter).

Sample size 26 SMT trades — indicative not predictive.
