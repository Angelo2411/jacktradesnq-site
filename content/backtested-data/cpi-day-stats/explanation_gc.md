## Article 1 — CPI Points (Gold)

The PDF "CPI Points (Gold)" shows every data related to CPI releases in pts from 2016 to 2026 — 125 releases.

CPI on Gold is a direct inflation trade — the metal reprices instantly on the print. Release-candle ranges are measured in pts. The full year-by-year breakdown of 1-minute release candle ranges is in the PDF below.

<a class="bd-btn bd-btn-secondary" href="/downloads/backtested-data/cpi-points.pdf" download>Download — CPI Points PDF</a>

---

## Article 2 — CPI Fullport (Gold)

These datas were my own tests to see which metrics are the best to fullport accounts on Gold. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

Bilateral straddle, full-port, **no stop loss**:
- Buy stop pending order at release price **+ Offset** (in pts)
- Sell stop pending order at release price **− Offset** (OCO with the buy stop — first touched fills, the other cancels)
- Take Profit at fill price **± TP**
- If TP is not hit within 30 min → position closed

All values below are in **pts**.

Gold CPI straddles tested: offsets {2, 3, 4, 5} pts × TPs {1.5, 2.0, 2.5} pts → 12 combos across 125 releases (2016–2026).

**Quick glossary:**
- **Offset** — distance in pts between the release price and where each pending stop order is placed.
- **OCO** ("One Cancels Other") — the two pending stops are linked. Whichever gets touched first fills, the other auto-cancels.
- **Filled** — the market triggered one of your stops; you have an open position. Not filled = no position, PnL stays 0.

> **Pre-2020 note:** CPI was a non-event on Gold before the inflation regime. Offsets ≥2 pts rarely filled cleanly in 2016–2019. Data kept for transparency — use **2022 onwards** as your baseline.

### Explore the data — your filters, your PDF

Pick a year, stop offset, TP target and side; the table refreshes live and you can download a tailored PDF report.

<div data-explorer="cpi"></div>

