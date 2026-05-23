ICT post-news IFVG entry across 17 red-folder releases (CPI, NFP, PPI, RetailSales, PCE, GDP, JoblessClaims, EmpireState, ECI, FOMC, ADP, JOLTS, ISM Mfg, ISM Services, CB Confidence, Philly Fed, Durable Goods), with optional **NQ SMT confirmation filter**. Tested 2016 → 2026 on ES 1m.

### Setup Logic

Mark out the data high/low (range price was trading in right before the release). Wait for price to sweep one side, then wait for an FVG to form on the rejection. Entry on the IFVG break (close back inside the range). SL on the sweep extreme + 1 tick (0.25 ES pt). TP on the opposite liquidity.

**Invalidation**: if the opposite side of the range also gets swept BEFORE the IFVG break (entry) — the target liquidity has already been taken, no edge left → skip the setup.

### NQ SMT Confirmation Filter

A trade is kept **only if NQ also reaches the same target** within the sweep window after the release.

- ES SHORT (sweep UP) → NQ must sweep its low
- ES LONG (sweep DOWN) → NQ must sweep its high

NQ and ES are both equity index futures — near-perfect correlation. SMT divergence on this pair is a clean filter: when NQ confirms the target, the rotation is statistically more likely to extend.

### Performance — ES 10y (all 17 events combined, "TP1 + BE" variant)

Without SMT: 730 trades, PF 0.85, net -151.2 ES pts, WR 41.5%. With NQ SMT confirmation (545 trades): **PF 1.56, net +265.7 ES pts, WR 50.5%**. The SMT filter materially improves edge: drops 25% of setups while moving PF from 0.85 → 1.56 and flipping the net from negative to positive.

### Per-Event Performance (TP1 + BE, SMT-filtered)

Strongest: CPI (PF 3.74, n=36), ISM Manufacturing (PF 3.69, n=13), PPI (PF 2.79, n=30), NFP (PF 2.46, n=31), Retail Sales (PF 2.07, n=40). Weakest: Philly Fed (PF 0.50), JOLTS (PF 0.62), CB Confidence (PF 0.66). See the per-event sub-pages for full breakdowns.

### Disclaimer

545 SMT-filtered trades across 10 years. AI-assisted analysis — not financial advice. The aggregate edge is concentrated in the inflation prints (CPI, PPI) and manufacturing PMIs. Sentiment / housing-adjacent prints under-perform.
