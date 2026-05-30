## Retail Sales Straddle — S&P 500 (ES)

Retail Sales hits at 8:30 ET — the monthly consumer spending report, how much Americans spent at stores and online. You don't pick a side here: you bracket the release. A buy-stop sits above price, a sell-stop below, both set before the number drops, and whichever way the S&P 500 (ES) breaks, you're already in.

These datas were my own tests to see which stop/TP combos perform best on ES around Retail Sales. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in ES pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

ES's broad-market liquidity makes fills cleaner on Retail Sales than on more volatile events — the release candle tends to be orderly, and the backtest reflects that in fill-rate consistency.

### Interactive explorer

Filter the full ES grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="retail-sales"></div>
