CPI hits Gold differently than equity indices — tighter offsets work, and 10 out of 12 combos are profitable.

## CPI Straddle — GC Futures (10y)

A bilateral straddle placed at the 8:30 ET CPI release: one buy-stop above price, one sell-stop below (OCO). First touched fills, other cancels. If TP is not hit within 30 minutes, position closes at market.

All values are in **$/oz** (GC points). 1 GC point = $100 on a full contract.

**Quick glossary:**
- **Stop offset** — distance in $/oz between the release price and each pending stop order. Stop 2.0 = buy stop 2.0 above, sell stop 2.0 below.
- **OCO** ("One Cancels Other") — two stops linked; first fill cancels the other.
- **Filled** — market triggered one stop; position open. Not filled = PnL stays 0.
- **TP hit** — position closed at target. Expired = closed at market after 30 min without hitting TP.

### Setup

- Instrument: GC continuous front-month futures
- Period: 132 CPI releases (2016–2026)
- Combos tested: 12 (stop offsets × TP targets)
- No stop loss — position expires at market if TP not hit in 30 min

> **Scale note:** GC offsets are in $/oz, not NQ points. A 2.0 $/oz stop on Gold is roughly equivalent to a 25 pt stop on NQ in terms of volatility-adjusted risk.

### Best combo

Stop offset **2.0 $/oz** — Take Profit **1.5 $/oz**:

| Metric | Value |
|--------|-------|
| Events total | 132 |
| Fill rate | 90.9% |
| TP hit rate | 73.5% |
| No fill | 9.1% |
| Avg PnL / event | +0.68 $/oz |
| Worst PnL | −16.6 $/oz |

10 out of 12 combos tested show positive average PnL. The two losing combos use the widest offsets (>4 $/oz), where fill rate drops below 20% and the few fills that occur tend to expire without reaching TP.

### Why Tighter Offsets Work on Gold

Unlike NQ where the first-minute CPI candle can reach 40–66 pts, GC's release candle is more contained. Gold doesn't gap through ±10 $/oz on CPI; it moves 1–5 $/oz on most releases. Tight offsets (1.5–3 $/oz) catch the real directional move without getting hit by a manipulation spike first.

### Explore the data — your filters, your PDF

Pick a year, stop offset, TP target and side; the table refreshes live and you can download a tailored PDF report.

<div data-explorer="cpi-gc"></div>

### What This Means for Trading

- CPI straddles on Gold are cleaner than on NQ at tight offsets because Gold's release move is more directional and less plagued by manipulation wicks.
- The 90.9% fill rate at 2.0 $/oz means you almost always have a position — the debate is whether TP hits or you expire flat.
- 2022–2024 are the most relevant years (inflation regime, high-conviction CPI reactions). Pre-2020 data shows near-zero fill rates on wider offsets — the event simply didn't move Gold that much.

---

*Results derived from historical GC continuous front-month 1-minute data via AI-assisted backtesting. 132 CPI releases 2016–2026. Past performance does not predict future results. Not financial advice.*
