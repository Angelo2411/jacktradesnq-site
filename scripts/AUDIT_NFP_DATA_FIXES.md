# Audit NFP IFVG-SMT — bugs data à corriger (handoff)

Audit fait sur la data NFP NQ publiée (`public/data/nfp-ifvg-smt.json` + `nfp-ifvg-smt-trade-prices.json`).
Verdict global : **data fiable**, agrégats ⟷ trades reconcilient à 100% en nombre de trades et en PnL sur chaque année.
Restent **2 bugs** à fixer. Ordre de priorité ci-dessous.

---

## BUG 1 — Event fantôme compté comme NFP (CORRECTNESS, prio haute)

### Symptôme
`2024-08-21` est compté comme NFP et **a généré 1 trade compté dans les stats publiées**
(smt=ON, side long, −18 pts). Or ce n'est PAS le rapport mensuel NFP : c'est la **révision benchmark annuelle BLS**
(et l'heure 08:30 est même probablement fausse — le benchmark prelim 2024 est sorti à 10:00 ET).

Impact mesuré sur la vue affichée (NQ, SMT=ON, variant no_be) :
- Avec le fantôme : 23 trades / **+973.75 pts**
- Sans : 22 trades / **+991.75 pts**

### Autres fantômes (mêmes cause, AUCUN trade généré sur NQ → impact nul aujourd'hui, mais à nettoyer car ils peuvent toucher ES/YM/GC/SI)
- `2019-09-05` (jeu) — doublon de `2019-09-06` (vrai NFP vendredi)
- `2020-05-11` (lun) — doublon de `2020-05-08` (vrai NFP vendredi)
- `2024-01-10` — doublon de `2024-01-05` (vrai NFP)

Compte NFP/an dans le calendrier (devrait être ~12) :
`2019=13, 2020=13, 2024=14` → ces excédents = les fantômes ci-dessus.

### Cause racine
Source : `/Users/angelo/news-cal-official/news_official_2016_2026.csv`
contient ces lignes taguées `NFP` à `08:30`. Exemple :
```
2024-08-02,08:30,NFP,BLS,yes      <- vrai NFP août
2024-08-21,08:30,NFP,BLS,yes      <- FANTÔME (révision benchmark)
```
Le loader `scripts/run_es_10y_all_events.py:168 load_events()` fait confiance au tag CSV :
il garde toute ligne `event_type=="NFP"` à l'heure attendue, **sans dédup ni validation calendaire**.
→ le fantôme passe direct dans le moteur.

Ce CSV est la **source unique** consommée par TOUS les runners d'event (NQ/ES/YM via `run_es_10y_all_events.py`,
GC/SI via `run_metals_10y_all_events.py` / `run_si_10y_all_events.py`, + CPI/FOMC). Donc fix au niveau CSV = fix global.

### Fix recommandé (2 couches)

**Couche A — nettoyer la source (fait le vrai job) :**
Dans le repo `~/news-cal-official`, retirer/retaguer les lignes fantômes du builder
(`scripts/build_official_and_diff.py` + `scrape_5events.py`), puis régénérer `news_official_2016_2026.csv`.
Règle canonique NFP = **un seul NFP par mois calendaire**, date = release officielle BLS
(1er vendredi, ou décalage si jour férié type July 4 / shutdown / delay annoncé).
Lignes à supprimer : `2024-08-21`, `2019-09-05`, `2020-05-11`, `2024-01-10`.
⚠️ NE PAS toucher aux décalages LÉGITIMES (à garder) : `2020-07-02`, `2025-07-03` (July 4),
`2025-11-20` (shutdown), `2026-02-11` (delay) — déjà gérés correctement.

**Couche B — garde-fou défensif dans le loader** (pour que ce drift ne repasse jamais silencieusement) :
dans `run_es_10y_all_events.py load_events()`, après le filtre, pour `event_type=="NFP"`
dédupliquer à 1 event par `(year, month)` (garder le 1er du mois) et `assert` qu'on a ~11-13 NFP/an.
Si >13/an ou 2 events dans le même mois → raise (drift calendrier = bug invisible, cf taskLesson 2026-05-08).

