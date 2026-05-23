## Jobless Claims Straddle — Silver

Silver straddles around the weekly jobless claims release — 8:30 ET every Thursday. Silver amplifies the same dollar-reaction dynamic as Gold but with wider ranges and lower liquidity, so the backtest profile is different.

These datas were my own tests to see which stop/TP combos perform best on Silver futures around jobless claims. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in SI pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

Silver's thinner liquidity means wider spreads and more slippage — but the moves, when they come, can be outsized relative to the offset. Test wider stops than Gold to account for the noise.

### Interactive explorer

Filter the full Silver grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="jobless-claims"></div>
