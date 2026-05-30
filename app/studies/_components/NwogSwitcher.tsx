'use client';

import { useState, useEffect } from 'react';
import { useAsset } from './AssetContext';
import { assetShort } from '@/lib/terminology';

type SessionKey = '30min' | 'Asia' | 'London_lun' | 'NY_AM_lun' | 'NY_PM_lun';
type YearKey = '2025' | '2026';
type DayKey = 'J+1' | 'J+2' | 'J+3' | 'J+4' | 'non comblé';

type SessionStats = { retrace_pct: number; fill_pct: number; retrace_n: number; fill_n: number };
type YearStats = { n: number; jm_fill: number; flip: number; cf_total: number; jm_fill_pct: number; flip_pct: number };
type DayDist = { n: number; pct: number };

type AssetPayload = {
  meta: {
    date_range: string; min_gap_pts: number; N_gaps: number; n_up: number; n_down: number;
    avg_gap_abs: number; asset: string; unit: string;
  };
  bucket_stats: Record<SessionKey, SessionStats>;
  jour_meme: { fill_pct: number; fill_n: number; continue_n: number; flip_n: number; continue_pct: number; flip_pct: number };
  by_year: Record<YearKey, YearStats>;
  day_of_fill_distribution: { non_jour_meme_n: number; distribution: Record<DayKey, DayDist> };
};

type DataSet = Record<string, AssetPayload>;

const SESSION_LABELS: Record<SessionKey, string> = {
  '30min': 'First 30 min',
  'Asia': 'Asia',
  'London_lun': 'London (Mon)',
  'NY_AM_lun': 'NY AM (Mon)',
  'NY_PM_lun': 'NY PM (Mon)',
};

const LIFECYCLE_LABELS: Record<DayKey, string> = {
  'J+1': 'J+1',
  'J+2': 'J+2',
  'J+3': 'J+3',
  'J+4': 'J+4',
  'non comblé': 'Never that week',
};

/** Maps asset code -> JSON key in nwog-4asset.json (uppercase ticker) */
const ASSET_JSON_KEY: Record<string, string> = { nq: 'NQ', gc: 'GC', es: 'ES', si: 'SI' };

