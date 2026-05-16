'use client';

import { useState, useEffect, useMemo } from 'react';
import type { StudyStats, AssetType } from '@/lib/study-stats';
import type { DayPlaybook } from '@/lib/today-events';
import StudyCard from './StudyCard';

const STORAGE_KEY = 'hub-filters-v2';

const DOW_SHORT_LABELS = ['M', 'T', 'W', 'T', 'F'];
const DOW_FULL_LABELS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

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
  const jsDay = ny.getDay(); // 0=Sun, 1=Mon … 6=Sat
  if (jsDay < 1 || jsDay > 5) return 0; // weekend → default Mon
  return jsDay - 1; // 1=Mon → 0 … 5=Fri → 4
}

function cellHint(day: DayPlaybook): string {
  if (day.events.length === 0) return '—';
  // If there's a "name-brand" event use it, else show count
  const named = day.events.find((e) =>
    ['CPI', 'NFP', 'FOMC', 'PPI', 'PCE', 'GDP', 'JC', 'ISM', 'ADP'].includes(e.event),
  );
  if (named) return named.event;
  return `${day.events.length} ev`;
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

        {/* ── Day playbook stripe ── */}
        {weekly && weekly.length >= 5 && (
          <div className="bd-flt-section bd-flt-section--playbook">
            <h4 className="bd-flt-section-hd bd-flt-section-hd--playbook">Day playbook</h4>
            <div className="bd-dow-strip" role="group" aria-label="Day of week playbook">
              {weekly.slice(0, 5).map((day, i) => {
                const isSel = mounted && selectedDow === i;
                return (
                  <button
                    key={i}
                    className={`bd-dow-cell${isSel ? ' bd-dow-cell--on' : ''}`}
                    aria-pressed={isSel}
                    aria-label={`${day.dowLabel}: ${day.events.length} release${day.events.length !== 1 ? 's' : ''}`}
                    onClick={() => setSelectedDow(isSel ? null : i)}
                  >
                    <span className="bd-dow-cell-lbl">{DOW_SHORT_LABELS[i]}</span>
                    <span className="bd-dow-cell-sub">{cellHint(day)}</span>
                  </button>
                );
              })}
            </div>

            {/* expanded detail for selected day */}
            {mounted && selectedDow !== null && weekly[selectedDow] && (
              <div className="bd-day-detail" aria-live="polite">
                <p className="bd-day-detail-dayname">{DOW_FULL_LABELS[selectedDow]}</p>
                {weekly[selectedDow].events.length === 0 ? (
                  <p className="bd-day-detail-quiet">No scheduled releases.</p>
                ) : (
                  <ul className="bd-day-detail-list">
                    {weekly[selectedDow].events.map((ev) => (
                      <li key={ev.event} className="bd-day-detail-row">
                        <span className="bd-day-detail-ev">{ev.event}</span>
                        <span className="bd-day-detail-time">{ev.time}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {weekly[selectedDow].killzone.length > 0 && (
                  <p className="bd-day-detail-verdict">
                    Top session:{' '}
                    {weekly[selectedDow].killzone.reduce((a, b) =>
                      a.avgRange > b.avgRange ? a : b,
                    ).session}{' '}
                    ·{' '}
                    {weekly[selectedDow].killzone
                      .reduce((a, b) => (a.avgRange > b.avgRange ? a : b))
                      .avgRange.toFixed(1)}{' '}
                    pts avg
                  </p>
                )}
              </div>
            )}
          </div>
        )}

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
