'use client';

import { useEffect, useMemo, useState } from 'react';

/* ──────────────────────────────────────────────────────────────────────────
   Shared types — works for both CPI (stop_pts) and NFP (entry_offset).
   The explorer reads `offsetKey` from config and uses it to query the JSON.
   ──────────────────────────────────────────────────────────────────────── */

export interface RankedRow {
  events_total: number;
  fill_rate: number;
  tp_hit_rate: number;
  no_fill_rate: number;
  expired_filled_rate: number;
  avg_pnl_per_event: number;
  avg_pnl_when_filled: number;
  worst_pnl: number;
  tp_pts: number;
  // dynamic offset key — either stop_pts (CPI) or entry_offset (NFP)
  // plus optional avg_max_drawdown / worst_max_drawdown
  [key: string]: number;
}

export interface YearRow extends RankedRow {
  year: number;
  count: number;
}

export interface StraddleData {
  ranked: RankedRow[];
  best: RankedRow;
  by_year: YearRow[];
}

export interface ExplorerConfig {
  eventType: 'CPI' | 'NFP';
  title: string;
  subtitle: string;
  dataUrl: string;
  /** Field name for offset/stop in JSON: 'stop_pts' (CPI) or 'entry_offset' (NFP) */
  offsetKey: 'stop_pts' | 'entry_offset';
  /** UI label for the offset filter */
  offsetLabel: string;
}

/* ──────────────────────────────────────────────────────────────────────── */

const ALL = 'ALL' as const;
type Side = 'BOTH' | 'LONG' | 'SHORT';

function uniqSorted<T>(arr: T[]): T[] {
  return Array.from(new Set(arr)).sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b));
  });
}

function fmtPct(v: number | undefined | null): string {
  if (v === undefined || v === null || Number.isNaN(v)) return '—';
  return `${v.toFixed(1)}%`;
}

function fmtNum(v: number | undefined | null, digits = 2): string {
  if (v === undefined || v === null || Number.isNaN(v)) return '—';
  return v.toFixed(digits);
}

