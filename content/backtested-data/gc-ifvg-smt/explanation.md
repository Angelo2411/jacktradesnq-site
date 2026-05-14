ICT post-news IFVG entry on 8:30 ET releases (CPI, NFP, PPI, RetailSales, PCE, GDP, JoblessClaims, EmpireState, ECI), with optional **SI SMT confirmation filter**. Tested 2016 → 2026 on GC 1m.

### Setup Logic

Mark out the data high/low (range price was trading in right before 8:30 ET). Wait for price to sweep one side, then wait for an FVG to form on the rejection. Entry on the IFVG break (close back inside the range). SL on the sweep extreme + 1 tick (0.10 GC pt). TP on the opposite liquidity.

**Invalidation**: if the opposite side of the range also gets swept BEFORE the IFVG break (entry) — the target liquidity has already been taken, no edge left → skip the setup.

### SI SMT Confirmation Filter

A trade is kept **only if SI also reaches the same target** within 2h30 after the release.

- GC SHORT (sweep UP) → SI must sweep its low
- GC LONG (sweep DOWN) → SI must sweep its high

When no SI bar exists at 8:30 ET, the filter returns False — no bias, just no confirmation.

If SI never reaches its target by 11:00 ET → trade excluded from the SMT-filtered stats.

### Performance — GC 10y (all 9 events combined)

Without SMT: 594 trades, PF 0.795, net -141.8 GC pts. With SMT (52 trades): PF 0.977, net -1.4 GC pts. SMT filter reduces exposure but does not create a positive edge on Gold across the 9 event types combined.

NFP shows the strongest SMT signal in isolation: 8 trades, WR 62%, PF 6.18, net +31.6 pts. Other events (CPI, PCE, JoblessClaims) remain negative even with SI confirmation.

### Why Gold Behaves Differently from NQ

NQ and ES are equity index futures — near-perfect correlation, SMT divergence is a clean signal. GC and SI are both precious metals but their intraday liquidity profiles diverge sharply at macro releases: GC is deep and continuous; SI is thin and sparse. The SMT signal is structurally weaker because SI's sparsity means many "no confirmation" readings are data gaps rather than genuine divergence.

### Disclaimer

594 total setups, 52 SMT-filtered trades. No statistically significant edge observed on Gold 8:30 news IFVG across 9 event types. AI-assisted analysis — not financial advice.

<div data-explorer="gc-ifvg-smt"></div>
