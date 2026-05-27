## Durable Goods Straddle — Silver

Durable Goods Orders (Durable Goods) measures orders for long-lasting manufactured goods — machinery, electronics, aircraft — released monthly at 8:30 ET as a read on factory and business activity. This study brackets each release with a straddle on Silver (SI) futures: two orders placed above and below price before the number drops, entering whichever side fires. Silver has a direct industrial-demand link to this report — strong capex orders mean more factory activity, which consumes silver in manufacturing processes.

These datas were my own tests to see which stop/TP combos perform best on Silver futures around Durable Goods. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in SI pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

Silver may show a stronger directional reaction to Durable Goods than Gold because the industrial-demand channel runs parallel to the rate channel. The backtest disambiguates which dominates.

### Interactive explorer

Filter the full Silver grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="durable-goods"></div>
