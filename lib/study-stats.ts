import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content', 'studies');
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
  releaseTime?: string;
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
const IFVG_SLUGS: Array<{ slug: string; event: string; asset: string; releaseTime?: string }> = [
  { slug: 'cpi-ifvg-smt',                event: 'CPI',                  asset: 'NQ' },
  { slug: 'nfp-ifvg-smt',                event: 'NFP',                  asset: 'NQ' },
  { slug: 'ppi-ifvg-smt',                event: 'PPI',                  asset: 'NQ' },
  { slug: 'pce-ifvg-smt',                event: 'PCE',                  asset: 'NQ' },
  { slug: 'joblessclaims-ifvg-smt',      event: 'Jobless Claims',       asset: 'NQ' },
  { slug: 'retailsales-ifvg-smt',        event: 'Retail Sales',         asset: 'NQ' },
  { slug: 'empirestate-ifvg-smt',        event: 'Empire State',         asset: 'NQ' },
  { slug: 'employmentcostindex-ifvg-smt',event: 'Employment Cost',      asset: 'NQ' },
  { slug: 'gdp-ifvg-smt',               event: 'GDP',                  asset: 'NQ' },
  { slug: 'fomc-ifvg-smt',              event: 'FOMC',                 asset: 'NQ', releaseTime: '14:00 ET' },
  { slug: 'adp-ifvg-smt',               event: 'ADP',                  asset: 'NQ', releaseTime: '8:15 ET' },
  { slug: 'jolts-ifvg-smt',             event: 'JOLTS',                asset: 'NQ', releaseTime: '10:00 ET' },
  { slug: 'ism-mfg-ifvg-smt',           event: 'ISM Manufacturing PMI', asset: 'NQ', releaseTime: '10:00 ET' },
  { slug: 'ism-services-ifvg-smt',      event: 'ISM Services PMI',      asset: 'NQ', releaseTime: '10:00 ET' },
  { slug: 'cb-confidence-ifvg-smt',     event: 'CB Consumer Confidence', asset: 'NQ', releaseTime: '10:00 ET' },
  { slug: 'philly-fed-ifvg-smt',        event: 'Philadelphia Fed Manufacturing', asset: 'NQ', releaseTime: '8:30 ET' },
  { slug: 'durable-goods-ifvg-smt',     event: 'Durable Goods Orders', asset: 'NQ', releaseTime: '8:30 ET' },
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
  { slug: 'fomc-ifvg-smt-gc',                event: 'FOMC',            asset: 'GC', releaseTime: '14:00 ET' },
  { slug: 'adp-ifvg-smt-gc',                 event: 'ADP',             asset: 'GC', releaseTime: '8:15 ET' },
  { slug: 'jolts-ifvg-smt-gc',               event: 'JOLTS',           asset: 'GC', releaseTime: '10:00 ET' },
  { slug: 'ism-mfg-ifvg-smt-gc',             event: 'ISM Manufacturing PMI', asset: 'GC', releaseTime: '10:00 ET' },
  { slug: 'ism-services-ifvg-smt-gc',        event: 'ISM Services PMI',      asset: 'GC', releaseTime: '10:00 ET' },
  { slug: 'cb-confidence-ifvg-smt-gc',       event: 'CB Consumer Confidence', asset: 'GC', releaseTime: '10:00 ET' },
  { slug: 'philly-fed-ifvg-smt-gc',          event: 'Philadelphia Fed Manufacturing', asset: 'GC', releaseTime: '8:30 ET' },
  { slug: 'durable-goods-ifvg-smt-gc',       event: 'Durable Goods Orders', asset: 'GC', releaseTime: '8:30 ET' },
  { slug: 'es-ifvg-smt',                event: 'Multi-event',          asset: 'ES' },
  { slug: 'cpi-ifvg-smt-es',                 event: 'CPI',             asset: 'ES' },
  { slug: 'nfp-ifvg-smt-es',                 event: 'NFP',             asset: 'ES' },
  { slug: 'ppi-ifvg-smt-es',                 event: 'PPI',             asset: 'ES' },
  { slug: 'pce-ifvg-smt-es',                 event: 'PCE',             asset: 'ES' },
  { slug: 'gdp-ifvg-smt-es',                 event: 'GDP',             asset: 'ES' },
  { slug: 'joblessclaims-ifvg-smt-es',       event: 'Jobless Claims',  asset: 'ES' },
  { slug: 'retailsales-ifvg-smt-es',         event: 'Retail Sales',    asset: 'ES' },
  { slug: 'empirestate-ifvg-smt-es',         event: 'Empire State',    asset: 'ES' },
  { slug: 'employmentcostindex-ifvg-smt-es', event: 'Employment Cost', asset: 'ES' },
  { slug: 'fomc-ifvg-smt-es',                event: 'FOMC',            asset: 'ES', releaseTime: '14:00 ET' },
  { slug: 'adp-ifvg-smt-es',                 event: 'ADP',             asset: 'ES', releaseTime: '8:15 ET' },
  { slug: 'jolts-ifvg-smt-es',               event: 'JOLTS',           asset: 'ES', releaseTime: '10:00 ET' },
  { slug: 'ism-mfg-ifvg-smt-es',             event: 'ISM Manufacturing PMI', asset: 'ES', releaseTime: '10:00 ET' },
  { slug: 'ism-services-ifvg-smt-es',        event: 'ISM Services PMI',      asset: 'ES', releaseTime: '10:00 ET' },
  { slug: 'cb-confidence-ifvg-smt-es',       event: 'CB Consumer Confidence', asset: 'ES', releaseTime: '10:00 ET' },
  { slug: 'philly-fed-ifvg-smt-es',          event: 'Philadelphia Fed Manufacturing', asset: 'ES', releaseTime: '8:30 ET' },
  { slug: 'durable-goods-ifvg-smt-es',       event: 'Durable Goods Orders', asset: 'ES', releaseTime: '8:30 ET' },
];

