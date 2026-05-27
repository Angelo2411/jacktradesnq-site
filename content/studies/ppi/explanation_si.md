## PPI Straddle — Silver

The Producer Price Index (PPI) tracks wholesale inflation — what manufacturers pay before goods reach consumers — released monthly at 8:30 ET. This study runs a straddle on Silver (SI) futures around each PPI release: two bracket orders placed above and below price before the number drops, entering whichever side fires. Silver reacts to PPI through two channels at once — as an inflation hedge and as an industrial metal tied to factory activity.

These datas were my own tests to see which stop/TP combos perform best on Silver futures around PPI. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in SI pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

Silver's thinner liquidity and dual-demand profile make it a higher-volatility play on PPI than Gold. The backtest shows which offsets survive the noise.

### Interactive explorer

Filter the full Silver grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="ppi"></div>
