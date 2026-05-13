Every single one of 36 NFP straddle combos on Gold came out positive. That doesn't happen often.

## NFP Straddle — GC Futures (10y)

A bilateral straddle placed at the 8:30 ET NFP release: one buy-stop above price, one sell-stop below (OCO). First touched fills, other cancels. If TP is not hit within 30 minutes, position closes at market.

All values are in **$/oz** (GC points). 1 GC point = $100 on a full contract.

> **Context:** An earlier study tested a directional IFVG-based NFP model on GC and found no edge (net −1.4 pts over 10y). This straddle study is a different strategy — bilateral, non-directional — and the result is the opposite. The directional model failed; the straddle works.

**Quick glossary:**
- **Entry offset** — distance in $/oz between the release price and each pending stop. Offset 2.0 = buy stop 2.0 above, sell stop 2.0 below.
- **OCO** ("One Cancels Other") — two stops linked; first fill cancels the other.
- **Filled** — market triggered one stop. Not filled = PnL stays 0.
- **TP hit** — position closed at target. Expired = closed at market after 30 min.

### Setup

- Instrument: GC continuous front-month futures
- Period: 128 NFP releases (2016–2026)
- Combos tested: 36 (entry offsets × TP targets)
- No stop loss — position expires at market if TP not hit in 30 min

### Best combo

Entry offset **2.0 $/oz** — Take Profit **2.0 $/oz**:

| Metric | Value |
|--------|-------|
| Events total | 128 |
| Fill rate | 97.7% |
| TP hit rate | 86.7% |
| No fill | 2.3% |
| Avg PnL / event | +1.16 $/oz |
| Worst PnL | −30.1 $/oz |

**All 36 combos tested show positive average PnL**, ranging from +0.10 to +1.86 $/oz per event. This is the cleanest result across any news straddle study in this series.

### Why All Combos Work

NFP moves Gold decisively in one direction almost every month. The combination of:
1. High fill rates at tight offsets (Gold moves ≥2 $/oz on essentially every NFP)
2. Strong directional follow-through once the move starts
3. A 30-minute expiry window that's long enough to capture the move

...creates a setup where even suboptimal parameter choices are profitable. The best combos simply capture more of the move with fewer expired positions.

### Contrast with NQ

On NQ, tight NFP offsets (≤75 pts) are negative-expectancy — manipulation wicks eat them. On Gold, tight offsets (2–3 $/oz) work cleanly. Gold does not produce the same head-fake wick pattern that NQ does around NFP.

### Explore the data — your filters, your PDF

Pick a year, entry offset, TP target and side; the table refreshes live and you can download a tailored PDF report.

<div data-explorer="nfp-gc"></div>

### What This Means for Trading

- NFP on Gold is the single highest-conviction straddle setup in this entire dataset. 36/36 combos positive, best TP rate 86.7%.
- Tight offsets (2.0–3.0 $/oz) are optimal — no need to push wide to avoid manipulation.
- 2022–2026 years carry the most weight; pre-2020 NFP data shows smaller moves and lower fill rates at any offset.
- The worst single event loss is −30.1 $/oz — a reminder that no-stop setups have tail risk. Size accordingly.

---

*Results derived from historical GC continuous front-month 1-minute data via AI-assisted backtesting. 128 NFP releases 2016–2026. Past performance does not predict future results. Not financial advice.*
