## New Week Opening Gap — Fill Study (S&P 500)

A **New Week Opening Gap (NWOG)** is the difference between ES futures' Friday 16:59 ET close and the Sunday 18:00 ET re-open. I counted gaps of **≥5 points** — the threshold was determined by computing |sun_open − fri_close| across all 447 Sundays in the dataset. The median absolute gap is 3.50 points; I used max(median × 1.5, 5) = 5.0 points as the cutoff.

### Methodology

- Instrument: ES continuous front-month futures (S&P 500 E-mini)
- Period: 10-year backtest window (2016–2026, 1-minute timeframe)
- First qualifying gap: 2016-04-24 (5.5 pt bull gap, direct fill)
- Threshold: gap size ≥ 5 pts (absolute), via max(median × 1.5, 5) on empirical gap distribution
- Total events meeting threshold: **183** (92 bull gaps, 91 bear gaps)

Bull/bear split is nearly 50/50 — unlike NQ or GC, ES shows no structural directional bias on the Sunday open. Gaps open up or down with roughly equal probability.
- Outcomes measured from Sunday 18:00 ET open:
  - **Direct fill** — gap closes within 30 minutes of the open
  - **Later fill** — gap closes after 30 min but before 00:00 ET (still Sunday night session)
  - **Held** — gap never closes during the Sunday night session

### Headline Results

| Outcome | Events | Percentage |
|---------|--------|------------|
| Direct fill (≤30 min) | 138 | 75.4% |
| Later fill (30 min – 00:00 ET) | 14 | 7.7% |
| Held through session | 31 | 16.9% |

Combined fill rate (direct + later): **83.1%** of all qualifying NWOGs fill before midnight ET. ES fills less reliably than NQ or GC — the index tends to hold gaps longer, with a 17% held rate vs 7% for GC.

### Bull vs Bear Gaps

Bear gaps fill faster than bull gaps — 80.2% direct vs 70.7% direct. Bear gaps also get held less often (12.1% vs 21.7% held). When ES gaps down into the Sunday open, the market tends to buy the gap quickly. Bullish gaps are more likely to run without filling.

| Direction | Events | Direct | Later | Held |
|-----------|--------|--------|-------|------|
| Bull | 92 | 70.7% | 7.6% | 21.7% |
| Bear | 91 | 80.2% | 7.7% | 12.1% |

### By Gap Size

Fill rate is fairly stable across bucket sizes — the 8–15 pt bucket has the highest direct rate at 81.1%. The largest 30+ pt gaps drop to 68.4% direct and carry the highest held rate at 26.3%. Unlike Gold where the biggest gaps are the cleanest, large ES gaps are harder to fill.

| Gap size | Events | Direct | Later | Held |
|----------|--------|--------|-------|------|
| 5–8 pts | 69 | 71.0% | 7.2% | 21.7% |
| 8–15 pts | 53 | 81.1% | 9.4% | 9.4% |
| 15–30 pts | 42 | 78.6% | 7.1% | 14.3% |
| 30+ pts | 19 | 68.4% | 5.3% | 26.3% |

### Regime Stability

ES fill rates are notably volatile year over year — 2017 saw only 33.3% direct fill (2/6), while 2023 and 2026 YTD are above 90%. This contrasts with GC's stable 80–100% range and suggests ES NWOG performance is regime-dependent. Treat the 75.4% headline as a long-run average; the short run can diverge meaningfully.

The full year-by-year breakdown and the complete 183-event list are in the PDF below.
