"""
aggregate_pairs_summary.py
---------------------------
Reads 7 IFVG-SMT pair JSONs for each of 17 macro events,
extracts the ALL / be_50 / smt=True / BOTH row, and outputs:
  - public/data/pairs-summary.json   (structured, for future hub UI)
  - public/data/pairs-summary.csv    (flat, for quick analysis)
  - content/backtested-data/pairs-comparison/explanation.md
  - content/backtested-data/pairs-comparison/meta.json
"""

import json
import csv
import os
from pathlib import Path

# ── paths ──────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent  # ~/jtnq-hub-v3-ym
DATA_DIR = ROOT / "public" / "data"
CONTENT_DIR = ROOT / "content" / "backtested-data" / "pairs-comparison"

# ── event catalogue ────────────────────────────────────────────────────────
EVENTS = [
    {"slug": "adp",                 "name": "ADP"},
    {"slug": "cb-confidence",       "name": "CB Confidence"},
    {"slug": "cpi",                 "name": "CPI"},
    {"slug": "durable-goods",       "name": "Durable Goods"},
    {"slug": "empirestate",         "name": "Empire State"},
    {"slug": "employmentcostindex", "name": "Employment Cost Index"},
    {"slug": "fomc",                "name": "FOMC"},
    {"slug": "gdp",                 "name": "GDP"},
    {"slug": "ism-mfg",             "name": "ISM Mfg"},
    {"slug": "ism-services",        "name": "ISM Services"},
    {"slug": "joblessclaims",       "name": "Jobless Claims"},
    {"slug": "jolts",               "name": "JOLTS"},
    {"slug": "nfp",                 "name": "NFP"},
    {"slug": "pce",                 "name": "PCE"},
    {"slug": "philly-fed",          "name": "Philly Fed"},
    {"slug": "ppi",                 "name": "PPI"},
    {"slug": "retailsales",         "name": "Retail Sales"},
]

# ── pair catalogue ─────────────────────────────────────────────────────────
# Each pair: (label, anchor, smt_partner, json_suffix)
# json_suffix appended to "{event_slug}-ifvg-smt{suffix}.json"
PAIRS = [
    {"id": "nq_smt_es",   "anchor": "NQ", "smt": "ES", "suffix": ""},
    {"id": "es_smt_nq",   "anchor": "ES", "smt": "NQ", "suffix": "-es"},
    {"id": "gc_smt_si",   "anchor": "GC", "smt": "SI", "suffix": "_gc"},
    {"id": "ym_smt_nq",   "anchor": "YM", "smt": "NQ", "suffix": "-ym"},
    {"id": "ym_smt_es",   "anchor": "YM", "smt": "ES", "suffix": "-ym-vs-es"},
    {"id": "es_smt_ym",   "anchor": "ES", "smt": "YM", "suffix": "-es-vs-ym"},
    {"id": "nq_smt_ym",   "anchor": "NQ", "smt": "YM", "suffix": "-nq-vs-ym"},
]

# ── helpers ────────────────────────────────────────────────────────────────

def read_target_row(path: Path) -> dict | None:
    """Return the ALL/be_50/smt=True/BOTH row, or None if file/row missing."""
    if not path.exists():
        return None
    try:
        with open(path) as f:
            data = json.load(f)
        rows = data.get("rows", [])
        for r in rows:
            if (
                r.get("year") == "ALL"
                and r.get("variant") == "be_50"
                and r.get("smt") is True
                and r.get("side") == "BOTH"
            ):
                return r
    except Exception as e:
        print(f"  WARN: could not parse {path.name}: {e}")
    return None


def placeholder() -> dict:
    return {"n": 0, "wr": None, "pf": None, "net_pts": None}

# ── main build ─────────────────────────────────────────────────────────────

def build():
    results = []  # list of event dicts

    events_processed = 0
    pairs_found = 0
    pairs_missing = 0

    for ev in EVENTS:
        slug = ev["slug"]
        event_entry = {"slug": slug, "name": ev["name"], "pairs": []}

        for pair in PAIRS:
            fname = f"{slug}-ifvg-smt{pair['suffix']}.json"
            fpath = DATA_DIR / fname

            row = read_target_row(fpath)

            if row is None:
                pairs_missing += 1
                pair_data = {
                    "pair_id":  pair["id"],
                    "anchor":   pair["anchor"],
                    "smt":      pair["smt"],
                    "n":        0,
                    "wr":       None,
                    "pf":       None,
                    "net_pts":  None,
                    "missing":  True,
                }
            else:
                pairs_found += 1
                pair_data = {
                    "pair_id":  pair["id"],
                    "anchor":   pair["anchor"],
                    "smt":      pair["smt"],
                    "n":        row["n"],
                    "wr":       round(row["wr"], 4) if row.get("wr") is not None else None,
                    "pf":       round(row["pf"], 3) if row.get("pf") is not None else None,
                    "net_pts":  round(row["net_pts"], 1) if row.get("net_pts") is not None else None,
                    "missing":  False,
                }

            event_entry["pairs"].append(pair_data)

        results.append(event_entry)
        events_processed += 1

    print(f"Events processed : {events_processed}")
    print(f"Pairs found      : {pairs_found}")
    print(f"Pairs missing    : {pairs_missing} (placeholder n=0)")

    return results


