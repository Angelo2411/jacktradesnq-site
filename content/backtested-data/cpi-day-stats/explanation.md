## Article 1 — CPI Points

The PDF "CPI Points" shows every data related to CPI in terms of points from 2016 to 2026.

### Year-by-Year — Release Candle Range (1m, 8:30 ET)

CPI volatility lives almost entirely inside the 1-minute release bar. How many points NQ travels high-to-low on that single candle, year by year.

**Range 1m** = the high minus the low (in NQ points) of the 8:30 ET candle — i.e. the full top-to-bottom travel during the 60 seconds of the release.

| Year | Count | Avg Range 1m | Max Range 1m |
|------|-------|-------------|--------------|
| 2016 | 8 | 3.2 pts | 7.2 pts |
| 2017 | 11 | 2.0 pts | 5.2 pts |
| 2018 | 12 | 12.1 pts | 44.2 pts |
| 2019 | 12 | 7.6 pts | 25.0 pts |
| 2020 | 11 | 11.7 pts | 30.5 pts |
| 2021 | 19 | 20.2 pts | 86.2 pts |
| 2022 | 24 | 38.3 pts | 197.5 pts |
| 2023 | 24 | 28.5 pts | 148.2 pts |
| 2024 | 23 | 40.6 pts | 246.2 pts |
| 2025 | 21 | 66.5 pts | 224.5 pts |
| 2026 | 8 | 42.1 pts | 103.8 pts |

The average release-candle range went from **3.2 pts** in 2016 to **66.5 pts** in 2025 — a 21× expansion. CPI is not the same event it was pre-2020.

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/cpi-points.pdf" download>Download — CPI Points PDF</a>

---

## Article 2 — CPI Fullport

These datas were my own tests to see which metrics are the best to fullport accounts. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

Bilateral straddle, full-port, **no stop loss**:
- Buy stop pending order at release price **+ Offset** (in NQ points)
- Sell stop pending order at release price **− Offset** (OCO with the buy stop — first touched fills, the other cancels)
- Take Profit at fill price **± TP**
- If TP is not hit within 30 min → position closed

All values below are in **NQ points** (1 pt ≈ $20 on 1 NQ contract / $2 on 1 MNQ).

**Quick glossary:**
- **Offset** — distance in points between the release price and where each pending stop order is placed. Offset 25 = buy stop 25 pts above, sell stop 25 pts below.
- **OCO** ("One Cancels Other") — the two pending stops are linked. Whichever gets touched first fills, the other auto-cancels.
- **Filled** — the market triggered one of your stops; you have an open position. Not filled = no position, PnL stays 0.

> **Pre-2020 note:** CPI was a non-event before the inflation regime. Offsets ≥25 pts rarely filled in 2016–2019. Data kept for transparency — use **2022 onwards** as your baseline.

### All Combos — Ranked by TP Hit Rate

| Offset (pts) | TP (pts) | Fill % | TP Hit % | No Fill % |
|------|----|--------|----------|-----------|
| 25 | 15 | 65.9% | **45.09%** | 34.1% |
| 25 | 20 | 65.9% | 40.46% | 34.1% |
| 30 | 15 | 59.0% | 39.88% | 41.0% |
| 35 | 15 | 54.3% | 30.64% | 45.7% |
| 25 | 25 | 65.9% | 30.64% | 34.1% |
| 40 | 15 | 47.4% | 30.64% | 52.6% |
| 30 | 20 | 59.0% | 30.06% | 41.0% |
| 35 | 20 | 54.3% | 29.48% | 45.7% |
| 40 | 20 | 47.4% | 28.90% | 52.6% |
| 30 | 25 | 59.0% | 28.32% | 41.0% |
| 35 | 25 | 54.3% | 27.75% | 45.7% |
| 40 | 25 | 47.4% | 24.28% | 52.6% |

Best combo: **Offset 25 / TP 15** — highest TP hit rate (45%) across all 173 events.

### Year-by-Year — Offset 25 / TP 15

| Year | Count | Wins | Losses | No-Fill |
|------|-------|------|--------|---------|
| 2016 | 8  | 0  | 0 | 8  |
| 2017 | 11 | 1  | 0 | 10 |
| 2018 | 12 | 2  | 2 | 8  |
| 2019 | 12 | 0  | 1 | 11 |
| 2020 | 11 | 4  | 4 | 3  |
| 2021 | 19 | 10 | 2 | 7  |
| 2022 | 24 | 15 | 6 | 3  |
| 2023 | 24 | 11 | 9 | 4  |
| 2024 | 23 | 13 | 7 | 3  |
| 2025 | 21 | 16 | 3 | 2  |
| 2026 | 8  | 6  | 2 | 0  |

**Wins** = TP hit before 30-min expiry. **Losses** = filled but TP not hit (held to expiry). **No-Fill** = neither stop triggered, flat at 0.

2025 and 2026 are the cleanest years on record — 16/3 and 6/2 win-loss splits.

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/cpi-fullport.pdf" download>Download — CPI Fullport PDF</a>
