import fs from 'fs';
import path from 'path';
import type { NewsCalendarItem } from './news-calendar';

// Server-only loader for the multi-week calendar JSON.
// Returns [] if file missing (graceful degradation).
export function loadNewsCalendar(): NewsCalendarItem[] {
  const p = path.join(process.cwd(), 'public', 'data', 'news-calendar.json');
  if (!fs.existsSync(p)) return [];
  try {
    return (JSON.parse(fs.readFileSync(p, 'utf-8')) as { events?: NewsCalendarItem[] })
      .events ?? [];
  } catch {
    return [];
  }
}
