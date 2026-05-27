## PCE Core Straddle — Dow (YM)

PCE Inflation (PCE) is the Federal Reserve's preferred inflation gauge, released monthly at 8:30 ET — a surprise print shifts the rate path and reprices equity markets immediately. This study brackets each PCE release with a straddle on Dow Jones (YM) futures: two orders placed above and below price before the number drops, entering whichever direction fires. The Dow's heavy weighting in industrials and financials makes it particularly sensitive to the cost-of-capital shift that follows a hot or cold PCE print.

These datas were my own tests to see which stop/TP combos perform best on YM around PCE. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in YM pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

YM's rate-sensitivity on PCE is distinct from NQ's — the Dow's old-economy tilt means inflation-driven rate repricing hits different sectors. The backtest reveals whether that creates a different offset sweet spot.

### Interactive explorer

Filter the full YM grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="pce"></div>
