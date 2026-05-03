## Article 1 — NFP Points

The PDF "NFP Points" shows every data related to NFP in terms of points from 2016 to 2026. Sample size: **114 releases** with valid 1-minute NQ bar data.

### Year-by-Year Averages

| Year | Events | Avg Range 5m | Median 5m | Max Range 5m | Avg Range 30m | Max Range 30m | Avg Dir 15m |
|------|--------|-------------|-----------|--------------|--------------|--------------|-------------|
| 2016 | 8  | 17.91 pts  | 18.25  | 25.50  | 21.56  | 31.25  | +2.88  |
| 2017 | 12 | 12.67 pts  | 11.62  | 28.50  | 15.79  | 28.50  | +1.31  |
| 2018 | 12 | 29.75 pts  | 26.75  | 63.50  | 38.52  | 69.50  | +4.17  |
| 2019 | 12 | 31.90 pts  | 30.50  | 61.25  | 41.44  | 61.25  | +6.10  |
| 2020 | 11 | 41.36 pts  | 34.75  | 90.25  | 62.66  | 121.00 | −0.80  |
| 2021 | 12 | 69.21 pts  | 54.88  | 176.75 | 89.44  | 187.00 | +20.81 |
| 2022 | 12 | 143.38 pts | 131.38 | 295.25 | 186.46 | 295.25 | −73.94 |
| 2023 | 12 | 110.08 pts | 95.62  | 208.00 | 127.02 | 224.75 | +4.92  |
| 2024 | 12 | 135.29 pts | 118.50 | 228.25 | 159.50 | 253.00 | +13.58 |
| 2025 | 8  | 145.72 pts | 127.88 | 275.00 | 172.81 | 275.00 | +22.56 |
| 2026 | 3  | 113.08 pts | 98.25  | 173.75 | 168.33 | 290.50 | −39.25 |

NFP went from a **17 pt** avg range in 2016 to **145 pts** in 2025 — an 8× expansion. Like CPI, the inflation regime turned NFP into a violent event.

### Top 10 Most Violent Releases (by 30m range)

| Date | Range 5m | Range 30m | Dir 15m | Max Up | Max Down |
|------|---------|----------|---------|--------|----------|
| 2022-12-02 | 295.25 | 295.25 | −238.25 | 4.25  | 291.00 |
| 2026-03-06 | 173.75 | 290.50 | −172.00 | 35.00 | 255.50 |
| 2025-01-10 | 275.00 | 275.00 | −146.25 | 18.00 | 257.00 |
| 2022-11-04 | 204.50 | 262.50 | +22.00  | 105.50 | 157.00 |
| 2024-08-02 | 228.25 | 253.00 | −171.00 | 52.00 | 201.00 |
| 2022-10-07 | 208.50 | 243.50 | −180.00 | 0.00  | 243.50 |
| 2024-09-06 | 199.75 | 238.25 | +105.00 | 181.00 | 57.25 |
| 2025-03-07 | 212.25 | 235.75 | +56.50  | 166.25 | 69.50 |
| 2022-08-05 | 169.75 | 229.50 | −173.75 | 4.75  | 224.75 |
| 2023-10-06 | 208.00 | 224.75 | −185.00 | 2.50  | 222.25 |

### Threshold Probabilities (range_5m, all 114 events)

| Threshold | Count > | Pct > |
|-----------|---------|-------|
| > 30 pts  | 78 | 68.4% |
| > 50 pts  | 58 | 50.9% |
| > 80 pts  | 44 | 38.6% |
| > 100 pts | 31 | 27.2% |
| > 150 pts | 18 | 15.8% |

### Direction Bias

| Window  | Up        | Down      |
|---------|-----------|-----------|
| 5m  | 64 (56.1%) | 50 (43.9%) |
| 15m | 63 (55.3%) | 51 (44.7%) |

Slight upside skew, but essentially a coin flip on direction. The size of the move is the real story, not the sign.

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/nfp-points.pdf" download>Download — NFP Points PDF</a>

---

## Article 2 — NFP Fullport

These datas were my own tests to see which metrics are the best to fullport accounts. Unlike CPI, **every single NFP straddle combo tested came out negative-expectancy**. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

> **What doesn't work, contrary to CPI:** 42 combos tested, all losing. Best combo only loses **−5.66 pts/event** on average. NFP whipsaws too hard for a no-stop straddle to capture the move cleanly.

### Setup

Buy stop X pts above price + sell stop X pts below, 1 minute before release. **No stop loss** — position stays open until TP or 30-min expiry. Entry offsets in {45, 50, 55, 60, 65, 70, 75}, TPs in {20, 25, 30, 35, 40, 50}.

### Top 10 Combos (least bad) — Ranked by TP Hit Rate

| Off | TP | Fill % | TP Hit % | Exp % | Avg PnL/ev | Avg PnL (filled) | Worst PnL |
|-----|----|--------|----------|-------|-----------|------------------|-----------|
| 45 | 20 | 54.39% | **34.21%** | 20.18% | −5.66  | −10.4  | −278.5 |
| 50 | 20 | 51.75% | 33.33%     | 18.42% | −4.77  | −9.22  | −223.25 |
| 45 | 25 | 54.39% | 31.58%     | 22.81% | −6.25  | −11.49 | −278.5 |
| 55 | 20 | 48.25% | 30.70%     | 17.54% | −4.23  | −8.76  | −170.0 |
| 50 | 25 | 51.75% | 29.82%     | 21.93% | −4.99  | −9.64  | −223.25 |
| 60 | 20 | 44.74% | 28.95%     | 15.79% | −2.66  | −5.94  | −175.0 |
| 45 | 30 | 54.39% | 28.07%     | 26.32% | −6.54  | −12.03 | −278.5 |
| 65 | 20 | 41.23% | 27.19%     | 14.04% | −2.18  | −5.28  | −138.25 |
| 70 | 20 | 39.47% | 26.32%     | 13.16% | −1.75  | −4.44  | −143.25 |
| 60 | 25 | 44.74% | 26.32%     | 18.42% | −3.11  | −6.95  | −175.0 |

### Best Combo: Offset 45 / TP 20

- TP hit rate: **34.21%**
- Avg PnL per event: **−5.66 pts**
- Worst single event: **−278.5 pts** (2022-12-02)

### Why It Doesn't Work

NFP triggers fast manipulation wicks both sides before committing to a direction. Without a stop loss, the wrong-side fill stays open and bleeds when the real move retraces. Tighter TP captures more hits but smaller payouts; wider TP gets fewer fills. No combo escapes negative expectancy across 114 events.

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/nfp-fullport.pdf" download>Download — NFP Fullport PDF</a>
