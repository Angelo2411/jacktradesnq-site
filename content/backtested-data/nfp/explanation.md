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

These datas were my own tests to see which metrics are the best to fullport accounts. Unlike CPI, **every single NFP straddle combo tested came out negative-expectancy**. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

> **What doesn't work, contrary to CPI:** 42 combos tested, all losing. Best combo only loses **−5.66 pts/event** on average. NFP whipsaws too hard for a no-stop straddle to capture the move cleanly.

### Setup

Bilateral straddle, full-port, **no stop loss**:
- Buy stop pending order at release price **+ Offset** (in NQ points)
- Sell stop pending order at release price **− Offset** (OCO)
- Take Profit at fill price **± TP**
- If TP not hit by minute 30 → exit at the m=30 close
- Entry offsets tested in {45, 50, 55, 60, 65, 70, 75}, TPs in {20, 25, 30, 35, 40, 50}

All values below in **NQ points** (1 pt ≈ $20 on 1 NQ contract / $2 on 1 MNQ).

**Quick glossary:**
- **Offset** — distance in points between the release price and where each pending stop order is placed.
- **OCO** ("One Cancels Other") — the two pending stops are linked. Whichever gets touched first fills, the other auto-cancels.
- **Filled** — the market triggered one of your stops; you have an open position. Not filled = no position, PnL stays 0.
- **Expired** — filled events where TP was never touched, so the trade closed at the 30-min cutoff. `Fill % = TP Hit % + Expired %`.
- **Avg PnL/event** vs **Avg PnL filled** — the first averages over all events (No Fill counted as 0), the second averages only over events where you actually had a position.
- **Worst PnL** — the single worst event in the sample: filled then held to 30-min close. The blow-up scenario fullport with no stop loss has to survive.

### Top 10 Combos (least bad) — Ranked by TP Hit Rate

| Offset (pts) | TP (pts) | Fill % | TP Hit % | Expired % | Avg PnL/event (pts) | Avg PnL filled (pts) | Worst PnL (pts) |
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
