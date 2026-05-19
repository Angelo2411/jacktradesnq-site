import Link from 'next/link';
import { getEventStudyMap } from '@/lib/study-stats';
import { loadNewsWeek } from '@/lib/news-week-server';
import { RED_FOLDER_WHITELIST } from '@/lib/news-week';
import type { NewsItem } from '@/lib/news-week';
import CalendarDays from './_components/CalendarDays';

function impClass(imp: string) {
  if (imp === 'High') return 'v3-imp-h';
  if (imp === 'Medium') return 'v3-imp-m';
  return '';
}

export default function CalendarPage() {
  // Server-side: load real news from public/data/news-week.json (uses fs).
  const news = loadNewsWeek();
  const studyMap = getEventStudyMap(news);
  const redFolder = news.filter((n: { imp: string; event: string }) => n.imp === 'High' && RED_FOLDER_WHITELIST.has(n.event));

  return (
    <>
      <div className="v3-hero-crumb">Calendar</div>
      <h1 className="v3-hero-h1">
        This week<span className="v3-hero-dot">.</span>
      </h1>
      <p className="v3-hero-sub">
        Top strategies firing each day · click a card to drill down.
      </p>

      {/* Filter pills */}
      <div className="v3-filters">
        <button className="v3-flt-pill active">This week</button>
        <button className="v3-flt-pill">Next week</button>
        <button className="v3-flt-pill">Month view</button>
      </div>

      {/* Day cards — client: computes week dates at runtime, filters by asset */}
      <CalendarDays news={news} studyMap={studyMap} />

      {/* News this week — Red folder (High impact) only */}
      <section className="v3-news-week">
        <div className="v3-news-week-h2">Red folder this week</div>
        <div className="v3-news-week-sub">
          High-impact scheduled releases only (NY time).
        </div>
        {redFolder.length === 0 ? (
          <p className="v3-news-empty">
            No red-folder events scheduled this week. Quiet macro week.
          </p>
        ) : (
          <ul className="v3-news-list">
            {redFolder.map((row: NewsItem, i: number) => {
              const slug = studyMap[row.event]?.slug ?? null;
              const inner = (
                <>
                  <span className="v3-news-td-d">{row.day}</span>
                  <span className="v3-news-td-t">{row.time}</span>
                  <span className="v3-news-td-e">{row.event}</span>
                  <span className={'v3-news-td-imp ' + impClass(row.imp)}>{row.imp}</span>
                </>
              );
              return (
                <li key={i}>
                  {slug ? (
                    <Link href={`/backtested-data/${slug}/`} className="v3-news-row v3-news-row-link">
                      {inner}
                    </Link>
                  ) : (
                    <div className="v3-news-row">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
