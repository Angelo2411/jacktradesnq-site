## Retail Sales Straddle — Gold

Retail Sales is the monthly US consumer spending report, released at 8:30 ET — it shows how much Americans spent at stores and online, signaling whether the economy is running hot or cooling. This study brackets each release with a straddle on Gold (GC) futures: two orders placed above and below price before the number drops, entering whichever side fires. Gold reacts because strong consumer spending can push rates higher, pressuring the metal, while a weak print fuels safe-haven demand and bids it.

These datas were my own tests to see which stop/TP combos perform best on Gold around Retail Sales. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in Gold pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

Gold's reaction to Retail Sales is less direct than CPI — the metal trades the second-order rate implication, not the data point itself. Offsets need to account for that delayed transmission.

### Interactive explorer

Filter the full Gold grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="retail-sales"></div>
