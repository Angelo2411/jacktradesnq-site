## Retail Sales Straddle — NQ

Retail Sales is the monthly US consumer spending report, released at 8:30 ET — it measures how much Americans spent at stores and online, giving a direct read on economic health. This study brackets each release with a straddle on Nasdaq 100 (NQ) futures: two orders placed above and below price before the number drops, entering whichever direction fires. A strong surprise tends to lift growth expectations and bid NQ; a miss does the opposite.

These datas were my own tests to see which stop/TP combos perform best on NQ around Retail Sales. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window. 1 NQ pt ≈ $20 / 1 MNQ pt ≈ $2.

Retail Sales straddles benefit from the fact that the market often underweights this release — the surprise factor can be larger than expected, generating clean directional fills.

### Interactive explorer

Filter the full grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="retail-sales"></div>
