## The setup

8:30 ET (= 13:30 UTC) is when the US drops its biggest red-folder data — NFP, CPI, PPI, jobless claims, retail sales, GDP. The release candle prints two extreme wicks. One side gets swept first; the other side becomes the structural target.

The trade I'm backtesting:

1. **Pre-news range** — high and low across the 5 1-minute bars before 8:30 ET.
2. **Sweep** — the first bar within [8:30, 8:33] that breaks pre-news high (sweep UP) or pre-news low (sweep DOWN).
3. **Wait for a 3-bar FVG** in the *opposite* direction to form after the sweep, on the chosen FVG timeframe (1m / 2m / 5m).
4. **Wait for that FVG to break** — a TF close back through the bar-1 edge. Once broken, it's an inverted FVG — IFVG — pointing in the trade direction.
5. **Entry on first retest** of the IFVG zone. Sweep UP → SHORT at the bar-1 high. Sweep DOWN → LONG at the bar-1 low.
6. **SL** = sweep price ± 1 NQ tick (0.25). **TP** = the opposite side of the pre-news range.
7. Optional **break-even** move: when MFE hits a chosen threshold, SL is moved to entry. Optional **direction filter** to take only longs or only shorts.
8. If no IFVG broken-and-retested by 11:00 ET → no trade. If entered, resolve forward 1m bars until 16:00 ET.

This is **strict IFVG** — no "close back inside" proxy, no "first reaction" entry. The 3-bar gap must form, get broken on a close, and then get retested.

## The 108-variant grid

I tested every combination of four switches:

- **Break-even**: None / +3 / +5 / +8 / +10 / +15 pts (6)
- **FVG timeframe**: 1m / 2m / 5m (3)
- **Direction filter**: both / long-only / short-only (3)
- **SMT external (NQ vs ES)**: off / on (2)

108 variants total, run on 550 NQ red-folder events from April 2016 to December 2026.

## SMT external filter

Smart Money Technique (SMT) external compares NQ to ES on the 3-min sweep window. The thesis: a "real" sweep is one futures index reaching for liquidity while the other does not. If both indices sweep together, it's broad index drift, not a stop hunt — so we skip.

Rule:
- **Sweep UP NQ valid only if** `max(ES.high[t0..t0+3min]) ≤ ES.pre_news_high` (ES did NOT sweep its own high)
- **Sweep DOWN NQ valid only if** `min(ES.low[t0..t0+3min]) ≥ ES.pre_news_low`

Result: SMT cuts ~82% of events. Mean trades per variant drops from ~104 to ~10 over 10 years.

| Mode | Mean PF | Mean total pts | Mean trades | Events skipped (SMT) |
|---|---|---|---|---|
| SMT off (baseline) | 0.98 | −76.71 | 104 | — |
| SMT on (NQ vs ES) | 2.79 | −5.17 | 9.8 | 450 / 550 (81.8%) |

Top 5 SMT-on variants by PF — note the tiny samples:

| Variant | PF | Total pts | WR | Trades |
|---|---|---|---|---|
| `be0_tf5_long_only_smt` | 8.13 | +14.25 | 71.4% | 7 |
| `be3_tf5_long_only_smt` | 8.13 | +14.25 | 71.4% | 7 |
| `be0_tf5_both_smt` | 7.44 | +14.50 | 70.0% | 10 |
| `be3_tf5_both_smt` | 7.44 | +14.50 | 70.0% | 10 |
| `be0_tf2_long_only_smt` | 4.17 | +14.25 | 75.0% | 8 |

The PF lift is real but the sample sizes are statistically empty (n=7-10 over 10 years = ~1 trade/year). The SMT-off `be0_tf2_long_only` still wins on total pts (+207 over 70 trades) and remains the variant I'd actually trade. **SMT does not transform a marginal edge into a tradable one — it concentrates the high-quality cluster into a sample too thin to bank on.**

## Top 5 variants by profit factor

