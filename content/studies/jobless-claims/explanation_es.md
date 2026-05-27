## Jobless Claims Straddle — S&P 500 (ES)

Jobless Claims (weekly US unemployment filings) drops every Thursday at 8:30 ET — the most frequent labor market data point on the calendar, published weekly rather than monthly. This study brackets each release with a straddle on S&P 500 (ES) futures: two orders placed above and below price before the number drops, entering whichever direction fires. ES captures how labor data hits broad risk appetite across all 500 names, with generally more measured moves than the tech-heavy Nasdaq.

These datas were my own tests to see which stop/TP combos perform best on ES around jobless claims. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in ES pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

ES ranges are generally tighter than NQ on the same release — the index is less volatile per point. Scale your position sizing to match the expected move.

### Interactive explorer

Filter the full ES grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="jobless-claims"></div>
