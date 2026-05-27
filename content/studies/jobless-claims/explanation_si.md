## Jobless Claims Straddle — Silver

Jobless Claims (weekly US unemployment filings) drops every Thursday at 8:30 ET — a high reading signals labor market weakness, a low reading signals strength, and both move metals through the dollar channel. This study brackets each release with a straddle on Silver (SI) futures: two orders placed above and below price before the number drops, entering whichever side fires. Silver amplifies the same dollar-reaction as Gold but with wider ranges and thinner liquidity, producing a different backtest profile.

These datas were my own tests to see which stop/TP combos perform best on Silver futures around jobless claims. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in SI pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

Silver's thinner liquidity means wider spreads and more slippage — but the moves, when they come, can be outsized relative to the offset. Test wider stops than Gold to account for the noise.

### Interactive explorer

Filter the full Silver grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="jobless-claims"></div>
