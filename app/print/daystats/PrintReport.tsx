'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

// ── Types ────────────────────────────────────────────────────────────────────

interface Bar {
  m: number; // minutes from release (0 = release bar)
  o: number;
  h: number;
  l: number;
  c: number;
}

interface EventEntry {
  date: string;
  t0_iso: string;
  entry_price: number;
  bars: Bar[];
}

interface YearStats {
  year: string;
  n: number;
  avg: number;
  max: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EVENT_LABELS: Record<string, string> = {
  'cb-confidence': 'CB Consumer Confidence',
  'cpi':           'CPI',
  'durable-goods': 'Durable Goods',
  'fomc':          'FOMC',
  'ism-mfg':       'ISM Manufacturing',
  'ism-services':  'ISM Services',
  'philly-fed':    'Philly Fed',
};

const EVENT_RELEASE_TIME: Record<string, string> = {
  'cb-confidence': '10:00 ET',
  'cpi':           '8:30 ET',
  'durable-goods': '8:30 ET',
  'fomc':          '14:00 ET',
  'ism-mfg':       '10:00 ET',
  'ism-services':  '10:00 ET',
  'philly-fed':    '8:30 ET',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDataUrl(event: string, asset: string): string {
  // Map hyphenated event slug → underscore filename
  const fileEvent = event.replace(/-/g, '_');
  const suffix = asset === 'gc' ? '_gc' : `_${asset}`;
  return `/data/${fileEvent}_event_bars${suffix}.json`;
}

function getReleaseBarRange(entry: EventEntry): number | null {
  const bar = entry.bars.find((b) => b.m === 0);
  if (!bar) return null;
  return bar.h - bar.l;
}

function computeStats(events: EventEntry[]) {
  const ranges: number[] = [];
  const byYear: Record<string, number[]> = {};

  for (const ev of events) {
    const rng = getReleaseBarRange(ev);
    if (rng === null) continue;
    ranges.push(rng);
    const yr = ev.date.slice(0, 4);
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(rng);
  }

  const n = ranges.length;
  if (n === 0) return null;

  const sorted = [...ranges].sort((a, b) => a - b);
  const avg = ranges.reduce((s, v) => s + v, 0) / n;
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(n / 2)];
  const pctPos = 100; // all release bars have range > 0 by definition

  const yearStats: YearStats[] = Object.entries(byYear)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, yrs]) => ({
      year,
      n: yrs.length,
      avg: yrs.reduce((s, v) => s + v, 0) / yrs.length,
      max: Math.max(...yrs),
    }));

  return { n, avg, max, median, pctPos, yearStats };
}

// ── SVG Range Chart ───────────────────────────────────────────────────────────

