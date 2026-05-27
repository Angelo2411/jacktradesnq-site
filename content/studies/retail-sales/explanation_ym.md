## Retail Sales Straddle — Dow (YM)

Retail Sales is the monthly US consumer spending report, released at 8:30 ET — it directly measures demand for the goods and services that drive Dow-listed companies' revenues. This study brackets each release with a straddle on Dow Jones (YM) futures: two orders placed above and below price before the number drops, entering whichever direction fires. The Dow's consumer-cyclical tilt — retailers, autos, home improvement — makes this one of the most relevant macro releases for YM specifically.

These datas were my own tests to see which stop/TP combos perform best on YM around Retail Sales. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in YM pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

YM may show stronger directional follow-through on Retail Sales than NQ — the Dow's sector exposure is literally consumer-facing. The backtest measures whether that shows up in fill rate and PnL.

### Interactive explorer

Filter the full YM grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="retail-sales"></div>
