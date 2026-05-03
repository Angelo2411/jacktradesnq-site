## Article 1 — NQ Move Statistics (173 Releases · 2016–2026)

Source: monfxreplay, NQ 1m bars. Move Up/Down = max pts from release price over 30 min. Range = high − low.

### Year-by-Year Averages

| Year | Count | Avg Range 5m | Avg Range 30m | Max Range 30m | Avg Dir 15m |
|------|-------|-------------|--------------|--------------|-------------|
| 2016 | 8 | 5 pts | 8.8 pts | 16.5 pts | +0.4 |
| 2017 | 11 | 5.3 pts | 13.3 pts | 51 pts | −5.5 |
| 2018 | 12 | 16.8 pts | 27.5 pts | 60 pts | +5 |
| 2019 | 12 | 10.5 pts | 17.3 pts | 27.5 pts | +3.1 |
| 2020 | 11 | 26 pts | 46.6 pts | 79.5 pts | −9.2 |
| 2021 | 19 | 34.8 pts | 54.3 pts | 145 pts | −0.7 |
| 2022 | 24 | 57.1 pts | 90.7 pts | 280.5 pts | +6 |
| 2023 | 24 | 39.4 pts | 59 pts | 151.3 pts | +12.9 |
| 2024 | 23 | 58.4 pts | 82.4 pts | 360.8 pts | +4.7 |
| 2025 | 21 | 84.1 pts | 113.6 pts | 334.8 pts | +38.2 |
| 2026 | 8 | 59.1 pts | 101.9 pts | 143.3 pts | −3.3 |

The average 30m range went from **8.8 pts** in 2016 to **113.6 pts** in 2025 — a 13× expansion. CPI is not the same event it was pre-2020.

### Manipulation Wick Analysis

12.7% of releases (22/173) wick **both sides** — meaning NQ travels more than 15 pts up AND more than 15 pts down in the first 5 minutes before committing to a direction. Median manipulation depth is **24.3 pts**. Practical implication: straddle stops placed at 20 pts or less get hunted before the real move starts on roughly 1 in 8 releases.

| Metric | Value |
|--------|-------|
| % Wicked Both Sides | 12.7% (22/173) |
| % Reversal 5m→15m | 1.7% (3/173) |
| Median Manip Depth | 24.3 pts |
| Max Manip Depth | 51.5 pts (2022-12-23) |

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/cpi-day-stats.pdf" download>Download — NQ Move Statistics PDF</a>

---

## Article 2 — CPI Straddle Backtest, Full-Port (173 Releases · 12 Combos)

Buy stop X pts above price + sell stop X pts below, 1 minute before release. Force-close at 30 min. 12 Stop/TP combinations tested.

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

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/cpi-straddle-backtest.pdf" download>Download — Straddle Backtest Full-Port PDF</a>
