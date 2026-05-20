'use client';

import { useAsset } from './AssetContext';

// NQ data from explanation.md (58 events ≥50 pts, 2018–2026)
const NQ_SUMMARY = {
  totalEvents: 58,
  gapMinPoints: 50,
  direct: { count: 39, pct: 67.2 },
  later: { count: 8, pct: 13.8 },
  held: { count: 11, pct: 19.0 },
  bull: { count: 19, direct: 73.7, later: 15.8, held: 10.5 },
  bear: { count: 39, direct: 64.1, later: 12.8, held: 23.1 },
};

// GC data from public/data/nwog-gc.json (155 events ≥2 pts, 2016–2026)
const GC_SUMMARY = {
  totalEvents: 155,
  gapMinPoints: 2,
  direct: { count: 134, pct: 86.5 },
  later: { count: 10, pct: 6.5 },
  held: { count: 11, pct: 7.1 },
  bull: { count: 102, direct: 90.2, later: 4.9, held: 4.9 },
  bear: { count: 53, direct: 79.2, later: 9.4, held: 11.3 },
};

function SummaryTable({ data, unit }: { data: typeof NQ_SUMMARY; unit: string }) {
  return (
    <div aria-live="polite" style={{ marginTop: 16 }}>
      <p style={{ fontFamily: 'var(--f-sans)', fontSize: '0.875rem', color: 'var(--c-muted)', marginBottom: 12 }}>
        {data.totalEvents} events · gap ≥{data.gapMinPoints} {unit}.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--f-sans)', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
            <th style={{ textAlign: 'left', padding: '6px 12px 6px 0', color: 'var(--c-muted)', fontWeight: 500 }}>Outcome</th>
            <th style={{ textAlign: 'right', padding: '6px 0 6px 12px', color: 'var(--c-muted)', fontWeight: 500 }}>Events</th>
            <th style={{ textAlign: 'right', padding: '6px 0 6px 12px', color: 'var(--c-muted)', fontWeight: 500 }}>%</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
            <td style={{ padding: '8px 12px 8px 0', fontWeight: 600 }}>Direct fill (≤30 min)</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.direct.count}</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.direct.pct}%</td>
          </tr>
          <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
            <td style={{ padding: '8px 12px 8px 0', fontWeight: 600 }}>Later fill</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.later.count}</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.later.pct}%</td>
          </tr>
          <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
            <td style={{ padding: '8px 12px 8px 0', fontWeight: 600 }}>Held</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.held.count}</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.held.pct}%</td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--f-sans)', fontSize: '0.875rem', marginTop: 16 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
            <th style={{ textAlign: 'left', padding: '6px 12px 6px 0', color: 'var(--c-muted)', fontWeight: 500 }}>Direction</th>
            <th style={{ textAlign: 'right', padding: '6px 0 6px 12px', color: 'var(--c-muted)', fontWeight: 500 }}>Events</th>
            <th style={{ textAlign: 'right', padding: '6px 0 6px 12px', color: 'var(--c-muted)', fontWeight: 500 }}>Direct %</th>
            <th style={{ textAlign: 'right', padding: '6px 0 6px 12px', color: 'var(--c-muted)', fontWeight: 500 }}>Later %</th>
            <th style={{ textAlign: 'right', padding: '6px 0 6px 12px', color: 'var(--c-muted)', fontWeight: 500 }}>Held %</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
            <td style={{ padding: '8px 12px 8px 0', fontWeight: 600 }}>Bull</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.bull.count}</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.bull.direct}%</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.bull.later}%</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.bull.held}%</td>
          </tr>
          <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
            <td style={{ padding: '8px 12px 8px 0', fontWeight: 600 }}>Bear</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.bear.count}</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.bear.direct}%</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.bear.later}%</td>
            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{data.bear.held}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function NwogSwitcher() {
  const { asset } = useAsset();

  return (
    <div className="bd-asset-scope" data-asset={asset} style={{ marginBottom: 32 }}>
      {asset === 'nq' ? (
        <SummaryTable data={NQ_SUMMARY} unit="pts" />
      ) : (
        <SummaryTable data={GC_SUMMARY} unit="pts" />
      )}
    </div>
  );
}
