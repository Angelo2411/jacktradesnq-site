import fs from 'fs';
import path from 'path';
import type { NewsItem } from './news-week';

// Server-only loader. Reads public/data/news-week.json.
// Returns [] if file missing (graceful degradation).
export function loadNewsWeek(): NewsItem[] {
  const p = path.join(process.cwd(), 'public', 'data', 'news-week.json');
  if (!fs.existsSync(p)) return [];
  try {
    return (JSON.parse(fs.readFileSync(p, 'utf-8')) as { events?: NewsItem[] }).events ?? [];
  } catch {
    return [];
  }
}
