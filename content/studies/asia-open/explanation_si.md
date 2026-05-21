## New Week Opening Gap — Fill Study (Silver)

A **New Week Opening Gap (NWOG)** is the difference between SI futures' Friday 16:59 ET close and the Sunday 18:00 ET re-open. I counted gaps of **≥0.10 points** ($0.10/oz) — this is a baseline threshold set low to capture actionable moves on Silver, where a $0.10 gap can represent a meaningful re-pricing.

### Methodology

- Instrument: SI continuous front-month futures (Silver)
- Period: 10-year backtest window (2016–2026, 1-minute timeframe) — real BBO data
- First qualifying gap: 2016-08-07 (0.18 pt bear gap, direct fill)
- Threshold: gap size ≥ 0.10 pt ($0.10/oz) — baseline, to be re-evaluated
- Total events meeting threshold: **49** (35 bull gaps, 14 bear gaps)

Silver shows a strong bull bias in NWOGs — roughly 2.5:1 bull-to-bear split, reflecting the structural uptrend and the metal's tendency to re-price higher into Asian demand on Sunday night.
- Outcomes measured from Sunday 18:00 ET open:
  - **Direct fill** — gap closes within 30 minutes of the open
  - **Later fill** — gap closes after 30 min but before 00:00 ET (still Sunday night session)
  - **Held** — gap never closes during the Sunday night session

### Headline Results

| Outcome | Events | Percentage |
|---------|--------|------------|
| Direct fill (≤30 min) | 36 | 73.5% |
| Later fill (30 min – 00:00 ET) | 10 | 20.4% |
| Held through session | 3 | 6.1% |

Combined fill rate (direct + later): **93.9%** of all qualifying NWOGs fill before midnight ET. The very low held rate (6.1%) means Silver almost never holds a Sunday gap through the session — similar to Gold's behavior, reflecting the metal's 24h continuous demand profile.

### Bull vs Bear Gaps

Bull gaps fill much more reliably than bear gaps on Silver. All 35 bull gaps eventually filled (direct or later — 0% held rate). Bear gaps have a 21.4% held rate and only 57.1% direct fill. When Silver gaps down, it's more likely to keep going; when it gaps up, the fill is nearly guaranteed.

| Direction | Events | Direct | Later | Held |
|-----------|--------|--------|-------|------|
| Bull | 35 | 80.0% | 20.0% | 0.0% |
| Bear | 14 | 57.1% | 21.4% | 21.4% |

### By Gap Size

The vast majority of events (39/49) fall in the 0.10–0.50 pt bucket. Only 3 events exceed 1.00 pt, and there are zero 2.00+ pt NWOGs over the 10-year window. Small gaps are the norm on Silver — the distribution is compressed compared to Gold or equities.

| Gap size | Events | Direct | Later | Held |
|----------|--------|--------|-------|------|
| 0.10–0.50 pts | 39 | 74.4% | 20.5% | 5.1% |
| 0.50–1.00 pts | 7 | 71.4% | 28.6% | 0.0% |
| 1.00–2.00 pts | 3 | 66.7% | 0.0% | 33.3% |
| 2.00+ pts | 0 | — | — | — |

### Notes: Low N and Sparse Data

With only 49 total events over 10 years, Silver NWOGs are far less frequent than Gold (155 events) or ES (183 events). Several years have 0–2 events. The headline 73.5% direct rate is directionally useful but should be treated with appropriate caution given the low sample size. Consider raising the threshold (e.g., 0.25 pts) to reduce noise, or combining SI with GC for a precious-metals NWOG basket.

The full year-by-year breakdown and the complete 49-event list are in the PDF below.
