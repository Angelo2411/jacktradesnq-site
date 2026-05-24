import json
from datetime import datetime, timezone

SRC = '/Users/angelo/jtnq-hub/public/data/globex-ib10-fib50-fibo-grid.json'
DST = 'public/data/globex-ib50.json'

KEEP_TP = [1.0, 1.5, 1.75, 2.0]

with open(SRC) as f:
    src = json.load(f)

date_from = src['from']
date_to = src['to']
generated_at = datetime.now(timezone.utc).isoformat()

all_trades = []
counts = {}

for variant in src['variants']:
    tp = variant['tp_extension']
    if tp not in KEEP_TP:
        continue
    counts[tp] = 0
    for trade in variant['trades']:
        et = trade['entry_time']
        xt = trade['exit_time']
        entry_dt = datetime.fromtimestamp(et, tz=timezone.utc)
        exit_dt = datetime.fromtimestamp(xt, tz=timezone.utc)
        pnl_pts = trade['pnl_points']
        row = {
            'ts': entry_dt.isoformat(),
            'year': entry_dt.year,
            'side': trade['side'],
            'pnl_pts': pnl_pts,
            'outcome': 'win' if pnl_pts > 0 else 'loss',
            'entry_price': trade['entry_price'],
            'sl_price': trade['sl'],
            'tp_price': trade['tp'],
            'entry_ts': entry_dt.isoformat(),
            'exit_ts': exit_dt.isoformat(),
            'exit_price': trade['exit_price'],
            'x_stop': 0,
            'y_tp': tp,
        }
        all_trades.append(row)
        counts[tp] += 1

output = {
    'meta': {
        'title': 'Globex IB50',
        'symbol': 'NQ',
        'tf': '1m',
        'date_from': date_from,
        'date_to': date_to,
        'generated_at': generated_at,
        'tp_variants': [1.0, 1.5, 1.75, 2.0],
        'default_tp': 1.75,
        'description': '10-min Globex initial balance (18:00-18:10 ET). Break of IB extreme arms bias, entry at 50% retrace. SL=entry-side IB extreme, TP=tp_extension x mid-to-extreme distance.',
    },
    'trades': all_trades,
}

with open(DST, 'w') as f:
    json.dump(output, f)

# --- Proof prints ---
print(f'total trades: {len(all_trades)}')
for tp in sorted(counts.keys()):
    print(f'  tp={tp}: {counts[tp]}')

# 12-month trailing check for tp=1.75
cutoff = '2025-05-22T00:00:00Z'
tp175_trades = [t for t in all_trades if t['y_tp'] == 1.75 and t['ts'] >= cutoff]
tp175_n = len(tp175_trades)
tp175_sum = sum(t['pnl_pts'] for t in tp175_trades)
print(f'\n12mo tp=1.75 (ts >= {cutoff}): {tp175_n} trades, {tp175_sum:.2f} pts')
