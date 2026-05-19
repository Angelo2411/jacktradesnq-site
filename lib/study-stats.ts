import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'public', 'data');

type Trade = {
  ts: string;
  year: string | number;
  variant: string;
  smt: boolean;
  side: string;
  pnl_pts: number;
  outcome: string;
};

type Row = {
  year: string | number;
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
};

type IfvgJson = {
  meta?: Record<string, unknown>;
  rows?: Row[];
  trades?: Trade[];
};

function loadIfvgJson(slug: string): IfvgJson | null {
  const filename = slug.endsWith('-gc') ? slug.slice(0, -3) + '_gc.json' : `${slug}.json`;
  const p = path.join(dataDir, filename);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as IfvgJson;
  } catch {
    return null;
  }
}

export type StrategyStats = {
  slug: string;
  event: string;
  asset: string;
  pf: number;
  n: number;
  net: number;
  wr: number;
  bias: string;
  dateFrom: string;
  dateTo: string;
};

export type WeekdayStats = {
  n: number;
  w: number;
  net: number;
  wr: number;
};

export type WeekdayBreakdown = {
  mon: WeekdayStats;
  tue: WeekdayStats;
  wed: WeekdayStats;
  thu: WeekdayStats;
  fri: WeekdayStats;
};

// IFVG SMT slugs that have a trades[] array we can derive stats from
const IFVG_SLUGS: Array<{ slug: string; event: string; asset: string }> = [
  { slug: 'cpi-ifvg-smt',                event: 'CPI',                  asset: 'NQ' },
  { slug: 'nfp-ifvg-smt',                event: 'NFP',                  asset: 'NQ' },
  { slug: 'ppi-ifvg-smt',                event: 'PPI',                  asset: 'NQ' },
  { slug: 'pce-ifvg-smt',                event: 'PCE',                  asset: 'NQ' },
  { slug: 'joblessclaims-ifvg-smt',      event: 'Jobless Claims',       asset: 'NQ' },
  { slug: 'retailsales-ifvg-smt',        event: 'Retail Sales',         asset: 'NQ' },
  { slug: 'empirestate-ifvg-smt',        event: 'Empire State',         asset: 'NQ' },
  { slug: 'employmentcostindex-ifvg-smt',event: 'Employment Cost',      asset: 'NQ' },
  { slug: 'gdp-ifvg-smt',               event: 'GDP',                  asset: 'NQ' },
  { slug: 'fomc-ifvg-smt',              event: 'FOMC',                 asset: 'NQ' },
  { slug: 'gc-ifvg-smt',                event: 'Multi-event',          asset: 'GC' },
  { slug: 'cpi-ifvg-smt-gc',                 event: 'CPI',             asset: 'GC' },
  { slug: 'nfp-ifvg-smt-gc',                 event: 'NFP',             asset: 'GC' },
  { slug: 'ppi-ifvg-smt-gc',                 event: 'PPI',             asset: 'GC' },
  { slug: 'pce-ifvg-smt-gc',                 event: 'PCE',             asset: 'GC' },
  { slug: 'gdp-ifvg-smt-gc',                 event: 'GDP',             asset: 'GC' },
  { slug: 'joblessclaims-ifvg-smt-gc',       event: 'Jobless Claims',  asset: 'GC' },
  { slug: 'retailsales-ifvg-smt-gc',         event: 'Retail Sales',    asset: 'GC' },
  { slug: 'empirestate-ifvg-smt-gc',         event: 'Empire State',    asset: 'GC' },
  { slug: 'employmentcostindex-ifvg-smt-gc', event: 'Employment Cost', asset: 'GC' },
];

