## Jobless Claims Straddle — NQ

Jobless Claims (weekly US unemployment filings) drops every Thursday at 8:30 ET — it's the most frequent labor market data point on the calendar, published weekly rather than monthly. This study brackets each release with a straddle on Nasdaq 100 (NQ) futures: two orders placed above and below price before the number drops, entering whichever direction fires. The weekly cadence means far more trade samples than monthly events, so the edge here is built on consistency over a large sample.

These datas were my own tests to see which stop/TP combos perform best on NQ around the 8:30 ET jobless claims release. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window. 1 NQ pt ≈ $20 / 1 MNQ pt ≈ $2.

Jobless Claims is a weekly steady-eddy — the moves are smaller than CPI or NFP but the frequency gives you far more bites at the apple.

### Interactive explorer

Filter the full grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="jobless-claims"></div>
