## PPI Straddle — S&P 500 (ES)

The Producer Price Index (PPI) measures wholesale inflation at the factory level, released monthly at 8:30 ET. This study runs a straddle on S&P 500 (ES) futures around each PPI release: two bracket orders sit above and below the market before the number drops, entering whichever direction fires. When PPI surprises, rate expectations shift and the broad index reprices across all 500 names at once.

These datas were my own tests to see which stop/TP combos perform best on ES around PPI. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in ES pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

ES straddles on PPI benefit from the index's deeper liquidity — fills are cleaner, slippage is lower, but the range per point is smaller than NQ. Position sizing compensates.

### Interactive explorer

Filter the full ES grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="ppi"></div>
