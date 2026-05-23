## PPI Straddle — S&P 500 (ES)

ES futures straddle around the monthly 8:30 ET PPI release. The broad index absorbs PPI through the rate-expectations channel — hot producer prices tighten financial conditions, and 500 stocks reprice together.

These datas were my own tests to see which stop/TP combos perform best on ES around PPI. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in ES pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

ES straddles on PPI benefit from the index's deeper liquidity — fills are cleaner, slippage is lower, but the range per point is smaller than NQ. Position sizing compensates.

### Interactive explorer

Filter the full ES grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="ppi"></div>