function computeIfvgStats(
  json: IfvgJson,
  slugEntry: { slug: string; event: string; asset: string },
  variant: 'tp1_be' | 'be_50' | 'no_be' = 'tp1_be',
): StrategyStats {
  const trades = (json.trades ?? []).filter(
    (t) => t.smt === true && t.variant === variant
  );
  const n = trades.length;
  const wins = trades.filter((t) => t.outcome === 'win').length;
  const net = trades.reduce((s, t) => s + t.pnl_pts, 0);
  const wr = n > 0 ? wins / n : 0;
  const winPnl = trades.filter((t) => t.pnl_pts > 0).reduce((s, t) => s + t.pnl_pts, 0);
  const lossPnl = Math.abs(trades.filter((t) => t.pnl_pts < 0).reduce((s, t) => s + t.pnl_pts, 0));
  const pf = lossPnl > 0 ? winPnl / lossPnl : winPnl > 0 ? 99 : 0;
  const meta = json.meta as Record<string, string> | undefined;
  const dateFrom = meta?.date_from ?? '';
  const dateTo = meta?.date_to ?? '';

  // Simple bias: if more long trades win than short, bias is Long
  const longs = trades.filter((t) => t.side === 'LONG');
  const shorts = trades.filter((t) => t.side === 'SHORT');
  const longWr = longs.length > 0 ? longs.filter((t) => t.outcome === 'win').length / longs.length : 0;
  const shortWr = shorts.length > 0 ? shorts.filter((t) => t.outcome === 'win').length / shorts.length : 0;
  const bias = longWr > shortWr + 0.05 ? 'Long' : shortWr > longWr + 0.05 ? 'Short' : 'Both';

  return {
    slug: slugEntry.slug,
    event: slugEntry.event,
    asset: slugEntry.asset,
    pf: Math.round(pf * 100) / 100,
    n,
    net: Math.round(net * 10) / 10,
    wr: Math.round(wr * 100),
    bias,
    dateFrom,
    dateTo,
  };
}

let _stratCache: StrategyStats[] | null = null;

export function getAllStrategyStats(): StrategyStats[] {
  if (_stratCache) return _stratCache;
  const results: StrategyStats[] = [];
  for (const entry of IFVG_SLUGS) {
    const json = loadIfvgJson(entry.slug);
    if (!json) continue;
    const stats = computeIfvgStats(json, entry);
    if (stats.n > 0) results.push(stats);
  }
  _stratCache = results;
  return results;
}

export function getStrategyStats(slug: string): StrategyStats | null {
  return getAllStrategyStats().find((s) => s.slug === slug) ?? null;
}

export function getStrategyStatsByVariant(slug: string): { tp1_be: StrategyStats; be_50: StrategyStats; no_be: StrategyStats } | null {
  const entry = IFVG_SLUGS.find((e) => e.slug === slug);
  if (!entry) return null;
  const json = loadIfvgJson(slug);
  if (!json) return null;
  return {
    tp1_be: computeIfvgStats(json, entry, 'tp1_be'),
    be_50:  computeIfvgStats(json, entry, 'be_50'),
    no_be:  computeIfvgStats(json, entry, 'no_be'),
  };
}

export type MarketStudyStats = {
  slug: string;
  title: string;
  asset: string;
  headline: string;
  sample: string;
  detail: string;
};

export function getMarketStudyStats(): MarketStudyStats[] {
  const results: MarketStudyStats[] = [];

  // nwog-gc
  const nwogPath = path.join(dataDir, 'nwog-gc.json');
  if (fs.existsSync(nwogPath)) {
    const d = JSON.parse(fs.readFileSync(nwogPath, 'utf-8'));
    const fillPct = d.summary?.direct_pct
      ? `${(d.summary.direct_pct * 100).toFixed(1)}%`
      : '86.5%';
    results.push({
      slug: 'asia-open',
      title: 'Asia Open NWOG',
      asset: 'GC',
      headline: `${fillPct} fill in ${d.directWindowMinutes ?? 30} min`,
      sample: `${d.totalEvents ?? 155} events`,
      detail: 'New Week Opening Gap fill rate · 10y',
    });
  }

  // killzone-gc
  const kzPath = path.join(dataDir, 'killzone-gc.json');
  if (fs.existsSync(kzPath)) {
    const d = JSON.parse(fs.readFileSync(kzPath, 'utf-8'));
    const asia = (d.overall ?? []).find((k: { killzone: string }) => k.killzone === 'Asia');
    results.push({
      slug: 'killzone-past-vs-now',
      title: 'Killzone Ranges',
      asset: 'GC',
      headline: asia ? `${asia.avgRange.toFixed(1)} pts avg Asia range` : '13.2 pts avg Asia range',
      sample: `${asia?.n ?? 2671} sessions`,
      detail: 'Killzone OHLC stats · 10y',
    });
  }

  // cpi event bars
  const cpiEbPath = path.join(dataDir, 'cpi_event_bars.json');
  if (fs.existsSync(cpiEbPath)) {
    const d = JSON.parse(fs.readFileSync(cpiEbPath, 'utf-8'));
    const events = Array.isArray(d) ? d : d.events ?? [];
    results.push({
      slug: 'cpi-day-stats',
      title: 'CPI Event Bars',
      asset: 'NQ',
      headline: `${events.length} CPI releases charted`,
      sample: `${events.length} events`,
      detail: 'Per-release bar chart · 10y',
    });
  }

  // nfp event bars
  const nfpEbPath = path.join(dataDir, 'nfp_event_bars.json');
  if (fs.existsSync(nfpEbPath)) {
    const d = JSON.parse(fs.readFileSync(nfpEbPath, 'utf-8'));
    const events = Array.isArray(d) ? d : d.events ?? [];
    results.push({
      slug: 'nfp',
      title: 'NFP Event Bars',
      asset: 'NQ',
      headline: `${events.length} NFP releases charted`,
      sample: `${events.length} events`,
      detail: 'Per-release bar chart · 10y',
    });
  }

  // fomc event bars
  const fomcEbPath = path.join(dataDir, 'fomc_event_bars.json');
  if (fs.existsSync(fomcEbPath)) {
    const d = JSON.parse(fs.readFileSync(fomcEbPath, 'utf-8'));
    const events = Array.isArray(d) ? d : d.events ?? [];
    results.push({
      slug: 'fomc-day-stats',
      title: 'FOMC Event Bars',
      asset: 'NQ',
      headline: `${events.length} FOMC releases charted`,
      sample: `${events.length} events`,
      detail: 'Per-release bar chart · 10y',
    });
  }

  return results;
}

