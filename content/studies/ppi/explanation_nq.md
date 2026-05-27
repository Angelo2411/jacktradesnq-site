## PPI Straddle — NQ

PPI hits at 8:30 ET — wholesale inflation, the prices factories charge before goods reach the shelf. You don't pick a side here: you bracket the release. A buy-stop sits above price, a sell-stop below, both set before the number drops, and whichever way the Nasdaq 100 (NQ) breaks, you're already in.

These datas were my own tests to see which stop/TP combos perform best on NQ around PPI. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window. 1 NQ pt ≈ $20 / 1 MNQ pt ≈ $2.

PPI moves are typically smaller than CPI — the market treats it as the opening act, not the main event. But when PPI and CPI both surprise in the same direction, the cumulative move can be large.

### Interactive explorer

Filter the full grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="ppi"></div>