export default function NwogSwitcher() {
  const { asset } = useAsset();
  const [data, setData] = useState<DataSet | null>(null);

  useEffect(() => {
    fetch('/data/nwog-4asset.json')
      .then((r) => r.json())
      .then((json) => setData(json as DataSet))
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="bd-asset-scope" data-asset={asset}>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: '0.875rem', color: 'var(--c-muted)', paddingTop: 16 }}>
          Loading…
        </p>
      </div>
    );
  }

  const key = ASSET_JSON_KEY[asset] ?? 'NQ';
  const payload = data[key];
  if (!payload) {
    return (
      <div className="bd-asset-scope" data-asset={asset}>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: '0.875rem', color: 'var(--c-muted)', paddingTop: 16 }}>
          No data for {asset.toUpperCase()}.
        </p>
      </div>
    );
  }

  const { meta, bucket_stats, jour_meme, by_year, day_of_fill_distribution } = payload;

  return (
    <div className="bd-asset-scope" data-asset={asset} style={{ marginBottom: 32 }}>
      <div aria-live="polite">
        <p
          style={{
            fontFamily: 'var(--f-sans)',
            fontSize: '0.875rem',
            color: 'var(--c-muted)',
            marginBottom: 20,
          }}
        >
          {meta.N_gaps} qualifying weekend gaps · avg {meta.avg_gap_abs.toFixed(1)} {meta.unit} · 2025–2026
        </p>

        {/* KPI cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            padding: '20px 16px',
            background: 'var(--c-surface-raised)',
            borderRadius: 12,
            marginBottom: 24,
          }}
          className="nwog-kpi-grid"
        >
          {[
            { label: 'Retrace', val: bucket_stats.Asia.retrace_pct, color: 'var(--c-sage)', sub: 'pulls back to open' },
            { label: 'Fill same-day', val: jour_meme.fill_pct, color: 'var(--c-accent)', sub: 'fully closes' },
            { label: 'Flip', val: jour_meme.flip_pct, color: 'var(--c-terra)', sub: 'fills then reverses' },
          ].map((kpi) => (
            <div key={kpi.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--f-serif)',
                  fontSize: '2.25rem',
                  fontWeight: 700,
                  color: kpi.color,
                  lineHeight: 1,
                }}
              >
                {kpi.val.toFixed(1)}%
              </span>
              <span
                style={{
                  fontFamily: 'var(--f-sans)',
                  fontSize: '0.75rem',
                  color: 'var(--c-muted)',
                  marginTop: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {kpi.label}
              </span>
              <span style={{ fontFamily: 'var(--f-sans)', fontSize: '0.75rem', color: 'var(--c-muted)', marginTop: 2, opacity: 0.75 }}>
                {kpi.sub}
              </span>
            </div>
          ))}
        </div>

        {/* By session table */}
        <p
          style={{
            fontFamily: 'var(--f-sans)',
            fontWeight: 600,
            fontSize: '0.8rem',
            color: 'var(--c-ink)',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          By session
        </p>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--f-sans)',
            fontSize: '0.875rem',
            marginBottom: 24,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--c-ink)',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--c-ink)',
                }}
              >
                Session
              </th>
              <th
                style={{
                  textAlign: 'right',
                  fontWeight: 600,
                  color: 'var(--c-ink)',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--c-ink)',
                }}
              >
                Retrace %
              </th>
              <th
                style={{
                  textAlign: 'right',
                  fontWeight: 600,
                  color: 'var(--c-ink)',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--c-ink)',
                }}
              >
                Fill %
              </th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(SESSION_LABELS) as SessionKey[]).map((sk) => (
              <tr key={sk}>
                <td
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--c-surface-raised)',
                    color: 'var(--c-ink)',
                  }}
                >
                  {SESSION_LABELS[sk]}
                </td>
                <td
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--c-surface-raised)',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--c-ink)',
                  }}
                >
                  {bucket_stats[sk].retrace_pct.toFixed(1)}%
                </td>
                <td
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--c-surface-raised)',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--c-ink)',
                  }}
                >
                  {bucket_stats[sk].fill_pct.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* By regime table */}
        <p
          style={{
            fontFamily: 'var(--f-sans)',
            fontWeight: 600,
            fontSize: '0.8rem',
            color: 'var(--c-ink)',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          By regime
        </p>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--f-sans)',
            fontSize: '0.875rem',
            marginBottom: 24,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--c-ink)',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--c-ink)',
                }}
              >
                Year
              </th>
              <th
                style={{
                  textAlign: 'right',
                  fontWeight: 600,
                  color: 'var(--c-ink)',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--c-ink)',
                }}
              >
                N
              </th>
              <th
                style={{
                  textAlign: 'right',
                  fontWeight: 600,
                  color: 'var(--c-ink)',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--c-ink)',
                }}
              >
                Fill same-day %
              </th>
              <th
                style={{
                  textAlign: 'right',
                  fontWeight: 600,
                  color: 'var(--c-ink)',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--c-ink)',
                }}
              >
                Flip %
              </th>
            </tr>
          </thead>
          <tbody>
            {(['2025', '2026'] as YearKey[]).map((yr) => (
              <tr key={yr}>
                <td
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--c-surface-raised)',
                    fontFamily: 'var(--f-serif)',
                    fontWeight: 700,
                    color: 'var(--c-ink)',
                  }}
                >
                  {yr}
                </td>
                <td
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--c-surface-raised)',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--c-ink)',
                  }}
                >
                  {by_year[yr].n}
                </td>
                <td
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--c-surface-raised)',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--c-ink)',
                  }}
                >
                  {by_year[yr].jm_fill_pct.toFixed(1)}%
                </td>
                <td
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--c-surface-raised)',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--c-ink)',
                  }}
                >
                  {by_year[yr].flip_pct.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Lifecycle */}
        <p
          style={{
            fontFamily: 'var(--f-sans)',
            fontWeight: 600,
            fontSize: '0.8rem',
            color: 'var(--c-ink)',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Lifecycle
        </p>
        <p
          style={{
            fontFamily: 'var(--f-sans)',
            fontSize: '0.8rem',
            color: 'var(--c-muted)',
            marginBottom: 12,
          }}
        >
          Gaps not filled on Monday (n={day_of_fill_distribution.non_jour_meme_n})
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(Object.keys(LIFECYCLE_LABELS) as DayKey[]).map((dk) => {
            const entry = day_of_fill_distribution.distribution[dk];
            return (
              <div
                key={dk}
                style={{
                  flex: '1 1 auto',
                  minWidth: 90,
                  padding: '10px 12px',
                  background: 'var(--c-surface-raised)',
                  borderRadius: 8,
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--f-serif)',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: 'var(--c-ink)',
                    lineHeight: 1.2,
                  }}
                >
                  {entry.pct.toFixed(1)}%
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--f-sans)',
                    fontSize: '0.72rem',
                    color: 'var(--c-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: 3,
                  }}
                >
                  {LIFECYCLE_LABELS[dk]}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--f-sans)',
                    fontSize: '0.68rem',
                    color: 'var(--c-muted)',
                    opacity: 0.75,
                    marginTop: 2,
                  }}
                >
                  n={entry.n}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @media (max-width: 520px) {
          .nwog-kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