function computeIfvgStats(
  json: IfvgJson,
  slugEntry: { slug: string; event: string; asset: string; releaseTime?: string },
  variant: 'tp1_be' | 'be_50' | 'no_be' = 'tp1_be',
  smtOn = true,
): StrategyStats {
  const trades = (json.trades ?? []).filter(
    (t) => t.variant === variant && (smtOn ? t.smt === true : true)
  );
  const n = trades.length;
  const wins = trades.filter((t) => t.pnl_pts > 0).length;
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
  const longWr = longs.length > 0 ? longs.filter((t) => t.pnl_pts > 0).length / longs.length : 0;
  const shortWr = shorts.length > 0 ? shorts.filter((t) => t.pnl_pts > 0).length / shorts.length : 0;
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
    releaseTime: slugEntry.releaseTime,
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

export type VariantStatsTriplet = { tp1_be: StrategyStats; be_50: StrategyStats; no_be: StrategyStats };

export function getStrategyStatsByVariantAndSmt(slug: string): { smtOn: VariantStatsTriplet; smtOff: VariantStatsTriplet } | null {
  const entry = IFVG_SLUGS.find((e) => e.slug === slug);
  if (!entry) return null;
  const json = loadIfvgJson(slug);
  if (!json) return null;
  return {
    smtOn: {
      tp1_be: computeIfvgStats(json, entry, 'tp1_be', true),
      be_50:  computeIfvgStats(json, entry, 'be_50', true),
      no_be:  computeIfvgStats(json, entry, 'no_be', true),
    },
    smtOff: {
      tp1_be: computeIfvgStats(json, entry, 'tp1_be', false),
      be_50:  computeIfvgStats(json, entry, 'be_50', false),
      no_be:  computeIfvgStats(json, entry, 'no_be', false),
    },
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

// Event name → IFVG SMT slug mapping per asset (NQ + GC)
const EVENT_SLUG_MAP: Record<string, { nq: string | null; gc: string | null; es: string | null }> = {
  // ── Backtested (have IFVG SMT JSONs) ──────────────────────────────────────
  'CPI':                              { nq: 'cpi-ifvg-smt',                gc: 'cpi-ifvg-smt-gc',                es: 'cpi-ifvg-smt-es' },
  'Core CPI':                         { nq: 'cpi-ifvg-smt',                gc: 'cpi-ifvg-smt-gc',                es: 'cpi-ifvg-smt-es' },
  'NFP':                              { nq: 'nfp-ifvg-smt',                gc: 'nfp-ifvg-smt-gc',                es: 'nfp-ifvg-smt-es' },
  'Non-Farm Payrolls':                { nq: 'nfp-ifvg-smt',                gc: 'nfp-ifvg-smt-gc',                es: 'nfp-ifvg-smt-es' },
  'PPI':                              { nq: 'ppi-ifvg-smt',                gc: 'ppi-ifvg-smt-gc',                es: 'ppi-ifvg-smt-es' },
  'PCE':                              { nq: 'pce-ifvg-smt',                gc: 'pce-ifvg-smt-gc',                es: 'pce-ifvg-smt-es' },
  'Core PCE':                         { nq: 'pce-ifvg-smt',                gc: 'pce-ifvg-smt-gc',                es: 'pce-ifvg-smt-es' },
  'Jobless Claims':                   { nq: 'joblessclaims-ifvg-smt',      gc: 'joblessclaims-ifvg-smt-gc',      es: 'joblessclaims-ifvg-smt-es' },
  'Initial Jobless Claims':           { nq: 'joblessclaims-ifvg-smt',      gc: 'joblessclaims-ifvg-smt-gc',      es: 'joblessclaims-ifvg-smt-es' },
  'Retail Sales':                     { nq: 'retailsales-ifvg-smt',        gc: 'retailsales-ifvg-smt-gc',        es: 'retailsales-ifvg-smt-es' },
  'Core Retail Sales':                { nq: 'retailsales-ifvg-smt',        gc: 'retailsales-ifvg-smt-gc',        es: 'retailsales-ifvg-smt-es' },
  'Empire State Manufacturing':       { nq: 'empirestate-ifvg-smt',        gc: 'empirestate-ifvg-smt-gc',        es: 'empirestate-ifvg-smt-es' },
  'Empire State Manufacturing Index': { nq: 'empirestate-ifvg-smt',        gc: 'empirestate-ifvg-smt-gc',        es: 'empirestate-ifvg-smt-es' },
  'Employment Cost Index':            { nq: 'employmentcostindex-ifvg-smt',gc: 'employmentcostindex-ifvg-smt-gc',es: 'employmentcostindex-ifvg-smt-es' },
  'GDP':                              { nq: 'gdp-ifvg-smt',                gc: 'gdp-ifvg-smt-gc',                es: 'gdp-ifvg-smt-es' },
  'FOMC Statement':                   { nq: 'fomc-ifvg-smt',               gc: 'fomc-ifvg-smt-gc',               es: 'fomc-ifvg-smt-es' },
  'Federal Funds Rate':               { nq: 'fomc-ifvg-smt',               gc: 'fomc-ifvg-smt-gc',               es: 'fomc-ifvg-smt-es' },
  'ADP Non-Farm Employment Change':   { nq: 'adp-ifvg-smt',                gc: 'adp-ifvg-smt-gc',                es: 'adp-ifvg-smt-es' },
  'ADP':                              { nq: 'adp-ifvg-smt',                gc: 'adp-ifvg-smt-gc',                es: 'adp-ifvg-smt-es' },
  'JOLTS Job Openings':               { nq: 'jolts-ifvg-smt',              gc: 'jolts-ifvg-smt-gc',              es: 'jolts-ifvg-smt-es' },
  'JOLTS':                            { nq: 'jolts-ifvg-smt',              gc: 'jolts-ifvg-smt-gc',              es: 'jolts-ifvg-smt-es' },
  'ISM Manufacturing PMI':                 { nq: 'ism-mfg-ifvg-smt',      gc: 'ism-mfg-ifvg-smt-gc',            es: 'ism-mfg-ifvg-smt-es' },
  'ISM Services PMI':                      { nq: 'ism-services-ifvg-smt', gc: 'ism-services-ifvg-smt-gc',       es: 'ism-services-ifvg-smt-es' },
  'ISM Non-Manufacturing PMI':             { nq: 'ism-services-ifvg-smt', gc: 'ism-services-ifvg-smt-gc',       es: 'ism-services-ifvg-smt-es' },
  'CB Consumer Confidence':                { nq: 'cb-confidence-ifvg-smt', gc: 'cb-confidence-ifvg-smt-gc',       es: 'cb-confidence-ifvg-smt-es' },
  'Philadelphia Fed Manufacturing Index':  { nq: 'philly-fed-ifvg-smt',   gc: 'philly-fed-ifvg-smt-gc',         es: 'philly-fed-ifvg-smt-es' },
  'Durable Goods Orders':                  { nq: 'durable-goods-ifvg-smt', gc: 'durable-goods-ifvg-smt-gc',       es: 'durable-goods-ifvg-smt-es' },
  'Core Durable Goods Orders':             { nq: 'durable-goods-ifvg-smt', gc: 'durable-goods-ifvg-smt-gc',       es: 'durable-goods-ifvg-smt-es' },
  // ── FF red folder, no backtest yet (visible with "No backtest yet" badge) ─
  'FOMC Minutes':                          { nq: null, gc: null, es: null },
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
  news: Array<{ event: string }>,
  asset: 'nq' | 'gc' | 'es' = 'nq',
): Record<string, EventStudyStats | null> {
  const map: Record<string, EventStudyStats | null> = {};
  for (const item of news) {
    if (!(item.event in map)) {
      map[item.event] = getStudyForEvent(item.event, asset);
    }
  }
  return map;
}

export function getStudyForEvent(
  eventName: string,
  asset: 'nq' | 'gc' | 'es' = 'nq',
): EventStudyStats | null {
  const entry = EVENT_SLUG_MAP[eventName];
  if (!entry) return null;                // unknown event
  const slug = entry[asset];
  if (!slug) return null;                  // known event, no study for this asset
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
    if (t.pnl_pts > 0) acc[day].w++;
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

export type YearStats = {
  year: number;
  n: number;
  w: number;
  be: number;
  l: number;
  net: number;
  wr: number;
  bePct: number;
  lPct: number;
  pf: number;
  avgWin: number;
  avgLoss: number;
  maxDD: number;
};
export type YearBreakdown = YearStats[]; // sorted asc by year

export function getYearBreakdown(slug: string, smtOn = true): YearBreakdown {
  const json = loadIfvgJson(slug);
  if (!json) return [];

  const allTrades = (json.trades ?? []).filter(
    (t) => t.variant === 'tp1_be' && (smtOn ? t.smt === true : true)
  );

  // Group trades by year
  const byYear: Record<number, typeof allTrades> = {};
  for (const t of allTrades) {
    const yr = typeof t.year === 'number' ? t.year : (t.year ? Number(t.year) : new Date(t.ts).getUTCFullYear());
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(t);
  }

  return Object.entries(byYear)
    .map(([yr, trades]) => {
      // Sort by ts ascending for maxDD calculation
      const sorted = [...trades].sort((a, b) => a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0);

      let n = 0, w = 0, be = 0, l = 0;
      let winPts = 0, lossPts = 0, net = 0;
      let winSum = 0, lossSum = 0;

      for (const t of sorted) {
        n++;
        net += t.pnl_pts;
        if (t.pnl_pts > 0) {
          w++;
          winPts += t.pnl_pts;
          winSum += t.pnl_pts;
        } else if (t.pnl_pts < -5) {
          l++;
          lossPts += Math.abs(t.pnl_pts);
          lossSum += Math.abs(t.pnl_pts);
        } else {
          // Math.abs(pnl_pts) < 5 → breakeven zone
          be++;
        }
      }

      // Max drawdown: peak - trough cumulative
      let cumul = 0, peak = 0, maxDD = 0;
      for (const t of sorted) {
        cumul += t.pnl_pts;
        if (cumul > peak) peak = cumul;
        const dd = cumul - peak;
        if (dd < maxDD) maxDD = dd;
      }

      const pf = lossPts > 0 ? winPts / lossPts : winPts > 0 ? 99 : 0;

      return {
        year: Number(yr),
        n,
        w,
        be,
        l,
        net: Math.round(net * 10) / 10,
        wr: n > 0 ? Math.round((w / n) * 100) : 0,
        bePct: n > 0 ? Math.round((be / n) * 100) : 0,
        lPct: n > 0 ? Math.round((l / n) * 100) : 0,
        pf: Math.round(pf * 100) / 100,
        avgWin: w > 0 ? Math.round((winSum / w) * 10) / 10 : 0,
        avgLoss: l > 0 ? Math.round((lossSum / l) * 10) / 10 : 0,
        maxDD: Math.round(maxDD * 10) / 10,
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

// ─── Hub v3 StudyStats API ─────────────────────────────────────────────────

export type AssetType = 'NQ' | 'GC' | 'ES' | 'SI' | 'mixed';
export type FamilyType = 'News' | 'IB' | 'EMA' | 'Time' | 'Misc';
export type WindowType = 'Asia' | 'London' | 'NY 8:30' | 'NY 9:30';

export interface DescriptivePayload {
  primaryValue: string;
  primaryLabel: string;
  secondaryValue: string;
  secondaryLabel: string;
  tertiary?: string;
  barSegments?: { label: string; value: number; color: 'sage' | 'gold' | 'terra' | 'mute' }[];
}

export interface StudyStats {
  slug: string;
  title: string;
  asset: AssetType;
  family: FamilyType;
  window?: WindowType;
  kind: 'strategy' | 'study';
  pf: number;
  n: number;
  edgePts: number;
  wr: number;
  wrByWeekday: number[];
  nByWeekday: number[];
  bestVariant?: string;
  smt?: boolean;
  date: string;
  excerpt?: string;
  descriptive?: DescriptivePayload;
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

interface HubIfvgJson {
  meta?: Record<string, unknown>;
  rows: IfvgRow[];
  trades: IfvgTrade[];
}

function processIfvgSmt(data: HubIfvgJson): Pick<StudyStats, 'pf' | 'n' | 'edgePts' | 'wr' | 'wrByWeekday' | 'nByWeekday' | 'bestVariant' | 'smt'> {
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
  symbol?: string;
  totalEvents?: number;
  dateRange?: { from: string; to: string };
  summary?: {
    direct?: { count: number; pct: number };
    later?: { count: number; pct: number };
    held?: { count: number; pct: number };
    bull?: { count: number; direct: number; later: number; held: number };
    bear?: { count: number; direct: number; later: number; held: number };
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

// Slug-to-data-file overrides (when filename differs from slug)
const SLUG_DATA_MAP: Record<string, string> = {
  'asia-open': 'nwog-gc',
  'killzone-past-vs-now': 'killzone-gc',
  'cpi-day-stats': 'cpi-straddle',
  'nfp': 'nfp-straddle',
};

function processOneSlug(slug: string): StudyStats | null {
  const metaPath = path.join(contentDir, slug, 'meta.json');
  if (!fs.existsSync(metaPath)) return null;

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as {
    title: string;
    titleNq?: string;
    category: string;
    date: string;
    group?: string;
    excerpt?: string;
  };

  const title = meta.titleNq ?? meta.title;
  const group = meta.group;
  const date = meta.date;
  const excerpt = meta.excerpt ?? '';
  const family = inferFamily(slug, group);
  const asset = inferAsset(slug);
  const window = inferWindow(slug, family, group);

  // Resolve data file (slug override or exact match)
  const dataSlug = SLUG_DATA_MAP[slug] ?? slug;
  const jsonPath = path.join(dataDir, `${dataSlug}.json`);
  const jsonData = loadJson<Record<string, unknown>>(jsonPath);

  let kind: 'strategy' | 'study' = 'strategy';
  let descriptive: DescriptivePayload | undefined;
  let stats: Pick<StudyStats, 'pf' | 'n' | 'edgePts' | 'wr' | 'wrByWeekday' | 'nByWeekday' | 'bestVariant' | 'smt'>;

  const asUnknown = jsonData as unknown;
  if (jsonData && Array.isArray((asUnknown as HubIfvgJson).rows) && Array.isArray((asUnknown as HubIfvgJson).trades)) {
    kind = 'strategy';
    stats = processIfvgSmt(asUnknown as HubIfvgJson);
  } else if (jsonData && Array.isArray((asUnknown as StraddleJson).ranked)) {
    // Straddle: has real backtest data but stats may be marginal — render as study
    kind = 'study';
    const n_events = (asUnknown as StraddleJson).ranked?.[0]?.events_total ?? 0;
    const straddleStats = processStraddle(asUnknown as StraddleJson);
    stats = straddleStats;
    descriptive = {
      primaryValue: `${n_events}`,
      primaryLabel: 'releases backtested',
      secondaryValue: straddleStats.bestVariant ?? '—',
      secondaryLabel: 'best combo',
      tertiary: excerpt || 'Straddle backtest — explore offset/TP combos',
    };
  } else if (jsonData && typeof (asUnknown as NwogJson).totalEvents === 'number') {
    kind = 'study';
    const nwogData = asUnknown as NwogJson;
    const directPct = nwogData.summary?.direct?.pct ?? 0;
    const laterPct = nwogData.summary?.later?.pct ?? 0;
    const heldPct = nwogData.summary?.held?.pct ?? 0;
    const bullDirect = nwogData.summary?.bull?.direct ?? 0;
    const bearDirect = nwogData.summary?.bear?.direct ?? 0;
    const totalN = nwogData.totalEvents ?? 0;
    stats = processNwog(nwogData);
    const dateRangeStr = nwogData.dateRange
      ? `${new Date(nwogData.dateRange.from).getFullYear()}–${new Date(nwogData.dateRange.to).getFullYear()}`
      : '10y';
    descriptive = {
      primaryValue: `${directPct.toFixed(1)}%`,
      primaryLabel: 'fill in 30 min',
      secondaryValue: `${totalN} events`,
      secondaryLabel: `${dateRangeStr} · ${nwogData.symbol ?? asset}`,
      tertiary: `Bull ${bullDirect.toFixed(1)}% · Bear ${bearDirect.toFixed(1)}%`,
      barSegments: [
        { label: 'Direct', value: Math.round(directPct), color: 'sage' },
        { label: 'Later', value: Math.round(laterPct), color: 'gold' },
        { label: 'Held', value: Math.round(heldPct), color: 'mute' },
      ],
    };
  } else if (jsonData && Array.isArray((asUnknown as KillzoneJson).overall)) {
    kind = 'study';
    const kzData = asUnknown as KillzoneJson;
    const rows = kzData.overall ?? [];
    const totalN = rows.reduce((s, r) => s + r.n, 0);
    // Find session with highest avgRange
    const best = rows.reduce((a, b) => (a.avgRange > b.avgRange ? a : b), rows[0]);
    const minR = rows.reduce((a, b) => (a.avgRange < b.avgRange ? a : b), rows[0]);
    stats = processKillzone(kzData);
    descriptive = {
      primaryValue: `${best?.avgRange?.toFixed(1) ?? '—'} pts`,
      primaryLabel: `avg range ${best?.killzone ?? ''}`,
      secondaryValue: `${totalN.toLocaleString()} sessions`,
      secondaryLabel: `10y · ${asset}`,
      tertiary: rows.length >= 2 ? `${minR.killzone} ${minR.avgRange.toFixed(1)} pts → ${best.killzone} ${best.avgRange.toFixed(1)} pts` : undefined,
      barSegments: rows.map((r) => ({
        label: r.killzone,
        value: Math.round(r.avgRange * 10) / 10,
        color: r === best ? 'gold' as const : 'mute' as const,
      })),
    };
  } else {
    // No JSON data — render as study with excerpt teaser
    kind = 'study';
    stats = {
      pf: 0, n: 0, edgePts: 0, wr: 0,
      wrByWeekday: [0, 0, 0, 0, 0],
      nByWeekday: [0, 0, 0, 0, 0],
    };
    if (excerpt) {
      descriptive = {
        primaryValue: '—',
        primaryLabel: 'no data',
        secondaryValue: date,
        secondaryLabel: asset,
        tertiary: excerpt,
      };
    }
  }

  return {
    slug,
    title,
    asset,
    family,
    window,
    kind,
    date,
    excerpt,
    descriptive,
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
