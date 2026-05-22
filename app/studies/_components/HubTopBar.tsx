'use client';

import type { AssetType } from '@/lib/study-stats';

type AssetFilter = AssetType | 'All';
export type SortBy = 'pf' | 'n' | 'alpha' | 'date';

interface HubTopBarProps {
  asset: AssetFilter;
  sortBy: SortBy;
  query: string;
  onAsset: (a: AssetFilter) => void;
  onSort: (s: SortBy) => void;
  onQuery: (q: string) => void;
}

export default function HubTopBar({
  asset,
  sortBy,
  query,
  onAsset,
  onSort,
  onQuery,
}: HubTopBarProps) {
  return (
    <div className="bd-hub-topbar" aria-label="Hub filters">
      {/* Asset toggle */}
      <div className="bd-hub-topbar-group">
        <div className="bd-flt-asset-toggle bd-flt-asset-toggle--inline">
          {(['All', 'NQ', 'ES', 'YM', 'GC', 'SI'] as AssetFilter[]).map((a) => (
            <button
              key={a}
              className={`bd-flt-asset-btn${asset === a ? ' on' : ''}`}
              onClick={() => onAsset(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Search — fills the gap */}
      <div className="bd-hub-topbar-group bd-hub-topbar-group--search">
        <label className="bd-hub-search" htmlFor="hub-search-input">
          <svg
            className="bd-hub-search-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16.5" y2="16.5" />
          </svg>
          <input
            id="hub-search-input"
            type="search"
            placeholder="Search studies — CPI, NFP, killzone…"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              className="bd-hub-search-clear"
              aria-label="Clear search"
              onClick={() => onQuery('')}
            >
              ×
            </button>
          )}
        </label>
      </div>

      {/* Sort toggles */}
      <div className="bd-hub-topbar-group bd-hub-topbar-group--end">
        <div className="bd-flt-asset-toggle bd-flt-asset-toggle--inline bd-flt-sort-toggle">
          {(
            [
              ['pf', 'Best PF'],
              ['n', 'Most trades'],
              ['alpha', 'A–Z'],
              ['date', 'Recent'],
            ] as [SortBy, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              className={`bd-flt-asset-btn${sortBy === v ? ' on' : ''}`}
              onClick={() => onSort(v)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
