'use client';

import { useAsset } from './AssetContext';

const NQ_SUMMARY = {
  totalEvents: 58,
  gapMinPoints: 50,
  direct: { count: 39, pct: 67.2 },
  later: { count: 8, pct: 13.8 },
  held: { count: 11, pct: 19.0 },
  bull: { count: 19, direct: 73.7, later: 15.8, held: 10.5 },
  bear: { count: 39, direct: 64.1, later: 12.8, held: 23.1 },
};

const GC_SUMMARY = {
  totalEvents: 155,
  gapMinPoints: 2,
  direct: { count: 134, pct: 86.5 },
  later: { count: 10, pct: 6.5 },
  held: { count: 11, pct: 7.1 },
  bull: { count: 102, direct: 90.2, later: 4.9, held: 4.9 },
  bear: { count: 53, direct: 79.2, later: 9.4, held: 11.3 },
};

type Summary = typeof NQ_SUMMARY;

function Cylinder({
  label,
  count,
  direct,
  later,
  held,
}: {
  label: 'Bull' | 'Bear';
  count: number;
  direct: number;
  later: number;
  held: number;
}) {
  const segments = [
    { key: 'direct', pct: direct, color: 'var(--c-sage)', text: 'var(--c-paper)', name: 'Direct' },
    { key: 'later', pct: later, color: 'var(--c-accent)', text: 'var(--c-ink)', name: 'Later' },
    { key: 'held', pct: held, color: 'var(--c-terra)', text: 'var(--c-paper)', name: 'Held' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ fontFamily: 'var(--f-sans)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--c-ink)' }}>
        {label}
        <span style={{ marginLeft: 8, color: 'var(--c-ink-quiet)', fontWeight: 400 }}>{count} events</span>
      </div>
      <div
        role="img"
        aria-label={`${label}: Direct ${direct}%, Later ${later}%, Held ${held}%`}
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
            key={s.key}
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
              <span style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.85, marginTop: 2 }}>{s.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CylinderView({ data, unit }: { data: Summary; unit: string }) {
  return (
    <div aria-live="polite" style={{ marginTop: 16 }}>
      <p style={{ fontFamily: 'var(--f-sans)', fontSize: '0.875rem', color: 'var(--c-muted, var(--c-ink-quiet))', marginBottom: 20 }}>
        {data.totalEvents} events · gap ≥{data.gapMinPoints} {unit}.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          padding: '20px 16px',
          background: 'var(--c-paper-edge, oklch(0.94 0.02 85))',
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        {[
          { lbl: 'Direct (≤30 min)', val: data.direct.pct, cnt: data.direct.count, c: 'var(--c-sage)' },
          { lbl: 'Later fill', val: data.later.pct, cnt: data.later.count, c: 'var(--c-accent)' },
          { lbl: 'Held', val: data.held.pct, cnt: data.held.count, c: 'var(--c-terra)' },
        ].map((kpi) => (
          <div key={kpi.lbl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--f-serif, var(--f-sans))', fontSize: '2.25rem', fontWeight: 700, color: kpi.c, lineHeight: 1 }}>
              {kpi.val}%
            </span>
            <span style={{ fontFamily: 'var(--f-sans)', fontSize: '0.75rem', color: 'var(--c-ink-quiet)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {kpi.lbl}
            </span>
            <span style={{ fontFamily: 'var(--f-sans)', fontSize: '0.75rem', color: 'var(--c-ink-dim)', marginTop: 2 }}>
              {kpi.cnt} events
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', justifyContent: 'center', paddingTop: 8 }}>
        <Cylinder label="Bull" count={data.bull.count} direct={data.bull.direct} later={data.bull.later} held={data.bull.held} />
        <Cylinder label="Bear" count={data.bear.count} direct={data.bear.direct} later={data.bear.later} held={data.bear.held} />
      </div>
    </div>
  );
}

export default function NwogSwitcher() {
  const { asset } = useAsset();

  return (
    <div className="bd-asset-scope" data-asset={asset} style={{ marginBottom: 32 }}>
      {asset === 'nq' ? <CylinderView data={NQ_SUMMARY} unit="pts" /> : <CylinderView data={GC_SUMMARY} unit="pts" />}
    </div>
  );
}
