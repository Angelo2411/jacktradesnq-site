## PPI Straddle — S&P 500 (ES)

PPI hits at 8:30 ET — wholesale inflation, the prices factories charge before goods reach the shelf. You don't pick a side here: you bracket the release. A buy-stop sits above price, a sell-stop below, both set before the number drops, and whichever way the S&P 500 (ES) breaks, you're already in.

These datas were my own tests to see which stop/TP combos perform best on ES around PPI. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in ES pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

ES straddles on PPI benefit from the index's deeper liquidity — fills are cleaner, slippage is lower, but the range per point is smaller than NQ. Position sizing compensates.

### Interactive explorer

Filter the full ES grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="ppi"></div>
