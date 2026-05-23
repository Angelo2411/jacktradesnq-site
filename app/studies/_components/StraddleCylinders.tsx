'use client';

import type { TradeRow } from '@/lib/study-stats';

interface Segment {
  pct: number;
  count: number;
  name: string;
  color: string;
  text: string;
}

function Cylinder({ label, total, segments }: { label: string; total: number; segments: Segment[] }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ fontFamily: 'var(--f-sans)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--c-ink)' }}>
        {label}
        <span style={{ marginLeft: 8, color: 'var(--c-ink-quiet)', fontWeight: 400 }}>{total} trades</span>
      </div>
      <div
        role="img"
        aria-label={`${label}: ${segments.map((s) => `${s.name} ${s.pct.toFixed(1)}%`).join(', ')}`}
        style={{
          width: '100%',
          maxWidth: 180,
          height: 320,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--c-paper-edge)',
          boxShadow: '0 1px 2px oklch(0.20 0.02 270 / 0.06)',
        }}
      >
        {segments.map((s) => (
          <div
            key={s.name}
            style={{
              flexBasis: `${s.pct}%`,
              background: s.color,
              color: s.text,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--f-sans)',
              fontSize: s.pct < 8 ? '0.7rem' : '0.95rem',
              fontWeight: 700,
              padding: s.pct < 8 ? '2px 4px' : '6px 8px',
              minHeight: 0,
            }}
          >
            <span>{s.pct.toFixed(1)}%</span>
            {s.pct >= 12 && (
              <span style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.85, marginTop: 2 }}>
                {s.name} · {s.count}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StraddleCylinders({ trades }: { trades: TradeRow[] }) {
  const total = trades.length;
  if (total === 0) return null;

  const longs = trades.filter((t) => t.side === 'long').length;
  const shorts = trades.filter((t) => t.side === 'short').length;
  const wins = trades.filter((t) => t.pnl_pts > 0).length;
  const losses = trades.filter((t) => t.pnl_pts < 0).length;
  const flats = total - wins - losses;

  const sideSegments: Segment[] = [
    { name: 'Long', count: longs, pct: (longs / total) * 100, color: 'var(--c-sage-soft)', text: 'var(--c-ink)' },
    { name: 'Short', count: shorts, pct: (shorts / total) * 100, color: 'var(--c-terra-soft)', text: 'var(--c-ink)' },
  ];

  const outcomeSegments: Segment[] = [
    { name: 'Win', count: wins, pct: (wins / total) * 100, color: 'var(--c-sage)', text: 'var(--c-paper)' },
    { name: 'Loss', count: losses, pct: (losses / total) * 100, color: 'var(--c-terra)', text: 'var(--c-paper)' },
    ...(flats > 0
      ? [{ name: 'Flat', count: flats, pct: (flats / total) * 100, color: 'var(--c-accent)', text: 'var(--c-ink)' } as Segment]
      : []),
  ];

  return (
    <div style={{ marginTop: 32 }}>
      <div className="v3-wd-h">Distribution</div>
      <div className="v3-wd-sub">Direction taken and outcome across all filtered trades.</div>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', justifyContent: 'center', paddingTop: 16 }}>
        <Cylinder label="Side" total={total} segments={sideSegments} />
        <Cylinder label="Outcome" total={total} segments={outcomeSegments} />
      </div>
    </div>
  );
}
