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
- If TP is not hit within 30 min → position closed
- Entry offsets tested in {45, 60, 80, 100, 120, 150}, TPs in {20, 30, 50, 75} → 24 combos

All values below in **NQ points** (1 pt ≈ $20 on 1 NQ contract / $2 on 1 MNQ).

**Quick glossary:**
- **Offset** — distance in points between the release price and where each pending stop order is placed.
- **OCO** ("One Cancels Other") — the two pending stops are linked. Whichever gets touched first fills, the other auto-cancels.
- **Filled** — the market triggered one of your stops; you have an open position. Not filled = no position, PnL stays 0.

### Where to place your stop and TP

After testing 24 combos across 114 NFP releases:

- **Stop offset: 100 pts** — sits past the typical manip-wick range. Tighter offsets (≤75) get filled by the head-fake then bleed.
- **Take profit: 50 pts** — large enough to clear the chop, tight enough to actually get hit.

Fill rate ~24% — you skip the NFPs that don't reach ±100 pts in 60 seconds. When you do fill, you're entering on the real directional leg.

The full 24-combo breakdown and year-by-year stats are in the PDF below.

### Year-by-Year — Best by TP Hit Rate (Offset 45 / TP 20)

This is the highest-fill, highest-TP-hit combo — useful to read **how often** the trade actually wins.

| Year | Count | Wins | Losses | No-Fill |
|------|-------|------|--------|---------|
| 2016 | 8  | 0  | 0 | 8  |
| 2017 | 12 | 0  | 0 | 12 |
| 2018 | 12 | 1  | 0 | 11 |
| 2019 | 12 | 0  | 3 | 9  |
| 2020 | 11 | 2  | 3 | 6  |
| 2021 | 12 | 4  | 3 | 5  |
| 2022 | 12 | 10 | 2 | 0  |
| 2023 | 12 | 9  | 2 | 1  |
| 2024 | 12 | 6  | 6 | 0  |
| 2025 | 8  | 5  | 3 | 0  |
| 2026 | 3  | 2  | 1 | 0  |

**Wins** = TP hit before 30-min expiry. **Losses** = filled but TP not hit (held to expiry). **No-Fill** = neither stop triggered, flat at 0.

### Why Offset Size Matters

NFP triggers fast manipulation wicks both sides before committing to a direction. The median manip-wick reaches into the 50-80 pt range — anything closer and you get filled by the head-fake, then bleed on the retrace (no SL). Push the offset to 80-100+ and you skip the manipulation entirely; the only fills you get are real moves big enough to break through 100 pts in the release minute.

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/nfp-fullport.pdf" download>Download — NFP Fullport PDF</a>
