'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { WeekdayBreakdown, WeekdayStats, YearBreakdown, TradeRow, StrategyStats } from '@/lib/study-stats';
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
    if (worstDay) {
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
              href={`/backtested-data/${slug}/?tab=trades&day=${d.key}`}
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
            {worstDay && ` Worst: ${worstDay.label} (${breakdown[worstDay.key].wr}% WR · ${breakdown[worstDay.key].net} pts net).`}
          </>
        ) : verdict}
      </div>
    </div>
  );
}

function YearBlock({ breakdown, slug, smtLabel = 'SMT-on', trades = [] }: { breakdown: YearBreakdown; slug: string; smtLabel?: string; trades?: TradeRow[] }) {
  if (breakdown.length === 0) {
    return <div className="v3-coming-soon">No year data available.</div>;
  }

  const maxAbsNet = Math.max(...breakdown.map((y) => Math.abs(y.net)), 1);

  const best = breakdown.reduce((a, b) => (a.net >= b.net ? a : b));
  const worst = breakdown.reduce((a, b) => (a.net <= b.net ? a : b));

  function netBarClass(net: number) {
    if (Math.abs(net) <= 5) return 'v3-yr-bar gold';
    return net > 0 ? 'v3-yr-bar pos' : 'v3-yr-bar neg';
  }

  function netValClass(net: number) {
    if (net > 0) return 'v3-yr-net pos';
    if (net < 0) return 'v3-yr-net neg';
    return 'v3-yr-net zero';
  }

  return (
    <div>
      <div className="v3-wd-h">Performance by year</div>
      <div className="v3-wd-sub">Real data — {smtLabel} variant · tp1_be.</div>
      <div className="v3-yr-table-wrap">
        <table className="v3-yr-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>N</th>
              <th>WR</th>
              <th>Net pts</th>
              <th>PF</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((y) => {
              const barW = Math.round((Math.abs(y.net) / maxAbsNet) * 100);
              return (
                <tr
                  key={y.year}
                  className="v3-yr-row"
                  onClick={() => { window.location.href = `/backtested-data/${slug}/?tab=trades&year=${y.year}`; }}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="v3-yr-year">{y.year}</td>
                  <td className="v3-yr-num">{y.n}</td>
                  <td className="v3-yr-num">{y.wr}%</td>
                  <td className="v3-yr-net-cell">
                    <div className="v3-yr-net-inner">
                      <div
                        className={netBarClass(y.net)}
                        style={{ width: `${barW}%` }}
                      />
                      <span className={netValClass(y.net)}>
                        {y.net >= 0 ? '+' : ''}{y.net}
                      </span>
                    </div>
                  </td>
                  <td className="v3-yr-num">{y.pf.toFixed(2)}</td>
                </tr>
              );
            })}
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
        <div className="eq-pair-wrap">
          <EquityCurve trades={trades} title="Equity curve" subtitle={`Cumulative PnL · ${smtLabel}`} />
          <DailyPnlBars trades={trades} title="Trade-by-trade PnL" subtitle={`Per trade · ${smtLabel}`} />
        </div>
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
  asset: 'nq' | 'gc' | 'es';
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
              <>
                <tr
                  key={i}
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
              </>
            ))}
          </tbody>
        </table>
      </div>
      {dayFilter && DAY_LABEL[dayFilter] && (
        <div className="v3-tr-filter-badge">
          Filtered by {DAY_LABEL[dayFilter]} ·{' '}
          <Link href={`/backtested-data/${slug}/?tab=trades`} className="v3-tr-clear">× clear</Link>
        </div>
      )}
      {yearFilter && (
        <div className="v3-tr-filter-badge">
          Filtered by year {yearFilter} ·{' '}
          <Link href={`/backtested-data/${slug}/?tab=trades`} className="v3-tr-clear">× clear</Link>
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
  asset: 'nq' | 'gc' | 'es';
}) {
  const [variant, setVariant] = useState<VariantKey>('tp1_be');
  const [smtOn, setSmtOn] = useState<boolean>(true);
  const activeStats = statsByVariantAndSmt
    ? statsByVariantAndSmt[smtOn ? 'smtOn' : 'smtOff'][variant]
    : statsByVariant
      ? statsByVariant[variant]
      : null;
  const activeBreakdown = !smtOn && breakdownOff ? breakdownOff : breakdown;
  const activeYearBreakdown = !smtOn && yearBreakdownOff ? yearBreakdownOff : yearBreakdown;
  const activeTradesByVariant = !smtOn && tradesByVariantOff ? tradesByVariantOff : tradesByVariant;
  const activeTrades = activeTradesByVariant ? activeTradesByVariant[variant] : trades;
  const smtLabel = smtOn ? 'SMT-on' : 'SMT-off';
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') ?? 'overview') as Tab;
  const activeTab: Tab = TAB_LIST.some((t) => t.key === tab) ? tab : 'overview';
  const dayFilter = searchParams.get('day') ?? '';
  const yearFilter = searchParams.get('year') ?? '';

  function tabHref(t: string) {
    return `/backtested-data/${slug}/?tab=${t}`;
  }

  return (
    <>
      {activeStats && (
        <div className="v3-kpi-band">
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Profit factor</div>
            <div className={'v3-kpi-band-val' + (activeStats.pf >= 1.5 ? ' pos' : '')}>
              {activeStats.pf.toFixed(2)}
            </div>
            <div className="v3-kpi-band-foot">winners $ ÷ losers $</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Sample size</div>
            <div className="v3-kpi-band-val">{activeStats.n}</div>
            <div className="v3-kpi-band-foot">events tested</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Net (pts)</div>
            <div className={'v3-kpi-band-val' + (activeStats.net > 0 ? ' pos' : '')}>
              {activeStats.net >= 0 ? '+' : ''}{activeStats.net.toFixed(1)}
            </div>
            <div className="v3-kpi-band-foot">total over {dateFrom}–{dateTo}</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Win rate</div>
            <div className="v3-kpi-band-val gold">{activeStats.wr}%</div>
            <div className="v3-kpi-band-foot">{VARIANT_LABELS[variant]} · {smtLabel} variant</div>
          </div>
        </div>
      )}

      {statsByVariant && (
        <div className="v3-flt-row" style={{ margin: '0 0 12px', flexWrap: 'wrap', gap: 8 }}>
          {(['tp1_be', 'be_50', 'no_be'] as VariantKey[]).map((v) => (
            <button
              key={v}
              type="button"
              className={'v3-flt-pill' + (variant === v ? ' active' : '')}
              onClick={() => setVariant(v)}
            >
              {VARIANT_LABELS[v]}
            </button>
          ))}
          {statsByVariantAndSmt && (
            <span style={{ display: 'inline-flex', gap: 4, marginLeft: 8, paddingLeft: 12, borderLeft: '1px solid oklch(0.85 0.02 85)' }}>
              <button
                type="button"
                className={'v3-flt-pill' + (smtOn ? ' active' : '')}
                onClick={() => setSmtOn(true)}
                aria-pressed={smtOn}
              >
                SMT on
              </button>
              <button
                type="button"
                className={'v3-flt-pill' + (!smtOn ? ' active' : '')}
                onClick={() => setSmtOn(false)}
                aria-pressed={!smtOn}
              >
                SMT off
              </button>
            </span>
          )}
        </div>
      )}

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

      {activeTab === 'weekday' ? (
        <WeekdayBlock breakdown={activeBreakdown} slug={slug} smtLabel={smtLabel} />
      ) : activeTab === 'year' ? (
        <YearBlock breakdown={activeYearBreakdown} slug={slug} smtLabel={smtLabel} trades={activeTrades} />
      ) : activeTab === 'trades' ? (
        <TradesBlock trades={activeTrades} tradesByVariant={activeTradesByVariant} variant={variant} setVariant={setVariant} dayFilter={dayFilter} yearFilter={yearFilter} slug={slug} eventShort={eventShort} asset={asset} smtLabel={smtLabel} />
      ) : activeTab === 'methodology' ? (
        <div className="v3-meth-link">
          <Link href="/backtested-data/methodology/">Read full methodology →</Link>
          <p>Data sources, backtest engine, assumptions, what this is not.</p>
        </div>
      ) : (
        <div className="v3-prose">{overviewContent}</div>
      )}
    </>
  );
}
