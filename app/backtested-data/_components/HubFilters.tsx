'use client';

import { useState, useEffect, useMemo } from 'react';
import type { StudyStats, AssetType } from '@/lib/study-stats';
import StudyCard from './StudyCard';

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

export default function HubFilters({ studies }: { studies: StudyStats[] }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFilters(loadState());
    setMounted(true);
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

    // Default sort: PF descending
    list.sort((a, b) => b.pf - a.pf);

    return list;
  }, [studies, filters]);

  // Group by kind: strategies first, market studies second
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
    <div className="bd-hub-body">
      {/* ── Sidebar filters ── */}
      <aside className="bd-hub-filters" aria-label="Hub filters">
        <h4 className="bd-flt-section-hd">Search</h4>
        <div className="bd-flt-search-wrap">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            className="bd-flt-search"
            placeholder="Search the atlas…"
            aria-label="Search studies (cosmetic)"
            readOnly
          />
        </div>

        <div className="bd-flt-section">
          <div className="bd-flt-asset-toggle">
            {(['NQ', 'GC', 'All'] as const).map((a) => (
              <button
                key={a}
                className={`bd-flt-asset-btn${filters.asset === a ? ' on' : ''}`}
                onClick={() => updateFilter('asset', a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="bd-flt-section">
          <label className="bd-flt-toggle-row">
            <span>Show no-edge studies</span>
            <button
              role="switch"
              aria-checked={filters.showNoEdge}
              className={`bd-flt-switch${filters.showNoEdge ? ' on' : ''}`}
              onClick={() => updateFilter('showNoEdge', !filters.showNoEdge)}
            >
              <span className="bd-flt-switch-thumb" />
            </button>
          </label>
        </div>

        <p className="bd-flt-disclaimer">
          Honest by default. Flops published too — the only way the wins stay credible.
        </p>
      </aside>

      {/* ── Card grid ── */}
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
    </div>
  );
}
