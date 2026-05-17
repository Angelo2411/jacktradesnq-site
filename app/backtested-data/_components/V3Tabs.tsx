'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { WeekdayBreakdown, WeekdayStats, YearBreakdown, TradeRow } from '@/lib/study-stats';

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
}: {
  breakdown: WeekdayBreakdown;
  slug: string;
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

  void slug;

  return (
    <div>
      <div className="v3-wd-h">Performance by day of the week</div>
      <div className="v3-wd-sub">Real data — SMT-on variant · tp1_be.</div>
      <div className="v3-wd-grid">
        {days.map((d) => {
          const st = breakdown[d.key];
          const isBest = bestDay?.key === d.key;
          const isWorst = worstDay?.key === d.key;
          const colClass = 'v3-wd-col' + (isBest ? ' best' : isWorst ? ' worst' : '');
          const barH = st.n === 0 ? 4 : Math.max(6, Math.round((st.wr / maxWr) * 80));
          return (
            <div key={d.key} className={colClass}>
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

function YearBlock({ breakdown }: { breakdown: YearBreakdown }) {
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
      <div className="v3-wd-sub">Real data — SMT-on variant · tp1_be.</div>
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
                <tr key={y.year} className="v3-yr-row">
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
    </div>
  );
}

const PAGE_SIZE = 25;

function TradesBlock({ trades }: { trades: TradeRow[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (trades.length === 0) {
    return <div className="v3-coming-soon">No trade data available.</div>;
  }

  const shown = trades.slice(0, visible);

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

  return (
    <div>
      <div className="v3-wd-h">Trade list</div>
      <div className="v3-wd-sub">tp1_be · SMT-on variant · most recent first.</div>
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
              <tr key={i} className="v3-tr-row">
                <td className="v3-tr-date">{t.ts.slice(0, 10)}</td>
                <td className="v3-tr-side">{t.side.toUpperCase()}</td>
                <td className={pnlClass(t.pnl_pts)}>
                  {t.pnl_pts >= 0 ? '+' : ''}{t.pnl_pts.toFixed(2)}
                </td>
                <td>
                  <span className={outcomeClass(t.outcome)}>{t.outcome}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visible < trades.length && (
        <button
          className="v3-tr-load-more"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
        >
          Load more ({trades.length - visible} remaining)
        </button>
      )}
      <div className="v3-tr-count">{trades.length} total trades</div>
    </div>
  );
}

export default function V3Tabs({
  slug,
  breakdown,
  yearBreakdown,
  trades,
  overviewContent,
}: {
  slug: string;
  breakdown: WeekdayBreakdown;
  yearBreakdown: YearBreakdown;
  trades: TradeRow[];
  overviewContent: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') ?? 'overview') as Tab;
  const activeTab: Tab = TAB_LIST.some((t) => t.key === tab) ? tab : 'overview';

  function tabHref(t: string) {
    return `/backtested-data/${slug}/?tab=${t}`;
  }

  return (
    <>
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
        <WeekdayBlock breakdown={breakdown} slug={slug} />
      ) : activeTab === 'year' ? (
        <YearBlock breakdown={yearBreakdown} />
      ) : activeTab === 'trades' ? (
        <TradesBlock trades={trades} />
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
