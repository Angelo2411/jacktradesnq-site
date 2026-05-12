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
type ViewMode = 'TABLE' | 'RANKING' | 'BEST';

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

async function loadImageBase64(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
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
  const [view, setView] = useState<ViewMode>('TABLE');
  const [generating, setGenerating] = useState(false);
  const [showAllRanking, setShowAllRanking] = useState(false);

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
      return { events: 0, fill: 0, tpHit: 0, wins: 0, losses: 0, noFill: 0, combos: 0 };
    }
    // All rows for the same (year, offset, tp) scope share the same event pool.
    // Use max(count) as the true distinct event count — avoids double-counting
    // when multiple combos are in scope.
    const realEvents = Math.max(...rows.map((r) => r.count ?? r.events_total ?? 0));
    // Weighted averages: each row weighted by its own n (same n for same year scope,
    // varies across years when year=ALL). Total weight = sum of n across rows.
    let weightSum = 0;
    let fillSum = 0;
    let tpHitSum = 0;
    let expiredFilledSum = 0;
    for (const r of rows) {
      const n = r.count ?? r.events_total ?? 0;
      weightSum += n;
      fillSum += (r.fill_rate / 100) * n;
      tpHitSum += (r.tp_hit_rate / 100) * n;
      expiredFilledSum += (r.expired_filled_rate / 100) * n;
    }
    const fillPct = weightSum > 0 ? (fillSum / weightSum) * 100 : 0;
    const tpHitPct = weightSum > 0 ? (tpHitSum / weightSum) * 100 : 0;
    const expiredFilledPct = weightSum > 0 ? (expiredFilledSum / weightSum) * 100 : 0;

    // Wins/losses only meaningful for a single combo
    const wins = Math.round((tpHitPct / 100) * realEvents);
    const filledTotal = Math.round((fillPct / 100) * realEvents);
    const losses = Math.max(0, filledTotal - wins);
    const noFill = realEvents - filledTotal;
    return {
      events: realEvents,
      fill: fillPct,
      tpHit: tpHitPct,
      expiredFilled: expiredFilledPct,
      wins,
      losses,
      noFill,
      combos: rows.length,
    };
  }, [rows]);

  /* ── best combo ─────────────────────────────────────────────────────── */

  interface BestCombo {
    offsetVal: number;
    tp_pts: number;
    netPnl: number;
    avgPnlPerEvent: number;
    count: number;
    fills: number;
    wins: number;
    losses: number;
    noFill: number;
    fillRate: number;
    tpHitRate: number;
    totalCombos: number;
  }

  const bestCombo: BestCombo | null = useMemo(() => {
    if (rows.length === 0) return null;
    const sorted = [...rows].sort((a, b) => {
      const nA = a.count ?? a.events_total;
      const nB = b.count ?? b.events_total;
      const netA = a.avg_pnl_per_event * nA;
      const netB = b.avg_pnl_per_event * nB;
      if (netB !== netA) return netB - netA;
      if (b.tp_pts !== a.tp_pts) return b.tp_pts - a.tp_pts;
      return b.fill_rate - a.fill_rate;
    });
    const r = sorted[0];
    const n = r.count ?? r.events_total;
    const fills = Math.round((r.fill_rate / 100) * n);
    const wins = Math.round((r.tp_hit_rate / 100) * n);
    return {
      offsetVal: Number(r[config.offsetKey]),
      tp_pts: r.tp_pts,
      netPnl: r.avg_pnl_per_event * n,
      avgPnlPerEvent: r.avg_pnl_per_event,
      count: n,
      fills,
      wins,
      losses: fills - wins,
      noFill: n - fills,
      fillRate: r.fill_rate,
      tpHitRate: r.tp_hit_rate,
      totalCombos: rows.length,
    };
  }, [rows, config.offsetKey]);

  /* ── ranking rows ───────────────────────────────────────────────────── */

  interface RankingRow {
    rank: number;
    offsetVal: number;
    tp_pts: number;
    count: number;
    fills: number;
    wins: number;
    losses: number;
    noFill: number;
    winPct: number;
    avgPnlPerEvent: number;
  }

  const rankingRows: RankingRow[] = useMemo(() => {
    if (!data) return [];
    const yearAll = year === ALL;
    const offAll = offset === ALL;
    const tpAll = tp === ALL;

    let base: Row[];
    if (yearAll) {
      base = data.ranked as Row[];
    } else {
      base = data.by_year.filter((r) => r.year === Number(year)) as Row[];
    }
    if (!offAll) {
      base = base.filter((r) => Number(r[config.offsetKey]) === Number(offset));
    }
    if (!tpAll) {
      base = base.filter((r) => r.tp_pts === Number(tp));
    }

    const sorted = [...base].sort((a, b) => {
      const nA = a.count ?? a.events_total;
      const nB = b.count ?? b.events_total;
      const fillsA = (a.fill_rate / 100) * nA;
      const fillsB = (b.fill_rate / 100) * nB;
      if (fillsB !== fillsA) return fillsB - fillsA;
      return b.tp_hit_rate - a.tp_hit_rate;
    });

    return sorted.map((r, i) => {
      const n = r.count ?? r.events_total;
      const fills = Math.round((r.fill_rate / 100) * n);
      const wins = Math.round((r.tp_hit_rate / 100) * n);
      return {
        rank: i + 1,
        offsetVal: Number(r[config.offsetKey]),
        tp_pts: r.tp_pts,
        count: n,
        fills,
        wins,
        losses: fills - wins,
        noFill: n - fills,
        winPct: r.tp_hit_rate,
        avgPnlPerEvent: r.avg_pnl_per_event,
      };
    });
  }, [data, year, offset, tp, config.offsetKey]);

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
      doc.text(`${config.eventType} Straddle -- Custom Report`, 40, 80);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text(
        'Generated by jacktradesnq.com -- interactive explorer',
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
        `• Year: ${year === ALL ? 'All years (2016-2026)' : year}`,
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

      // ── Concept chart page ──
      const conceptUrl = `/data/straddle_charts/concept_cpi.jpg`;
      const conceptImg = await loadImageBase64(conceptUrl);
      if (conceptImg) {
        doc.addPage();
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(20);
        doc.text('How the Straddle Works', 40, 50);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(
          'Buy stop above + Sell stop below the release bar. First side filled, OCO cancels the other.',
          40,
          68,
        );
        // Image: 16:9, fit landscape in portrait page
        const imgW = pageW - 80;
        const imgH = imgW * (9 / 16);
        doc.addImage(conceptImg, 'JPEG', 40, 82, imgW, imgH, undefined, 'FAST');
      }

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
          'Wins',
          'Losses',
          'No-Fill',
        ],
      ];
      const body = rows.map((r) => {
        const n = r.count ?? r.events_total;
        const wins = Math.round((r.tp_hit_rate / 100) * n);
        const filled = Math.round((r.fill_rate / 100) * n);
        const losses = filled - wins;
        const noFill = Math.round((r.no_fill_rate / 100) * n);
        return [
          ...(isYearScoped ? [String(r.year ?? '')] : []),
          String(r[config.offsetKey]),
          String(r.tp_pts),
          String(n),
          fmtPct(r.fill_rate),
          fmtPct(r.tp_hit_rate),
          fmtPct(r.no_fill_rate),
          String(wins),
          String(losses),
          String(noFill),
        ];
      });

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
            `Year-by-year breakdown -- ${offset} / ${tp}`,
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
                'Wins',
                'Losses',
                'No-Fill',
              ],
            ],
            body: yearRows.map((r) => {
              const n = r.count ?? r.events_total;
              const wins = Math.round((r.tp_hit_rate / 100) * n);
              const filled = Math.round((r.fill_rate / 100) * n);
              const losses = filled - wins;
              const noFill = Math.round((r.no_fill_rate / 100) * n);
              return [
                String(r.year),
                String(n),
                fmtPct(r.fill_rate),
                fmtPct(r.tp_hit_rate),
                fmtPct(r.no_fill_rate),
                String(wins),
                String(losses),
                String(noFill),
              ];
            }),
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

      // ── Combo chart pages ──
      const evType = config.eventType.toLowerCase();
      const outcomes = ['tp_hit', 'manip', 'no_fill'];
      for (const r of rows) {
        const offVal = r[config.offsetKey];
        const tpVal = r.tp_pts;
        const comboKey = `X${offVal}_Y${tpVal}`;

        // Load 3 chart images
        const imgs: (string | null)[] = await Promise.all(
          outcomes.map((o) =>
            loadImageBase64(`/data/straddle_charts/${evType}/${comboKey}_${o}.jpg`),
          ),
        );
        const validImgs = imgs.filter(Boolean) as string[];
        if (validImgs.length === 0) continue;

        // One landscape page per outcome chart
        const LABELS: Record<string, string> = { tp_hit: 'TP Hit', manip: 'Manip to SL', no_fill: 'No Fill' };
        for (let i = 0; i < outcomes.length; i++) {
          const img = imgs[i];
          if (!img) continue;
          doc.addPage('a4', 'landscape');
          doc.setFont('times', 'bold');
          doc.setFontSize(14);
          doc.setTextColor(20);
          doc.text(
            `${config.eventType} -- SL ${offVal} / TP ${tpVal} -- ${LABELS[outcomes[i]]}`,
            40, 40,
          );
          const pageW = doc.internal.pageSize.getWidth();
          const pageH = doc.internal.pageSize.getHeight();
          const margin = 40;
          const imgW = pageW - margin * 2;
          const imgH = imgW * (9 / 16);
          const imgY = (pageH - imgH) / 2 + 10;
          doc.addImage(img, 'JPEG', margin, imgY, imgW, imgH, undefined, 'FAST');
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
            <option value="BOTH">Both</option>
            <option value="LONG">Long only</option>
            <option value="SHORT">Short only</option>
          </select>
        </label>

        <div className="bd-filter">
          <span className="bd-filter-lbl">View</span>
          <div className="bd-view-toggle">
            <button
              type="button"
              className={`bd-view-btn${view === 'TABLE' ? ' bd-view-btn-active' : ''}`}
              onClick={() => setView('TABLE')}
            >
              Table
            </button>
            <button
              type="button"
              className={`bd-view-btn${view === 'RANKING' ? ' bd-view-btn-active' : ''}`}
              onClick={() => setView('RANKING')}
            >
              Ranking
            </button>
            <button
              type="button"
              className={`bd-view-btn${view === 'BEST' ? ' bd-view-btn-active' : ''}`}
              onClick={() => setView('BEST')}
            >
              Best
            </button>
          </div>
        </div>
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
          {summary.combos === 1 ? (
            <>
              <span className="bd-stat-card-lbl">Wins / Losses / No-Fill</span>
              <span className="bd-stat-card-num bd-stat-card-num-sm">
                {summary.wins} / {summary.losses} / {summary.noFill}
              </span>
            </>
          ) : (
            <>
              <span className="bd-stat-card-lbl">Combos in scope</span>
              <span className="bd-stat-card-num">{summary.combos}</span>
            </>
          )}
        </div>
      </div>

      {/* Live table */}
      {view === 'TABLE' && (
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
                <th>Wins</th>
                <th>Losses</th>
                <th>No-Fill</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={isYearScoped ? 10 : 9}
                    style={{ textAlign: 'center', padding: 24, opacity: 0.6 }}
                  >
                    No rows match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const n = r.count ?? r.events_total;
                  const wins = Math.round((r.tp_hit_rate / 100) * n);
                  const filled = Math.round((r.fill_rate / 100) * n);
                  const losses = filled - wins;
                  const noFill = Math.round((r.no_fill_rate / 100) * n);
                  return (
                    <tr
                      key={`${r.year ?? 'all'}-${r[config.offsetKey]}-${r.tp_pts}-${i}`}
                    >
                      {isYearScoped ? <td>{r.year}</td> : null}
                      <td>{r[config.offsetKey]}</td>
                      <td>{r.tp_pts}</td>
                      <td>{n}</td>
                      <td>{fmtPct(r.fill_rate)}</td>
                      <td>{fmtPct(r.tp_hit_rate)}</td>
                      <td>{fmtPct(r.no_fill_rate)}</td>
                      <td>{wins}</td>
                      <td>{losses}</td>
                      <td>{noFill}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Ranking view */}
      {view === 'RANKING' && (
        <div className="bd-ranking-wrap">
          <p className="bd-ranking-caption">
            Ranked by total fills{year !== ALL ? ` in ${year}` : ' (all years)'}
          </p>
          <div className="bd-table-wrap">
            <table className="bd-data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>{config.offsetLabel}</th>
                  <th>TP</th>
                  <th>Fills</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>No-Fill</th>
                  <th>Win %</th>
                  <th>Avg PnL / event</th>
                </tr>
              </thead>
              <tbody>
                {rankingRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 24, opacity: 0.6 }}>
                      No rows match these filters.
                    </td>
                  </tr>
                ) : (
                  (showAllRanking ? rankingRows : rankingRows.slice(0, 3)).map((r) => (
                    <tr
                      key={`rank-${r.offsetVal}-${r.tp_pts}`}
                      className={r.rank <= 3 ? 'bd-ranking-top3' : undefined}
                    >
                      <td className="bd-ranking-rank">{r.rank}</td>
                      <td>{r.offsetVal}</td>
                      <td>{r.tp_pts}</td>
                      <td>{r.fills}</td>
                      <td>{r.wins}</td>
                      <td>{r.losses}</td>
                      <td>{r.noFill}</td>
                      <td>{fmtPct(r.winPct)}</td>
                      <td
                        className={
                          r.avgPnlPerEvent > 0
                            ? 'bd-ranking-pos'
                            : r.avgPnlPerEvent < 0
                            ? 'bd-ranking-neg'
                            : undefined
                        }
                      >
                        {fmtNum(r.avgPnlPerEvent)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {rankingRows.length > 3 && (
            <button
              type="button"
              className="bd-ranking-toggle"
              onClick={() => setShowAllRanking((v) => !v)}
            >
              {showAllRanking
                ? 'Show top 3 only'
                : `Show all ${rankingRows.length} combos`}
            </button>
          )}
        </div>
      )}

      {/* Best combo view */}
      {view === 'BEST' && (
        <div className="bd-best-wrap">
          {bestCombo === null ? (
            <p className="bd-best-empty">No combos match these filters.</p>
          ) : (
            <>
              <div className="bd-best-hero">
                <p className="bd-best-hero-headline">
                  {config.offsetLabel} {bestCombo.offsetVal} pts
                  <span className="bd-best-hero-sep"> · </span>
                  TP {bestCombo.tp_pts} pts
                </p>
                <p className="bd-best-hero-subline">
                  Best Net PnL across {bestCombo.totalCombos} combo{bestCombo.totalCombos !== 1 ? 's' : ''}{' '}
                  {year !== ALL ? `in ${year}` : 'across all years'}
                  {side !== 'BOTH' ? ` · ${side === 'LONG' ? 'Long' : 'Short'} filter` : ''}
                </p>
                <div className="bd-stat-grid bd-best-hero-stats">
                  <div className="bd-stat-card">
                    <span className="bd-stat-card-lbl">Net PnL</span>
                    <span
                      className={`bd-stat-card-num bd-stat-card-num-sm ${bestCombo.netPnl > 0 ? 'bd-ranking-pos' : bestCombo.netPnl < 0 ? 'bd-ranking-neg' : ''}`}
                    >
                      {bestCombo.netPnl >= 0 ? '+' : ''}{fmtNum(bestCombo.netPnl)} pts
                    </span>
                  </div>
                  <div className="bd-stat-card">
                    <span className="bd-stat-card-lbl">Avg PnL / event</span>
                    <span
                      className={`bd-stat-card-num bd-stat-card-num-sm ${bestCombo.avgPnlPerEvent > 0 ? 'bd-ranking-pos' : bestCombo.avgPnlPerEvent < 0 ? 'bd-ranking-neg' : ''}`}
                    >
                      {bestCombo.avgPnlPerEvent >= 0 ? '+' : ''}{fmtNum(bestCombo.avgPnlPerEvent)} pts
                    </span>
                  </div>
                  <div className="bd-stat-card">
                    <span className="bd-stat-card-lbl">Win rate</span>
                    <span className="bd-stat-card-num bd-stat-card-num-sm">
                      {fmtPct(bestCombo.tpHitRate)}
                    </span>
                    <span className="bd-best-sub">
                      {bestCombo.wins}W / {bestCombo.losses}L / {bestCombo.noFill}NF
                    </span>
                  </div>
                  <div className="bd-stat-card">
                    <span className="bd-stat-card-lbl">Events fired</span>
                    <span className="bd-stat-card-num bd-stat-card-num-sm">
                      {bestCombo.count}
                    </span>
                    <span className="bd-best-sub">{fmtPct(bestCombo.fillRate)} fill</span>
                  </div>
                </div>
              </div>
              <div className="bd-best-footer">
                {side !== 'BOTH' && (
                  <p className="bd-best-note">
                    Side filter is informational — bilateral dataset, long/short outcomes not split per event.
                  </p>
                )}
                <p className="bd-best-caption">
                  Selected from {bestCombo.totalCombos} combo{bestCombo.totalCombos !== 1 ? 's' : ''} in the current scope, ranked by total points earned.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="bd-ctas">
        <button
          type="button"
          className="bd-btn bd-btn-secondary"
          onClick={downloadPdf}
          disabled={generating || rows.length === 0}
        >
          {generating ? 'Generating…' : '↓ Download — Custom PDF (your filters)'}
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
