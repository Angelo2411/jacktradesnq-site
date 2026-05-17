import Link from 'next/link';
import { getCalendarWeekday } from '@/lib/study-stats';

// Current week Mon-Fri dates in ET timezone
function getWeekDates(): Array<{ dayKey: string; label: string; date: string; isoDate: string }> {
  // Get current date in ET (UTC-4/5). For weekday detection, we approximate ET as UTC-5.
  const nowUtc = new Date();
  const etMs = nowUtc.getTime() - 5 * 60 * 60 * 1000;
  const etNow = new Date(etMs);

  // Find Monday of the current week
  const dayOfWeek = etNow.getUTCDay(); // 0=Sun, 1=Mon ... 6=Sat
  const daysFromMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(etNow.getTime() + daysFromMon * 24 * 60 * 60 * 1000);

  const DAYS = [
    { dayKey: 'mon', label: 'Mon' },
    { dayKey: 'tue', label: 'Tue' },
    { dayKey: 'wed', label: 'Wed' },
    { dayKey: 'thu', label: 'Thu' },
    { dayKey: 'fri', label: 'Fri' },
  ];

  return DAYS.map(({ dayKey, label }, i) => {
    const d = new Date(monday.getTime() + i * 24 * 60 * 60 * 1000);
    const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const day = d.getUTCDate();
    const todayEt = new Date(nowUtc.getTime() - 5 * 60 * 60 * 1000);
    const isToday =
      d.getUTCFullYear() === todayEt.getUTCFullYear() &&
      d.getUTCMonth() === todayEt.getUTCMonth() &&
      d.getUTCDate() === todayEt.getUTCDate();
    const isoDate = d.toISOString().slice(0, 10);
    return { dayKey, label, date: `${month} ${day}`, isoDate, isToday } as {
      dayKey: string;
      label: string;
      date: string;
      isoDate: string;
      isToday: boolean;
    };
  });
}

// TODO: replace with real news-pine.json when available in public/data/
// <!-- TODO data shape: news-pine.json not present in public/data/ as of 2026-05-17 -->
const NEWS_PLACEHOLDER = [
  { day: 'Mon 19', time: '8:30', event: 'Empire State Manufacturing', imp: 'Medium' },
  { day: 'Mon 19', time: '9:15', event: 'Industrial Production',      imp: 'Low'    },
  { day: 'Tue 20', time: '8:30', event: 'Building Permits',           imp: 'Low'    },
  { day: 'Tue 20', time: '8:30', event: 'Housing Starts',             imp: 'Low'    },
  { day: 'Wed 21', time: '14:00', event: 'FOMC Minutes',              imp: 'High'   },
  { day: 'Thu 22', time: '8:30', event: 'Jobless Claims',             imp: 'Medium' },
  { day: 'Thu 22', time: '8:30', event: 'Philly Fed',                 imp: 'Medium' },
  { day: 'Fri 23', time: '10:00', event: 'Existing Home Sales',       imp: 'Low'    },
];

function impClass(imp: string) {
  if (imp === 'High') return 'v3-imp-h';
  if (imp === 'Medium') return 'v3-imp-m';
  return '';
}

export default function CalendarPage() {
  const weekDates = getWeekDates();
  const calData = getCalendarWeekday();
  const todayIdx = weekDates.findIndex((d) => (d as typeof d & { isToday: boolean }).isToday);

  return (
    <>
      <div className="v3-hero-crumb">Calendar</div>
      <h1 className="v3-hero-h1">
        This week<span className="v3-hero-dot">.</span>
      </h1>
      <p className="v3-hero-sub">
        Top strategies firing each day · click a card to drill down.
      </p>

      {/* Filter pills — UI only */}
      <div className="v3-filters">
        <button className="v3-flt-pill active">This week</button>
        <button className="v3-flt-pill">Next week</button>
        <button className="v3-flt-pill">Month view</button>
      </div>

      {/* Day cards */}
      <div className="v3-day-cards">
        {weekDates.map((day, i) => {
          const isToday = (day as typeof day & { isToday: boolean }).isToday;
          const strats = calData[day.dayKey] ?? [];
          const topSlug = strats[0]?.slug;
          const href = topSlug
            ? `/backtested-data/${topSlug}/?tab=weekday`
            : '/backtested-data/';

          return (
            <Link
              key={day.dayKey}
              href={href}
              className={'v3-day-card' + (isToday ? ' today' : '')}
            >
              <div className="v3-day-hd">
                <div className="v3-day-name-wrap">
                  <span className="v3-day-name">{day.label}</span>
                  {isToday && (
                    <span className="v3-today-badge">Today</span>
                  )}
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
          void i;
          void todayIdx;
        })}
      </div>

      {/* News this week */}
      <section className="v3-news-week">
        <div className="v3-news-week-h2">News this week</div>
        <div className="v3-news-week-sub">
          Scheduled releases (NY time). {/* TODO: wire to live news-pine.json when available */}
        </div>
        <table className="v3-news-tbl">
          <tbody>
            {NEWS_PLACEHOLDER.map((row, i) => (
              <tr key={i}>
                <td className="v3-news-td-d">{row.day}</td>
                <td className="v3-news-td-t">{row.time}</td>
                <td className="v3-news-td-e">{row.event}</td>
                <td className={'v3-news-td-imp ' + impClass(row.imp)}>{row.imp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
