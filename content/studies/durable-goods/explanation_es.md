## Durable Goods Straddle — S&P 500 (ES)

Durable Goods Orders (Durable Goods) measures orders for long-lasting manufactured goods — machinery, electronics, aircraft — released monthly at 8:30 ET as a direct read on business investment confidence. This study brackets each release with a straddle on S&P 500 (ES) futures: two orders placed above and below price before the number drops, entering whichever direction fires. The broad index captures the capex signal through industrials, tech, and materials sectors that reprice immediately on business-spending surprises.

These datas were my own tests to see which stop/TP combos perform best on ES around Durable Goods. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in ES pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

ES straddles on Durable Goods benefit from the event's mid-tier status — less algo front-running than CPI or NFP, so the release-minute fills are often cleaner when the print deviates from consensus.

### Interactive explorer

Filter the full ES grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="durable-goods"></div>
