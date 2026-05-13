'use client';

import { useState } from 'react';

type AssetKey = 'nq' | 'gc';

const ASSETS: { key: AssetKey; label: string; dot: string }[] = [
  { key: 'nq', label: 'Nasdaq', dot: 'oklch(0.86 0.16 95)' },
  { key: 'gc', label: 'Gold', dot: 'oklch(0.74 0.16 78)' },
];

// NQ data hardcoded from explanation.md (10y backtest)
const NQ_ROWS = [
  { killzone: 'Asia',   hoursNY: '18:00 → 00:00', n: null, avg: null, med: null, unit: 'pts' },
  { killzone: 'London', hoursNY: '02:00 → 05:00', n: null, avg: null, med: null, unit: 'pts' },
  { killzone: 'NY AM',  hoursNY: '09:30 → 11:00', n: null, avg: null, med: null, unit: 'pts' },
  { killzone: 'NY PM',  hoursNY: '14:00 → 16:10', n: null, avg: null, med: null, unit: 'pts' },
];

// GC data from public/data/killzone-gc.json (overall array)
const GC_ROWS = [
  { killzone: 'Asia',   hoursNY: '18:00 → 00:00', n: 2671, avg: 13.2, med: 7.7,  unit: '$/oz' },
  { killzone: 'London', hoursNY: '02:00 → 05:00', n: 2669, avg: 10.2, med: 7.2,  unit: '$/oz' },
  { killzone: 'NY AM',  hoursNY: '09:30 → 11:00', n: 2670, avg: 12.9, med: 9.2,  unit: '$/oz' },
  { killzone: 'NY PM',  hoursNY: '14:00 → 16:10', n: 2618, avg: 7.4,  med: 4.5,  unit: '$/oz' },
];

export default function KillzoneSwitcher() {
  const [asset, setAsset] = useState<AssetKey>('nq');
  const rows = asset === 'nq' ? NQ_ROWS : GC_ROWS;
  const unit = asset === 'nq' ? 'pts' : '$/oz';

  return (
    <div className="bd-asset-scope" data-asset={asset} style={{ marginBottom: 32 }}>
      <div className="bd-asset-topbar">
        <div className="bd-asset-switch" role="tablist" aria-label="Asset selector">
          {ASSETS.map((a, i) => (
            <button
              key={a.key}
              role="tab"
              type="button"
              aria-selected={asset === a.key}
              onClick={() => setAsset(a.key)}
              className="bd-asset-switch-btn"
              style={{ ['--btn-dot' as string]: a.dot }}
            >
              {a.label}
              {i === 0 ? (
                <span className="bd-asset-switch-sep" aria-hidden="true">
                  /
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {asset === 'gc' ? (
        <div aria-live="polite" style={{ marginTop: 16 }}>
          <p
            style={{
              fontFamily: 'var(--f-sans)',
              fontSize: '0.875rem',
              color: 'var(--c-muted)',
              marginBottom: 12,
            }}
          >
            Gold (GC) — killzone range stats ($/oz), 10-year backtest 2016–2026.
            Both NQ and Gold backtested — toggle via the buttons above.
          </p>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--f-sans)',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 12px 6px 0', color: 'var(--c-muted)', fontWeight: 500 }}>Killzone</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', color: 'var(--c-muted)', fontWeight: 500 }}>Hours (NY)</th>
                <th style={{ textAlign: 'right', padding: '6px 0 6px 12px', color: 'var(--c-muted)', fontWeight: 500 }}>n</th>
                <th style={{ textAlign: 'right', padding: '6px 0 6px 12px', color: 'var(--c-muted)', fontWeight: 500 }}>Avg ({unit})</th>
                <th style={{ textAlign: 'right', padding: '6px 0 6px 12px', color: 'var(--c-muted)', fontWeight: 500 }}>Median ({unit})</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.killzone} style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '8px 12px 8px 0', fontWeight: 600 }}>{r.killzone}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--c-muted)' }}>{r.hoursNY}</td>
                  <td style={{ padding: '8px 0 8px 12px', textAlign: 'right', color: 'var(--c-muted)' }}>{r.n?.toLocaleString() ?? '—'}</td>
                  <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{r.avg ?? '—'}</td>
                  <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{r.med ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p
          aria-live="polite"
          style={{
            fontFamily: 'var(--f-sans)',
            fontSize: '0.875rem',
            color: 'var(--c-muted)',
            marginTop: 16,
          }}
        >
          Showing NQ data — see PDF below for full breakdown. Switch to Gold to view GC killzone ranges.
        </p>
      )}
    </div>
  );
}
