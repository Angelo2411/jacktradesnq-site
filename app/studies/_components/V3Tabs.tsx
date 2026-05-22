'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Fragment, useState, useMemo } from 'react';
import type { WeekdayBreakdown, WeekdayStats, YearBreakdown, TradeRow, StrategyStats } from '@/lib/study-stats';
import { aggregateYearTotals } from '@/lib/year-stats-utils';
import { filterTradesByLookback, computeKPI, computeYearBreakdown, computeWeekdayBreakdown } from '@/lib/client-stats';
import FilterBar, { useFilterState } from './FilterBar';
import TradeMiniChart from './TradeMiniChart';
import WeekdayBars from './WeekdayBars';
import EquityCurve from './EquityCurve';
import DailyPnlBars from './DailyPnlBars';

type Tab = 'overview' | 'weekday' | 'year' | 'trades' | 'methodology';

const TAB_LIST: Array<{ key: Tab; label: string }> = [
  { key: 'overview',     label: 'Overview' },
  { key: 'weekday',      label: 'By weekday' },
  { key: 'year',         label: 'By year' },
  { key: 'trades',       label: 'Trade list' },
  { key: 'methodology',  label: 'Methodology' },
];

function WeekdayBlock({
  breakdown,
  slug,
  smtLabel = 'SMT-on',
}: {
  breakdown: WeekdayBreakdown;
  slug: string;
  smtLabel?: string;
}) {
  const days: Array<{ key: keyof WeekdayBreakdown; label: string }> = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
  ];

  const validDays = days.filter((d) => breakdown[d.key].n > 0);
  const bestDay = validDays.length
    ? validDays.reduce((a, b) => (breakdown[a.key].wr >= breakdown[b.key].wr ? a : b))
    : null;
  const losingDays = validDays.filter((d) => breakdown[d.key].net < 0);
  const worstDay = losingDays.length
    ? losingDays.reduce((a, b) => (breakdown[a.key].net <= breakdown[b.key].net ? a : b))
    : null;

  const maxWr = Math.max(...days.map((d) => breakdown[d.key].wr), 1);

  function barClass(st: WeekdayStats) {
    if (st.n === 0) return 'v3-wd-bar';
    if (st.net > 5) return 'v3-wd-bar pos';
    if (st.net < -5) return 'v3-wd-bar neg';
    return 'v3-wd-bar gold';
  }

  function pnlClass(st: WeekdayStats) {
    if (st.net > 0) return 'v3-wd-stat-pnl pos';
    if (st.net < 0) return 'v3-wd-stat-pnl neg';
    return 'v3-wd-stat-pnl zero';
  }

  const verdict = (() => {
    if (!bestDay) return 'Not enough data across weekdays to draw conclusions.';
    const bestSt = breakdown[bestDay.key];
    const parts: string[] = [
      `Best day: ${bestDay.label} (${bestSt.wr}% WR · ${bestSt.net >= 0 ? '+' : ''}${bestSt.net} pts net, N=${bestSt.n}).`,
    ];
    if (worstDay && worstDay.key !== bestDay.key) {
      const wSt = breakdown[worstDay.key];
      parts.push(`Worst: ${worstDay.label} (${wSt.wr}% WR · ${wSt.net} pts net).`);
    }
    return parts.join(' ');
  })();

  return (
    <div>
      <WeekdayBars breakdown={breakdown} title="Net PnL by weekday" subtitle={smtLabel} />
      <div className="v3-wd-h">Performance by day of the week</div>
      <div className="v3-wd-sub">Real data — {smtLabel} variant · tp1_be.</div>
      <div className="v3-wd-grid">
        {days.map((d) => {
          const st = breakdown[d.key];
          const isBest = bestDay?.key === d.key;
          const isWorst = worstDay?.key === d.key;
          const colClass = 'v3-wd-col' + (isBest ? ' best' : isWorst ? ' worst' : '');
          const barH = st.n === 0 ? 4 : Math.max(6, Math.round((st.wr / maxWr) * 80));
          return (
            <Link
              key={d.key}
              href={`/studies/${slug}/?tab=trades&day=${d.key}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div className={colClass}>
                <div className="v3-wd-col-day">{d.label}</div>
                <div className="v3-wd-bar-wrap">
                  <div className={barClass(st)} style={{ height: `${barH}%` }} />
                </div>
                {st.n === 0 ? (
                  <>
                    <div className="v3-wd-stat">—</div>
                    <div className="v3-wd-stat-sub">N=0</div>
                    <div className="v3-wd-stat-pnl zero">no events</div>
                  </>
                ) : (
                  <>
                    <div className="v3-wd-stat">{st.wr}%</div>
                    <div className="v3-wd-stat-sub">N={st.n} · WR</div>
                    <div className={pnlClass(st)}>
                      {st.net >= 0 ? '+' : ''}{st.net} pts
                    </div>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      <div className="v3-wd-verdict">
        {bestDay ? (
          <>
            Best day: <strong>{bestDay.label}</strong>
            {' '}({breakdown[bestDay.key].wr}% WR · {breakdown[bestDay.key].net >= 0 ? '+' : ''}{breakdown[bestDay.key].net} pts net, N={breakdown[bestDay.key].n}).
            {worstDay && worstDay.key !== bestDay.key && ` Worst: ${worstDay.label} (${breakdown[worstDay.key].wr}% WR · ${breakdown[worstDay.key].net} pts net).`}
          </>
        ) : verdict}
      </div>
    </div>
  );
}

function YearBlock({ breakdown, slug, smtLabel = 'SMT-on', trades = [] }: { breakdown: YearBreakdown; slug: string; smtLabel?: string; trades?: TradeRow[] }) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const filteredTrades = useMemo(
    () => (selectedYear !== null ? trades.filter((t) => t.year === selectedYear) : trades),
    [trades, selectedYear]
  );

  if (breakdown.length === 0) {
    return <div className="v3-coming-soon">No year data available.</div>;
  }

  const best = breakdown.reduce((a, b) => (a.net >= b.net ? a : b));
  const worst = breakdown.reduce((a, b) => (a.net <= b.net ? a : b));
  const total = aggregateYearTotals(breakdown);

  function pctClass(val: number, type: 'win' | 'be' | 'loss') {
    if (type === 'win') return val >= 50 ? 'v3-yr-num sage' : 'v3-yr-num';
    if (type === 'loss') return val >= 50 ? 'v3-yr-num terra' : 'v3-yr-num';
    return 'v3-yr-num gold';
  }

  function renderRow(y: typeof breakdown[0] | typeof total, isTotal = false) {
    const cls = 'v3-yr-row' +
      (isTotal ? ' total' : selectedYear === y.year ? ' selected' : '');
    const onClick = isTotal ? undefined : () => setSelectedYear(selectedYear === y.year ? null : y.year);

    return (
      <tr
        key={isTotal ? 'total' : y.year}
        className={cls}
        onClick={onClick}
        style={isTotal ? { cursor: 'default' } : { cursor: 'pointer' }}
      >
        <td className="v3-yr-year">{isTotal ? 'Total' : y.year}</td>
        <td className="v3-yr-num">{y.n}</td>
        <td className={pctClass(y.wr, 'win')}>{y.wr}%</td>
        <td className={pctClass(y.bePct, 'be')}>{y.bePct}%</td>
        <td className={pctClass(y.lPct, 'loss')}>{y.lPct}%</td>
        <td className="v3-yr-num">{y.pf.toFixed(2)}</td>
        <td className="v3-yr-num sage">{y.avgWin > 0 ? `+${y.avgWin}` : '—'}</td>
        <td className="v3-yr-num terra">{y.avgLoss > 0 ? `-${y.avgLoss}` : '—'}</td>
        <td className="v3-yr-num terra">{y.maxDD < 0 ? y.maxDD.toFixed(1) : '—'}</td>
      </tr>
    );
  }

  return (
    <div>
      <div className="v3-wd-h">Performance by year</div>
      <div className="v3-wd-sub">Real data — {smtLabel} variant · tp1_be. Click a row to filter charts.</div>
      <div className="v3-yr-table-wrap">
        <table className="v3-yr-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>N</th>
              <th>Win%</th>
              <th>BE%</th>
              <th>Loss%</th>
              <th>PF</th>
              <th>Avg Win</th>
              <th>Avg Loss</th>
              <th>Max DD</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((y) => renderRow(y, false))}
            {renderRow(total, true)}
          </tbody>
        </table>
      </div>
      <div className="v3-wd-verdict">
        Best year: <strong>{best.year}</strong> ({best.wr}% WR · {best.net >= 0 ? '+' : ''}{best.net} pts net).
        {worst.year !== best.year && (
          <> Worst: <strong>{worst.year}</strong> ({worst.wr}% WR · {worst.net} pts net).</>
        )}
      </div>
      {trades.length > 0 && (
        <>
          {selectedYear !== null && (
            <div className="v3-yr-filter-pill">
              <span>Filtered on {selectedYear}</span>
              <button
                type="button"
                onClick={() => setSelectedYear(null)}
                aria-label="Reset year filter"
              >
                ×
              </button>
            </div>
          )}
          <div className="eq-pair-wrap">
            <EquityCurve trades={filteredTrades} title="Equity curve" subtitle={selectedYear ? `${selectedYear} · ${smtLabel}` : `Cumulative PnL · ${smtLabel}`} />
            <DailyPnlBars trades={filteredTrades} title="Trade-by-trade PnL" subtitle={selectedYear ? `${selectedYear} · per trade` : `Per trade · ${smtLabel}`} />
          </div>
        </>
      )}
    </div>
  );
}

const PAGE_SIZE = 25;

const DAY_LABEL: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday',
};

function tradeWeekday(ts: string): number {
  // Convert UTC timestamp to ET (subtract 5h) then get day
  const d = new Date(new Date(ts).getTime() - 5 * 3600 * 1000);
  return d.getUTCDay(); // 1=Mon...5=Fri
}

const DAY_KEY_TO_NUM: Record<string, number> = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5 };

type VariantKey = 'tp1_be' | 'be_50' | 'no_be';

const VARIANT_LABELS: Record<VariantKey, string> = {
  tp1_be: 'TP1 + BE',
  be_50:  'TP only + BE',
  no_be:  'TP only',
};

function TradesBlock({
  trades,
  tradesByVariant,
  variant,
  setVariant,
  dayFilter = '',
  yearFilter = '',
  slug,
  eventShort,
  asset,
  smtLabel = 'SMT-on',
}: {
  trades: TradeRow[];
  tradesByVariant?: { tp1_be: TradeRow[]; be_50: TradeRow[]; no_be: TradeRow[] };
  variant: VariantKey;
  setVariant: (v: VariantKey) => void;
  dayFilter?: string;
  yearFilter?: string;
  slug: string;
  eventShort: string;
  asset: 'nq' | 'gc' | 'es' | 'si';
  smtLabel?: string;
}) {
  const activeTrades = tradesByVariant ? tradesByVariant[variant] : trades;
  const dayFiltered = dayFilter && DAY_KEY_TO_NUM[dayFilter] !== undefined
    ? activeTrades.filter((t) => tradeWeekday(t.ts) === DAY_KEY_TO_NUM[dayFilter])
    : activeTrades;
  const filtered = yearFilter
    ? dayFiltered.filter((t) => t.ts.slice(0, 4) === yearFilter)
    : dayFiltered;

  const [visible, setVisible] = useState(PAGE_SIZE);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (trades.length === 0) {
    return <div className="v3-coming-soon">No trade data available.</div>;
  }

  const shown = filtered.slice(0, visible);

  function pnlClass(pnl: number) {
    if (pnl > 0) return 'v3-tr-pnl pos';
    if (pnl < 0) return 'v3-tr-pnl neg';
    return 'v3-tr-pnl zero';
  }

  function outcomeClass(outcome: string) {
    if (outcome === 'win') return 'v3-tr-badge win';
    if (outcome === 'loss') return 'v3-tr-badge loss';
    if (outcome === 'timeout') return 'v3-tr-badge timeout';
    return 'v3-tr-badge be';
  }

  const hasStructuralPrices = trades.some((t) => t.entry_price !== undefined && t.sl_price !== undefined && t.tp_price !== undefined);

  return (
    <div>
      <div className="v3-wd-h">Trade list</div>
      <div className="v3-wd-sub">
        {VARIANT_LABELS[variant]} · {smtLabel} variant{hasStructuralPrices ? ' · SL = sweep ± 1 tick · TP = pre-news pivot (structural, varies per trade)' : ''} · most recent first.
      </div>
      <div className="v3-tr-table-wrap">
        <table className="v3-tr-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Side</th>
              <th>PnL (pts)</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((t, i) => (
              <Fragment key={i}>
                <tr
                  className={'v3-tr-row' + (expandedIdx === i ? ' expanded' : '')}
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="v3-tr-date">
                    <span className="v3-tr-expand-icon">{expandedIdx === i ? '▾' : '▸'}</span>
                    {t.ts.slice(0, 10)}
                  </td>
                  <td className="v3-tr-side">{t.side.toUpperCase()}</td>
                  <td className={pnlClass(t.pnl_pts)}>
                    {t.pnl_pts >= 0 ? '+' : ''}{t.pnl_pts.toFixed(2)}
                  </td>
                  <td>
                    <span className={outcomeClass(t.outcome)}>{t.outcome}</span>
                  </td>
                </tr>
                {expandedIdx === i && (
                  <tr key={`${i}-chart`} className="v3-tr-expanded">
                    <td colSpan={4} style={{ padding: '16px 16px 24px' }}>
                      <TradeMiniChart
                        eventShort={eventShort}
                        asset={asset}
                        tradeDate={t.ts.slice(0, 10)}
                        side={t.side as 'long' | 'short'}
                        pnl_pts={t.pnl_pts}
                        outcome={t.outcome}
                        entryPrice={t.entry_price}
                        slPrice={t.sl_price}
                        tpPrice={t.tp_price}
                        entryTs={t.entry_ts}
                        exitTs={t.exit_ts}
                        exitPrice={t.exit_price}
                        ts={t.ts}
                        dataHigh={t.data_high}
                        dataLow={t.data_low}
                        sweepTs={t.sweep_ts}
                        sweepSide={t.sweep_side}
                        ifvgTop={t.ifvg_top}
                        ifvgBottom={t.ifvg_bottom}
                        ifvgFormationTs={t.ifvg_formation_ts}
                        variant={variant}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {dayFilter && DAY_LABEL[dayFilter] && (
        <div className="v3-tr-filter-badge">
          Filtered by {DAY_LABEL[dayFilter]} ·{' '}
          <Link href={`/studies/${slug}/?tab=trades`} className="v3-tr-clear">× clear</Link>
        </div>
      )}
      {yearFilter && (
        <div className="v3-tr-filter-badge">
          Filtered by year {yearFilter} ·{' '}
          <Link href={`/studies/${slug}/?tab=trades`} className="v3-tr-clear">× clear</Link>
        </div>
      )}
      {visible < filtered.length && (
        <button
          className="v3-tr-load-more"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
        >
          Load more ({filtered.length - visible} remaining)
        </button>
      )}
      <div className="v3-tr-count">{filtered.length} total trades{dayFilter ? ` (${trades.length} unfiltered)` : ''}</div>
    </div>
  );
}

export default function V3Tabs({
  slug,
  breakdown,
  breakdownOff,
  yearBreakdown,
  yearBreakdownOff,
  trades,
  tradesByVariant,
  tradesByVariantOff,
  statsByVariant,
  statsByVariantAndSmt,
  dateFrom,
  dateTo,
  overviewContent,
  eventShort,
  asset,
  hideKpiBand = false,
}: {
  slug: string;
  breakdown: WeekdayBreakdown;
  breakdownOff?: WeekdayBreakdown;
  yearBreakdown: YearBreakdown;
  yearBreakdownOff?: YearBreakdown;
  trades: TradeRow[];
  tradesByVariant?: { tp1_be: TradeRow[]; be_50: TradeRow[]; no_be: TradeRow[] };
  tradesByVariantOff?: { tp1_be: TradeRow[]; be_50: TradeRow[]; no_be: TradeRow[] };
  statsByVariant?: { tp1_be: StrategyStats; be_50: StrategyStats; no_be: StrategyStats } | null;
  statsByVariantAndSmt?: {
    smtOn: { tp1_be: StrategyStats; be_50: StrategyStats; no_be: StrategyStats };
    smtOff: { tp1_be: StrategyStats; be_50: StrategyStats; no_be: StrategyStats };
  } | null;
  dateFrom?: string;
  dateTo?: string;
  overviewContent: React.ReactNode;
  eventShort: string;
  asset: 'nq' | 'gc' | 'es' | 'si';
  hideKpiBand?: boolean;
}) {
  // ── URL-driven filter state ──────────────────────────────────────────
  const { variant, smtOn, lookback } = useFilterState();
  const hasSmtToggle = !!statsByVariantAndSmt;

  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') ?? 'overview') as Tab;
  const activeTab: Tab = TAB_LIST.some((t) => t.key === tab) ? tab : 'overview';
  const dayFilter = searchParams.get('day') ?? '';
  const yearFilter = searchParams.get('year') ?? '';

  const smtLabel = smtOn ? 'SMT-on' : 'SMT-off';

  // ── Raw trade pool by smt toggle ─────────────────────────────────────
  const rawByVariant = useMemo(
    () => (!smtOn && tradesByVariantOff ? tradesByVariantOff : tradesByVariant),
    [smtOn, tradesByVariant, tradesByVariantOff]
  );

  // ── Apply lookback filter ─────────────────────────────────────────────
  const filteredByVariant = useMemo(() => {
    if (!rawByVariant) return undefined;
    return {
      tp1_be: filterTradesByLookback(rawByVariant.tp1_be, lookback),
      be_50:  filterTradesByLookback(rawByVariant.be_50,  lookback),
      no_be:  filterTradesByLookback(rawByVariant.no_be,  lookback),
    };
  }, [rawByVariant, lookback]);

  const activeTrades = useMemo(
    () => filteredByVariant ? filteredByVariant[variant] : filterTradesByLookback(trades, lookback),
    [filteredByVariant, variant, trades, lookback]
  );

  // ── KPI: recomputed client-side from filtered trades ──────────────────
  const kpi = useMemo(() => computeKPI(activeTrades), [activeTrades]);

  // ── Breakdowns: recomputed from filtered trades ───────────────────────
  const activeYearBreakdown = useMemo(
    () => computeYearBreakdown(activeTrades),
    [activeTrades]
  );
  const activeBreakdown = useMemo(
    () => computeWeekdayBreakdown(activeTrades),
    [activeTrades]
  );

  // Preserve server-side breakdowns for reference when lookback=all (identity check)
  // but we always use client-computed for consistency with lookback filter.

  function tabHref(t: string) {
    // Preserve existing filter params when switching tabs
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', t);
    // Clear day/year filters on tab switch (they belong to specific tabs)
    params.delete('day');
    params.delete('year');
    return `/studies/${slug}/?${params.toString()}`;
  }

  const hasTradeData = (tradesByVariant?.tp1_be?.length ?? 0) > 0;

  return (
    <>
      {/* ── Sticky FilterBar ── */}
      {hasTradeData && (
        <div className="fb-sticky-wrap">
          <FilterBar hasSmtToggle={hasSmtToggle} />
        </div>
      )}

      {/* ── KPI band ── */}
      {hasTradeData && !hideKpiBand && (
        <div className="v3-kpi-band fb-animated">
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Profit factor</div>
            <div className={'v3-kpi-band-val' + (kpi.pf >= 1.5 ? ' pos' : '')}>
              {kpi.pf.toFixed(2)}
            </div>
            <div className="v3-kpi-band-foot">winners $ ÷ losers $</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Sample size</div>
            <div className="v3-kpi-band-val">{kpi.n}</div>
            <div className="v3-kpi-band-foot">events tested</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Net (pts)</div>
            <div className={'v3-kpi-band-val' + (kpi.net > 0 ? ' pos' : '')}>
              {kpi.net >= 0 ? '+' : ''}{kpi.net.toFixed(1)}
            </div>
            <div className="v3-kpi-band-foot">total over {dateFrom}–{dateTo}</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Win rate</div>
            <div className="v3-kpi-band-val gold">{kpi.wr}%</div>
            <div className="v3-kpi-band-foot">{VARIANT_LABELS[variant]} · {smtLabel}</div>
          </div>
        </div>
      )}

      {/* ── Tabs nav ── */}
      <div className="v3-tabs">
        {TAB_LIST.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={'v3-tab' + (activeTab === t.key ? ' active' : '')}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="fb-animated">
        {activeTab === 'weekday' ? (
          <WeekdayBlock breakdown={activeBreakdown} slug={slug} smtLabel={smtLabel} />
        ) : activeTab === 'year' ? (
          <YearBlock breakdown={activeYearBreakdown} slug={slug} smtLabel={smtLabel} trades={activeTrades} />
        ) : activeTab === 'trades' ? (
          <TradesBlock
            trades={activeTrades}
            tradesByVariant={filteredByVariant}
            variant={variant}
            setVariant={() => {/* variant now URL-driven */}}
            dayFilter={dayFilter}
            yearFilter={yearFilter}
            slug={slug}
            eventShort={eventShort}
            asset={asset}
            smtLabel={smtLabel}
          />
        ) : activeTab === 'methodology' ? (
          <div className="v3-meth-link">
            <Link href="/studies/methodology/">Read full methodology →</Link>
            <p>Data sources, backtest engine, assumptions, what this is not.</p>
          </div>
        ) : (
          <div className="v3-prose">{overviewContent}</div>
        )}
      </div>
    </>
  );
}
