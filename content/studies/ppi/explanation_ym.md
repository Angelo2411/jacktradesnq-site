## PPI Straddle — Dow (YM)

The Producer Price Index (PPI) measures wholesale inflation — what factories charge before goods reach the consumer — released monthly at 8:30 ET. This study runs a straddle on Dow Jones (YM) futures around each PPI release: two bracket orders sit above and below price before the number drops, entering whichever direction fires. The Dow's heavy industrial and materials composition makes it especially sensitive to factory-gate cost surprises.

These datas were my own tests to see which stop/TP combos perform best on YM around PPI. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in YM pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

YM's sensitivity to input-cost signals gives PPI straddles a different character here — hot PPI can hit the Dow harder than NQ because of the sector mix. The backtest shows whether that edge is tradeable.

### Interactive explorer

Filter the full YM grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="ppi"></div>
