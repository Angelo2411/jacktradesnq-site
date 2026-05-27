## PCE Core Straddle — Gold

PCE Inflation (PCE) is the Federal Reserve's preferred inflation gauge, released monthly at 8:30 ET — it directly shapes interest rate expectations and moves Gold (GC) hard when it surprises. This study runs a straddle around each PCE release: two bracket orders sit above and below price before the number drops, taking whichever direction fires. Gold is particularly sensitive to PCE because the metal prices real rates, and the Fed's reaction to this print determines whether those rates tighten or ease.

These datas were my own tests to see which stop/TP combos perform best on Gold around PCE. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close in Gold pts, TP at fill ±TP, no SL, 30-min expiry. Bilateral straddle across Stop/TP combos tested over a 10-year window.

Gold treats PCE as a real-rate signal with maximum Fed-policy weight — hotter PCE means the Fed stays tighter, which can cut both ways for Gold depending on the inflation-expectations vs rate-hike-fears balance.

### Interactive explorer

Filter the full Gold grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="pce"></div>
