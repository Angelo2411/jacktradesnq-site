## Jobless Claims Straddle — Silver

Jobless Claims drops every Thursday at 8:30 ET — weekly unemployment filings, the highest-frequency labor market read on the calendar. You don't pick a side here: you bracket the release. A buy-stop sits above price, a sell-stop below, both set before the number drops, and whichever way Silver (SI) breaks, you're already in.

These datas were my own tests to see which stop/TP combos perform best on Silver futures around jobless claims. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in SI pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

Silver's thinner liquidity means wider spreads and more slippage — but the moves, when they come, can be outsized relative to the offset. Test wider stops than Gold to account for the noise.

### Interactive explorer

Filter the full Silver grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="jobless-claims"></div>
