ICT post-news IFVG entry on 8:30 ET CPI releases, with optional **ES SMT confirmation filter**. Tested 2019 → 2026 on MNQ 1m.

### Setup Logic

Mark out the data high/low (range price was trading in right before 8:30 ET). Wait for price to sweep one side, then wait for an FVG to form on the rejection. Entry on the IFVG break (close back inside the range). SL on the sweep extreme. TP on the opposite liquidity.

### ES SMT Confirmation Filter

A trade is kept **only if ES (E-mini S&P 500) also reaches the same target** within 2h30 after the release.

- NQ SHORT (sweep UP) → ES must sweep its low
- NQ LONG (sweep DOWN) → ES must sweep its high

If ES never reaches its target by 11:00 ET → trade was a one-sided NQ move, excluded from the SMT-filtered stats.

### Performance — MNQ 7y

Without SMT: 75 trades, PF 0.98, net -13 MNQ pts (no edge). With SMT: 51 trades remain, PF 2.13, net +454 MNQ pts. Year-by-year breakdown in the explorer below + Full PDF download.

### Why It Works

NQ and ES are highly correlated indices. When NQ reaches the target side but ES doesn't follow during the same window, the move is a one-sided drift — likely a fakeout for the broader market. Filtering for ES confirmation keeps only setups where both indices participate in the reversal.

### Disclaimer

Sample size 51 SMT-filtered trades is statistically thin; treat as indicative not predictive. AI-assisted analysis — not financial advice.

<div data-explorer="cpi-ifvg-smt"></div>
