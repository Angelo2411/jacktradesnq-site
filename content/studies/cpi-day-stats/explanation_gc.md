## Article 1 — CPI Points (Gold)

How far does Gold (GC) move when the Consumer Price Index (CPI) — the US monthly inflation report — prints at 8:30 ET? Gold reprices instantly on inflation data; this covers 125 releases from 2016 to 2026 so you can calibrate straddle offsets and size entries before each print. Release-candle ranges are measured in points (dollars per oz). The full year-by-year breakdown of 1-minute release candle ranges is in the PDF below.

<a class="bd-btn bd-btn-secondary" href="/downloads/studies/cpi-points.pdf" download>Download — CPI Points PDF</a>

---

## Article 2 — CPI Fullport (Gold)

These datas were my own tests to see which metrics are the best to fullport accounts on Gold. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

### Setup

OCO buy-stop / sell-stop ±Offset from release close, TP at fill ±TP, no SL, 30-min expiry. 12 Gold combos tested: Offset ∈ {2, 3, 4, 5} pts × TP ∈ {1.5, 2.0, 2.5} pts across 125 releases (2016–2026).

> **Pre-2020 note:** CPI was a non-event on Gold before the inflation regime. Offsets ≥2 pts rarely filled cleanly in 2016–2019. Use **2022 onwards** as your baseline.

### Interactive explorer

Filter the full Gold grid live — pick stop / TP / year window — and download a tailored PDF report.

<div data-explorer="cpi"></div>

### Related

- [NFP straddle (fullport model)](/studies/nfp/) — same fullport explorer on NFP.
- [Full IFVG + SMT NQ — CPI](/studies/cpi-ifvg-smt/) — sweep + IFVG entry variant on CPI.
- [Full IFVG + SMT GC — CPI](/studies/cpi-ifvg-smt-gc/) — Gold variant.
