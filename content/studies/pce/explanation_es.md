## PCE Core Straddle — S&P 500 (ES)

ES futures straddle around the monthly 8:30 ET PCE Core release. As the Fed's primary inflation compass, PCE is the single release most likely to move the entire rate curve — and ES, as the broadest equity benchmark, absorbs that repricing across all 500 names.

These datas were my own tests to see which stop/TP combos perform best on ES around PCE. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in ES pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

ES straddles on PCE are a pure rate-path expression — the breadth of the index means sector-level noise cancels out, leaving a clean macro signal. The backtest measures how tradeable that signal is.

### Interactive explorer

Filter the full ES grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="pce"></div>
