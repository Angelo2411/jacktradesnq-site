import { getEventStudyMap } from '@/lib/study-stats';
import type { NewsItem } from '@/lib/news-week';
import CalendarDays from './_components/CalendarDays';

const NEWS_PLACEHOLDER: NewsItem[] = [
  { day: 'Mon 19', time: '8:30',  event: 'Empire State Manufacturing', imp: 'Medium' },
  { day: 'Mon 19', time: '9:15',  event: 'Industrial Production',      imp: 'Low'    },
  { day: 'Tue 20', time: '8:30',  event: 'Building Permits',           imp: 'Low'    },
  { day: 'Tue 20', time: '8:30',  event: 'Housing Starts',             imp: 'Low'    },
  { day: 'Wed 21', time: '14:00', event: 'FOMC Minutes',               imp: 'High'   },
  { day: 'Thu 22', time: '8:30',  event: 'Jobless Claims',             imp: 'Medium' },
  { day: 'Thu 22', time: '8:30',  event: 'Philly Fed',                 imp: 'Medium' },
  { day: 'Fri 23', time: '10:00', event: 'Existing Home Sales',        imp: 'Low'    },
];

function impClass(imp: string) {
  if (imp === 'High') return 'v3-imp-h';
  if (imp === 'Medium') return 'v3-imp-m';
  return '';
}

export default function CalendarPage() {
  // Server-side: resolve study stats (uses fs). Pass serializable map to client.
  const studyMap = getEventStudyMap(NEWS_PLACEHOLDER);
  const redFolder = NEWS_PLACEHOLDER.filter((n) => n.imp === 'High');

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
      <CalendarDays news={NEWS_PLACEHOLDER} studyMap={studyMap} />

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
          <table className="v3-news-tbl">
            <tbody>
              {redFolder.map((row, i) => (
                <tr key={i}>
                  <td className="v3-news-td-d">{row.day}</td>
                  <td className="v3-news-td-t">{row.time}</td>
                  <td className="v3-news-td-e">{row.event}</td>
                  <td className={'v3-news-td-imp ' + impClass(row.imp)}>{row.imp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
