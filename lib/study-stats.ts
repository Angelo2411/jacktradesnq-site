import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content', 'backtested-data');
const dataDir = path.join(process.cwd(), 'public', 'data');

export type AssetType = 'NQ' | 'GC' | 'ES' | 'SI' | 'mixed';
export type FamilyType = 'News' | 'IB' | 'EMA' | 'Time' | 'Misc';
export type WindowType = 'Asia' | 'London' | 'NY 8:30' | 'NY 9:30';

export interface StudyStats {
  slug: string;
  title: string;
  asset: AssetType;
  family: FamilyType;
  window?: WindowType;
  pf: number;
  n: number;
  edgePts: number;
  wr: number;
  wrByWeekday: number[];
  nByWeekday: number[];
  bestVariant?: string;
  smt?: boolean;
  date: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function inferAsset(slug: string): AssetType {
  if (slug.startsWith('gc-')) return 'GC';
  if (slug.includes('-gc')) return 'GC';
  if (slug.includes('-es')) return 'ES';
  if (slug.includes('-si')) return 'SI';
  return 'NQ';
}

function inferFamily(slug: string, group?: string): FamilyType {
  if (group === '8:30 News Model') return 'News';
  const newsEvents = [
    'cpi', 'nfp', 'ppi', 'pce', 'gdp', 'joblessclaims', 'empirestate',
    'employmentcostindex', 'retailsales', 'gc-ifvg',
  ];
  for (const ev of newsEvents) {
    if (slug.startsWith(ev) || slug.includes(ev)) return 'News';
  }
  if (slug.includes('killzone')) return 'Time';
  if (slug.includes('nwog') || slug.includes('asia-open')) return 'Time';
  if (slug.includes('ema')) return 'EMA';
  if (slug.includes('ib') || slug.includes('ib50')) return 'IB';
  if (slug.includes('straddle')) return 'News';
  return 'Misc';
}

function inferWindow(slug: string, family: FamilyType, group?: string): WindowType | undefined {
  if (group === '8:30 News Model') return 'NY 8:30';
  if (family === 'News') return 'NY 8:30';
  if (slug.includes('asia') || slug.includes('nwog')) return 'Asia';
  if (slug.includes('london')) return 'London';
  if (slug.includes('930') || slug.includes('9-30')) return 'NY 9:30';
  return undefined;
}

// Compute weekday WR from a trades array
function computeWeekdayWR(trades: Array<{ ts: string; outcome: string }>): {
  wrByWeekday: number[];
  nByWeekday: number[];
} {
  const wins = [0, 0, 0, 0, 0];
  const ns = [0, 0, 0, 0, 0];
  for (const t of trades) {
    const dt = new Date(t.ts);
    const wd = dt.getUTCDay(); // 0=Sun
    const idx = wd - 1; // Mon=0..Fri=4
    if (idx < 0 || idx > 4) continue;
    ns[idx]++;
    if (t.outcome === 'win') wins[idx]++;
  }
  const wrByWeekday = ns.map((n, i) => (n > 0 ? Math.round((wins[i] / n) * 100) : 0));
  return { wrByWeekday, nByWeekday: ns };
}

// ── IFVG-SMT shape ────────────────────────────────────────────────────────────

interface IfvgRow {
  year: string;
  variant: string;
  smt: boolean;
  side: string;
  n: number;
  w: number;
  l: number;
  be: number;
  wr: number;
  pf: number;
  net_pts: number;
  avg_win: number;
  avg_loss: number;
}

interface IfvgTrade {
  ts: string;
  year: number;
  variant: string;
  smt: boolean;
  side: string;
  pnl_pts: number;
  outcome: string;
}

interface IfvgJson {
  meta?: Record<string, unknown>;
  rows: IfvgRow[];
  trades: IfvgTrade[];
}

function processIfvgSmt(data: IfvgJson): Pick<StudyStats, 'pf' | 'n' | 'edgePts' | 'wr' | 'wrByWeekday' | 'nByWeekday' | 'bestVariant' | 'smt'> {
  const { rows, trades } = data;

  // Group rows by (variant, smt), compute aggregate N for BOTH side
  type GroupKey = string;
  const groupN = new Map<GroupKey, number>();
  for (const r of rows) {
    if (r.side !== 'BOTH') continue;
    const key = `${r.variant}|${r.smt}`;
    groupN.set(key, (groupN.get(key) ?? 0) + r.n);
  }

  // For each group with N>=10, compute PF from trades
  let bestPf = 0;
  let bestKey: GroupKey | null = null;

  for (const [key, totalN] of groupN.entries()) {
    if (totalN < 10) continue;
    const [variant, smtStr] = key.split('|');
    const smtBool = smtStr === 'true';
    const groupTrades = trades.filter(
      (t) => t.variant === variant && t.smt === smtBool,
    );
    const winSum = groupTrades
      .filter((t) => t.outcome === 'win')
      .reduce((s, t) => s + t.pnl_pts, 0);
    const lossSum = groupTrades
      .filter((t) => t.outcome === 'loss')
      .reduce((s, t) => s + Math.abs(t.pnl_pts), 0);
    if (lossSum === 0) continue;
    const pf = winSum / lossSum;
    if (pf > bestPf) {
      bestPf = pf;
      bestKey = key;
    }
  }

  if (!bestKey) {
    return {
      pf: 0, n: 0, edgePts: 0, wr: 0,
      wrByWeekday: [0, 0, 0, 0, 0],
      nByWeekday: [0, 0, 0, 0, 0],
    };
  }

  const [variant, smtStr] = bestKey.split('|');
  const smtBool = smtStr === 'true';
  const bestTrades = trades.filter(
    (t) => t.variant === variant && t.smt === smtBool,
  );
  const n = bestTrades.length;
  const wins = bestTrades.filter((t) => t.outcome === 'win');
  const wr = n > 0 ? Math.round((wins.length / n) * 100) : 0;
  const edgePts = Math.round(bestTrades.reduce((s, t) => s + t.pnl_pts, 0));
  const { wrByWeekday, nByWeekday } = computeWeekdayWR(bestTrades);

  return {
    pf: Math.round(bestPf * 100) / 100,
    n,
    edgePts,
    wr,
    wrByWeekday,
    nByWeekday,
    bestVariant: variant,
    smt: smtBool,
  };
}

// ── Straddle shape ────────────────────────────────────────────────────────────

interface StraddleRow {
  stop_pts: number;
  tp_pts: number;
  events_total: number;
  fill_rate: number;
  tp_hit_rate: number;
  avg_pnl_per_event: number;
}

interface StraddleJson {
  ranked?: StraddleRow[];
  best?: StraddleRow;
}

function processStraddle(data: StraddleJson, n_events_hint?: number): Pick<StudyStats, 'pf' | 'n' | 'edgePts' | 'wr' | 'wrByWeekday' | 'nByWeekday' | 'bestVariant'> {
  const rows = data.ranked ?? [];
  const eligible = rows.filter((r) => r.events_total >= 10);
  if (!eligible.length) {
    return {
      pf: 0, n: 0, edgePts: 0, wr: 0,
      wrByWeekday: [0, 0, 0, 0, 0],
      nByWeekday: [0, 0, 0, 0, 0],
    };
  }
  const best = eligible[0];
  // PF approximation: (tp_rate * tp_pts) / ((fill_rate - tp_rate) * stop_pts)
  const fillRate = best.fill_rate / 100;
  const tpRate = best.tp_hit_rate / 100;
  const stopRate = fillRate - tpRate;
  let pf = 0;
  if (stopRate > 0 && tpRate > 0) {
    pf = (tpRate * best.tp_pts) / (stopRate * best.stop_pts);
  }
  const edgePts = Math.round(best.avg_pnl_per_event * (best.events_total));
  const n = best.events_total;
  const wr = Math.round(tpRate * 100);

  return {
    pf: Math.round(pf * 100) / 100,
    n,
    edgePts,
    wr,
    wrByWeekday: [0, 0, 0, 0, 0],
    nByWeekday: [0, 0, 0, 0, 0],
    bestVariant: `stop ${best.stop_pts}pt / tp ${best.tp_pts}pt`,
  };
}

// ── NWOG shape ────────────────────────────────────────────────────────────────

interface NwogJson {
  totalEvents?: number;
  summary?: {
    direct?: { count: number; pct: number };
    later?: { count: number; pct: number };
    held?: { count: number; pct: number };
  };
}

function processNwog(data: NwogJson): Pick<StudyStats, 'pf' | 'n' | 'edgePts' | 'wr' | 'wrByWeekday' | 'nByWeekday'> {
  const n = data.totalEvents ?? 0;
  const directPct = data.summary?.direct?.pct ?? 0;
  return {
    pf: directPct > 80 ? parseFloat((directPct / 20).toFixed(2)) : 0,
    n,
    edgePts: 0,
    wr: Math.round(directPct),
    wrByWeekday: [0, 0, 0, 0, 0],
    nByWeekday: [0, 0, 0, 0, 0],
  };
}

// ── Killzone shape ────────────────────────────────────────────────────────────

interface KillzoneRow {
  killzone: string;
  n: number;
  avgRange: number;
  medRange: number;
  avgMove: number;
}

interface KillzoneJson {
  overall?: KillzoneRow[];
}

function processKillzone(data: KillzoneJson): Pick<StudyStats, 'pf' | 'n' | 'edgePts' | 'wr' | 'wrByWeekday' | 'nByWeekday'> {
  const rows = data.overall ?? [];
  const total = rows.reduce((s, r) => s + r.n, 0);
  if (!total) {
    return {
      pf: 0, n: 0, edgePts: 0, wr: 0,
      wrByWeekday: [0, 0, 0, 0, 0],
      nByWeekday: [0, 0, 0, 0, 0],
    };
  }
  const avgRange = rows.reduce((s, r) => s + r.avgRange * r.n, 0) / total;
  return {
    pf: 0,
    n: total,
    edgePts: Math.round(avgRange),
    wr: 0,
    wrByWeekday: [0, 0, 0, 0, 0],
    nByWeekday: [0, 0, 0, 0, 0],
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function loadJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function processOneSlug(slug: string): StudyStats | null {
  const metaPath = path.join(contentDir, slug, 'meta.json');
  if (!fs.existsSync(metaPath)) return null;

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as {
    title: string;
    titleNq?: string;
    category: string;
    date: string;
    group?: string;
  };

  const title = meta.titleNq ?? meta.title;
  const group = meta.group;
  const date = meta.date;
  const family = inferFamily(slug, group);
  const asset = inferAsset(slug);
  const window = inferWindow(slug, family, group);

  // Try to load JSON data
  // Priority: exact slug, then slug + _nq variant, then gc variant
  const jsonPath = path.join(dataDir, `${slug}.json`);
  const jsonData = loadJson<Record<string, unknown>>(jsonPath);

  let stats: Pick<StudyStats, 'pf' | 'n' | 'edgePts' | 'wr' | 'wrByWeekday' | 'nByWeekday' | 'bestVariant' | 'smt'>;

  const asUnknown = jsonData as unknown;
  if (jsonData && Array.isArray((asUnknown as IfvgJson).rows) && Array.isArray((asUnknown as IfvgJson).trades)) {
    stats = processIfvgSmt(asUnknown as IfvgJson);
  } else if (jsonData && Array.isArray((asUnknown as StraddleJson).ranked)) {
    stats = processStraddle(asUnknown as StraddleJson);
  } else if (jsonData && typeof (asUnknown as NwogJson).totalEvents === 'number') {
    stats = processNwog(asUnknown as NwogJson);
  } else if (jsonData && Array.isArray((asUnknown as KillzoneJson).overall)) {
    stats = processKillzone(asUnknown as KillzoneJson);
  } else {
    // No JSON data — return zeroed card
    stats = {
      pf: 0, n: 0, edgePts: 0, wr: 0,
      wrByWeekday: [0, 0, 0, 0, 0],
      nByWeekday: [0, 0, 0, 0, 0],
    };
  }

  return {
    slug,
    title,
    asset,
    family,
    window,
    date,
    ...stats,
  };
}

export function getAllStudyStats(): StudyStats[] {
  if (!fs.existsSync(contentDir)) return [];

  const slugs = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  return slugs
    .map((slug) => {
      try {
        return processOneSlug(slug);
      } catch {
        return null;
      }
    })
    .filter((s): s is StudyStats => s !== null);
}
