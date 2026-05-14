ICT post-news IFVG entry on 8:30 ET Retail Sales releases, with optional **SI SMT confirmation filter**. Tested 2016 → 2026 on GC 1m.

### Setup Logic

Mark out the data high/low (range price was trading in right before 8:30 ET). Wait for price to sweep one side, then wait for an FVG to form on the rejection. Entry on the IFVG break (close back inside the range). SL on the sweep extreme + 0.10 (1 GC tick). TP on the opposite liquidity.

**Invalidation**: if the opposite side of the range also gets swept BEFORE the IFVG break (entry) — the target liquidity has already been taken, no edge left → skip the setup.

### SI SMT Confirmation Filter

A trade is kept **only if SI also reaches the same target** within 2h30 after the release.

- GC SHORT (sweep UP) → SI must sweep its low
- GC LONG (sweep DOWN) → SI must sweep its high

When no SI bar exists at 8:30 ET, the filter returns False — no confirmation, not a disqualifier.

### Performance — GC 10y

Without SI SMT: 101 trades, PF 1.00, net +0.1 GC pts. With SI SMT (2 trades): WR 0%, PF —, net -2.2 GC pts.

Flat without SMT; no edge observed with SI confirmation.

### Why Gold Behaves Differently from NQ

NQ and ES are equity index futures — near-perfect correlation, SMT divergence is a clean signal. GC and SI are both precious metals but their intraday liquidity profiles diverge sharply at macro releases: GC is deep and continuous; SI is thin and sparse. The SMT signal is structurally weaker because SI's sparsity means many "no confirmation" readings are data gaps rather than genuine divergence.

### Disclaimer

101 total setups, 2 SMT-filtered trades. AI-assisted analysis — not financial advice.

<div data-explorer="retailsales-ifvg-smt"></div>
