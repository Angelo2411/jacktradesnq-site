## New Week Opening Gap — Fill Study (Gold)

A **New Week Opening Gap (NWOG)** is the difference between GC futures' Friday 16:59 ET close and the Sunday 18:00 ET re-open. I counted gaps of **≥2 points** ($2/oz) — smaller gaps are inside normal tick noise on Gold and rarely produce a clean fill setup.

### Methodology

- Instrument: GC continuous front-month futures (Databento `.n.0`, forward-filled)
- Period: 10-year backtest window (2016–2026, 1-minute timeframe)
- First qualifying gap: 2016-02-14 (2.2 pt bear gap, held)
- Threshold: gap size ≥ 2 pts (absolute)
- Total events meeting threshold: **155** (102 bull gaps, 53 bear gaps)

Note: Gold has been in a structural uptrend across most of the window, so bull gaps outnumber bear gaps roughly 2:1. The Sunday open routinely re-prices higher into Asia demand.
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

Combined fill rate (direct + later): **93.0%** of all qualifying NWOGs fill before midnight ET. Gold fills its Sunday gap noticeably more often than NQ does — the metal's 24h continuous demand profile means very few gaps survive the first half hour.

### Bull vs Bear Gaps

Bear gaps hold more often than bull gaps — 11.3% vs 4.9%. Bull gaps also fill at a higher direct rate (90.2% vs 79.2%), consistent with the dominant uptrend regime: a bullish gap simply pulls back into Friday's range before Asia bids resume.

| Direction | Events | Direct | Later | Held |
|-----------|--------|--------|-------|------|
| Bull | 102 | 90.2% | 4.9% | 4.9% |
| Bear | 53 | 79.2% | 9.4% | 11.3% |

### By Gap Size

Unlike NQ, fill rate on Gold does **not** degrade with gap size — if anything the 20+ pt bucket has the highest direct-fill rate. Large weekend gaps on Gold usually mean a macro headline that gets faded fast once the full Sunday session opens.

| Gap size | Events | Direct | Later | Held |
|----------|--------|--------|-------|------|
| 2–5 pts | 77 | 85.7% | 6.5% | 7.8% |
| 5–10 pts | 33 | 81.8% | 9.1% | 9.1% |
| 10–20 pts | 25 | 88.0% | 8.0% | 4.0% |
| 20+ pts | 20 | 95.0% | 0.0% | 5.0% |

The 20+ pt bucket is the cleanest: 95% direct fill, only 5% held. The opposite of what we see on NQ where the biggest gaps coin-flip.

### Regime: No Volatility Break

GC behaved consistently across the window — 2020 (96.2%), 2022 (90.9%), 2024 (82.6%), 2025 (95.5%), 2026 YTD (100%) all show direct-fill rates above 80%. There is no equivalent of the 2025 NQ regime shift on Gold: the Sunday gap kept resolving fast even through the macro volatility expansion. Use the headline 86.5% number as a stable long-run baseline.

The full year-by-year breakdown and the complete 155-event list are in the PDF below.