function RangeChart({ yearStats, maxRange }: { yearStats: YearStats[]; maxRange: number }) {
  const W = 560;
  const H = 180;
  const PAD = { top: 12, right: 16, bottom: 32, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const scaleY = (v: number) => chartH - (v / maxRange) * chartH;
  const barW = Math.max(8, Math.floor(chartW / yearStats.length) - 4);
  const stepX = chartW / yearStats.length;

  const tickVals = [0, maxRange * 0.25, maxRange * 0.5, maxRange * 0.75, maxRange];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      style={{ display: 'block', overflow: 'visible' }}
      aria-label="Release-bar avg range by year"
      role="img"
    >
      {/* Grid lines */}
      {tickVals.map((v, i) => (
        <line
          key={i}
          x1={PAD.left}
          x2={PAD.left + chartW}
          y1={PAD.top + scaleY(v)}
          y2={PAD.top + scaleY(v)}
          stroke="oklch(0.32 0.016 64)"
          strokeWidth={i === 0 ? 1.5 : 0.75}
          strokeDasharray={i === 0 ? undefined : '3 3'}
        />
      ))}

      {/* Y axis labels */}
      {tickVals.map((v, i) => (
        <text
          key={i}
          x={PAD.left - 6}
          y={PAD.top + scaleY(v) + 4}
          textAnchor="end"
          fontSize={9}
          fill="oklch(0.62 0.018 75)"
          fontFamily="JetBrains Mono, monospace"
        >
          {v === 0 ? '0' : v.toFixed(0)}
        </text>
      ))}

      {/* Bars */}
      {yearStats.map((ys, i) => {
        const cx = PAD.left + i * stepX + stepX / 2;
        const barH = (ys.avg / maxRange) * chartH;
        const barY = PAD.top + chartH - barH;
        return (
          <g key={ys.year}>
            {/* Max range tick */}
            <line
              x1={cx - barW / 2}
              x2={cx + barW / 2}
              y1={PAD.top + scaleY(ys.max)}
              y2={PAD.top + scaleY(ys.max)}
              stroke="oklch(0.80 0.135 82 / 0.6)"
              strokeWidth={1.5}
            />
            {/* Avg bar */}
            <rect
              x={cx - barW / 2}
              y={barY}
              width={barW}
              height={barH}
              fill="oklch(0.80 0.135 82)"
              rx={2}
            />
            {/* Year label */}
            <text
              x={cx}
              y={PAD.top + chartH + 18}
              textAnchor="middle"
              fontSize={9}
              fill="oklch(0.62 0.018 75)"
              fontFamily="JetBrains Mono, monospace"
            >
              {ys.year.slice(2)}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={PAD.left} y={H - 8} width={10} height={4} fill="oklch(0.80 0.135 82)" rx={1} />
      <text x={PAD.left + 14} y={H - 3} fontSize={8} fill="oklch(0.62 0.018 75)" fontFamily="JetBrains Mono, monospace">avg</text>
      <line x1={PAD.left + 36} x2={PAD.left + 46} y1={H - 5} y2={H - 5} stroke="oklch(0.80 0.135 82 / 0.6)" strokeWidth={1.5} />
      <text x={PAD.left + 50} y={H - 3} fontSize={8} fill="oklch(0.62 0.018 75)" fontFamily="JetBrains Mono, monospace">max</text>
    </svg>
  );
}

// ── Main Report Component ─────────────────────────────────────────────────────

export default function PrintReport() {
  const params = useSearchParams();
  const event = (params.get('event') ?? 'cpi').toLowerCase();
  const asset = (params.get('asset') ?? 'es').toLowerCase();
  const autoPrint = params.get('print') === '1';

  const [events, setEvents] = useState<EventEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = getDataUrl(event, asset);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — ${url}`);
        return r.json() as Promise<EventEntry[]>;
      })
      .then((j) => {
        if (!cancelled) setEvents(j);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Load failed');
      });
    return () => { cancelled = true; };
  }, [event, asset]);

  const stats = useMemo(() => {
    if (!events) return null;
    return computeStats(events);
  }, [events]);

  // Auto-print when data ready
  useEffect(() => {
    if (!autoPrint || !stats) return;
    const t = setTimeout(() => window.print(), 800);
    return () => clearTimeout(t);
  }, [autoPrint, stats]);

  const eventLabel = EVENT_LABELS[event] ?? event.toUpperCase();
  const releaseTime = EVENT_RELEASE_TIME[event] ?? '—';
  const assetLabel = asset.toUpperCase();
  const today = new Date().toISOString().slice(0, 10);

  if (error) {
    return <div style={{ padding: 40, fontFamily: 'system-ui' }}>Error: {error}</div>;
  }
  if (!events || !stats) {
    return <div style={{ padding: 40, fontFamily: 'system-ui' }}>Loading…</div>;
  }

  return (
    <div className="ds-report">
      {/* ── Page 1: Cover + Stats ── */}
      <section className="ds-page ds-cover">
        <header className="ds-cover-header">
          <p className="ds-kicker">jacktradesnq.com — studies</p>
          <h1 className="ds-h1">
            {eventLabel} <em>Release</em>
          </h1>
          <p className="ds-subtitle">
            {assetLabel} futures · {releaseTime} release · 1-minute bar statistics · 2016–2026
          </p>
        </header>

        {/* KPI strip */}
        <div className="ds-kpi-grid">
          <div className="ds-kpi">
            <span className="ds-kpi-val">{stats.n}</span>
            <span className="ds-kpi-label">releases charted</span>
          </div>
          <div className="ds-kpi">
            <span className="ds-kpi-val">{stats.avg.toFixed(1)}</span>
            <span className="ds-kpi-label">avg range (pts)</span>
          </div>
          <div className="ds-kpi ds-kpi-accent">
            <span className="ds-kpi-val">{stats.max.toFixed(1)}</span>
            <span className="ds-kpi-label">max range (pts)</span>
          </div>
          <div className="ds-kpi">
            <span className="ds-kpi-val">{stats.median.toFixed(1)}</span>
            <span className="ds-kpi-label">median range (pts)</span>
          </div>
        </div>

        <p className="ds-definition">
          <strong>Release-bar range</strong> = high minus low of the 1-minute candle at the release time.
          Measures the full intrabar top-to-bottom move during the 60 seconds of the release.
        </p>

        {/* Chart */}
        <div className="ds-chart-wrap" data-chart-ready="true">
          <p className="ds-chart-title">Avg release-bar range by year (pts) — max range tick above each bar</p>
          <RangeChart yearStats={stats.yearStats} maxRange={stats.max} />
        </div>

        <p className="ds-foot">
          Generated {today} · {stats.n} events · 1m release-bar range · jacktradesnq.com
        </p>
      </section>

      {/* ── Page 2: Year-by-Year Table ── */}
      <section className="ds-page ds-table-page">
        <h2 className="ds-h2">Year-by-Year — Release Candle Range (1m, {releaseTime})</h2>

        <table className="ds-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Count</th>
              <th>Avg Range (pts)</th>
              <th>Max Range (pts)</th>
            </tr>
          </thead>
          <tbody>
            {stats.yearStats.map((ys) => (
              <tr key={ys.year}>
                <td>{ys.year}</td>
                <td>{ys.n}</td>
                <td>{ys.avg.toFixed(1)}</td>
                <td>{ys.max.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>All</td>
              <td>{stats.n}</td>
              <td>{stats.avg.toFixed(1)}</td>
              <td>{stats.max.toFixed(1)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="ds-disclaimer">
          <p>AI-assisted analysis — not financial advice. Past performance does not predict future results.</p>
          <p>Data: {assetLabel} futures 1-minute bars. Range = high − low of release bar.</p>
          <p>Source: jacktradesnq.com · {today}</p>
        </div>
      </section>

      <style jsx global>{`
        @font-face {
          font-family: 'Fraunces';
          src: url('/fonts/Fraunces-Italic-VF.woff2') format('woff2');
          font-style: italic;
          font-weight: 100 900;
        }
        @font-face {
          font-family: 'Satoshi';
          src: url('/fonts/Satoshi-Variable.woff2') format('woff2');
          font-weight: 300 900;
        }
        @font-face {
          font-family: 'JetBrains Mono';
          src: url('/fonts/JetBrainsMono.woff2') format('woff2');
          font-weight: 400 700;
        }

        .ds-report {
          background: oklch(0.16 0.014 62);
          color: oklch(0.94 0.028 85);
          font-family: 'Satoshi', system-ui, sans-serif;
          margin: 0;
          padding: 0;
        }

        .ds-page {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 40px 64px;
          min-height: calc(100vh - 48px);
          page-break-after: always;
          break-after: page;
        }
        .ds-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }

        /* Cover */
        .ds-kicker {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: oklch(0.62 0.018 75);
          margin: 0 0 16px;
        }
        .ds-h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-style: italic;
          font-weight: 300;
          font-size: 3.5rem;
          line-height: 1.02;
          letter-spacing: -0.02em;
          margin: 0 0 8px;
          color: oklch(0.94 0.028 85);
        }
        .ds-h1 em {
          font-style: italic;
          color: oklch(0.80 0.135 82);
        }
        .ds-subtitle {
          font-size: 0.9rem;
          color: oklch(0.62 0.018 75);
          margin: 0 0 40px;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.04em;
        }

        /* KPI grid */
        .ds-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }
        .ds-kpi {
          background: oklch(0.198 0.019 62);
          border: 1px solid oklch(0.32 0.016 64);
          border-radius: 12px;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ds-kpi-accent {
          border-color: oklch(0.80 0.135 82 / 0.4);
          background: oklch(0.22 0.04 82);
        }
        .ds-kpi-val {
          font-family: 'Fraunces', Georgia, serif;
          font-style: italic;
          font-weight: 300;
          font-size: 2rem;
          line-height: 1;
          color: oklch(0.94 0.028 85);
        }
        .ds-kpi-accent .ds-kpi-val {
          color: oklch(0.80 0.135 82);
        }
        .ds-kpi-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: oklch(0.62 0.018 75);
        }

        /* Definition block */
        .ds-definition {
          font-size: 0.85rem;
          color: oklch(0.72 0.018 75);
          line-height: 1.6;
          padding: 12px 16px;
          border-left: 2px solid oklch(0.80 0.135 82 / 0.4);
          background: oklch(0.198 0.019 62);
          border-radius: 0 8px 8px 0;
          margin-bottom: 32px;
        }
        .ds-definition strong {
          color: oklch(0.94 0.028 85);
          font-weight: 600;
        }

        /* Chart */
        .ds-chart-wrap {
          margin-bottom: 32px;
          background: oklch(0.198 0.019 62);
          border: 1px solid oklch(0.32 0.016 64);
          border-radius: 12px;
          padding: 24px 20px 16px;
        }
        .ds-chart-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: oklch(0.62 0.018 75);
          margin: 0 0 16px;
        }

        /* Footer */
        .ds-foot {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: oklch(0.42 0.012 62);
          border-top: 1px solid oklch(0.32 0.016 64);
          padding-top: 16px;
        }

        /* Table page */
        .ds-h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-style: italic;
          font-weight: 300;
          font-size: 1.75rem;
          color: oklch(0.94 0.028 85);
          margin: 0 0 24px;
        }
        .ds-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          margin-bottom: 40px;
        }
        .ds-table thead th {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: oklch(0.62 0.018 75);
          border-bottom: 1px solid oklch(0.32 0.016 64);
          padding: 8px 12px;
          text-align: left;
          background: oklch(0.198 0.019 62);
        }
        .ds-table thead th:not(:first-child) { text-align: right; }
        .ds-table tbody td {
          padding: 9px 12px;
          border-bottom: 1px solid oklch(0.248 0.018 60);
          color: oklch(0.88 0.022 80);
        }
        .ds-table tbody td:not(:first-child) {
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
        }
        .ds-table tbody tr:hover { background: oklch(0.218 0.019 60); }
        .ds-table tfoot td {
          padding: 10px 12px;
          border-top: 2px solid oklch(0.80 0.135 82 / 0.4);
          font-weight: 700;
          color: oklch(0.80 0.135 82);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          text-align: right;
        }
        .ds-table tfoot td:first-child {
          text-align: left;
          font-family: 'Satoshi', system-ui, sans-serif;
        }

        /* Disclaimer */
        .ds-disclaimer {
          margin-top: 40px;
          padding-top: 16px;
          border-top: 1px solid oklch(0.32 0.016 64);
          font-size: 0.75rem;
          color: oklch(0.42 0.012 62);
          line-height: 1.7;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Print */
        @page {
          size: A4 portrait;
          margin: 0.5in 0.5in 0.5in 0.5in;
        }
        @media print {
          body { background: oklch(0.16 0.014 62) !important; }
          .ds-report { max-width: none; }
          .ds-page {
            min-height: 0;
            padding: 24px 32px 40px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}
