"""Convert fibo-grid JSON to site TradeRow format (per-asset). Usage: uv run python convert_globex_ib50_asset.py <input.json> <output.json>"""
import json
import sys
from datetime import datetime, timezone

if len(sys.argv) < 3:
    print(f"Usage: {sys.argv[0]} <input_fibo_grid.json> <output.json>")
    sys.exit(1)

SRC = sys.argv[1]
DST = sys.argv[2]

KEEP_TP = [1.0, 1.5, 1.75, 2.0]

with open(SRC) as f:
    src = json.load(f)

symbol = src['symbol']
date_from = src['from']
date_to = src['to']
generated_at = datetime.now(timezone.utc).isoformat()

# Build lookup: entry_time -> {sl, tp_at_1, side} from tp_extension==1.0 variant
tp1_variant = next(v for v in src['variants'] if v['tp_extension'] == 1.0)
session_ib = {}
for t in tp1_variant['trades']:
    et = t['entry_time']
    session_ib[et] = {'sl': t['sl'], 'tp_at_1': t['tp'], 'side': t['side']}

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
        ib = session_ib.get(et, {})
        side = trade['side']
        sl = trade['sl']
        tp_at_1 = ib.get('tp_at_1', None)
        if tp_at_1 is not None:
            if side == 'short':
                ib_high = sl
                ib_low = tp_at_1
            else:
                ib_low = sl
                ib_high = tp_at_1
        else:
            # fallback: derive from entry + sl (entry is mid, sl is one extreme)
            mid_to_sl = abs(trade['entry_price'] - sl)
            if side == 'short':
                ib_high = trade['entry_price'] + mid_to_sl
                ib_low = trade['entry_price'] - mid_to_sl
            else:
                ib_low = trade['entry_price'] - mid_to_sl
                ib_high = trade['entry_price'] + mid_to_sl
        row = {
            'ts': entry_dt.isoformat(),
            'year': entry_dt.year,
            'side': side,
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
            'ib_high': ib_high,
            'ib_low': ib_low,
        }
        all_trades.append(row)
        counts[tp] += 1

output = {
    'meta': {
        'title': f'Globex IB50 — {symbol}',
        'symbol': symbol,
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

print(f'{symbol}: {len(all_trades)} trades saved to {DST}')
for tp in sorted(counts.keys()):
    print(f'  tp={tp}: {counts[tp]}')