# ── write JSON ─────────────────────────────────────────────────────────────

def write_json(results: list):
    out = {"events": results}
    out_path = DATA_DIR / "pairs-summary.json"
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2)
    size_kb = out_path.stat().st_size / 1024
    print(f"Written: {out_path}  ({size_kb:.1f} KB)")


# ── write CSV ──────────────────────────────────────────────────────────────

def write_csv(results: list):
    out_path = DATA_DIR / "pairs-summary.csv"
    fields = ["event_slug", "event_name", "pair_id", "anchor", "smt", "n", "wr", "pf", "net_pts", "missing"]
    rows = []
    for ev in results:
        for p in ev["pairs"]:
            rows.append({
                "event_slug":  ev["slug"],
                "event_name":  ev["name"],
                "pair_id":     p["pair_id"],
                "anchor":      p["anchor"],
                "smt":         p["smt"],
                "n":           p["n"],
                "wr":          p["wr"] if p["wr"] is not None else "",
                "pf":          p["pf"] if p["pf"] is not None else "",
                "net_pts":     p["net_pts"] if p["net_pts"] is not None else "",
                "missing":     p["missing"],
            })
    with open(out_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    size_kb = out_path.stat().st_size / 1024
    print(f"Written: {out_path}  ({size_kb:.1f} KB, {len(rows)} rows)")


# ── write markdown explanation ─────────────────────────────────────────────

def write_explanation(results: list):
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = CONTENT_DIR / "explanation.md"

    lines = [
        "# IFVG-SMT Pairs Comparison — All Events",
        "",
        "Backtest filter: **be_50 variant · SMT=On · BOTH sides · ALL years (2016–2026)**.",
        "",
        "7 pairs tested: NQ/ES, ES/NQ, GC/SI, YM/NQ, YM/ES, ES/YM, NQ/YM.",
        "",
        "Only pairs with **n ≥ 30** included in top-3 rankings.",
        "",
    ]

    for ev in results:
        slug = ev["slug"]
        name = ev["name"]

        # eligible = n >= 30 and pf not None
        eligible = [
            p for p in ev["pairs"]
            if p["n"] >= 30 and p["pf"] is not None
        ]
        eligible.sort(key=lambda x: x["pf"], reverse=True)
        top3 = eligible[:3]

        lines.append(f"## {name}")
        lines.append("")

        if not top3:
            lines.append("_No pair with n ≥ 30 available._")
            lines.append("")
            continue

        lines.append("| Rank | Anchor | SMT | n | WR | PF | Net pts |")
        lines.append("|------|--------|-----|---|----|----|---------|")
        for i, p in enumerate(top3, 1):
            wr_str  = f"{p['wr']*100:.1f}%" if p["wr"] is not None else "—"
            pf_str  = f"{p['pf']:.3f}"      if p["pf"] is not None else "—"
            net_str = str(p["net_pts"])      if p["net_pts"] is not None else "—"
            lines.append(f"| {i} | {p['anchor']} | {p['smt']} | {p['n']} | {wr_str} | {pf_str} | {net_str} |")
        lines.append("")

    explanation_text = "\n".join(lines)
    with open(out_path, "w") as f:
        f.write(explanation_text)
    size_kb = out_path.stat().st_size / 1024
    print(f"Written: {out_path}  ({size_kb:.1f} KB)")


# ── write meta.json ────────────────────────────────────────────────────────

def write_meta():
    meta = {
        "title": "IFVG-SMT pairs comparison",
        "category": "ifvg",
        "date": "2026-05-20",
        "excerpt": "Compare 7 anchor/SMT pairs (NQ/ES/GC/YM) across 17 macro events.",
        "tradingviewUrl": None,
        "pdfFile": None,
    }
    out_path = CONTENT_DIR / "meta.json"
    with open(out_path, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"Written: {out_path}")


# ── entry point ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== aggregate_pairs_summary.py ===")
    print(f"Root   : {ROOT}")
    print(f"Data   : {DATA_DIR}")
    print()

    results = build()
    print()
    write_json(results)
    write_csv(results)
    write_explanation(results)
    write_meta()

    print()
    print("Done.")
