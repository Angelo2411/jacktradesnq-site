# FF Red Folder events — backtests pending

État au 2026-05-19. Calendar FF red folder whitelist élargie à 38 strings (commit `83edf9a`).
Events visibles sur `/backtested-data/calendar/` avec badge "No backtest yet" quand pas mappés.

## Already backtested (10 events)

| Event | Release | NQ slug | GC slug |
|-------|---------|---------|---------|
| CPI | 8:30 ET | `cpi-ifvg-smt` | `cpi-ifvg-smt-gc` |
| NFP | 8:30 ET (1st Fri) | `nfp-ifvg-smt` | `nfp-ifvg-smt-gc` |
| PPI | 8:30 ET | `ppi-ifvg-smt` | `ppi-ifvg-smt-gc` |
| PCE | 8:30 ET | `pce-ifvg-smt` | `pce-ifvg-smt-gc` |
| GDP | 8:30 ET | `gdp-ifvg-smt` | `gdp-ifvg-smt-gc` |
| Jobless Claims | 8:30 ET (Thu) | `joblessclaims-ifvg-smt` | `joblessclaims-ifvg-smt-gc` |
| Retail Sales | 8:30 ET | `retailsales-ifvg-smt` | `retailsales-ifvg-smt-gc` |
| Empire State Manufacturing | 8:30 ET | `empirestate-ifvg-smt` | `empirestate-ifvg-smt-gc` |
| Employment Cost Index | 8:30 ET | `employmentcostindex-ifvg-smt` | `employmentcostindex-ifvg-smt-gc` |
| FOMC Statement | 14:00 ET | `fomc-ifvg-smt` | `fomc-ifvg-smt-gc` |

## Pending backtests (priorité décroissante)

### Co-released avec NFP — could reuse NFP data or skip dedicated backtest

- **Unemployment Rate** — released within NFP report (BLS Employment Situation, Friday 8:30 ET). Same setup window. Backtest = NFP backtest (collision). Recommended: alias `EVENT_SLUG_MAP['Unemployment Rate'] = nfp-ifvg-smt` slugs.
- **Average Hourly Earnings** — same as Unemployment Rate (co-released NFP). Alias to NFP.

### Dedicated release — needs new backtest pattern

1. **ADP Non-Farm Employment Change** — Wed before NFP, **8:15 ET** (different from 8:30). Runner: clone `run_news_830_v2.py` with release_time=(8,15) + event_type="ADP". CSV: present in `news_official_2016_2026.csv` (event_type "ADP", ~134 events 2016-2026).

2. **ISM Manufacturing PMI** — 1st business day of month, **10:00 ET**. New release window. Runner: clone with release_time=(10,0). Likely NOT in our CSV — would need extension or scrape.

3. **ISM Services PMI** (aka Non-Manufacturing) — 3rd business day of month, **10:00 ET**. Same pattern as Manufacturing PMI.

4. **JOLTS Job Openings** — Tuesday, **10:00 ET**. CSV has `event_type="JOLTS"` (~110 events 2016-2026). Runner: 10:00 ET pattern.

5. **CB Consumer Confidence** — Last Tuesday of month, **10:00 ET**. New release.

6. **Philadelphia Fed Manufacturing Index** — Thursday (3rd of month), **8:30 ET**. Same window as Jobless Claims (Thursday overlap!). Runner: 8:30 pattern, event filter "Philadelphia Fed".

7. **Durable Goods Orders / Core Durable Goods** — Wednesday/Thursday last week of month, **8:30 ET**.

8. **Existing Home Sales / New Home Sales** — 10:00 ET, monthly. Lower priority for NQ/GC trading.

9. **Trade Balance** — 8:30 ET, monthly. Lower priority.

10. **University of Michigan Consumer Sentiment** (Prelim/Final) — Friday, **10:00 ET**. Lower priority.

### Industrial Production (in CSV, low priority)

CSV has `event_type="IndustrialProduction"` (~134 events). 9:15 ET typically. Not currently in whitelist — add if Angelo wants.

## Pattern guide for new backtests

1. **8:30 ET event**: clone `run_news_830_v2.py` from `~/monfxreplay-python-news830/`. Adapt `event_filter` to new event_type. Run + reformat to v3 schema.
2. **8:15 ET event** (ADP): same pattern, override release time to (8, 15).
3. **10:00 ET event** (ISM/JOLTS/CB Conf): clone with release_time=(10, 0). Sweep window probably 10:00 → 13:00 ET. Resolve EOD 16:00.
4. **14:00 ET event** (already done for FOMC): see `~/jtnq-hub-v3/scripts/run_fomc_10y.py`.

GC equivalent: extend `~/jtnq-hub-v3/scripts/run_metals_10y_all_events.py` (which has FOMC dispatch since `588aaa5` indirectly via DeepSeek).

Output 3 files per (event, asset):
- `<slug>.json` — summary (meta + rows + trades)
- `<event>_event_bars.json` (NQ) / `<event>_event_bars_gc.json` (GC) — chart bars
- `<slug>-trade-prices.json` (NQ) / `<slug>-gc-trade-prices.json` (GC) — 17-key overlay

Then wire:
- `content/backtested-data/<slug>/{meta.json, explanation.md}`
- `IFVG_SLUGS` set in `app/backtested-data/[slug]/page.tsx`
- `IFVG_SLUGS` array + `EVENT_SLUG_MAP` in `lib/study-stats.ts`
