'use client';

import { useEffect, useMemo, useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────────── */

interface News830Row {
  year: string;
  variant: 'no_be' | 'be_50' | 'tp1_be';
  smt: boolean;
  side: 'BOTH' | 'LONG' | 'SHORT';
  n: number;
  w: number;
  l: number;
  be: number;
  wr: number;
  pf: number;
  net_pts: number;
  avg_win: number;
  avg_loss: number;
}

interface News830Meta {
  source: string;
  date_from: string;
  date_to: string;
  n_events_total: number;
}

interface News830Data {
  meta: News830Meta;
  rows: News830Row[];
}

/* ─────────────────────────────────────────────────────────────────────────────
   Mock data — used while real JSON is not yet deployed
   ───────────────────────────────────────────────────────────────────────── */

const MOCK: News830Data = {
  meta: {
    source: 'Databento NQ.c.0 + ES.c.0',
    date_from: '2022-09-01',
    date_to: '2026-05-09',
    n_events_total: 46,
  },
  rows: [
    { year: 'ALL', variant: 'no_be',   smt: false, side: 'BOTH',  n: 28, w: 11, l: 17, be: 0, wr: 0.393, pf: 1.08, net_pts:   28.75, avg_win:  35.14, avg_loss: -21.04 },
    { year: 'ALL', variant: 'no_be',   smt: true,  side: 'BOTH',  n: 21, w: 11, l: 10, be: 0, wr: 0.524, pf: 1.79, net_pts:  171.0,  avg_win:  35.14, avg_loss: -21.50 },
    { year: 'ALL', variant: 'be_50',   smt: false, side: 'BOTH',  n: 28, w:  9, l: 15, be: 4, wr: 0.321, pf: 0.87, net_pts:  -43.25, avg_win:  33.11, avg_loss: -22.75 },
    { year: '2025', variant: 'no_be',  smt: true,  side: 'BOTH',  n:  5, w:  4, l:  1, be: 0, wr: 0.80,  pf: 3.16, net_pts:  133.0,  avg_win:  36.00, avg_loss: -13.00 },
    { year: '2023', variant: 'no_be',  smt: true,  side: 'BOTH',  n:  9, w:  3, l:  6, be: 0, wr: 0.333, pf: 1.65, net_pts:   57.8,  avg_win:  34.20, avg_loss: -18.90 },
    { year: '2024', variant: 'no_be',  smt: true,  side: 'BOTH',  n:  4, w:  3, l:  1, be: 0, wr: 0.75,  pf: 0.92, net_pts:   -3.8,  avg_win:  32.00, avg_loss: -38.00 },
    { year: '2022', variant: 'no_be',  smt: false, side: 'BOTH',  n:  2, w:  0, l:  2, be: 0, wr: 0.00,  pf: 0.00, net_pts:  -20.5,  avg_win:   0.00, avg_loss: -10.25 },
    { year: '2026', variant: 'no_be',  smt: false, side: 'BOTH',  n:  2, w:  1, l:  1, be: 0, wr: 0.50,  pf: 0.62, net_pts:   -2.3,  avg_win:  14.50, avg_loss: -16.80 },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────── */

const VARIANT_LABELS: Record<string, string> = {
  no_be:   'No BE',
  be_50:   'BE@50%',
  tp1_be:  'TP1 50% + BE',
};

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

function fmtPf(v: number): string {
  if (!isFinite(v) || v === 0) return '—';
  return v.toFixed(2);
}

function fmtPts(v: number): string {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)} pts`;
}

function fmtAvg(win: number, loss: number): string {
  return `+${win.toFixed(1)} / ${loss.toFixed(1)}`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Segmented control
   ───────────────────────────────────────────────────────────────────────── */

interface SegOption<T> {
  value: T;
  label: string;
}

function SegControl<T extends string | boolean>({
  options,
  value,
  onChange,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="n8-seg" role="group">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          className={`n8-seg-btn${value === opt.value ? ' n8-seg-btn--active' : ''}`}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main widget
   ───────────────────────────────────────────────────────────────────────── */

const VARIANT_OPTIONS: SegOption<'no_be' | 'be_50' | 'tp1_be'>[] = [
  { value: 'no_be',  label: 'No BE' },
  { value: 'be_50',  label: 'BE@50%' },
  { value: 'tp1_be', label: 'TP1 50% + BE' },
];

const SIDE_OPTIONS: SegOption<'BOTH' | 'LONG' | 'SHORT'>[] = [
  { value: 'BOTH',  label: 'Both' },
  { value: 'LONG',  label: 'Long' },
  { value: 'SHORT', label: 'Short' },
];

const YEAR_OPTIONS = ['ALL', '2022', '2023', '2024', '2025', '2026'] as const;
type Year = (typeof YEAR_OPTIONS)[number];

export default function News830Explorer() {
  const [data, setData]       = useState<News830Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  // filter state
  const [variant, setVariant] = useState<'no_be' | 'be_50' | 'tp1_be'>('no_be');
  const [smt, setSmt]         = useState<boolean>(false);
  const [side, setSide]       = useState<'BOTH' | 'LONG' | 'SHORT'>('BOTH');
  const [year, setYear]       = useState<Year>('ALL');

  useEffect(() => {
    let cancelled = false;
    fetch('/data/news-830-model.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<News830Data>;
      })
      .then((j) => {
        if (cancelled) return;
        setData(j);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        // Fall back to mock while real data isn't deployed yet
        setData(MOCK);
        setUsingMock(true);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  /* ── filtered row ───────────────────────────────────────────────────────── */

  const row: News830Row | undefined = useMemo(() => {
    if (!data) return undefined;
    return data.rows.find(
      (r) =>
        r.year    === year    &&
        r.variant === variant &&
        r.smt     === smt     &&
        r.side    === side,
    );
  }, [data, year, variant, smt, side]);

  /* ── human-readable filter summary ─────────────────────────────────────── */

  const filterLabel = `${VARIANT_LABELS[variant]} · SMT ${smt ? 'on' : 'off'} · ${side} · ${year === 'ALL' ? 'All years' : year}`;

  /* ── render ─────────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="bd-explorer-loading">Loading dataset…</div>
    );
  }

  const netColor =
    row && row.net_pts > 0
      ? 'oklch(0.50 0.15 145)'
      : row && row.net_pts < 0
      ? 'oklch(0.50 0.15 30)'
      : 'inherit';

  return (
    <section className="n8-explorer">
      {/* ── styles scoped inside this section ─────────────────────────── */}
      <style>{`
        .n8-explorer {
          margin-top: 48px;
          padding: 32px;
          background: var(--c-surface-card);
          border: 1px solid var(--c-border);
          border-radius: 16px;
          max-width: 720px;
        }
        .n8-explorer-hd {
          font-family: var(--f-serif);
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: -0.01em;
          color: var(--c-ink);
          margin-bottom: 4px;
        }
        .n8-explorer-sub {
          font-family: var(--f-sans);
          font-size: 0.8rem;
          color: var(--c-muted);
          margin-bottom: 24px;
        }
        .n8-filter-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 24px;
          margin-bottom: 20px;
        }
        @media (max-width: 560px) {
          .n8-filter-grid { grid-template-columns: 1fr; }
        }
        .n8-filter-row { display: flex; flex-direction: column; gap: 6px; }
        .n8-filter-lbl {
          font-family: var(--f-sans);
          font-weight: 700;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--c-muted);
        }
        .n8-seg {
          display: inline-flex;
          border: 1px solid var(--c-border);
          border-radius: 6px;
          overflow: hidden;
          background: var(--c-surface);
        }
        .n8-seg-btn {
          flex: 1;
          padding: 6px 10px;
          font-family: var(--f-sans);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--c-muted);
          background: transparent;
          border: none;
          border-right: 1px solid var(--c-border);
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease;
          white-space: nowrap;
        }
        .n8-seg-btn:last-child { border-right: none; }
        .n8-seg-btn:hover { background: var(--c-surface-hover); color: var(--c-ink); }
        .n8-seg-btn--active {
          background: var(--c-accent);
          color: oklch(0.18 0.01 60);
          font-weight: 700;
        }
        .n8-seg-btn--active:hover { background: var(--c-accent-deep); }
        .n8-switch {
          position: relative;
          width: 44px;
          height: 24px;
          border-radius: 999px;
          border: 1px solid var(--c-border);
          background: var(--c-surface);
          cursor: pointer;
          padding: 0;
          transition: background 180ms ease, border-color 180ms ease;
        }
        .n8-switch:hover { background: var(--c-surface-hover); }
        .n8-switch--on { background: var(--c-accent); border-color: var(--c-accent); }
        .n8-switch--on:hover { background: var(--c-accent-deep); border-color: var(--c-accent-deep); }
        .n8-switch-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: oklch(0.99 0.005 90);
          box-shadow: 0 1px 2px oklch(0.18 0.01 60 / 0.20);
          transition: transform 180ms cubic-bezier(0.34, 1.4, 0.64, 1);
        }
        .n8-switch--on .n8-switch-thumb { transform: translateX(20px); }
        .n8-switch:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 2px; }
        .n8-year-select {
          font: inherit;
          font-family: var(--f-sans);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--c-ink);
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: 6px;
          padding: 7px 28px 7px 10px;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>");
          background-repeat: no-repeat;
          background-position: right 10px center;
          transition: border-color 150ms ease;
        }
        .n8-year-select:hover { border-color: var(--c-accent); }
        .n8-year-select:focus-visible {
          outline: none;
          border-color: var(--c-accent);
          box-shadow: 0 0 0 3px oklch(0.86 0.17 95 / 0.25);
        }
        .n8-filter-summary {
          font-family: var(--f-sans);
          font-size: 0.75rem;
          color: var(--c-muted);
          margin-bottom: 20px;
          padding: 8px 12px;
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: 6px;
          letter-spacing: 0.01em;
        }
        .n8-filter-summary strong {
          color: var(--c-ink);
          font-weight: 600;
        }
        .n8-stat-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (max-width: 680px) {
          .n8-stat-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 420px) {
          .n8-stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .n8-stat-card {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 14px 12px;
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: 10px;
        }
        .n8-stat-lbl {
          font-family: var(--f-sans);
          font-weight: 700;
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--c-muted);
        }
        .n8-stat-val {
          font-family: var(--f-serif);
          font-weight: 700;
          font-size: 1.5rem;
          color: var(--c-ink);
          letter-spacing: -0.015em;
          line-height: 1.1;
        }
        .n8-stat-val--sm {
          font-size: 1.05rem;
        }
        .n8-no-data {
          font-family: var(--f-sans);
          font-size: 0.875rem;
          color: var(--c-muted);
          font-style: italic;
          padding: 24px 0 8px;
          text-align: center;
        }
        .n8-mock-badge {
          display: inline-block;
          font-family: var(--f-sans);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: oklch(0.58 0.10 55);
          background: oklch(0.93 0.08 85);
          border: 1px solid oklch(0.86 0.12 75);
          border-radius: 4px;
          padding: 2px 7px;
          margin-left: 8px;
          vertical-align: middle;
        }
        .n8-disclaimer {
          font-family: var(--f-sans);
          font-size: 0.75rem;
          color: var(--c-muted);
          font-style: italic;
          margin-top: 16px;
          line-height: 1.6;
        }
      `}</style>

      <div className="n8-explorer-hd">
        Interactive explorer
        {usingMock && <span className="n8-mock-badge">preview data</span>}
      </div>
      <div className="n8-explorer-sub">
        Toggle filters — stat cards update instantly.
      </div>

      {/* ── filters ───────────────────────────────────────────────────── */}
      <div className="n8-filter-grid">
        <div className="n8-filter-row">
          <span className="n8-filter-lbl">Variant</span>
          <SegControl
            options={VARIANT_OPTIONS}
            value={variant}
            onChange={(v) => {
              setVariant(v);
            }}
          />
        </div>

        <div className="n8-filter-row">
          <span className="n8-filter-lbl">ES SMT confirmation</span>
          <button
            type="button"
            role="switch"
            aria-checked={smt}
            aria-label="ES SMT confirmation"
            className={`n8-switch${smt ? ' n8-switch--on' : ''}`}
            onClick={() => setSmt(!smt)}
          >
            <span className="n8-switch-thumb" />
          </button>
        </div>

        <div className="n8-filter-row">
          <span className="n8-filter-lbl">Side</span>
          <SegControl
            options={SIDE_OPTIONS}
            value={side}
            onChange={setSide}
          />
        </div>

        <div className="n8-filter-row">
          <span className="n8-filter-lbl">Year</span>
          <select
            className="n8-year-select"
            value={year}
            onChange={(e) => setYear(e.target.value as Year)}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y === 'ALL' ? 'All years' : y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── active filter summary ──────────────────────────────────────── */}
      <div className="n8-filter-summary">
        <strong>Showing:</strong> {filterLabel}
      </div>

      {/* ── stat cards ────────────────────────────────────────────────── */}
      {!row ? (
        <div className="n8-no-data">
          No data for this combination — try a different filter.
        </div>
      ) : (
        <div className="n8-stat-grid">
          <div className="n8-stat-card">
            <span className="n8-stat-lbl">Trades</span>
            <span className="n8-stat-val">{row.n}</span>
          </div>

          <div className="n8-stat-card">
            <span className="n8-stat-lbl">Win Rate</span>
            <span className="n8-stat-val">{fmtPct(row.wr)}</span>
          </div>

          <div className="n8-stat-card">
            <span className="n8-stat-lbl">Profit Factor</span>
            <span className="n8-stat-val">{fmtPf(row.pf)}</span>
          </div>

          <div className="n8-stat-card">
            <span className="n8-stat-lbl">Net P&amp;L</span>
            <span
              className="n8-stat-val"
              style={{ color: netColor }}
            >
              {fmtPts(row.net_pts)}
            </span>
          </div>

          <div className="n8-stat-card">
            <span className="n8-stat-lbl">Avg Win / Avg Loss</span>
            <span className="n8-stat-val n8-stat-val--sm">
              {fmtAvg(row.avg_win, row.avg_loss)}
            </span>
          </div>
        </div>
      )}

      <p className="n8-disclaimer">
        Backtest on Databento NQ continuous (NQ.c.0). Past performance does not
        predict future results. Sample sizes are small — treat as indicative
        only, not financial advice.
      </p>
    </section>
  );
}
