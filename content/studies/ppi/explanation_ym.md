## PPI Straddle — Dow (YM)

YM futures straddle around the monthly 8:30 ET PPI release. The Dow's old-economy tilt — industrials, materials, energy — makes PPI especially relevant: higher input costs squeeze margins, and YM reflects that pain directly.

These datas were my own tests to see which stop/TP combos perform best on YM around PPI. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in YM pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

YM's sensitivity to input-cost signals gives PPI straddles a different character here — hot PPI can hit the Dow harder than NQ because of the sector mix. The backtest shows whether that edge is tradeable.

### Interactive explorer

Filter the full YM grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="ppi"></div>