### Vérification après fix
```bash
# 1 seul NFP par mois, ~12/an, plus de fantôme :
awk -F, '$3=="NFP"{print substr($1,1,7)}' ~/news-cal-official/news_official_2016_2026.csv | sort | uniq -c | awk '$1>1'
# (doit ne RIEN sortir)
awk -F, '$3=="NFP" && $1 ~ /2024-08-21/' ~/news-cal-official/news_official_2016_2026.csv
# (doit ne RIEN sortir)
```
Puis re-run le moteur NQ/ES/YM + métaux, re-export les JSON, et confirmer :
NQ SMT=ON no_be → 22 trades / +991.75 pts (au lieu de 23 / +973.75).

---

## BUG 2 — `exit_price` manquant sur les trades TIMEOUT (COSMÉTIQUE, prio basse)

### Symptôme
4 trades NQ ont `exit_price: null` dans `nfp-ifvg-smt-trade-prices.json` :
`2017-02-03`, `2018-08-03`, `2021-05-07`, `2021-09-03`.
→ Sur le chart, le **marqueur de sortie manque** pour ces trades.
Les **stats agrégées sont correctes** (le moteur résout bien le timeout au dernier close via `pts`),
c'est uniquement le fichier markers qui ne stocke pas le prix de sortie.

### Cause racine
`scripts/run_news_830_variants.py:308-323` (`simulate_variant`, branche TIMEOUT) :
`pts` est calculé depuis `last_price`, mais `exit_price` reste à `None` (init ligne 206)
et n'est jamais assigné. Le dict retourné ligne 325 propage donc `exit_price=None`.

```python
# lignes 308-323 actuelles
if result is None:
    last = scan_bars_last_close(bars_idx, resolve_deadline_ts, entry_ts)
    if last is None:
        return {"result": "SKIP_NO_RESOLVE", "pts": 0.0}
    exit_ts, last_price = last
    if side == "SHORT":
        full_unreal = entry_price - last_price
    else:
        full_unreal = last_price - entry_price
    if variant == "tp1_be" and half_closed:
        pts = 0.5 * half_target + 0.5 * full_unreal
        result = "TIMEOUT_HALF"
    else:
        pts = full_unreal
        result = "TIMEOUT"
```

### Fix
Ajouter `exit_price = last_price` dans la branche timeout (juste après `exit_ts, last_price = last`) :
```python
    exit_ts, last_price = last
    exit_price = last_price        # <-- AJOUT : stocker le prix de sortie du timeout
```

### À vérifier ailleurs (même bug probable)
`run_si_10y_all_events.py:288` a sa **propre copie** de `simulate_variant` (GC/SI).
Vérifier la branche timeout là aussi et appliquer le même fix si `exit_price` n'est pas set.
`run_metals_10y_all_events.py` et `run_es_10y_all_events.py` importent la version de `run_news_830_variants.py`
→ le fix unique couvre NQ/ES/YM/métaux-via-import.

### Vérification après fix
```bash
python3 -c "import json; p=json.load(open('public/data/nfp-ifvg-smt-trade-prices.json'))['prices']; print('exit None:', sum(1 for x in p if x['exit_price'] is None))"
# doit afficher 0
```

---

## Ce qui est SAIN (ne pas toucher)
- Reconciliation agrégats `nfp-ifvg-smt.json` ⟷ `nfp-ifvg-smt-trade-prices.json` : n exact chaque année,
  PnL exact (l'écart apparent venait juste des 4 timeouts sans exit_price ci-dessus).
- Toutes les heures = 08:30 ET. Aucune corruption timezone (contrairement à l'ancien `news_red_folder`, cf taskLesson 2026-05-08).
- Logique SMT correcte : `smt=True` est bien un sous-ensemble des entrées de base.
  Agrégat `smt=false` = TOTAL (toutes entrées) ; `smt=true` = filtrées. Vue site = smt=true.
- Décalages NFP légitimes tous gérés (July 4, shutdown nov-2025, delay fév-2026).

## Checklist finale post-fix
1. [ ] Nettoyer CSV calendrier (BUG 1 couche A) + garde-fou loader (couche B)
2. [ ] Fix `exit_price` timeout dans `run_news_830_variants.py` (+ vérif `run_si_10y_all_events.py`)
3. [ ] Re-run moteur 5 assets (NQ/ES/YM/GC/SI) → re-export `public/data/*nfp-ifvg-smt*.json`
4. [ ] Vérifs ci-dessus (0 doublon mois, 0 fantôme, 0 exit None, NQ SMT=ON = 22/+991.75)
5. [ ] `npm run build` clean, vérif visuelle page `/studies/nfp-ifvg-smt`
6. [ ] Idéalement re-checker CPI/NFP/FOMC/autres events pour fantômes calendrier similaires
