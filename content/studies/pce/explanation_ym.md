## PCE Core Straddle — Dow (YM)

YM futures straddle around the monthly 8:30 ET PCE Core release. The Dow's composition — industrials, financials, cyclicals — means PCE hits through the cost-of-capital channel: tighter policy on a hot print raises borrowing costs across the Dow's capital-intensive names.

These datas were my own tests to see which stop/TP combos perform best on YM around PCE. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in YM pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

YM's rate-sensitivity on PCE is distinct from NQ's — the Dow's old-economy tilt means inflation-driven rate repricing hits different sectors. The backtest reveals whether that creates a different offset sweet spot.

### Interactive explorer

Filter the full YM grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="pce"></div>
