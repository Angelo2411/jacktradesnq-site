'use client';
import Link from 'next/link';
import { useAsset } from '../../_components/AssetContext';
import type { CalendarDayEntry } from '@/lib/study-stats';

type WeekDate = { dayKey: string; label: string; date: string; isoDate: string; isToday: boolean };

type Props = {
  calData: Record<string, CalendarDayEntry[]>;
  weekDates: WeekDate[];
};

export default function CalendarDays({ calData, weekDates }: Props) {
  const { asset } = useAsset();

  return (
    <div className="v3-day-cards">
      {weekDates.map((day) => {
        const allStrats = calData[day.dayKey] ?? [];
        const strats = asset === 'all'
          ? allStrats
          : allStrats.filter((s) => s.asset.toLowerCase() === asset);

        const topSlug = strats[0]?.slug;
        const href = topSlug
          ? `/backtested-data/${topSlug}/?tab=weekday`
          : '/backtested-data/';

        return (
          <Link
            key={day.dayKey}
            href={href}
            className={'v3-day-card' + (day.isToday ? ' today' : '')}
          >
            <div className="v3-day-hd">
              <div className="v3-day-name-wrap">
                <span className="v3-day-name">{day.label}</span>
                {day.isToday && <span className="v3-today-badge">Today</span>}
              </div>
              <span className="v3-day-date">{day.date}</span>
            </div>

            {strats.length === 0 ? (
              <div className="v3-day-empty">Quiet day — no setups with edge</div>
            ) : strats.length === 1 ? (
              <>
                <div className="v3-day-strat">
                  <div className="v3-day-strat-name">{strats[0].name}</div>
                  <div className="v3-day-strat-stats">
                    <span>N={strats[0].n}</span>
                    <span>WR <span className="pos">{strats[0].wr}%</span></span>
                    <span className="pos">+{strats[0].net} pts</span>
                  </div>
                </div>
                <div className="v3-day-empty" style={{ textAlign: 'left', padding: '8px 0' }}>
                  Quiet day — only 1 setup
                </div>
              </>
            ) : (
              strats.map((st) => (
                <div key={st.slug} className="v3-day-strat">
                  <div className="v3-day-strat-name">{st.name}</div>
                  <div className="v3-day-strat-stats">
                    <span>N={st.n}</span>
                    <span>WR <span className="pos">{st.wr}%</span></span>
                    <span className="pos">+{st.net} pts</span>
                  </div>
                </div>
              ))
            )}
          </Link>
        );
      })}
    </div>
  );
}
