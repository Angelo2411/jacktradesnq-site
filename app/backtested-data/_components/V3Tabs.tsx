'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { WeekdayBreakdown, WeekdayStats } from '@/lib/study-stats';

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

export default function V3Tabs({
  slug,
  breakdown,
  overviewContent,
}: {
  slug: string;
  breakdown: WeekdayBreakdown;
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
        <div className="v3-coming-soon">By year breakdown — coming soon.</div>
      ) : activeTab === 'trades' ? (
        <div className="v3-coming-soon">Trade list — coming soon.</div>
      ) : activeTab === 'methodology' ? (
        <div className="v3-coming-soon">Methodology detail — coming soon.</div>
      ) : (
        <div className="v3-prose">{overviewContent}</div>
      )}
    </>
  );
}
