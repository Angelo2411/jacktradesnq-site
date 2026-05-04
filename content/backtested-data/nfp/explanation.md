## Article 1 — NFP Points

The PDF "NFP Points" shows every data related to NFP in terms of points from 2016 to 2026. Sample size: **114 releases** with valid 1-minute NQ bar data.

### Year-by-Year — Release Candle Range (1m, 8:30 ET)

NFP volatility lives almost entirely inside the 1-minute release bar. How many points NQ travels high-to-low on that single candle, year by year.

**Range 1m** = the high minus the low (in NQ points) of the 8:30 ET candle — i.e. the full top-to-bottom travel during the 60 seconds of the release.

| Year | Count | Avg Range 1m | Max Range 1m |
|------|-------|-------------|--------------|
| 2016 | 8  | 14.4 pts  | 25.5 pts  |
| 2017 | 12 | 7.6 pts   | 13.8 pts  |
| 2018 | 12 | 21.2 pts  | 45.0 pts  |
| 2019 | 12 | 22.3 pts  | 45.5 pts  |
| 2020 | 11 | 27.8 pts  | 52.2 pts  |
| 2021 | 12 | 43.5 pts  | 87.0 pts  |
| 2022 | 12 | 121.8 pts | 240.8 pts |
| 2023 | 12 | 98.5 pts  | 187.5 pts |
| 2024 | 12 | 118.3 pts | 199.8 pts |
| 2025 | 8  | 127.6 pts | 249.8 pts |
| 2026 | 3  | 107.7 pts | 173.8 pts |

The average release-candle range went from **14.4 pts** in 2016 to **127.6 pts** in 2025 — a 9× expansion. Like CPI, the inflation regime turned NFP into a violent event.

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/nfp-points.pdf" download>Download — NFP Points PDF</a>

---

## Article 2 — NFP Fullport

These datas were my own tests to see which metrics are the best to fullport accounts. Tighter offsets (≤75 pts) are negative-expectancy — the manip wick eats them alive — but pushing the offset wider (80-100+) flips the strategy positive. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

> **Wider offsets are required.** The first round of tests (offsets 45-75) all came out negative — those stops are still inside the manip-wick range, so they get filled by the head-fake then bleed when price retraces. Pushing the offset to 80-150 pts skips the manip wick entirely. Best combo flips to **positive expectancy** that way.

### Setup

Bilateral straddle, full-port, **no stop loss**:
- Buy stop pending order at release price **+ Offset** (in NQ points)
- Sell stop pending order at release price **− Offset** (OCO)
- Take Profit at fill price **± TP**
- If TP not hit by minute 30 → exit at the m=30 close
- Entry offsets tested in {45, 60, 80, 100, 120, 150}, TPs in {20, 30, 50, 75} → 24 combos

All values below in **NQ points** (1 pt ≈ $20 on 1 NQ contract / $2 on 1 MNQ).

**Quick glossary:**
- **Offset** — distance in points between the release price and where each pending stop order is placed.
- **OCO** ("One Cancels Other") — the two pending stops are linked. Whichever gets touched first fills, the other auto-cancels.
- **Filled** — the market triggered one of your stops; you have an open position. Not filled = no position, PnL stays 0.
- **Expired** — filled events where TP was never touched, so the trade closed at the 30-min cutoff. `Fill % = TP Hit % + Expired %`.
- **Avg PnL/event** vs **Avg PnL filled** — the first averages over all events (No Fill counted as 0), the second averages only over events where you actually had a position.
- **Worst PnL** — the single worst event in the sample: filled then held to 30-min close. The blow-up scenario fullport with no stop loss has to survive.

### All 24 Combos — Ranked by Avg PnL/event

