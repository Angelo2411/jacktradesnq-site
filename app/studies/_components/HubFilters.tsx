'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { StudyStats, AssetType, FamilyType } from '@/lib/study-stats';
import { eventKeyOf } from '@/lib/event-key';
import type { DayPlaybook } from '@/lib/today-events';
import StudyRow from './StudyRow';
import HubTopBar, { type SortBy } from './HubTopBar';

/** Human-readable label for an event key */
const EVENT_LABELS: Record<string, string> = {
  cpi: 'CPI',
  nfp: 'NFP',
  ppi: 'PPI',
  pce: 'PCE',
  gdp: 'GDP',
  fomc: 'FOMC',
  adp: 'ADP',
  jolts: 'JOLTS',
  'ism-mfg': 'ISM Manufacturing',
  'ism-services': 'ISM Services',
  'ism-manufacturing': 'ISM Manufacturing',
  'retail-sales': 'Retail Sales',
  'jobless-claims': 'Jobless Claims',
  'cb-confidence': 'CB Consumer Confidence',
  'empire-state': 'Empire State',
  'durable-goods': 'Durable Goods',
  'philly-fed': 'Philly Fed',
  'empire-state-mfg': 'Empire State Mfg',
};

function eventLabel(key: string): string {
  if (EVENT_LABELS[key]) return EVENT_LABELS[key];
  // Title-case fallback: replace hyphens with spaces, capitalize each word
  return key
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface EventGroup {
  key: string;
  label: string;
  items: StudyStats[];
  bestPf: number;
}

function groupItems(items: StudyStats[]): Array<EventGroup | StudyStats> {
  const groupMap = new Map<string, StudyStats[]>();
  const singletons: StudyStats[] = [];

  for (const s of items) {
    const key = eventKeyOf(s.slug);
    if (key === null) {
      singletons.push(s);
      continue;
    }
    const bucket = groupMap.get(key) ?? [];
    bucket.push(s);
    groupMap.set(key, bucket);
  }

  // Groups of size ≥2 become accordions; singletons render as-is
  const groups: EventGroup[] = [];
  const extraSingletons: StudyStats[] = [];

  for (const [key, bucket] of groupMap.entries()) {
    if (bucket.length >= 2) {
      groups.push({
        key,
        label: eventLabel(key),
        items: bucket,
        bestPf: Math.max(...bucket.map((s) => s.pf)),
      });
    } else {
      extraSingletons.push(...bucket);
    }
  }

  // Sort groups by best PF descending
  groups.sort((a, b) => b.bestPf - a.bestPf);

  // Interleave: groups first, then all singletons (both the eventKeyOf-null ones
  // and the size-1 groups) at the end, preserving their existing PF sort order
  const allSingletons = [...singletons, ...extraSingletons].sort(
    (a, b) => b.pf - a.pf,
  );

  return [...groups, ...allSingletons];
}

const STORAGE_KEY = 'hub-filters-v3';

type FamilyFilter = FamilyType | 'All';

interface FilterState {
  asset: AssetType | 'All';
  sortBy: SortBy;
  query: string;
  family: FamilyFilter;
}

const DEFAULT_STATE: FilterState = {
  asset: 'All',
  sortBy: 'pf',
  query: '',
  family: 'All',
};

function loadState(): FilterState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) } as FilterState;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(s: FilterState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

/** Returns 0=Mon … 4=Fri in NY time, or null until mounted */
function getNyDowIndex(): number | null {
  const ny = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
  );
  const jsDay = ny.getDay();
  if (jsDay < 1 || jsDay > 5) return 0;
  return jsDay - 1;
}

