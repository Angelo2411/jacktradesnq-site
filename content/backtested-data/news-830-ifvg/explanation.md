## Retraction notice — v1 numbers were wrong

The original article on this page (108-variant grid, 550 events, baseline PF 1.16 / +142 pts) is **retracted**. The backtest engine had five bugs that materially distorted every number in that grid. They are listed below in full, then I republish the rewritten v2.0 results on the same setup.

| # | Bug | What it did | Impact |
|---|---|---|---|
| 1 | 3-minute sweep cap | Sweep detection only scanned bars [t0, t0+3min) | Sweeps at t0+30min or later (which the spec allows) were invisible |
| 2 | UTC-only-winter time filter | Loaded only 13:30 UTC events (winter EST) | 1122 / 1694 events (66%) silently dropped — the entire summer EDT season at 12:30 UTC |
| 3 | NFP/AHE/UR triple-count | NFP, Avg Hourly Earnings, Unemployment Rate release at the same timestamp on first-Friday-of-month → engine processed them as 3 separate trades on identical bars | ~41% trade-count inflation, distorted PF and drawdown |
| 4 | Entry on retest, not on break | Spec says "break itself is entry"; engine waited for a later bar to revisit the IFVG zone after the close-through | Wrong entry timing on fast news moves where retest never came |
| 5 | Silent data loss on invalid geometry | When entry price fell outside SL/TP envelope, the row was returned with `entry_price=None, ifvg_zone=None` even though an IFVG had been found | 289 / 550 events were unauditable |

All five are fixed in v2.0. The engine is in `monfxreplay-python/strategies/news_830_setup.py` (branch `feat/news-830-rewrite-fixes`); the runner-side dedupe and the EDT+EST list filter are in `run_news_830.py`.

## The setup (unchanged from v1)

8:30 ET (12:30 UTC summer / 13:30 UTC winter) is when the US drops red-folder data — NFP, CPI, PPI, jobless claims, retail sales, GDP. The release candle prints two extreme wicks. One side gets swept first; the other side becomes the structural target.

1. **Pre-news range** — high and low across the 5 1-minute bars before t0.
2. **Sweep** — the first 1-minute bar from t0 onward that breaks pre-news high (sweep UP) or pre-news low (sweep DOWN). v2.0 scans the full 8:30→11:00 ET session.
3. **Wait for a 3-bar FVG** in the *opposite* direction to form after the sweep, on the chosen FVG timeframe (1m / 2m / 5m).
4. **Wait for that FVG to break** — a TF close back through the bar-1 edge. The instant the close prints through, that's the inverted FVG (IFVG) and **that's the entry bar**. v2.0 takes entry at the bar-1 edge price the moment the close violates it (no retest required).
5. **SL** = sweep price ± 1 NQ tick (0.25). **TP** = the opposite side of the pre-news range.
6. Optional **break-even** move and **direction filter** as in v1.
7. If no IFVG broken by 11:00 ET → no trade. If entered, resolve forward 1m bars until 16:00 ET.

## v2.0 grid — 54 variants (BE × FVG TF × Direction)

54 variants on 1013 unique NQ red-folder events from April 2016 to December 2026. SMT-on variants from v1 are not republished here pending an audit of the SMT path — the v2.0 dedupe + EDT events would change those numbers too, but the SMT diagnostic JSON wasn't regenerated in this rewrite pass.

### Top 5 variants by profit factor

| Variant | PF | Total pts | WR | Trades |
|---|---|---|---|---|
| `be3_tf2_long_only` | 8.27 | +641.50 | 41.6% | 149 |
| `be3_tf1_short_only` | 5.39 | +649.50 | 35.4% | 220 |
| `be3_tf1_both` | 5.10 | +1151.00 | 35.5% | 414 |
| `be3_tf1_long_only` | 4.78 | +501.50 | 35.6% | 194 |
| `be5_tf2_long_only` | 4.65 | +604.75 | 45.6% | 149 |

### Top 5 variants by total points

