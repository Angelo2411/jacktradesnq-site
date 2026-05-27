## PCE Core Straddle — NQ

PCE Inflation (PCE) is the Federal Reserve's preferred measure of inflation, released monthly at 8:30 ET — when it surprises, the Fed's rate path shifts and markets move fast. This study brackets each PCE release with a straddle: two orders placed above and below the Nasdaq 100 (NQ) price before the number drops, entering whichever direction fires. Because the Fed watches PCE more closely than any other inflation print, the reaction on NQ tends to be sharp and decisive.

These datas were my own tests to see which stop/TP combos perform best on NQ around PCE. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window. 1 NQ pt ≈ $20 / 1 MNQ pt ≈ $2.

PCE straddles carry higher stakes than CPI because the Fed watches this number more closely — the market's reaction function is sharper and more binary.

### Interactive explorer

Filter the full grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="pce"></div>
