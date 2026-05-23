## Durable Goods Straddle — NQ

Durable Goods Orders is the capex signal — monthly, 8:30 ET, and a direct read on business confidence. When companies commit to big-ticket equipment, it signals forward-looking optimism that reprices NQ instantly.

These datas were my own tests to see which stop/TP combos perform best on NQ around Durable Goods. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window. 1 NQ pt ≈ $20 / 1 MNQ pt ≈ $2.

Durable Goods is a mid-tier event — it doesn't get the same attention as CPI or NFP, but when the print deviates hard from expectations, the fill can be clean because fewer algos are positioning ahead of it.

### Interactive explorer

Filter the full grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="durable-goods"></div>