// Event name → IFVG SMT slug mapping (NQ only for now; GC mapped later)
const EVENT_SLUG_MAP: Record<string, string | null> = {
  'CPI':                        'cpi-ifvg-smt',
  'NFP':                        'nfp-ifvg-smt',
  'Non-Farm Payrolls':          'nfp-ifvg-smt',
  'PPI':                        'ppi-ifvg-smt',
  'PCE':                        'pce-ifvg-smt',
  'Jobless Claims':             'joblessclaims-ifvg-smt',
  'Retail Sales':               'retailsales-ifvg-smt',
  'Empire State Manufacturing': 'empirestate-ifvg-smt',
  'Employment Cost Index':      'employmentcostindex-ifvg-smt',
  'GDP':                        'gdp-ifvg-smt',
  'FOMC Minutes':               null,
  'FOMC Statement':             'fomc-ifvg-smt',
  'Federal Funds Rate':         'fomc-ifvg-smt',
};

export type EventStudyStats = {
  slug: string;
  pf: number;
  n: number;
  net: number;
  wr: number;
  asset: string;
};

export function getEventStudyMap(
  news: Array<{ event: string }>
): Record<string, EventStudyStats | null> {
  const map: Record<string, EventStudyStats | null> = {};
  for (const item of news) {
    if (!(item.event in map)) {
      map[item.event] = getStudyForEvent(item.event);
    }
  }
  return map;
}

export function getStudyForEvent(eventName: string): EventStudyStats | null {
  const slug = EVENT_SLUG_MAP[eventName];
  if (slug === undefined) return null; // unknown event — treat same as no study
  if (slug === null) return null;       // known event, no study yet
  const stats = getStrategyStats(slug);
  if (!stats) return null;
  return { slug, pf: stats.pf, n: stats.n, net: stats.net, wr: stats.wr, asset: stats.asset };
}