| Offset (pts) | TP (pts) | Fill % | TP Hit % | Expired % | Avg PnL/event (pts) | Avg PnL filled (pts) | Worst PnL (pts) |
|-----|----|--------|----------|-------|-----------|------------------|-----------|
| 80  | 75 | 31.58% | 14.91%     | 16.67% | **+4.45**  | +14.10 | −140.5 |
| 100 | 50 | 23.68% | 14.91%     | 8.77%  | **+4.31**  | +18.18 | −111.5 |
| 100 | 30 | 23.68% | 18.42%     | 5.26%  | **+3.85**  | +16.27 | −107.0 |
| 100 | 75 | 23.68% | 11.40%     | 12.28% | +3.54  | +14.94 | −205.25 |
| 80  | 50 | 31.58% | 18.42%     | 13.16% | +3.24  | +10.26 | −140.5 |
| 100 | 20 | 23.68% | 19.30%     | 4.39%  | +2.18  | +9.22  | −107.0 |
| 120 | 30 | 19.30% | 14.91%     | 4.39%  | +2.13  | +11.05 | −131.5 |
| 120 | 75 | 19.30% | 7.89%      | 11.40% | +2.01  | +10.43 | −225.25 |
| 120 | 20 | 19.30% | 16.67%     | 2.63%  | +1.51  | +7.84  | −131.5 |
| 80  | 30 | 31.58% | 21.05%     | 10.53% | +0.29  | +0.91  | −140.5 |
| 150 | 75 | 14.91% | 4.39%      | 10.53% | +0.79  | +5.28  | −255.25 |
| 200 | 75 | 7.02%  | 0.88%      | 6.14%  | +0.19  | +2.71  | −37.75 |
| 80  | 20 | 31.58% | 23.68%     | 7.89%  | −0.61  | −1.94  | −140.5 |
| 60  | 75 | 44.74% | 17.54%     | 27.19% | −1.44  | −3.21  | −175.0 |
| 150 | 30 | 14.91% | 10.53%     | 4.39%  | −0.64  | −4.30  | −255.25 |
| 150 | 50 | 14.91% | 7.02%      | 7.89%  | +0.23  | +1.54  | −255.25 |
| 60  | 50 | 44.74% | 19.30%     | 25.44% | −2.18  | −4.86  | −175.0 |
| 60  | 30 | 44.74% | 24.56%     | 20.18% | −3.14  | −7.03  | −175.0 |
| 60  | 20 | 44.74% | 28.95%     | 15.79% | −2.66  | −5.94  | −175.0 |
| 45  | 20 | 54.39% | **34.21%** | 20.18% | −5.66  | −10.40 | −278.5 |
| 45  | 30 | 54.39% | 28.07%     | 26.32% | −6.54  | −12.03 | −278.5 |
| 45  | 50 | 54.39% | 18.42%     | 35.96% | −8.73  | −16.06 | −278.5 |
| 45  | 75 | 54.39% | 12.28%     | 42.11% | −12.63 | −23.22 | −278.5 |
| 150 | 20 | 14.91% | 12.28%     | 2.63%  | −1.26  | −8.45  | −255.25 |

The 12 top combos (by Avg PnL/event) all use Offset ≥ 80 pts. Anything ≤ 75 pts gets caught by the manip wick and bleeds.

### Best Combo: Offset 100 / TP 50

- Avg PnL per event: **+4.31 pts** (positive expectancy)
- Avg PnL when filled: **+18.18 pts**
- Fill rate: 23.68% — you skip ~76% of NFPs (the ones that don't reach 100 pts)
- TP hit rate among fills: 14.91%
- Worst single event: **−111.5 pts**
- Why it works: Offset 100 sits beyond the typical manip-wick range, so when you do get filled, the head-fake has already exhausted itself — you're entering on the real directional leg.

### Year-by-Year — Offset 100 / TP 50

| Year | Count | Fill % | TP Hit % | Avg PnL/event (pts) |
|------|-------|--------|----------|-----------|
| 2016 | 8  | 0.0%   | 0.0%   | 0     |
| 2017 | 12 | 0.0%   | 0.0%   | 0     |
| 2018 | 12 | 0.0%   | 0.0%   | 0     |
| 2019 | 12 | 0.0%   | 0.0%   | 0     |
| 2020 | 11 | 0.0%   | 0.0%   | 0     |
| 2021 | 12 | 16.7%  | 8.3%   | −5.12 |
| 2022 | 12 | 66.7%  | 41.7%  | **+13.31** |
| 2023 | 12 | 33.3%  | 25.0%  | **+10.77** |
| 2024 | 12 | 58.3%  | 33.3%  | +7.81 |
| 2025 | 8  | 62.5%  | 37.5%  | **+15.06** |
| 2026 | 3  | 33.3%  | 33.3%  | **+16.67** |

Pre-2021 NFP rarely moved 100 pts in 60 seconds → no fills, no edge. The strategy is **only meaningful in the post-2021 inflation/volatility regime** (the era you'll actually trade in).

### Why Offset Size Matters

NFP triggers fast manipulation wicks both sides before committing to a direction. The median manip-wick reaches into the 50-80 pt range — anything closer and you get filled by the head-fake, then bleed on the retrace (no SL). Push the offset to 80-100+ and you skip the manipulation entirely; the only fills you get are real moves big enough to break through 100 pts in the release minute.

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/nfp-fullport.pdf" download>Download — NFP Fullport PDF</a>
