## PPI Straddle — Gold

PPI hits at 8:30 ET — wholesale inflation, the prices factories charge before goods reach the shelf. You don't pick a side here: you bracket the release. A buy-stop sits above price, a sell-stop below, both set before the number drops, and whichever way Gold (GC) breaks, you're already in.

These datas were my own tests to see which stop/TP combos perform best on Gold around PPI. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in Gold pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

Gold treats PPI as a real-rate signal — hotter PPI implies tighter policy, which can go either way for the metal depending on whether inflation expectations or rate-hike fears dominate. The backtest captures both regimes.

### Interactive explorer

Filter the full Gold grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="ppi"></div>