// Returns weekday breakdown for an IFVG SMT slug (tp1_be smt=True)
// Day 0 = Monday (Python weekday: Mon=0 ... Fri=4)
export function getWeekdayBreakdown(slug: string, smtOn = true): WeekdayBreakdown {
  const empty: WeekdayStats = { n: 0, w: 0, net: 0, wr: 0 };
  const acc: Record<number, { n: number; w: number; net: number }> = {
    0: { n: 0, w: 0, net: 0 },
    1: { n: 0, w: 0, net: 0 },
    2: { n: 0, w: 0, net: 0 },
    3: { n: 0, w: 0, net: 0 },
    4: { n: 0, w: 0, net: 0 },
  };

  const json = loadIfvgJson(slug);
  if (!json) return { mon: empty, tue: empty, wed: empty, thu: empty, fri: empty };

  const trades = (json.trades ?? []).filter(
    (t) => t.variant === 'tp1_be' && (smtOn ? t.smt === true : true)
  );

  for (const t of trades) {
    if (!t.ts) continue;
    // ts is ISO timestamp string like "2016-04-19T12:30:00+00:00"
    const d = new Date(t.ts);
    // Convert to ET: ET = UTC-5 (EST) or UTC-4 (EDT)
    // Use UTC date shifted by ET offset approximation
    // For weekday, we look at ET date. ET = UTC - 4 or 5 hours.
    // The release is always at 8:30 ET, so UTC time is 12:30 or 13:30.
    // We subtract 5h to get approximate ET date for weekday.
    const etMs = d.getTime() - 5 * 60 * 60 * 1000;
    const etDate = new Date(etMs);
    // getDay() returns 0=Sun, 1=Mon ... 5=Fri, 6=Sat
    const dayJs = etDate.getUTCDay(); // use UTC since we manually shifted
    // Map JS day (1=Mon..5=Fri) to 0=Mon..4=Fri
    const day = dayJs - 1; // Mon=0, Fri=4
    if (day < 0 || day > 4) continue; // skip weekends
    acc[day].n++;
    if (t.outcome === 'win') acc[day].w++;
    acc[day].net += t.pnl_pts;
  }

  const toStat = (d: { n: number; w: number; net: number }): WeekdayStats => ({
    n: d.n,
    w: d.w,
    net: Math.round(d.net * 10) / 10,
    wr: d.n > 0 ? Math.round((d.w / d.n) * 100) : 0,
  });

  return {
    mon: toStat(acc[0]),
    tue: toStat(acc[1]),
    wed: toStat(acc[2]),
    thu: toStat(acc[3]),
    fri: toStat(acc[4]),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Year breakdown
// ─────────────────────────────────────────────────────────────────────────────

export type YearStats = { year: number; n: number; w: number; net: number; wr: number; pf: number };
export type YearBreakdown = YearStats[]; // sorted asc by year

export function getYearBreakdown(slug: string, smtOn = true): YearBreakdown {
  const json = loadIfvgJson(slug);
  if (!json) return [];

  const trades = (json.trades ?? []).filter(
    (t) => t.variant === 'tp1_be' && (smtOn ? t.smt === true : true)
  );

  const acc: Record<number, { n: number; w: number; winPts: number; lossPts: number; net: number }> = {};

  for (const t of trades) {
    const yr = typeof t.year === 'number' ? t.year : (t.year ? Number(t.year) : new Date(t.ts).getUTCFullYear());
    if (!acc[yr]) acc[yr] = { n: 0, w: 0, winPts: 0, lossPts: 0, net: 0 };
    acc[yr].n++;
    if (t.outcome === 'win') {
      acc[yr].w++;
      acc[yr].winPts += t.pnl_pts;
    } else if (t.outcome === 'loss') {
      acc[yr].lossPts += Math.abs(t.pnl_pts);
    }
    acc[yr].net += t.pnl_pts;
  }

  return Object.entries(acc)
    .map(([yr, d]) => {
      const pf = d.lossPts > 0 ? d.winPts / d.lossPts : d.winPts > 0 ? 99 : 0;
      return {
        year: Number(yr),
        n: d.n,
        w: d.w,
        net: Math.round(d.net * 10) / 10,
        wr: d.n > 0 ? Math.round((d.w / d.n) * 100) : 0,
        pf: Math.round(pf * 100) / 100,
      };
    })
    .sort((a, b) => a.year - b.year);
}

// ─────────────────────────────────────────────────────────────────────────────
// Trade list
// ─────────────────────────────────────────────────────────────────────────────

export type TradeRow = {
  ts: string;
  year: number;
  side: string;
  pnl_pts: number;
  outcome: string;
  entry_price?: number;
  sl_price?: number;
  tp_price?: number;
  entry_ts?: string;
  exit_ts?: string;
  exit_price?: number;
  data_high?: number;
  data_low?: number;
  sweep_ts?: string;
  sweep_side?: 'UP' | 'DOWN';
  ifvg_top?: number;
  ifvg_bottom?: number;
  ifvg_formation_ts?: string;
};

type PriceOverlayRow = {
  ts: string;
  entry_ts: string;
  variant: string;
  smt: boolean;
  side: string;
  entry_price: number;
  sl_price: number;
  tp_price: number;
  exit_ts: string;
  exit_price: number;
  data_high?: number;
  data_low?: number;
  sweep_ts?: string;
  sweep_side?: 'UP' | 'DOWN';
  ifvg_top?: number;
  ifvg_bottom?: number;
  ifvg_formation_ts?: string;
};

type PriceOverlayFile = {
  prices: PriceOverlayRow[];
};

type PriceFields = Pick<PriceOverlayRow, 'entry_price' | 'sl_price' | 'tp_price' | 'entry_ts' | 'exit_ts' | 'exit_price'> & {
  data_high?: number;
  data_low?: number;
  sweep_ts?: string;
  sweep_side?: 'UP' | 'DOWN';
  ifvg_top?: number;
  ifvg_bottom?: number;
  ifvg_formation_ts?: string;
};

function normTs(ts: string): string {
  try { return new Date(ts).toISOString(); } catch { return ts; }
}

function loadPriceOverlay(slug: string): Map<string, PriceFields> | null {
  const overlaySlug = slug;
  const p = path.join(dataDir, `${overlaySlug}-trade-prices.json`);
  if (!fs.existsSync(p)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf-8')) as PriceOverlayFile;
    const map = new Map<string, PriceFields>();
    for (const row of data.prices ?? []) {
      const key = `${normTs(row.ts)}|${row.variant}|${String(row.smt)}|${String(row.side).toLowerCase()}`;
      map.set(key, {
        entry_price: row.entry_price,
        sl_price: row.sl_price,
        tp_price: row.tp_price,
        entry_ts: row.entry_ts,
        exit_ts: row.exit_ts,
        exit_price: row.exit_price,
        data_high: row.data_high,
        data_low: row.data_low,
        sweep_ts: row.sweep_ts,
        sweep_side: row.sweep_side,
        ifvg_top: row.ifvg_top,
        ifvg_bottom: row.ifvg_bottom,
        ifvg_formation_ts: row.ifvg_formation_ts,
      });
    }
    return map;
  } catch {
    return null;
  }
}

export function getTradeList(slug: string, smtOn = true, variant: 'tp1_be' | 'be_50' | 'no_be' = 'tp1_be'): TradeRow[] {
  const json = loadIfvgJson(slug);
  if (!json) return [];

  const overlay = loadPriceOverlay(slug);

  return (json.trades ?? [])
    .filter((t) => t.variant === variant && (smtOn ? t.smt === true : true))
    .map((t) => {
      const sideNorm = t.side.toLowerCase();
      const priceFields: Partial<PriceFields> = overlay
        ? (overlay.get(`${normTs(t.ts)}|${t.variant}|${String(t.smt)}|${sideNorm}`) ?? {})
        : {};
      return {
        ts: t.ts,
        year: typeof t.year === 'number' ? t.year : Number(t.year) || new Date(t.ts).getUTCFullYear(),
        side: sideNorm,
        pnl_pts: Math.round(t.pnl_pts * 100) / 100,
        outcome: t.outcome,
        ...priceFields,
      };
    })
    .sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));
}

