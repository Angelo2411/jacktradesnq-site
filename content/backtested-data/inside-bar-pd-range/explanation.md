# Inside Bar → PD Range OCO

## Verdict

✅ **Edge confirmed** — Variant D: PF 2.28 NQ / PF 1.94 ES over 10 years (136 trades NQ).

## Methodology

Detect an inside bar (h < h[1] AND l > l[1], strict containment) during RTH 09:30–16:00 ET. On D+1, place OCO stop orders at PDH (long) and PDL (short). SL = opposite extreme. Time stop at 16:00 ET.

- **PDH/PDL source**: parent of inside bar (D-1)
- **OCO rule**: first stop-order touched fills, other cancels
- **SL intrabar priority**: SL before TP if both touched same minute
- **Variant D**: RTH-only inside bars — excludes ETH inside bars (strictest filter)

## Results — NQ

| Variant | Trades | WR | PF | Total pts |
|---------|--------|----|----|-----------|
| A — OCO PDH/PDL | 214 | 59.4% | 1.961 | +6,355 |
| B — Tighter SL | 214 | 65.4% | 1.796 | +4,946 |
| C — Wider TP | 214 | 54.7% | 1.139 | +1,089 |
| **D — RTH-only** | **136** | **58.8%** | **2.279** | **+4,636** |

## Sanity Check — Break Rate

edgeful claims 90% of inside bars break the range. Independent measurement (RTH strict): **76.3%** on NQ. Gap explained by session definition (RTH vs 24h).

---

*This study was generated with AI assistance. Past performance does not guarantee future results. For educational use only. Not financial advice.*
