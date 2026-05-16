'use client';

import { useState, useEffect, useMemo } from 'react';
import type { StudyStats, AssetType, FamilyType, WindowType } from '@/lib/study-stats';
import StudyCard from './StudyCard';

type SortKey = 'pf' | 'edge' | 'n' | 'updated';

const FAMILIES: FamilyType[] = ['News', 'IB', 'EMA', 'Time', 'Misc'];
const WINDOWS: WindowType[] = ['Asia', 'London', 'NY 8:30', 'NY 9:30'];
const SORT_LABELS: { key: SortKey; label: string }[] = [
  { key: 'pf', label: 'Profit factor' },
  { key: 'edge', label: 'Edge (pts)' },
  { key: 'n', label: 'Sample (N)' },
  { key: 'updated', label: 'Updated' },
];

const STORAGE_KEY = 'hub-filters-v1';

interface FilterState {
  asset: AssetType | 'All';
  families: FamilyType[];
  windows: WindowType[];
  sort: SortKey;
  showNoEdge: boolean;
}

const DEFAULT_STATE: FilterState = {
  asset: 'All',
  families: [],
  windows: [],
  sort: 'pf',
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

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
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
    if (filters.families.length > 0) {
      list = list.filter((s) => filters.families.includes(s.family));
    }
    if (filters.windows.length > 0) {
      list = list.filter((s) => s.window !== undefined && filters.windows.includes(s.window));
    }
    if (!filters.showNoEdge) {
      list = list.filter((s) => s.pf >= 1.5);
    }

    list.sort((a, b) => {
      switch (filters.sort) {
        case 'pf': return b.pf - a.pf;
        case 'edge': return b.edgePts - a.edgePts;
        case 'n': return b.n - a.n;
        case 'updated': return b.date.localeCompare(a.date);
      }
    });

    return list;
  }, [studies, filters]);

  // Group by family, preserving sort order within each family
  const familyOrder: FamilyType[] = ['News', 'IB', 'EMA', 'Time', 'Misc'];
  const grouped = useMemo(() => {
    const map = new Map<FamilyType, StudyStats[]>();
    for (const fam of familyOrder) map.set(fam, []);
    for (const s of filtered) {
      map.get(s.family)?.push(s);
    }
    return Array.from(map.entries()).filter(([, items]) => items.length > 0);
  }, [filtered]);

  const bestPfByFamily = useMemo(() => {
    const m = new Map<FamilyType, number>();
    for (const [fam, items] of grouped) {
      const best = Math.max(...items.map((s) => s.pf));
      m.set(fam, best);
    }
    return m;
  }, [grouped]);

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
          <h4 className="bd-flt-section-hd">Family</h4>
          <div className="bd-flt-pills">
            <button
              className={`bd-flt-pill${filters.families.length === 0 ? ' on' : ''}`}
              onClick={() => updateFilter('families', [])}
            >
              All
            </button>
            {FAMILIES.map((f) => (
              <button
                key={f}
                className={`bd-flt-pill${filters.families.includes(f) ? ' on' : ''}`}
                onClick={() => updateFilter('families', toggle(filters.families, f))}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bd-flt-section">
          <h4 className="bd-flt-section-hd">Window</h4>
          <div className="bd-flt-pills">
            {WINDOWS.map((w) => (
              <button
                key={w}
                className={`bd-flt-pill${filters.windows.includes(w) ? ' on' : ''}`}
                onClick={() => updateFilter('windows', toggle(filters.windows, w))}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="bd-flt-section">
          <h4 className="bd-flt-section-hd">Sort</h4>
          <div className="bd-flt-sort-list">
            {SORT_LABELS.map(({ key, label }) => (
              <label
                key={key}
                className={`bd-flt-sort-row${filters.sort === key ? ' on' : ''}`}
              >
                <input
                  type="radio"
                  name="hub-sort"
                  value={key}
                  checked={filters.sort === key}
                  onChange={() => updateFilter('sort', key)}
                  className="sr-only"
                />
                {label}
                {filters.sort === key && (
                  <span className="bd-flt-sort-caret" aria-hidden="true">↓</span>
                )}
              </label>
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
        {grouped.length === 0 ? (
          <p className="bd-hub-empty">No studies match your filters.</p>
        ) : (
          grouped.map(([family, items]) => {
            const bestPf = bestPfByFamily.get(family) ?? 0;
            return (
              <section key={family} className="bd-hub-family">
                <div className="bd-hub-family-head">
                  <h2 className="bd-hub-family-title">{family}</h2>
                  <span className="bd-hub-family-meta">
                    {items.length} {items.length === 1 ? 'study' : 'studies'}
                    {bestPf > 0 ? ` · best PF ${bestPf.toFixed(2)}` : ''}
                  </span>
                </div>
                <div className="bd-hub-grid">
                  {items.map((s) => (
                    <StudyCard key={s.slug} s={s} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}
