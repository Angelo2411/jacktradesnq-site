## Article 1 — CPI Points

The PDF "CPI Points" shows every data related to CPI in terms of points from 2016 to 2026.

### Year-by-Year Averages — Release Candle (1m, 8:30 ET)

CPI volatility lives almost entirely inside the 1-minute release bar. The numbers below describe what NQ does on that single candle, year by year.

**Column legend:**
- **Count** — number of CPI releases in the year (12 monthly releases is the baseline; less means the print fell on a non-trading day or data was missing).
- **Avg Range 1m** — average high − low in points on the 8:30 ET candle.
- **Max Range 1m** — worst-case 1m range observed that year (single biggest outlier).
- **Avg Move Up** — average distance from the candle open to the candle high (upside excursion before any reversal).
- **Avg Move Down** — average distance from the candle open to the candle low (downside excursion).
- **Avg Dir 1m** — average signed close − open on the 1m candle. Positive = candle closed bullish, negative = bearish. Useful to spot a structural bias in how CPI prints get faded or held.

| Year | Count | Avg Range 1m | Max Range 1m | Avg Move Up | Avg Move Down | Avg Dir 1m |
|------|-------|-------------|--------------|-------------|---------------|-----------|
| 2016 | 8 | 3.2 pts | 7.2 pts | 1.8 pts | 1.4 pts | −0.4 |
| 2017 | 11 | 2.0 pts | 5.2 pts | 0.4 pts | 1.6 pts | −1.1 |
| 2018 | 12 | 12.1 pts | 44.2 pts | 9.0 pts | 3.1 pts | +6.1 |
| 2019 | 12 | 7.6 pts | 25.0 pts | 3.2 pts | 4.5 pts | −1.9 |
| 2020 | 11 | 11.7 pts | 30.5 pts | 3.5 pts | 8.2 pts | −3.4 |
| 2021 | 19 | 20.2 pts | 86.2 pts | 9.8 pts | 10.4 pts | +0.8 |
| 2022 | 24 | 38.3 pts | 197.5 pts | 16.7 pts | 21.6 pts | −1.4 |
| 2023 | 24 | 28.5 pts | 148.2 pts | 15.0 pts | 13.5 pts | +5.4 |
| 2024 | 23 | 40.6 pts | 246.2 pts | 23.7 pts | 16.9 pts | +5.1 |
| 2025 | 21 | 66.5 pts | 224.5 pts | 54.2 pts | 12.2 pts | +37.7 |
| 2026 | 8 | 42.1 pts | 103.8 pts | 28.9 pts | 13.2 pts | +11.3 |

The average release-candle range went from **3.2 pts** in 2016 to **66.5 pts** in 2025 — a 21× expansion. CPI is not the same event it was pre-2020. 2025 also flips the structural bias hard upside (Avg Dir 1m **+37.7**) — releases tended to print and close bullish, not symmetrically.

### Manipulation Wick Analysis

12.7% of releases (22/173) wick **both sides** — meaning NQ travels more than 15 pts up AND more than 15 pts down in the first 5 minutes before committing to a direction. Median manipulation depth is **24.3 pts**.

| Metric | Value |
|--------|-------|
| % Wicked Both Sides | 12.7% (22/173) |
| % Reversal 5m→15m | 1.7% (3/173) |
| Median Manip Depth | 24.3 pts |
| Max Manip Depth | 51.5 pts (2022-12-23) |

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/cpi-points.pdf" download>Download — CPI Points PDF</a>

---

## Article 2 — CPI Fullport

These datas were my own tests to see which metrics are the best to fullport accounts. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

> **Pre-2020 caveat:** CPI was a non-event before the inflation regime. Stops ≥25 pts rarely filled in 2016–2019. Data kept for transparency — use **2022 onwards** as your baseline.

### All Combos — Ranked by TP Hit Rate

| Stop | TP | Fill % | TP Hit % | No Fill % | Avg PnL/ev | Worst PnL |
|------|----|--------|----------|-----------|-----------|-----------|
| 25 | 15 | 65.9% | **45.09%** | 34.1% | +3.17 | −159.75 |
| 25 | 20 | 65.9% | 40.46% | 34.1% | +3.96 | −159.75 |
| 30 | 15 | 59.0% | 39.88% | 41.0% | +1.96 | −164.75 |
| 35 | 15 | 54.3% | 30.64% | 45.7% | +1.30 | −77.00 |
| 25 | 25 | 65.9% | 30.64% | 34.1% | +3.87 | −159.75 |
| 40 | 15 | 47.4% | 30.64% | 52.6% | +0.75 | −230.75 |
| 30 | 20 | 59.0% | 30.06% | 41.0% | +1.84 | −164.75 |
| 35 | 20 | 54.3% | 29.48% | 45.7% | +1.28 | −225.75 |
| 40 | 20 | 47.4% | 28.90% | 52.6% | +1.59 | −230.75 |
| 30 | 25 | 59.0% | 28.32% | 41.0% | +1.36 | −220.75 |
| 35 | 25 | 54.3% | 27.75% | 45.7% | +2.07 | −225.75 |
| 40 | 25 | 47.4% | 24.28% | 52.6% | +0.48 | −230.75 |

Best combo: **Stop 25 / TP 15** — highest TP hit rate (45%), positive avg PnL across all 173 events.

### Year-by-Year — Stop 25 / TP 15

| Year | Count | Fill % | TP Hit % | Avg PnL/ev | Worst DD |
|------|-------|--------|----------|-----------|---------|
| 2016 | 8 | 0% | 0% | 0 | 0 |
| 2017 | 11 | 9.1% | 9.1% | +1.36 | 3.75 |
| 2018 | 12 | 33.3% | 16.7% | +2.29 | 26.5 |
| 2019 | 12 | 8.3% | 0% | −0.90 | 14 |
| 2020 | 11 | 72.7% | 36.4% | −1.77 | 63.75 |
| 2021 | 19 | 63.2% | 52.6% | +6.87 | 44 |
| 2022 | 24 | 87.5% | 62.5% | −0.85 | 172.5 |
| 2023 | 24 | 83.3% | 45.8% | +2.80 | 128.25 |
| 2024 | 23 | 87.0% | 56.5% | +3.46 | 68.75 |
| 2025 | 21 | 90.5% | **76.2%** | +8.83 | 100.75 |
| 2026 | 8 | 100% | **75%** | +11.78 | 47.5 |

2025 and 2026 are the cleanest years on record for this strategy — fill rate near 100%, TP hit rate 75–76%, and the avg P&L/event is climbing.

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/cpi-fullport.pdf" download>Download — CPI Fullport PDF</a>
