'use client';

import { useState, useEffect } from 'react';
import { useAsset } from './AssetContext';

type KillzoneKey = 'Asia' | 'London' | 'NY AM' | 'NY PM';

interface OverallRow {
  killzone: KillzoneKey;
  n: number;
  avgRange: number;
  medRange: number;
}

interface MonthRow {
  month: number;
  monthName: string;
  n: number;
  avgRange: number;
  medRange: number;
}

interface SeasonRow {
  season: string;
  months: number[];
  n: number;
  avgRange: number;
  medRange: number;
}

interface KillzoneData {
  symbol: string;
  dateRange: { from: string; to: string };
  overall: OverallRow[];
  byMonth: Record<KillzoneKey, MonthRow[]>;
  bySeason: Record<KillzoneKey, SeasonRow[]>;
}

const KILLZONES: KillzoneKey[] = ['Asia', 'London', 'NY AM', 'NY PM'];

const HOURS_NY: Record<KillzoneKey, string> = {
  Asia: '18:00 \u2192 00:00',
  London: '02:00 \u2192 05:00',
  'NY AM': '09:30 \u2192 11:00',
  'NY PM': '14:00 \u2192 16:10',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall'];

export default function KillzoneSwitcher() {
  const { asset } = useAsset();
  const [data, setData] = useState<KillzoneData | null>(null);

  useEffect(() => {
    fetch(`/data/killzone-${asset}.json`)
      .then((r) => r.json())
      .then((json) => setData(json as KillzoneData))
      .catch(() => setData(null));
  }, [asset]);

  if (!data) {
    return (
      <div className="bd-asset-scope" data-asset={asset}>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: '0.875rem', color: 'var(--c-muted)', paddingTop: 16 }}>
          Loading…
        </p>
      </div>
    );
  }

  const assetLabel = asset === 'gc' ? 'Gold (GC)' : asset === 'es' ? 'S&P 500 (ES)' : 'Nasdaq (NQ)';
  const unit = 'pts';

  return (
    <div className="bd-asset-scope" data-asset={asset} style={{ marginBottom: 32 }}>
      <div aria-live="polite">
        <p
          style={{
            fontFamily: 'var(--f-sans)',
            fontSize: '0.875rem',
            color: 'var(--c-muted)',
          }}
        >
          {assetLabel} — killzone range stats (pts), 2025–2026.
        </p>

        <h4
          style={{
            fontFamily: 'var(--f-sans)',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--c-muted)',
            marginTop: 24,
            marginBottom: 8,
          }}
        >
          Overall
        </h4>
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
            {KILLZONES.map((kz) => {
              const row = data.overall.find((r) => r.killzone === kz);
              if (!row) return null;
              return (
                <tr key={kz} style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '8px 12px 8px 0', fontWeight: 600 }}>{kz}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--c-muted)' }}>{HOURS_NY[kz]}</td>
                  <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{row.n}</td>
                  <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{row.avgRange.toFixed(1)}</td>
                  <td style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>{row.medRange.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h4
          style={{
            fontFamily: 'var(--f-sans)',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--c-muted)',
            marginTop: 24,
            marginBottom: 8,
          }}
        >
          Average range by month (2025–2026)
        </h4>
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
              <th style={{ textAlign: 'left', padding: '6px 12px 6px 0', color: 'var(--c-muted)', fontWeight: 500 }}>Month</th>
              {KILLZONES.map((kz) => (
                <th key={kz} style={{ textAlign: 'right', padding: '6px 0 6px 12px', color: 'var(--c-muted)', fontWeight: 500 }}>{kz}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MONTHS.map((monthName, i) => {
              const monthIdx = i + 1;
              return (
                <tr key={monthName} style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '8px 12px 8px 0', fontWeight: 600 }}>{monthName}</td>
                  {KILLZONES.map((kz) => {
                    const entry = data.byMonth[kz].find((m) => m.month === monthIdx);
                    return (
                      <td key={kz} style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>
                        {entry ? entry.avgRange.toFixed(1) : '\u2014'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        <h4
          style={{
            fontFamily: 'var(--f-sans)',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--c-muted)',
            marginTop: 24,
            marginBottom: 8,
          }}
        >
          By season
        </h4>
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
              <th style={{ textAlign: 'left', padding: '6px 12px 6px 0', color: 'var(--c-muted)', fontWeight: 500 }}>Season</th>
              {KILLZONES.map((kz) => (
                <th key={kz} style={{ textAlign: 'right', padding: '6px 0 6px 12px', color: 'var(--c-muted)', fontWeight: 500 }}>{kz}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SEASONS.map((season) => (
              <tr key={season} style={{ borderBottom: '1px solid var(--c-border)' }}>
                <td style={{ padding: '8px 12px 8px 0', fontWeight: 600 }}>{season}</td>
                {KILLZONES.map((kz) => {
                  const entry = data.bySeason[kz].find((s) => s.season === season);
                  return (
                    <td key={kz} style={{ padding: '8px 0 8px 12px', textAlign: 'right' }}>
                      {entry ? entry.avgRange.toFixed(1) : '\u2014'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