// Returns top strategies per weekday (for Calendar view)
// Returns for each day (mon..fri) the top 2 strategies by N*WR score
export type CalendarDayEntry = {
  slug: string;
  name: string;
  asset: string;
  n: number;
  wr: number;
  net: number;
};

export function getCalendarWeekday(): Record<string, CalendarDayEntry[]> {
  const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const result: Record<string, CalendarDayEntry[]> = {
    mon: [], tue: [], wed: [], thu: [], fri: [],
  };

  // For each IFVG slug, compute weekday breakdown and rank by score
  const candidates: Array<{
    slug: string;
    name: string;
    asset: string;
    day: string;
    n: number;
    wr: number;
    net: number;
    score: number;
  }> = [];

  for (const entry of IFVG_SLUGS) {
    // Skip multi-event aggregate (gc-ifvg-smt covers all 9 events, not day-specific)
    if (entry.slug === 'gc-ifvg-smt') continue;
    const json = loadIfvgJson(entry.slug);
    if (!json || !json.trades?.length) continue;

    const bd = getWeekdayBreakdown(entry.slug, true);
    for (const [i, dayKey] of DAY_KEYS.entries()) {
      const stats = bd[dayKey as keyof WeekdayBreakdown];
      if (stats.n < 2) continue; // skip days with < 2 trades
      if (stats.net <= 0) continue; // skip losing days
      const score = stats.n * (stats.wr / 100);
      candidates.push({
        slug: entry.slug,
        name: `${entry.event} IFVG+SMT`,
        asset: entry.asset,
        day: dayKey,
        n: stats.n,
        wr: stats.wr,
        net: stats.net,
        score,
      });
      void i;
    }
  }

  // Sort candidates by score desc, pick top 2 per day
  candidates.sort((a, b) => b.score - a.score);
  for (const c of candidates) {
    if (result[c.day].length < 2) {
      result[c.day].push({ slug: c.slug, name: c.name, asset: c.asset, n: c.n, wr: c.wr, net: c.net });
    }
  }

  return result;
}