export default function HubFilters({
  studies,
  weekly,
}: {
  studies: StudyStats[];
  weekly?: DayPlaybook[];
}) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);
  const [selectedDow, setSelectedDow] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setFilters(loadState());
    setMounted(true);
    setSelectedDow(getNyDowIndex());
  }, []);

  useEffect(() => {
    const cat = searchParams.get('cat');
    const CAT_TO_FAMILY: Record<string, FamilyType> = { news: 'News', ib: 'IB', ema: 'EMA', time: 'Time', misc: 'Misc' };
    if (cat && CAT_TO_FAMILY[cat]) {
      setFilters((f) => ({ ...f, family: CAT_TO_FAMILY[cat], asset: 'All' }));
    } else if (cat === null) {
      setFilters((f) => ({ ...f, family: 'All' }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (mounted) saveState(filters);
  }, [filters, mounted]);

  const updateFilter = <K extends keyof FilterState>(key: K, val: FilterState[K]) => {
    setFilters((f) => ({ ...f, [key]: val }));
  };

  const clearFamily = useCallback(() => {
    setFilters((f) => ({ ...f, family: 'All' }));
    router.push('/studies/', { scroll: false });
  }, [router]);

  const filtered = useMemo(() => {
    let list = [...studies];
    if (filters.asset !== 'All') {
      list = list.filter((s) => s.asset === filters.asset);
    }
    if (filters.family !== 'All') {
      list = list.filter((s) => s.family === filters.family);
    }
    const q = filters.query.trim().toLowerCase();
    if (q) {
      list = list.filter((s) => {
        const hay = `${s.title} ${s.slug} ${s.asset} ${s.family} ${s.excerpt ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }
    switch (filters.sortBy) {
      case 'n':
        list.sort((a, b) => b.n - a.n);
        break;
      case 'alpha':
        list.sort((a, b) => a.slug.localeCompare(b.slug));
        break;
      case 'date':
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        break;
      case 'pf':
      default:
        list.sort((a, b) => b.pf - a.pf);
        break;
    }
    return list;
  }, [studies, filters]);

  const strategies = useMemo(() => filtered.filter((s) => s.kind === 'strategy'), [filtered]);
  const marketStudies = useMemo(() => filtered.filter((s) => s.kind === 'study'), [filtered]);

  const bestStrategyPf = useMemo(
    () => (strategies.length > 0 ? Math.max(...strategies.map((s) => s.pf)) : 0),
    [strategies],
  );

  const sections = useMemo(() => {
    const result: { key: string; label: string; subtitle: string; items: typeof filtered }[] = [];
    if (strategies.length > 0) {
      result.push({
        key: 'strategy',
        label: 'Strategies',
        subtitle: `${strategies.length} ${strategies.length === 1 ? 'study' : 'studies'}${bestStrategyPf > 0 ? ` · best PF ${bestStrategyPf.toFixed(2)}` : ''}`,
        items: strategies,
      });
    }
    if (marketStudies.length > 0) {
      result.push({
        key: 'study',
        label: 'Market studies',
        subtitle: `${marketStudies.length} ${marketStudies.length === 1 ? 'study' : 'studies'} · descriptive`,
        items: marketStudies,
      });
    }
    return result;
  }, [strategies, marketStudies, bestStrategyPf]);

  // suppress unused warning — weekly/selectedDow kept for future day-playbook integration
  void weekly;
  void selectedDow;

  return (
    <>
      <HubTopBar
        asset={filters.asset}
        sortBy={filters.sortBy}
        query={filters.query}
        family={filters.family}
        onAsset={(a) => updateFilter('asset', a)}
        onSort={(s) => updateFilter('sortBy', s)}
        onQuery={(q) => updateFilter('query', q)}
        onClearFamily={clearFamily}
      />

      <main className="bd-hub-main" id="hub-grid">
        {sections.length === 0 ? (
          <p className="bd-hub-empty">No studies match your filters.</p>
        ) : (
          sections.map(({ key, label, subtitle, items }) => {
            const grouped = groupItems(items);
            const searchActive = filters.query.trim() !== '';
            const groupCount = grouped.filter(
              (g): g is EventGroup => 'key' in g && 'bestPf' in g,
            ).length;
            const defaultOpen = searchActive || groupCount <= 3;
            return (
              <section key={key} className="bd-kind-section">
                <div className="bd-kind-head">
                  <h2 className="bd-kind-title">{label}</h2>
                  <p className="bd-kind-subtitle">{subtitle}</p>
                </div>
                <div className="bd-hub-index">
                  {grouped.map((entry) => {
                    if ('slug' in entry) {
                      // singleton StudyStats
                      return <StudyRow key={entry.slug} s={entry} />;
                    }
                    // EventGroup accordion
                    const g = entry as EventGroup;
                    return (
                      <details
                        key={g.key}
                        className="bd-evt"
                        open={defaultOpen || undefined}
                      >
                        <summary className="bd-evt-head">
                          <span className="bd-evt-name">{g.label}</span>
                          <span className="bd-evt-meta">
                            {g.items.length} variants · best PF{' '}
                            <span className="bd-evt-pf">{g.bestPf.toFixed(2)}</span>
                          </span>
                          <span className="bd-evt-chevron" aria-hidden="true">›</span>
                        </summary>
                        <div className="bd-evt-body">
                          {g.items.map((s) => (
                            <StudyRow key={s.slug} s={s} />
                          ))}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </main>
    </>
  );
}
