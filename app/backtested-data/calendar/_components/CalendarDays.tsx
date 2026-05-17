'use client';
import Link from 'next/link';
import { useAsset } from '../../_components/AssetContext';
import { getWeekDates, getRedFolderByDay, type NewsItem } from '@/lib/news-week';
import type { EventStudyStats } from '@/lib/study-stats';

type Props = {
  news: NewsItem[];
  studyMap: Record<string, EventStudyStats | null>;
};

export default function CalendarDays({ news, studyMap }: Props) {
  const { asset } = useAsset();

  // Compute current week dates at runtime (client-side, uses real browser Date)
  const weekDates = getWeekDates();
  const dayRedEvents = getRedFolderByDay(news, weekDates, studyMap);

  return (
    <div className="v3-day-cards">
      {weekDates.map((day) => {
        const events = dayRedEvents[day.dayKey] ?? [];

        // Asset filter: gc → only events with a GC study (none currently)
        const filtered = asset === 'gc'
          ? events.filter((e) => e.study?.asset === 'GC')
          : events;

        const firstStudy = filtered.find((e) => e.study != null)?.study ?? null;
        const href = firstStudy ? `/backtested-data/${firstStudy.slug}/` : null;

        const cardClass = 'v3-day-card' + (day.isToday ? ' today' : '');

        const inner = (
          <>
            <div className="v3-day-hd">
              <div className="v3-day-name-wrap">
                <span className="v3-day-name">{day.label}</span>
                {day.isToday && <span className="v3-today-badge">Today</span>}
              </div>
              <span className="v3-day-date">{day.date}</span>
            </div>

            {filtered.length === 0 ? (
              <div className="v3-day-empty">
                {asset === 'gc'
                  ? 'No GC red folder events scheduled'
                  : 'Quiet day — no red folder release'}
              </div>
            ) : (
              filtered.map((ev, i) => (
                <div key={i} className="v3-day-strat">
                  <div className="v3-day-strat-name">
                    {ev.event}
                    <span className="v3-day-strat-time"> · {ev.time}</span>
                  </div>
                  {ev.study ? (
                    <div className="v3-day-strat-stats">
                      <span>N={ev.study.n}</span>
                      <span>WR <span className="pos">{ev.study.wr}%</span></span>
                      <span className="pos">+{ev.study.net} pts</span>
                    </div>
                  ) : (
                    <div className="v3-day-empty" style={{ padding: '4px 0', fontStyle: 'italic' }}>
                      No backtest yet
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        );

        return href ? (
          <Link key={day.dayKey} href={href} className={cardClass}>
            {inner}
          </Link>
        ) : (
          <div key={day.dayKey} className={cardClass}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
