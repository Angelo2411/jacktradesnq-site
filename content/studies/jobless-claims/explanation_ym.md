## Jobless Claims Straddle — Dow (YM)

Jobless Claims (weekly US unemployment filings) drops every Thursday at 8:30 ET — the highest-frequency labor market read on the calendar, published weekly rather than monthly. This study brackets each release with a straddle on Dow Jones (YM) futures: two orders placed above and below price before the number drops, entering whichever direction fires. The Dow's industrial and financial weighting means it reads labor data differently than tech-heavy indexes — more macro sensitivity, less rate-path noise.

These datas were my own tests to see which stop/TP combos perform best on YM around jobless claims. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in YM pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

YM tends to run tighter ranges than NQ on labor data — the Dow is less rate-sensitive, so the release candle is often narrower. Adjust your offset expectations accordingly.

### Interactive explorer

Filter the full YM grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="jobless-claims"></div>
