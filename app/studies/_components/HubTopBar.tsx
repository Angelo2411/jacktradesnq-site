'use client';

import type { AssetType } from '@/lib/study-stats';

type AssetFilter = AssetType | 'All';
export type SortBy = 'pf' | 'n' | 'alpha' | 'date';

interface HubTopBarProps {
  asset: AssetFilter;
  sortBy: SortBy;
  onAsset: (a: AssetFilter) => void;
  onSort: (s: SortBy) => void;
}

export default function HubTopBar({
  asset,
  sortBy,
  onAsset,
  onSort,
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

      {/* Sort toggles — pushed to the right */}
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
