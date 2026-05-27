This study tests a reversal entry on Silver (SI) futures across 17 major economic releases — Consumer Price Index (CPI), Non-Farm Payrolls (NFP), Producer Price Index (PPI), Retail Sales, PCE Inflation (PCE), Gross Domestic Product (GDP), Jobless Claims, and more. After each release sweeps a pre-news level, you wait for an Inverse Fair Value Gap (IFVG) to form, then enter when price breaks back inside the range, with an optional Gold (GC) SMT Divergence (SMT) filter. Tested across 2016–2026 on 1-minute SI data.

### Setup Logic

Mark out the data high/low (range price was trading in right before the release). Wait for price to sweep one side, then wait for an FVG to form on the rejection. Entry on the IFVG break (close back inside the range). SL on the sweep extreme + 1 tick (0.005 SI pt, Comex silver tick). TP on the opposite liquidity.

**Invalidation**: if the opposite side of the range also gets swept BEFORE the IFVG break (entry) — the target liquidity has already been taken, no edge left → skip the setup.

### GC SMT Confirmation Filter

A trade is kept **only if GC also reaches the same target** within the sweep window after the release.

- SI SHORT (sweep UP) → GC must sweep its low
- SI LONG (sweep DOWN) → GC must sweep its high

Silver and gold are both precious metals — Comex correlated metals with near-perfect co-movement. SMT divergence on this pair is a clean filter: when GC confirms the target, the rotation is statistically more likely to extend.

### Performance — SI 10y (all 17 events combined, "TP1 + BE" variant)

Without SMT: 1563 trades, PF 1.20, net +9.5 SI pts, WR 57.6%. With GC SMT confirmation (922 trades): **PF 2.00, net +21.4 SI pts, WR 68.3%**. The SMT filter materially improves edge: drops 41% of setups while moving PF from 1.20 → 2.00 and lifting win rate to 68.3%.

### Per-Event Performance

Per-event breakdown TBD — see per-event SI sub-pages (future work).

### Disclaimer

922 SMT-filtered trades across 10 years. AI-assisted analysis — not financial advice. SI data: Databento bbo-1m real fills (2016–2026). GC used as SMT partner (forward-filled).
