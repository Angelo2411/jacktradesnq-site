'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAsset } from './AssetContext';

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

export default function StraddleExplorer({
  config,
  embedded = false,
  fullportPdfNq,
  fullportPdfGc,
  fullportLabel,
}: {
  config: ExplorerConfig;
  embedded?: boolean;
  fullportPdfNq?: string;
  fullportPdfGc?: string;
  fullportLabel?: string;
}) {
  const [data, setData] = useState<StraddleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { asset } = useAsset();
  const fullportHref = asset === 'gc' ? fullportPdfGc : fullportPdfNq;

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

  function downloadPdf() {
    if (!data) return;
    setGenerating(true);
    try {
      // Resolve combo: explicit (offset/tp set) or best ranked in current scope.
      let stopVal: number;
      let tpVal: number;
      if (offset !== ALL && tp !== ALL) {
        stopVal = Number(offset);
        tpVal = Number(tp);
      } else if (rows.length > 0) {
        const r = rows[0];
        stopVal = Number(r[config.offsetKey]);
        tpVal = r.tp_pts;
      } else {
        alert('No combo available for the current filters.');
        setGenerating(false);
        return;
      }

      const params = new URLSearchParams({
        event: config.eventType.toLowerCase(),
        stop: String(stopVal),
        tp: String(tpVal),
        year: year === ALL ? 'ALL' : year,
        side,
        print: '1',
      });
      if (asset === 'gc') {
        params.set('asset', 'gc');
      }
      const url = `/print/straddle/?${params.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setGenerating(false);
      return;
    } catch (e) {
      console.error('PDF route open failed', e);
      alert(`Could not open print view: ${e instanceof Error ? e.message : 'unknown error'}`);
      setGenerating(false);
      return;
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
        {fullportHref && (
          <a className="bd-btn bd-btn-secondary" href={fullportHref} download>
            {fullportLabel ?? 'Download — Fullport PDF'}
          </a>
        )}
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
