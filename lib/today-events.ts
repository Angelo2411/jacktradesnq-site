import fs from 'fs';
import path from 'path';
import type { StudyStats } from './study-stats';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DayEvent = {
  event: string;          // "CPI", "NFP", "PPI", "Empire State", ...
  time: string;           // "8:30 ET"
  freq10y: number;        // count of occurrences on this dow in last 10y
  linkedSlug?: string;    // matching study slug e.g. "cpi-ifvg-smt"
  edgeOnDow?: {
    pf: number;
    n: number;
    wr: number;
    edgePts: number;
  } | null;
};

export type KillzoneByDow = {
  session: string;        // "Asia" | "London" | "NY AM" | "NY PM"
  avgRange: number;
  medRange: number;
  n: number;
};

export type DayPlaybook = {
  dow: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  dowLabel: string;       // "Monday"
  events: DayEvent[];
  killzone: KillzoneByDow[];
};

// ── Internal shapes from news_calendar.json ───────────────────────────────────

interface CalendarDay {
  dow: number;
  dowLabel: string;
  events: Array<{
    event: string;
    time: string;
    freq10y: number;
    linkedSlug: string | null;
  }>;
}

// ── Internal shape from killzone-gc.json ─────────────────────────────────────

interface KzDowEntry {
  dow: string;   // "Mon", "Tue", etc.
  n: number;
  avgRange: number;
  medRange: number;
}

interface KillzoneGcJson {
  byDow?: Record<string, KzDowEntry[]>;
}

// ── Map JS getDay() day-index to killzone JSON dow strings ────────────────────

const DOW_TO_STR: Record<number, string> = {
  0: 'Mon', 1: 'Tue', 2: 'Wed', 3: 'Thu', 4: 'Fri',
};

// ── Build weekly playbook ─────────────────────────────────────────────────────

export function getWeeklyPlaybook(allStats: StudyStats[]): DayPlaybook[] {
  const dataDir = path.join(process.cwd(), 'public', 'data');

  // Load news calendar
  const calPath = path.join(dataDir, 'news_calendar.json');
  let calDays: CalendarDay[] = [];
  if (fs.existsSync(calPath)) {
    try {
      calDays = JSON.parse(fs.readFileSync(calPath, 'utf-8')) as CalendarDay[];
    } catch { /* ignore */ }
  }

  // Load killzone data (prefer NQ if exists, else GC)
  const kzNqPath = path.join(dataDir, 'killzone.json');
  const kzGcPath = path.join(dataDir, 'killzone-gc.json');
  let kzJson: KillzoneGcJson | null = null;
  if (fs.existsSync(kzNqPath)) {
    try { kzJson = JSON.parse(fs.readFileSync(kzNqPath, 'utf-8')) as KillzoneGcJson; } catch { /* ignore */ }
  }
  if (!kzJson && fs.existsSync(kzGcPath)) {
    try { kzJson = JSON.parse(fs.readFileSync(kzGcPath, 'utf-8')) as KillzoneGcJson; } catch { /* ignore */ }
  }

  // Build stats lookup by slug
  const statsBySlug = new Map<string, StudyStats>();
  for (const s of allStats) {
    statsBySlug.set(s.slug, s);
  }

  // Build one DayPlaybook per Mon..Fri
  const playbook: DayPlaybook[] = [];

  for (let dowIndex = 0; dowIndex < 5; dowIndex++) {
    const calDay = calDays.find((d) => d.dow === dowIndex);
    const dowStr = DOW_TO_STR[dowIndex];

    // ── Events ──
    const events: DayEvent[] = (calDay?.events ?? []).map((raw) => {
      const dayEvent: DayEvent = {
        event: raw.event,
        time: raw.time,
        freq10y: raw.freq10y,
        linkedSlug: raw.linkedSlug ?? undefined,
      };

      if (raw.linkedSlug) {
        const study = statsBySlug.get(raw.linkedSlug);
        if (study && study.wrByWeekday && study.nByWeekday) {
          const n = study.nByWeekday[dowIndex] ?? 0;
          const wr = study.wrByWeekday[dowIndex] ?? 0;
          if (n >= 3) {
            dayEvent.edgeOnDow = {
              pf: study.pf,
              n,
              wr,
              edgePts: study.edgePts,
            };
          } else {
            dayEvent.edgeOnDow = null;
          }
        }
      }

      return dayEvent;
    });

    // ── Killzone ──
    const killzone: KillzoneByDow[] = [];
    if (kzJson?.byDow) {
      for (const [sessionLabel, entries] of Object.entries(kzJson.byDow)) {
        const entry = entries.find((e) => e.dow === dowStr);
        if (entry && entry.n > 0) {
          killzone.push({
            session: sessionLabel,
            avgRange: entry.avgRange,
            medRange: entry.medRange,
            n: entry.n,
          });
        }
      }
    }

    playbook.push({
      dow: dowIndex as 0 | 1 | 2 | 3 | 4,
      dowLabel: calDay?.dowLabel ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][dowIndex],
      events,
      killzone,
    });
  }

  return playbook;
}