| Variant | PF | Total pts | WR | Trades |
|---|---|---|---|---|
| `be8_tf1_long_only` | 1.71 | +118.75 | 34.4% | 96 |
| `be15_tf1_long_only` | 1.67 | +137.50 | 37.5% | 96 |
| `be3_tf5_long_only` | 1.59 | +144.50 | 47.7% | 65 |
| `be5_tf5_long_only` | 1.59 | +144.50 | 47.7% | 65 |
| `be3_tf5_both` | 1.58 | +188.50 | 46.2% | 106 |

## Top 5 variants by total points

| Variant | Total pts | PF | WR | Trades |
|---|---|---|---|---|
| `be0_tf2_long_only` | +207.25 | 1.44 | 52.2% | 70 |
| `be3_tf5_both` | +188.50 | 1.58 | 46.2% | 106 |
| `be5_tf5_both` | +188.50 | 1.58 | 46.2% | 106 |
| `be0_tf1_long_only` (V1 long-only) | +175.00 | 1.52 | 43.2% | 96 |
| `be0_tf5_long_only` | +163.00 | 1.55 | 53.1% | 65 |

## Switch-by-switch impact

Each cell averages over the 9 (or 18) other switch combos.

**Break-even threshold**

| BE | Mean PF | Mean total pts |
|---|---|---|
| None | 1.04 | −42.50 |
| +3 | 0.98 | −55.50 |
| +5 | 0.99 | −62.39 |
| +8 | 0.97 | −90.89 |
| +10 | 0.94 | −109.17 |
| +15 | 0.99 | −99.83 |

The grid average is dragged down by the short-only and tf2 combos. The headline: **forced break-even moves don't help**. Whatever you scrape on saved losses, you lose more often by giving up winners that retraced before TP.

**Direction filter**

| Direction | Mean PF | Mean total pts |
|---|---|---|
| Both | 0.93 | −115.07 |
| Long only | 1.16 | +4.50 |
| Short only | 0.86 | −119.57 |

Strongest signal in the grid: **the long side does work, the short side bleeds**. Same as in V1 — buying liquidity sweeps below pre-news range pays roughly twice as well as fading sweeps above.

**FVG timeframe**

| TF | Mean PF | Mean total pts |
|---|---|---|
| 1m | 0.94 | −69.11 |
| 2m | 0.62 | −244.89 |
| 5m | 1.39 | +83.86 |

The 2m TF is the worst — it forms FVGs slowly enough that by retest the structural geometry is gone. **5m is the best** because the 3-bar 5m FVG is a real 15-min consolidation, not noise. 1m sits in between.

## Baseline V1 — what I shipped first

The original V1 (`be0_tf1_both`) is in this grid as one specific variant:

| Metric | Value |
|---|---|
| Trades taken | 206 |
| WR | 37.1% |
| PF | 1.16 |
| Total pts | +141.75 |
| Expectancy | +0.69 pts / trade |
| Avg W / Avg L | +16.27 / −8.26 |
| Max DD | 420 pts |

Several variants beat it on PF (long-only, 5m FVG) and on total pts (`be0_tf2_long_only`, +207). None of them are step-changes — they shift the curve, not transform it.

## Honesty disclaimer

Every variant in the 6×3×3 grid is published — the unprofitable ones too. Several event types (CPI, CoreRetailSales, RetailSales) stay deeply negative across the entire grid: trying to fade a CPI release with this setup is structurally bad. The grid says so and I'm not removing those rows. The catastrophic variants (`be10_tf1_short_only`, PF 0.32, −348 pts) sit in the explorer alongside the best ones — pick whichever matches your hypothesis.

## Caveats

- 1-minute fills assume mid-of-bar entry/exit at the IFVG zone edge. Real fills will differ — slippage on news releases is non-trivial.
- "Worst case honest" rule: when a single 1-minute bar contains both SL and TP, we book it as a loss.
- Geometry guard skips events where price already moved past SL or TP at the moment of retest.
- Past performance does not predict future results. Backtests are AI-assisted on historical 1m data; verify yourself before risking capital.

Backtest engine: `strict_ifvg_v3_grid` + SMT external. Source: `news_830_setup.py` + `run_news_830_grid.py` in the monfxreplay-python repo. Bars: NQ + ES 1m parquets, April 2016 → December 2026.
