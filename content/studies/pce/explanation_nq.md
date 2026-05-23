## PCE Core Straddle — NQ

PCE Core is the Fed's preferred inflation gauge — monthly, 8:30 ET, and the single data point that most directly shapes rate-path expectations. When PCE surprises, the entire curve reprices, and NQ moves with it.

These datas were my own tests to see which stop/TP combos perform best on NQ around PCE. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window. 1 NQ pt ≈ $20 / 1 MNQ pt ≈ $2.

PCE straddles carry higher stakes than CPI because the Fed watches this number more closely — the market's reaction function is sharper and more binary.

### Interactive explorer

Filter the full grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="pce"></div>
