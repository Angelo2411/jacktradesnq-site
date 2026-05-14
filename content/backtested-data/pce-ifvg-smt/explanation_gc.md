ICT post-news IFVG entry on 8:30 ET PCE releases, with optional **SI SMT confirmation filter**. Tested 2016 → 2026 on GC 1m (Gold COMEX, Databento .n.0 forward-filled).

### Setup Logic

Mark out the data high/low (range price was trading in right before 8:30 ET). Wait for price to sweep one side, then wait for an FVG to form on the rejection. Entry on the IFVG break (close back inside the range). SL on the sweep extreme + 0.10 (1 GC tick). TP on the opposite liquidity.

**Invalidation**: if the opposite side of the range also gets swept BEFORE the IFVG break (entry) — the target liquidity has already been taken, no edge left → skip the setup.

### SI SMT Confirmation Filter

A trade is kept **only if SI (Silver COMEX) also reaches the same target** within 2h30 after the release.

- GC SHORT (sweep UP) → SI must sweep its low
- GC LONG (sweep DOWN) → SI must sweep its high

SI data is sparse (63k bars vs 5.4M for GC): when no SI bar exists at 8:30 ET, the filter returns False — no confirmation, not a disqualifier. About 11% of 8:30 ET events have SI data available.

### Performance — GC 10y

Without SI SMT: 77 trades, PF 0.41, net -58.3 GC pts. With SI SMT (11 trades): WR 18%, PF 0.17, net -12.9 GC pts.

Negative edge both with and without SMT filter.

### Why Gold Behaves Differently from NQ

NQ and ES are equity index futures — near-perfect correlation, SMT divergence is a clean signal. GC and SI are both precious metals but their intraday liquidity profiles diverge sharply at macro releases: GC is deep and continuous; SI is thin and sparse. The SMT signal is structurally weaker because SI's sparsity means many "no confirmation" readings are data gaps rather than genuine divergence.

### Disclaimer

77 total setups, 11 SMT-filtered trades. AI-assisted analysis — not financial advice.

<div data-explorer="pce-ifvg-smt"></div>
