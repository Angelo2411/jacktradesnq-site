ICT post-news IFVG entry on 8:30 ET NFP releases, with optional **ES SMT confirmation filter**. Tested 2016 → 2026 on NQ 1m.

### Setup Logic

Mark out the data high/low (range price was trading in right before 8:30 ET). Wait for price to sweep one side, then wait for an FVG to form on the rejection. Entry on the IFVG break (close back inside the range). SL on the sweep extreme. TP on the opposite liquidity.

**Invalidation**: if the opposite side of the range also gets swept BEFORE the IFVG break (entry) — the target liquidity has already been taken, no edge left → skip the setup.

### ES SMT Confirmation Filter

A trade is kept **only if ES (E-mini S&P 500) also reaches the same target** within 2h30 after the release.

- NQ SHORT (sweep UP) → ES must sweep its low
- NQ LONG (sweep DOWN) → ES must sweep its high

If ES never reaches its target by 11:00 ET → trade was a one-sided NQ move, excluded from the SMT-filtered stats.

### Performance — NQ 10y

Without SMT: 64 trades, PF 1.27, net +169 NQ pts. With SMT: 28 trades remain, PF 5.12, net +529 NQ pts. Year-by-year breakdown in the explorer below + Full PDF download.

<div data-equity="nfp"></div>

### Why It Works

NQ and ES are highly correlated indices. When NQ reaches the target side but ES doesn't follow during the same window, the move is a one-sided drift — likely a fakeout for the broader market. Filtering for ES confirmation keeps only setups where both indices participate in the reversal.

### Disclaimer

Sample size 28 SMT-filtered trades is statistically thin; treat as indicative not predictive. AI-assisted analysis — not financial advice.

<div data-explorer="nfp-ifvg-smt"></div>
