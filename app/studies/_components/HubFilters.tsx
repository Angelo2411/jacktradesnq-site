'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { StudyStats, AssetType, FamilyType } from '@/lib/study-stats';
import type { DayPlaybook } from '@/lib/today-events';
import StudyRow from './StudyRow';
import HubTopBar, { type SortBy } from './HubTopBar';

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
    if (cat === 'news' || cat === 'ib' || cat === 'ema' || cat === 'time' || cat === 'misc') {
      setFilters((f) => ({ ...f, family: (cat.charAt(0).toUpperCase() + cat.slice(1)) as FamilyType, asset: 'All' }));
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
          sections.map(({ key, label, subtitle, items }) => (
            <section key={key} className="bd-kind-section">
              <div className="bd-kind-head">
                <h2 className="bd-kind-title">{label}</h2>
                <p className="bd-kind-subtitle">{subtitle}</p>
              </div>
              <div className="bd-hub-index">
                {items.map((s) => (
                  <StudyRow key={s.slug} s={s} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </>
  );
}
