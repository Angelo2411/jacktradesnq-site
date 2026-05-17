import { getCalendarWeekday } from '@/lib/study-stats';
import CalendarDays from './_components/CalendarDays';

// Current week Mon-Fri dates in ET timezone
function getWeekDates(): Array<{ dayKey: string; label: string; date: string; isoDate: string; isToday: boolean }> {
  const nowUtc = new Date();
  const etMs = nowUtc.getTime() - 5 * 60 * 60 * 1000;
  const etNow = new Date(etMs);

  const dayOfWeek = etNow.getUTCDay();
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
    return { dayKey, label, date: `${month} ${day}`, isoDate: d.toISOString().slice(0, 10), isToday };
  });
}

const NEWS_PLACEHOLDER = [
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
  const weekDates = getWeekDates();
  const calData = getCalendarWeekday();

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

      {/* Day cards — client component, filters by asset context */}
      <CalendarDays calData={calData} weekDates={weekDates} />

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
