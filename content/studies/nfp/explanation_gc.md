## Article 1 — NFP Points (Gold)

This study measures how much Gold (GC) futures move at the moment Non-Farm Payrolls (NFP) — the US monthly jobs report — is released at 8:30 ET. A hot print tends to tank the dollar and lift Gold; a miss does the opposite — this dataset of 124 releases from 2016 to 2026 lets you size straddle entries and set expectations before each print. Release-candle ranges are measured in points (dollars per oz). The full year-by-year breakdown is in the PDF below.

<a class="bd-btn bd-btn-secondary" href="/downloads/studies/nfp-points.pdf" download>Download — NFP Points PDF</a>

---

## Article 2 — NFP Fullport (Gold)

These datas were my own tests to see which metrics are the best to fullport accounts on Gold. Unlike NQ where wider offsets are required to skip the manip wick, Gold NFP straddles work best with tighter offsets — the metal doesn't produce the same violent two-sided wick, so getting in early captures the real move. I remind you guys that these datas are gathered with AI and this is **NOT financial advice** — datas could be wrong, so backtest yourself.

> **Tighter offsets work best.** On NQ, pushing offsets to 80-100+ pts was necessary to escape the manip wick. On Gold, the opposite is true — Entry offset = 2.0 pts is the best performer. Wider offsets on GC degrade fill rate and average PnL because Gold's NFP move is cleaner: less head-fake, more directional follow-through.

### Setup

OCO buy-stop / sell-stop ±Offset from release close, TP at fill ±TP, no SL, 30-min expiry. 49 combos tested (Offset × TP ∈ {2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0} pts).

### Where to place your stop and TP

After testing 49 combos across 124 NFP Gold releases:

- **Entry offset: 2.0 pts** — tight enough to get filled on almost every NFP (97.7% fill rate), capturing the full directional leg.
- **Take profit: 2.0 pts** — large enough to clear noise on GC, tight enough that the move actually reaches it.

Fill rate ~97.7% — you're in on virtually every release. Gold NFP is a high-probability event; the challenge isn't getting filled, it's picking the right TP.

### Why Offset Size Matters (Gold vs NQ)

Gold and NQ handle NFP completely differently. NQ produces a violent manip wick that sweeps both sides before committing — you need wide offsets to survive it. Gold's NFP reaction is cleaner: the metal trends directionally off the dollar reaction, with far less two-sided whipsaw. Tighter offsets capture the move earlier; wider offsets just leave you unfilled on the smaller-but-consistent moves that make up the bulk of the sample. The data confirms it — offset=2.0 pts dominates every wider alternative on fill rate, TP hit rate, and average PnL.

### Interactive explorer

Filter the 49-combo Gold grid live — pick offset / TP / year window — and download a tailored PDF report.

<div data-explorer="nfp"></div>


### Related

- [CPI straddle (fullport model)](/studies/cpi-day-stats/) — same fullport explorer on CPI.
- [Full IFVG + SMT NQ — NFP](/studies/nfp-ifvg-smt/) — sweep + IFVG entry variant on NFP.
- [Full IFVG + SMT GC — NFP](/studies/nfp-ifvg-smt-gc/) — Gold variant.
