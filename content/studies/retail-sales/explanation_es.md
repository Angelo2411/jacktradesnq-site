## Retail Sales Straddle — S&P 500 (ES)

ES futures straddle around the monthly 8:30 ET Retail Sales release. Consumer spending is ~70% of GDP — when Retail Sales surprises, the broad market re-rates growth expectations, and ES moves as a bloc.

These datas were my own tests to see which stop/TP combos perform best on ES around Retail Sales. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in ES pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

ES's broad-market liquidity makes fills cleaner on Retail Sales than on more volatile events — the release candle tends to be orderly, and the backtest reflects that in fill-rate consistency.

### Interactive explorer

Filter the full ES grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="retail-sales"></div>
