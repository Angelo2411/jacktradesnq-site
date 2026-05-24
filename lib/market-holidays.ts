// NYSE/US market full closures. Source: NYSE 2026 holiday calendar (verified).
export const MARKET_HOLIDAYS: Record<string, string> = {
  '2026-01-01': "New Year's Day",
  '2026-01-19': 'Martin Luther King Jr. Day',
  '2026-02-16': "Washington's Birthday",
  '2026-04-03': 'Good Friday',
  '2026-05-25': 'Memorial Day',
  '2026-06-19': 'Juneteenth',
  '2026-07-03': 'Independence Day (observed)',
  '2026-09-07': 'Labor Day',
  '2026-11-26': 'Thanksgiving',
  '2026-12-25': 'Christmas Day',
};
// Early closes (1:00pm ET).
export const MARKET_EARLY_CLOSE: Record<string, string> = {
  '2026-11-27': 'Day after Thanksgiving',
  '2026-12-24': 'Christmas Eve',
};
