## Durable Goods Straddle — Dow (YM)

Durable Goods Orders (Durable Goods) measures orders for long-lasting manufactured goods — aircraft, machinery, heavy equipment — released monthly at 8:30 ET as a direct read on business investment. This study brackets each release with a straddle on Dow Jones (YM) futures: two orders placed above and below price before the number drops, entering whichever direction fires. The Dow is packed with the exact industrials this report measures — Boeing, Caterpillar, 3M — making Durable Goods one of the most directly relevant macro prints for YM.

These datas were my own tests to see which stop/TP combos perform best on YM around Durable Goods. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in YM pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

YM's industrial-DNA means Durable Goods straddles here are higher-conviction — the Dow moves on capex signals in a way NQ doesn't. The backtest confirms or denies whether that conviction translates to better fill rates.

### Interactive explorer

Filter the full YM grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="durable-goods"></div>
