# run_metals_10y_all_events.py

Source: copied from `/Users/angelo/mfx-py-news830-nq10y/` (non-git Python sandbox).

Usage: `uv run scripts/run_metals_10y_all_events.py` (run from `~/mfx-py-news830-nq10y/` venv, requires polars + parquet bars for GC/SI).

Output: `public/data/<slug>-ifvg-smt-gc-trade-prices.json` (per-event trade prices for IFVG SMT GC studies).

Deps (also versioned here): `run_news_830_variants.py`, `run_news_830_v2.py`, `run_nfp_be50.py`, `data.py`. Captures `ifvg_top/bottom/formation_ts` in `detect_setup_metals`, includes `load_si_bars` for SI parquets.
