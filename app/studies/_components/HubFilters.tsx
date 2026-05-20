'use client';

import { useState, useEffect, useMemo } from 'react';
import type { StudyStats, AssetType } from '@/lib/study-stats';
import type { DayPlaybook } from '@/lib/today-events';
import StudyCard from './StudyCard';
import HubTopBar from './HubTopBar';

const STORAGE_KEY = 'hub-filters-v2';

interface FilterState {
  asset: AssetType | 'All';
  showNoEdge: boolean;
}

const DEFAULT_STATE: FilterState = {
  asset: 'All',
  showNoEdge: true,
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

  useEffect(() => {
    setFilters(loadState());
    setMounted(true);
    setSelectedDow(getNyDowIndex());
  }, []);

  useEffect(() => {
    if (mounted) saveState(filters);
  }, [filters, mounted]);

  const updateFilter = <K extends keyof FilterState>(key: K, val: FilterState[K]) => {
    setFilters((f) => ({ ...f, [key]: val }));
  };

  const filtered = useMemo(() => {
    let list = [...studies];
    if (filters.asset !== 'All') {
      list = list.filter((s) => s.asset === filters.asset);
    }
    if (!filters.showNoEdge) {
      list = list.filter((s) => s.pf >= 1.5);
    }
    list.sort((a, b) => b.pf - a.pf);
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

  return (
    <>
      <HubTopBar
        asset={filters.asset}
        showNoEdge={filters.showNoEdge}
        selectedDow={selectedDow}
        mounted={mounted}
        weekly={weekly}
        onAsset={(a) => updateFilter('asset', a)}
        onShowNoEdge={(v) => updateFilter('showNoEdge', v)}
        onDow={(i) => setSelectedDow(i)}
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
              <div className="bd-hub-grid">
                {items.map((s) => (
                  <StudyCard key={s.slug} s={s} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </>
  );
}
