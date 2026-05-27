## PPI Straddle — Gold

The Producer Price Index (PPI) tracks wholesale inflation — what suppliers charge before goods reach store shelves — published monthly at 8:30 ET. This study runs a straddle on Gold (GC) futures around each PPI release: two bracket orders placed before the number drops, entering whichever side fires. Gold responds to PPI because factory-gate price surprises shift real-rate expectations, which directly moves the metal.

These datas were my own tests to see which stop/TP combos perform best on Gold around PPI. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in Gold pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

Gold treats PPI as a real-rate signal — hotter PPI implies tighter policy, which can go either way for the metal depending on whether inflation expectations or rate-hike fears dominate. The backtest captures both regimes.

### Interactive explorer

Filter the full Gold grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="ppi"></div>
