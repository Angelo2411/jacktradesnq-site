'use client';

import type { AssetType } from '@/lib/study-stats';

type AssetFilter = AssetType | 'All';

interface HubTopBarProps {
  asset: AssetFilter;
  showNoEdge: boolean;
  onAsset: (a: AssetFilter) => void;
  onShowNoEdge: (v: boolean) => void;
}

export default function HubTopBar({
  asset,
  showNoEdge,
  onAsset,
  onShowNoEdge,
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

      {/* Edge-only toggle — single button, pushed to the right */}
      <div className="bd-hub-topbar-group bd-hub-topbar-group--end">
        <button
          type="button"
          className={`bd-edge-toggle${!showNoEdge ? ' on' : ''}`}
          aria-pressed={!showNoEdge}
          onClick={() => onShowNoEdge(!showNoEdge)}
        >
          Edge only
        </button>
      </div>
    </div>
  );
}
