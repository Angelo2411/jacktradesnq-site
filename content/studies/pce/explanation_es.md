## PCE Core Straddle — S&P 500 (ES)

PCE hits at 8:30 ET — the Fed's preferred inflation gauge, the one that moves rate expectations faster than CPI. You don't pick a side here: you bracket the release. A buy-stop sits above price, a sell-stop below, both set before the number drops, and whichever way the S&P 500 (ES) breaks, you're already in.

These datas were my own tests to see which stop/TP combos perform best on ES around PCE. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in ES pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

ES straddles on PCE are a pure rate-path expression — the breadth of the index means sector-level noise cancels out, leaving a clean macro signal. The backtest measures how tradeable that signal is.

### Interactive explorer

Filter the full ES grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="pce"></div>
