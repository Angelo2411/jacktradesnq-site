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
- If TP not hit by minute 30 → exit at the m=30 close (no SL means no forced exit before that)

All values below are in **NQ points** (1 pt ≈ $20 on 1 NQ contract / $2 on 1 MNQ).

**Quick glossary:**
- **Offset** — distance in points between the release price and where each pending stop order is placed. Offset 25 = buy stop 25 pts above, sell stop 25 pts below.
- **OCO** ("One Cancels Other") — the two pending stops are linked. Whichever gets touched first fills, the other auto-cancels. You never end up with two opposite positions.
- **Worst PnL** — the single worst event in the sample: the trade got filled, no TP, no SL, and held to m=30 close at maximum drawdown. This is the "blow-up" scenario that fullport with no stop loss has to survive.

> **Pre-2020 note:** CPI was a non-event before the inflation regime. Offsets ≥25 pts rarely filled in 2016–2019. Data kept for transparency — use **2022 onwards** as your baseline.

### All Combos — Ranked by TP Hit Rate

| Offset (pts) | TP (pts) | Fill % | TP Hit % | No Fill % | Avg PnL/event (pts) | Worst PnL (pts) |
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

Best combo: **Offset 25 / TP 15** — highest TP hit rate (45%), positive avg PnL across all 173 events. Worst single event = −159.75 pts (filled then held to m=30 close, no SL).

### Year-by-Year — Offset 25 / TP 15

| Year | Count | Fill % | TP Hit % | Avg PnL/event (pts) | Worst Drawdown (pts) |
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

2025 and 2026 are the cleanest years on record for this strategy — fill rate near 100%, TP hit rate 75–76%, and the avg PnL/event is climbing.

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/cpi-fullport.pdf" download>Download — CPI Fullport PDF</a>
