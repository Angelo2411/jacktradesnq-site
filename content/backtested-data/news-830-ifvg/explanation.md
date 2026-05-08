## The setup

8:30 ET (= 13:30 UTC) is when the US drops its biggest red-folder data — NFP, CPI, PPI, jobless claims, retail sales, GDP. The release candle prints two extreme wicks. One side gets swept first; the other side becomes the structural target.

The trade I'm backtesting:

1. **Pre-news range** — high and low across the 5 1-minute bars before 8:30 ET.
2. **Sweep** — the first bar within [8:30, 8:33] that breaks pre-news high (sweep UP) or pre-news low (sweep DOWN).
3. **Wait for a 1-minute FVG** in the *opposite* direction to form after the sweep. After a sweep UP we want a bullish 3-bar FVG (low of bar 3 above high of bar 1). After a sweep DOWN, a bearish 3-bar FVG.
4. **Wait for that FVG to break** — a 1-minute close back through the bar-1 edge. Once broken, it's an inverted FVG — IFVG — pointing in the trade direction.
5. **Entry on first retest** of the IFVG zone. Sweep UP → SHORT at the bar-1 high. Sweep DOWN → LONG at the bar-1 low.
6. **SL** = sweep price ± 1 NQ tick (0.25). **TP** = the opposite side of the pre-news range.
7. If no IFVG broken-and-retested by 11:00 ET → no trade. If entered, resolve forward 1m bars until 16:00 ET.

This is **strict IFVG** — no "close back inside" proxy, no "first reaction" entry. The 3-bar gap must form, get broken on a close, and then get retested.

## Sample

550 events from April 2016 → December 2026 on NQ 1-minute bars. Filter: `time = 13:30 UTC AND impact = High` from the red-folder calendar.

After applying the structural rules, **205 events trigger a trade** (37% trigger rate). The other 345 are skipped because:
- 43 had no sweep (price stayed inside pre-news range during the 3-min window)
- 1 had a sweep but no IFVG broken-and-retested by 11:00 ET
- 301 had a late retest where price had already moved past SL or TP — geometry guard skips them

## Headline stats — 10y NQ

| Metric | Value |
|---|---|
| Events scanned | 550 |
| Trades taken | 205 |
| Wins / Losses / Timeouts | 76 / 129 / 1 |
| Win rate (resolved) | 37.07% |
| Profit factor | 1.16 |
| Expectancy | +0.69 pts / event traded |
| Total | +141.75 pts |
| Avg win / Avg loss | +16.27 / −8.26 pts |
| Avg trade duration | 11.1 min |
| Best trade | +91 pts (2023-03-10 NFP, SHORT) |
| Worst trade | −55.75 pts (2025-02-07 NFP, SHORT) |
| Median planned RR | 2.29 |

The win rate is below 50%, but the average win is roughly 2× the average loss, so the expectancy stays positive. PF of 1.16 over 205 trades is thin — not a print-money setup, but a workable framework you can refine with discretion (which event, which session context, which HTF bias).

## By event type (only ≥5 trades)

| Event | Events | Trades | WR | PF | Total pts |
|---|---|---|---|---|---|
| JoblessClaims | 229 | 75 | 45.3% | 1.67 | +142.8 |
| AvgHourlyEarnings | 43 | 21 | 38.1% | 1.52 | +82.8 |
| UnemploymentRate | 43 | 21 | 38.1% | 1.52 | +82.8 |
| GDP | 17 | 5 | 80.0% | 10.1 | +41.0 |
| NFP | 31 | 14 | 42.9% | 1.26 | +27.2 |
| ISM | 11 | 6 | 16.7% | 1.60 | +17.2 |
| EmpireState | 40 | 14 | 35.7% | 1.00 | 0.0 |
| PCE | 39 | 13 | 30.8% | 0.76 | −16.8 |
| RetailSales | 22 | 10 | 10.0% | 0.20 | −48.2 |
| CPI | 21 | 6 | 16.7% | 0.03 | −89.5 |
| CoreRetailSales | 40 | 16 | 12.5% | 0.11 | −94.8 |

The edge is concentrated in **labor-market data** — jobless claims, NFP, AHE, unemployment rate. Inflation prints (CPI, PCE, retail) bleed: the manip wick on CPI is huge and the IFVG retest often runs back through the sweep. The naive "trade every red-folder release" version is a bad idea — labor-only would be cleaner.

## Sweep direction asymmetry

| Sweep | Trades | WR | PF | Total pts |
|---|---|---|---|---|
| DOWN → LONG | 95 | 43.2% | 1.52 | +175.0 |
| UP → SHORT | 110 | 31.8% | 0.95 | −33.2 |

The setup performs roughly twice as well buying liquidity sweeps below pre-news range as it does selling sweeps above. Likely reflects the structural bid in the indices over this 10-year sample.

## Year by year

| Year | Events | Trades | W | L | WR | Total pts |
|---|---|---|---|---|---|---|
| 2016 | 27 | 2 | 0 | 2 | 0% | −1.0 |
| 2017 | 57 | 12 | 3 | 9 | 25% | −12.8 |
| 2018 | 51 | 19 | 4 | 15 | 21% | −32.5 |
| 2019 | 46 | 18 | 10 | 8 | 56% | +29.8 |
| 2020 | 51 | 16 | 6 | 10 | 38% | −14.8 |
| 2021 | 47 | 19 | 8 | 11 | 42% | +41.0 |
| 2022 | 50 | 13 | 7 | 6 | 54% | −63.5 |
| 2023 | 56 | 29 | 12 | 17 | 41% | +245.0 |
| 2024 | 60 | 38 | 13 | 25 | 34% | +99.2 |
| 2025 | 56 | 27 | 10 | 17 | 37% | −125.0 |
| 2026 | 49 | 12 | 3 | 9 | 25% | −23.8 |

Equity curve is uneven. The big year was 2023; 2025 erased a third of the prior gains; 2026 (partial) is also negative. Without filters this is a "live with the variance" setup, not a clean uptrend.

## Caveats

- 1-minute fills assume mid-of-bar entry/exit at the IFVG zone edge. Real fills will differ — slippage on news releases is non-trivial.
- "Worst case honest" rule: when a single 1-minute bar contains both SL and TP, we book it as a loss. This is conservative but realistic.
- The geometry guard skips ~55% of events (entry past SL/TP). That's not a bug — it's the strict IFVG model honestly admitting that price often runs past structure before the retest.
- Past performance does not predict future results. Backtests are AI-assisted on historical 1m data; verify yourself before risking capital.

Backtest engine: `strict_ifvg_v2`. Source: `news_830_setup.py` in the monfxreplay-python repo. Bars: NQ 1m parquets, April 2016 → December 2026.
