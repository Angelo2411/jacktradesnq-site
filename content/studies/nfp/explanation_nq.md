## Article 1 — NFP Points

The PDF "NFP Points" shows every data related to NFP in terms of points from 2016 to 2026. Sample size: **102 releases** with valid 1-minute NQ bar data.

### Year-by-Year — Release Candle Range (1m, 8:30 ET)

NFP volatility lives almost entirely inside the 1-minute release bar. How many points NQ travels high-to-low on that single candle, year by year.

**Range 1m** = the high minus the low (in NQ points) of the 8:30 ET candle — i.e. the full top-to-bottom travel during the 60 seconds of the release.

| Year | Count | Avg Range 1m | Max Range 1m |
|------|-------|-------------|--------------|
| 2016 | 7  | 12.9 pts  | 22.8 pts  |
| 2017 | 10 | 7.6 pts   | 13.8 pts  |
| 2018 | 11 | 20.0 pts  | 45.0 pts  |
| 2019 | 11 | 22.4 pts  | 45.5 pts  |
| 2020 | 9  | 27.9 pts  | 52.2 pts  |
| 2021 | 11 | 43.5 pts  | 87.0 pts  |
| 2022 | 11 | 126.9 pts | 240.8 pts |
| 2023 | 10 | 90.4 pts  | 187.5 pts |
| 2024 | 11 | 118.5 pts | 199.8 pts |
| 2025 | 7  | 110.1 pts | 187.5 pts |
| 2026 | 4  | 106.8 pts | 173.8 pts |

The average release-candle range went from **12.9 pts** in 2016 to **110.1 pts** in 2025 — an 8.5× expansion. Like CPI, the inflation regime turned NFP into a violent event.

<a class="bd-btn bd-btn-secondary" href="/downloads/studies/nfp-points.pdf" download>Download — NFP Points PDF</a>

---

## Article 2 — NFP Fullport

These datas were my own tests to see which metrics are the best to fullport accounts. Tighter offsets (≤75 pts) are negative-expectancy — the manip wick eats them alive — but pushing the offset wider (80-100+) flips the strategy positive. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

> **Wider offsets are required.** The first round of tests (offsets 45-75) all came out negative — those stops are still inside the manip-wick range, so they get filled by the head-fake then bleed when price retraces. Pushing the offset to 80-150 pts skips the manip wick entirely. Best combo flips to **positive expectancy** that way.

### Setup

OCO buy-stop / sell-stop ±Offset from release close, TP at fill ±TP, no SL, 30-min expiry. 24 combos tested (Offset ∈ {45, 60, 80, 100, 120, 150} × TP ∈ {20, 30, 50, 75}). 1 NQ pt ≈ $20 / 1 MNQ pt ≈ $2.

### Where to place your stop and TP

After testing 24 combos across 102 NFP releases:

- **Stop offset: 100 pts** — sits past the typical manip-wick range. Tighter offsets (≤75) get filled by the head-fake then bleed.
- **Take profit: 50 pts** — large enough to clear the chop, tight enough to actually get hit.

Fill rate ~24% — you skip the NFPs that don't reach ±100 pts in 60 seconds. When you do fill, you're entering on the real directional leg.

### Why Offset Size Matters

NFP triggers fast manipulation wicks both sides before committing to a direction. The median manip-wick reaches into the 50-80 pt range — anything closer and you get filled by the head-fake, then bleed on the retrace (no SL). Push the offset to 80-100+ and you skip the manipulation entirely; the only fills you get are real moves big enough to break through 100 pts in the release minute.

### Interactive explorer

Filter the 24-combo grid live — pick offset / TP / year window — and download a tailored PDF report.

<div data-explorer="nfp"></div>