export default function StraddleExplorer({
  config,
  embedded = false,
}: {
  config: ExplorerConfig;
  embedded?: boolean;
}) {
  const [data, setData] = useState<StraddleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // filter state
  const [year, setYear] = useState<string>(ALL);
  const [offset, setOffset] = useState<string>(ALL);
  const [tp, setTp] = useState<string>(ALL);
  const [side, setSide] = useState<Side>('BOTH');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(config.dataUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: StraddleData) => {
        if (cancelled) return;
        setData(j);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Load failed');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [config.dataUrl]);

  /* ── derived options ─────────────────────────────────────────────────── */

  const years = useMemo(
    () => (data ? uniqSorted(data.by_year.map((r) => r.year)) : []),
    [data],
  );
  const offsets = useMemo(
    () =>
      data
        ? uniqSorted(data.ranked.map((r) => Number(r[config.offsetKey])))
        : [],
    [data, config.offsetKey],
  );
  const tps = useMemo(
    () => (data ? uniqSorted(data.ranked.map((r) => r.tp_pts)) : []),
    [data],
  );

  /* ── filter rows ─────────────────────────────────────────────────────── */

  type Row = RankedRow & { year?: number; count?: number };

  const rows: Row[] = useMemo(() => {
    if (!data) return [];
    const yearAll = year === ALL;
    const offAll = offset === ALL;
    const tpAll = tp === ALL;

    let base: Row[];
    if (yearAll) {
      // all-year aggregate = ranked
      base = data.ranked as Row[];
    } else {
      base = data.by_year.filter((r) => r.year === Number(year)) as Row[];
    }
    if (!offAll) {
      base = base.filter(
        (r) => Number(r[config.offsetKey]) === Number(offset),
      );
    }
    if (!tpAll) {
      base = base.filter((r) => r.tp_pts === Number(tp));
    }
    return base;
  }, [data, year, offset, tp, config.offsetKey]);

  /* ── summary stats ───────────────────────────────────────────────────── */

  const summary = useMemo(() => {
    if (rows.length === 0) {
      return { events: 0, fill: 0, tpHit: 0, wins: 0, losses: 0, noFill: 0 };
    }
    // Weighted average by sample size (use `count` if year-scoped, else events_total)
    let totalEvents = 0;
    let fillSum = 0;
    let tpHitSum = 0;
    let expiredFilledSum = 0;
    for (const r of rows) {
      const n = r.count ?? r.events_total ?? 0;
      totalEvents += n;
      fillSum += (r.fill_rate / 100) * n;
      tpHitSum += (r.tp_hit_rate / 100) * n;
      expiredFilledSum += (r.expired_filled_rate / 100) * n;
    }
    const fillPct = totalEvents > 0 ? (fillSum / totalEvents) * 100 : 0;
    const tpHitPct = totalEvents > 0 ? (tpHitSum / totalEvents) * 100 : 0;
    const expiredFilledPct =
      totalEvents > 0 ? (expiredFilledSum / totalEvents) * 100 : 0;

    // Approximate counts (across the filtered scope)
    const wins = Math.round((tpHitPct / 100) * totalEvents);
    const filledTotal = Math.round((fillPct / 100) * totalEvents);
    const losses = Math.max(0, filledTotal - wins);
    const noFill = totalEvents - filledTotal;
    return {
      events: totalEvents,
      fill: fillPct,
      tpHit: tpHitPct,
      expiredFilled: expiredFilledPct,
      wins,
      losses,
      noFill,
    };
  }, [rows]);

  /* ── PDF generation ──────────────────────────────────────────────────── */

  async function downloadPdf() {
    if (!data) return;
    setGenerating(true);
    try {
      const [{ default: jsPDF }, autoTableMod] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const autoTable = autoTableMod.default;

      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const pageW = doc.internal.pageSize.getWidth();
      const today = new Date().toISOString().slice(0, 10);

      // ── Cover ──
      doc.setFont('times', 'bold');
      doc.setFontSize(26);
      doc.text(`${config.eventType} Straddle — Custom Report`, 40, 80);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text(
        'Generated by jacktradesnq.com — interactive explorer',
        40,
        102,
      );
      doc.text(`Date generated: ${today}`, 40, 118);

      // Filters block
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(40, 140, pageW - 40, 140);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(40);
      doc.text('FILTERS APPLIED', 40, 162);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const filterLines = [
        `• Year: ${year === ALL ? 'All years (2016–2026)' : year}`,
        `• ${config.offsetLabel}: ${offset === ALL ? 'All' : `${offset} pts`}`,
        `• TP target: ${tp === ALL ? 'All' : `${tp} pts`}`,
        `• Side: ${
          side === 'BOTH'
            ? 'Both directions (bilateral straddle)'
            : side === 'LONG'
              ? 'Long only'
              : 'Short only'
        }`,
      ];
      filterLines.forEach((line, i) => {
        doc.text(line, 50, 184 + i * 18);
      });

      // Summary cards
      const sy = 184 + filterLines.length * 18 + 24;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('SUMMARY', 40, sy);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const summaryLines = [
        `Events in scope: ${summary.events}`,
        `Fill rate (weighted): ${fmtPct(summary.fill)}`,
        `TP-hit rate (weighted): ${fmtPct(summary.tpHit)}`,
        `Wins / Losses / No-Fill: ${summary.wins} / ${summary.losses} / ${summary.noFill}`,
      ];
      summaryLines.forEach((line, i) => {
        doc.text(line, 50, sy + 22 + i * 18);
      });

      // ── Table page ──
      const tableStartY = sy + 22 + summaryLines.length * 18 + 28;

      const isYearScoped = year !== ALL;
      const head = [
        [
          ...(isYearScoped ? ['Year'] : []),
          config.offsetLabel,
          'TP',
          'Events',
          'Fill %',
          'TP Hit %',
          'No-Fill %',
          'Avg PnL',
          'Worst PnL',
        ],
      ];
      const body = rows.map((r) => [
        ...(isYearScoped ? [String(r.year ?? '')] : []),
        String(r[config.offsetKey]),
        String(r.tp_pts),
        String(r.count ?? r.events_total),
        fmtPct(r.fill_rate),
        fmtPct(r.tp_hit_rate),
        fmtPct(r.no_fill_rate),
        fmtNum(r.avg_pnl_per_event),
        fmtNum(r.worst_pnl),
      ]);

      autoTable(doc, {
        head,
        body,
        startY: tableStartY,
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 },
        headStyles: {
          fillColor: [30, 30, 30],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [248, 246, 240] },
        margin: { left: 40, right: 40 },
      });

      // Year breakdown extra page if combo is single & year is all
      if (year === ALL && offset !== ALL && tp !== ALL && data.by_year.length) {
        const yearRows = data.by_year.filter(
          (r) =>
            Number(r[config.offsetKey]) === Number(offset) &&
            r.tp_pts === Number(tp),
        );
        if (yearRows.length) {
          doc.addPage();
          doc.setFont('times', 'bold');
          doc.setFontSize(18);
          doc.setTextColor(20);
          doc.text(
            `Year-by-year breakdown — ${offset} / ${tp}`,
            40,
            70,
          );
          autoTable(doc, {
            head: [
              [
                'Year',
                'Events',
                'Fill %',
                'TP Hit %',
                'No-Fill %',
                'Avg PnL',
                'Worst PnL',
              ],
            ],
            body: yearRows.map((r) => [
              String(r.year),
              String(r.count),
              fmtPct(r.fill_rate),
              fmtPct(r.tp_hit_rate),
              fmtPct(r.no_fill_rate),
              fmtNum(r.avg_pnl_per_event),
              fmtNum(r.worst_pnl),
            ]),
            startY: 90,
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 5 },
            headStyles: {
              fillColor: [30, 30, 30],
              textColor: 255,
              fontStyle: 'bold',
            },
            alternateRowStyles: { fillColor: [248, 246, 240] },
            margin: { left: 40, right: 40 },
          });
        }
      }

      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(
          `jacktradesnq.com  ·  ${config.eventType} straddle interactive explorer  ·  ${today}  ·  Page ${p}/${pageCount}`,
          40,
          doc.internal.pageSize.getHeight() - 24,
        );
      }

      const filename = `${config.eventType.toLowerCase()}-straddle-${year === ALL ? 'all' : year}-${offset === ALL ? 'all' : offset}-${tp === ALL ? 'all' : tp}-${today}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error('PDF generation failed', e);
      alert(
        `Could not generate PDF: ${e instanceof Error ? e.message : 'unknown error'}`,
      );
    } finally {
      setGenerating(false);
    }
  }

  /* ── render ──────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="bd-explorer-loading">Loading dataset…</div>
    );
  }
  if (error || !data) {
    return (
      <div className="bd-explorer-loading">
        Could not load dataset: {error ?? 'unknown error'}
      </div>
    );
  }

  const isYearScoped = year !== ALL;

  const Wrapper = embedded ? 'section' : 'article';
  const wrapperClass = embedded ? 'bd-explorer bd-explorer-embedded' : 'bd-article bd-explorer';

  return (
    <Wrapper className={wrapperClass}>
      {!embedded && (
        <>
          <div className="bd-article-meta" style={{ marginBottom: 16 }}>
            <span className="bd-tag">DATA · INTERACTIVE</span>
            <span className="bd-meta">10-year window · NQ futures</span>
          </div>

          <h1 className="bd-h1 bd-article-title">
            {config.title}
            <span className="bd-dot">.</span>
          </h1>
          <p className="bd-article-lede">{config.subtitle}</p>
        </>
      )}

      {/* Filters */}
      <div className="bd-filters">
        <label className="bd-filter">
          <span className="bd-filter-lbl">Year</span>
          <select
            className="bd-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value={ALL}>All years</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className="bd-filter">
          <span className="bd-filter-lbl">{config.offsetLabel}</span>
          <select
            className="bd-select"
            value={offset}
            onChange={(e) => setOffset(e.target.value)}
          >
            <option value={ALL}>All</option>
            {offsets.map((o) => (
              <option key={o} value={String(o)}>
                {o} pts
              </option>
            ))}
          </select>
        </label>

        <label className="bd-filter">
          <span className="bd-filter-lbl">TP target</span>
          <select
            className="bd-select"
            value={tp}
            onChange={(e) => setTp(e.target.value)}
          >
            <option value={ALL}>All</option>
            {tps.map((t) => (
              <option key={t} value={String(t)}>
                {t} pts
              </option>
            ))}
          </select>
        </label>

        <label className="bd-filter">
          <span className="bd-filter-lbl">Side</span>
          <select
            className="bd-select"
            value={side}
            onChange={(e) => setSide(e.target.value as Side)}
          >
            <option value="BOTH">Both (bilateral)</option>
            <option value="LONG">Long only</option>
            <option value="SHORT">Short only</option>
          </select>
        </label>
      </div>

      {side !== 'BOTH' ? (
        <p className="bd-explorer-note">
          Note — the underlying dataset records bilateral straddle outcomes
          (OCO long &amp; short brackets). Long/Short split is not stored
          per-event, so the filter above is informational. Live numbers below
          remain bilateral.
        </p>
      ) : null}

      {/* Summary cards */}
      <div className="bd-stat-grid">
        <div className="bd-stat-card">
          <span className="bd-stat-card-lbl">Events in scope</span>
          <span className="bd-stat-card-num">{summary.events}</span>
        </div>
        <div className="bd-stat-card">
          <span className="bd-stat-card-lbl">Fill rate</span>
          <span className="bd-stat-card-num">{fmtPct(summary.fill)}</span>
        </div>
        <div className="bd-stat-card">
          <span className="bd-stat-card-lbl">TP-hit rate</span>
          <span className="bd-stat-card-num">{fmtPct(summary.tpHit)}</span>
        </div>
        <div className="bd-stat-card">
          <span className="bd-stat-card-lbl">Wins / Losses / No-Fill</span>
          <span className="bd-stat-card-num bd-stat-card-num-sm">
            {summary.wins} / {summary.losses} / {summary.noFill}
          </span>
        </div>
      </div>

      {/* Live table */}
      <div className="bd-table-wrap">
        <table className="bd-data-table">
          <thead>
            <tr>
              {isYearScoped ? <th>Year</th> : null}
              <th>{config.offsetLabel}</th>
              <th>TP</th>
              <th>Events</th>
              <th>Fill %</th>
              <th>TP Hit %</th>
              <th>No-Fill %</th>
              <th>Avg PnL</th>
              <th>Worst PnL</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={isYearScoped ? 9 : 8}
                  style={{ textAlign: 'center', padding: 24, opacity: 0.6 }}
                >
                  No rows match these filters.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={`${r.year ?? 'all'}-${r[config.offsetKey]}-${r.tp_pts}-${i}`}
                >
                  {isYearScoped ? <td>{r.year}</td> : null}
                  <td>{r[config.offsetKey]}</td>
                  <td>{r.tp_pts}</td>
                  <td>{r.count ?? r.events_total}</td>
                  <td>{fmtPct(r.fill_rate)}</td>
                  <td>{fmtPct(r.tp_hit_rate)}</td>
                  <td>{fmtPct(r.no_fill_rate)}</td>
                  <td>{fmtNum(r.avg_pnl_per_event)}</td>
                  <td>{fmtNum(r.worst_pnl)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bd-ctas">
        <button
          type="button"
          className="bd-btn bd-btn-primary bd-btn-cta"
          onClick={downloadPdf}
          disabled={generating || rows.length === 0}
        >
          {generating ? 'Generating…' : 'Download my PDF'}
        </button>
      </div>

      <p className="bd-explorer-disclaimer">
        Numbers come from a 10-year backtest of NQ futures around scheduled{' '}
        {config.eventType} releases. Fills and slippage are simulated; past
        performance does not predict future results. Educational purposes only,
        not financial advice.
      </p>
    </Wrapper>
  );
}
