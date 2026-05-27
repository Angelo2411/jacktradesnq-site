## Durable Goods Straddle — Gold

Durable Goods Orders (Durable Goods) tracks orders for long-lasting manufactured goods like machinery and aircraft, released monthly at 8:30 ET as a read on business investment. This study brackets each release with a straddle on Gold (GC) futures: two orders placed above and below price before the number drops, entering whichever side fires. Strong orders can pressure Gold by signaling expansion and potential rate tightening; weak orders bid the metal as a slowdown hedge.

These datas were my own tests to see which stop/TP combos perform best on Gold around Durable Goods. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in Gold pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

Gold's reaction to Durable Goods is second-order — the metal trades the rate-path implication, not the capex headline. The backtest shows whether that indirect transmission still produces tradeable fills.

### Interactive explorer

Filter the full Gold grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="durable-goods"></div>
