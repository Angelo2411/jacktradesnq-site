Gold gaps at the Sunday open — and it fills them at a rate that would surprise most traders.

## New Week Opening Gap — Fill Study (GC Futures, 10y)

A **New Week Opening Gap (NWOG)** is the difference between GC futures' Friday 16:59 ET close and the Sunday 18:00 ET re-open. I only counted gaps of **≥2 points** — smaller gaps are noise on Gold and rarely produce a clean fill setup.

Note: the threshold is 2 pts on GC vs 50 pts on NQ. Scale accordingly — a 2-point gap on a $3,000 gold contract is roughly equivalent proportionally.

### Methodology

- Instrument: GC continuous front-month futures
- Period: 10-year backtest window (2016–2026, 1-minute timeframe)
- Threshold: gap size ≥ 2 pts (absolute)
- Total qualifying events: **155** (102 bull gaps, 53 bear gaps)
- Outcomes measured from Sunday 18:00 ET open:
  - **Direct fill** — gap closes within 30 minutes of the open
  - **Later fill** — gap closes after 30 min but before 00:00 ET (still Sunday night session)
  - **Held** — gap never closes during the Sunday night session

### Headline Results

| Outcome | Events | Percentage |
|---------|--------|------------|
| Direct fill (≤30 min) | 134 | 86.5% |
| Later fill (30 min – 00:00 ET) | 10 | 6.5% |
| Held through session | 11 | 7.1% |

Combined fill rate (direct + later): **93.0%** of all qualifying GC NWOGs fill before midnight ET.

This is materially higher than NQ (81% combined). Gold's Sunday-night fill tendency is robust: the metal almost always retraces to close the gap before Asia pushes to the next leg.

### Bull vs Bear Gaps

| Direction | Events | Direct | Later | Held |
|-----------|--------|--------|-------|------|
| Bull | 102 | 90.2% | 4.9% | 4.9% |
| Bear | 53 | 79.2% | 9.4% | 11.3% |

Bull gaps fill at a higher direct rate. Bear gaps hold more often — consistent with Gold's long-term upward drift making downward gaps harder to close the same night.

### Year-by-Year Regime Shift

Pre-2020 direct fill rates were lower (50–71%). Post-2020 the rate jumped to 88–100% direct fill most years. The 2020+ period coincides with higher Gold volatility and larger Sunday participation driven by macro uncertainty.

| Period | Direct fill range |
|--------|-------------------|
| 2016–2019 | 50–71% |
| 2020–2026 | 88–100% |

Use post-2020 numbers as your live baseline.

### Why It Works

Gold trades 23 hours a day, 5 days a week. The Sunday gap represents a pricing dislocation between the last Friday print and where Asian buyers/sellers re-establish fair value. The 18:00 ET re-open is driven by thin volume — the gap is often created by a single large order or news-driven repositioning in an illiquid window. Once Asia proper opens (~19:00 ET) and European desks come online, the market systematically reverts to Friday's close to clear resting liquidity before committing to a directional move.

### What This Means for Trading

- A qualifying GC gap (≥2 pts) fills directly 86.5% of the time within 30 minutes. That's a high-probability fade setup on Sunday evening.
- Bull gaps are cleaner (90.2% direct). Size bear-gap fades more conservatively.
- Post-2020 data is the relevant reference — pre-2020 fill rates significantly understate current behavior.
- The "held" category (7.1%) tends to cluster around macro shock weekends (war escalation, surprise rate decisions). Check the calendar before sizing in.

---

*Results derived from historical GC continuous front-month 1-minute data via AI-assisted backtesting. Past performance does not predict future results. Not financial advice.*