| Variant | Total pts | PF | WR | Trades |
|---|---|---|---|---|
| `be0_tf1_both` (baseline) | +1512.00 | 2.08 | 51.6% | 414 |
| `be15_tf1_both` | +1427.75 | 2.61 | 47.6% | 414 |
| `be10_tf1_both` | +1410.00 | 3.19 | 44.4% | 414 |
| `be8_tf1_both` | +1299.75 | 3.56 | 42.8% | 414 |
| `be5_tf1_both` | +1161.00 | 3.99 | 38.9% | 414 |

### Baseline V1 (be0_tf1_both) — v1 vs v2.0

| Metric | v1 (retracted) | v2.0 |
|---|---|---|
| Unique events | 550 (winter only) | 1013 |
| Trades taken | 206 (NFP+AHE+UR triple-counted) | 414 |
| WR | 37.1% | 51.6% |
| PF | 1.16 | 2.08 |
| Total pts | +141.75 | +1512.00 |
| Expectancy | +0.69 pts / trade | +3.65 pts / trade |
| Avg W / Avg L | +16.27 / −8.26 | +13.90 / −7.10 |
| Max DD | 420 pts | 292.75 pts |

The headline conclusions on the *direction* of effects from v1 still hold qualitatively — long-only outperforms short-only on PF when filtered, BE moves trade win-rate for capped reward — but every single number changed and several variant rankings swapped. **Treat the v1 article as deleted.**

### Switch impacts (mean across the 9 other combos in each row)

**Break-even threshold**

| BE | Mean PF | Mean total pts |
|---|---|---|
| None | 1.79 | +637.7 |
| +3 | 3.36 | +369.7 |
| +5 | 2.56 | +373.3 |
| +8 | 2.22 | +410.8 |
| +10 | 2.04 | +440.6 |
| +15 | 1.81 | +481.7 |

(Means computed from the 54-variant grid.)

**Direction filter**

| Direction | Mean PF | Mean total pts |
|---|---|---|
| Both | 2.21 | +678.5 |
| Long only | 2.74 | +402.5 |
| Short only | 1.94 | +276.0 |

Both-direction is highest on total pts, long-only on PF — same qualitative shape as v1 but every absolute number is different.

**FVG timeframe**

| TF | Mean PF | Mean total pts |
|---|---|---|
| 1m | 3.42 | +884.6 |
| 2m | 2.51 | +478.7 |
| 5m | 0.97 | −6.3 |

Inverted from v1: in v2.0 the **1-minute FVG is best**, 5-minute is the worst. The previous engine's 5m advantage was an artifact of the retest-entry rule (slower TFs gave slow retests time to print at favourable prices); under entry-on-break, the 1-min reaction window is where the edge concentrates.

## What is "tradable" after the honest backtest?

The numbers are now substantially better than v1 — but with an important microstructure caveat. Most v2.0 trades are **scalp-tight**: SL and TP are often within 1-3 NQ points of entry because the sweep wick on a small candle plus the IFVG zone forming next to it produces a very narrow geometry. Average win is ~14 pts, average loss ~7 pts — these are arithmetic averages over many sub-1-pt events. PF 2.08 over 414 trades is genuine on this dataset, but live execution slippage on 8:30 ET releases will eat a non-trivial share of edges this small.

## Caveats

- Fills assume mid-of-bar entry/exit at the IFVG break_level. Real fills will differ; news-release slippage is non-trivial.
- "Worst-case honest" rule: when a single 1-minute bar contains both SL and TP, it's booked as a loss.
- Entry-geometry guard skips events where the IFVG break_level falls outside the SL/TP envelope (entry would be on the wrong side of SL). 555 of 1013 events skip for this reason in v2.0 — these are now visible in the JSON with `skip_reason="entry_geometry_invalid"`, fixing v1's silent-data-loss bug.
- Past performance does not predict future results. Backtests are AI-assisted on historical 1m data; verify yourself before risking capital.

Backtest engine: `news_830_setup.py` v4 + `run_news_830_grid.py` in the `monfxreplay-python` repo, branch `feat/news-830-rewrite-fixes`. Bars: NQ 1m parquet, April 2016 → December 2026.
