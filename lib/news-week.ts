import type { EventStudyStats } from './study-stats';

export type RedEvent = {
  time: string;
  event: string;
  study: EventStudyStats | null;
};

export type NewsItem = {
  day: string;   // e.g. "Wed 21"
  time: string;
  event: string;
  imp: string;
};

// Pure client-safe helper: compute current week Mon-Fri dates in ET.
export function getWeekDates(): Array<{
  dayKey: string;
  label: string;
  date: string;
  isToday: boolean;
}> {
  const DAYS = [
    { dayKey: 'mon', label: 'Mon' },
    { dayKey: 'tue', label: 'Tue' },
    { dayKey: 'wed', label: 'Wed' },
    { dayKey: 'thu', label: 'Thu' },
    { dayKey: 'fri', label: 'Fri' },
  ];

  const nowUtc = new Date();
  const etMs = nowUtc.getTime() - 5 * 60 * 60 * 1000;
  const etNow = new Date(etMs);

  const dayOfWeek = etNow.getUTCDay(); // 0=Sun,1=Mon,...,6=Sat
  // If weekend, show next week's Mon; otherwise current week's Mon
  const daysFromMon =
    dayOfWeek === 0 ? 1          // Sun → next Mon (+1)
    : dayOfWeek === 6 ? 2        // Sat → next Mon (+2)
    : 1 - dayOfWeek;             // Mon-Fri → this Mon

  const monday = new Date(etNow.getTime() + daysFromMon * 24 * 60 * 60 * 1000);

  return DAYS.map(({ dayKey, label }, i) => {
    const d = new Date(monday.getTime() + i * 24 * 60 * 60 * 1000);
    const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const day = d.getUTCDate();
    const isToday =
      d.getUTCFullYear() === etNow.getUTCFullYear() &&
      d.getUTCMonth() === etNow.getUTCMonth() &&
      d.getUTCDate() === etNow.getUTCDate();
    return { dayKey, label, date: `${month} ${day}`, isToday };
  });
}

// Whitelist of true red-folder events for NQ/GC. Crude Oil, PMI, Philly Fed
// etc. are flagged "High" by the upstream feed but not relevant for our setups.
export const RED_FOLDER_WHITELIST = new Set([
  // ── Backtested (10 canonical) ─────────────────────────────────────────────
  'CPI', 'Core CPI',
  'NFP', 'Non-Farm Payrolls', 'Employment Situation',
  'PPI', 'Core PPI',
  'PCE', 'Core PCE',
  'GDP', 'GDP Advance', 'GDP (Advance)',
  'Jobless Claims', 'Initial Jobless Claims',
  'Retail Sales', 'Core Retail Sales',
  'Empire State Manufacturing Index', 'Empire State Manufacturing', 'Empire State',
  'Employment Cost Index',
  'FOMC Statement', 'FOMC Rate Decision', 'FOMC Press Conference', 'Fed Interest Rate Decision',
  'Federal Funds Rate', 'FOMC Minutes',
  // ── FF red folder (co-released w/ NFP dropped; orange events dropped) ─
  'ISM Manufacturing PMI',
  'ISM Services PMI', 'ISM Non-Manufacturing PMI',
  'ADP Non-Farm Employment Change',
  'JOLTS Job Openings',
  'CB Consumer Confidence',
  'Philadelphia Fed Manufacturing Index',
  'Durable Goods Orders', 'Core Durable Goods Orders',
]);

// Pure client-safe: match news items to week dates, attach study from map.
export function getRedFolderByDay(
  news: NewsItem[],
  weekDates: ReturnType<typeof getWeekDates>,
  studyMap: Record<string, EventStudyStats | null>
): Record<string, RedEvent[]> {
  const result: Record<string, RedEvent[]> = {
    mon: [], tue: [], wed: [], thu: [], fri: [],
  };

  for (const { dayKey, date } of weekDates) {
    // date = "May 21" → dayNum = "21"
    // NEWS day field format = "Wed 21" → compare only the numeric part
    const dayNum = date.split(' ')[1];

    const hits = news.filter((n) => {
      const newsDayNum = n.day.split(' ')[1];
      return newsDayNum === dayNum && n.imp === 'High' && RED_FOLDER_WHITELIST.has(n.event);
    });
    result[dayKey] = hits.map((n) => ({
      time: n.time,
      event: n.event,
      study: studyMap[n.event] ?? null,
    }));
  }

  return result;
}

