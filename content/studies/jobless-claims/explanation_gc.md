## Jobless Claims Straddle — Gold

Jobless Claims (weekly US unemployment filings) hits every Thursday at 8:30 ET — a surprisingly high number means the labor market is weakening, a low number signals strength, and both move Gold (GC). This study brackets each release with a straddle: two orders placed above and below price before the number drops, entering whichever side fires. Because it's weekly rather than monthly, the backtest accumulates far more trade samples than any other event on the calendar.

These datas were my own tests to see which stop/TP combos perform best on Gold around the 8:30 ET jobless claims release. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in Gold pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

Gold's reaction to jobless claims tends to be cleaner than NQ — less head-fake wick, more directional follow-through on the dollar leg. Tighter offsets capture the move earlier without getting eaten by manipulation.

### Interactive explorer

Filter the full Gold grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="jobless-claims"></div>
