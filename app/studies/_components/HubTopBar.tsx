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
          {(['All', 'NQ', 'GC'] as AssetFilter[]).map((a) => (
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

      {/* Edge / No-edge segmented — pushed to the right */}
      <div className="bd-hub-topbar-group bd-hub-topbar-group--end">
        <div className="bd-edge-segmented" role="group" aria-label="Filter by edge">
          <button
            type="button"
            className={`bd-edge-seg-btn${!showNoEdge ? ' on' : ''}`}
            aria-pressed={!showNoEdge}
            onClick={() => onShowNoEdge(false)}
          >
            Edge only
          </button>
          <button
            type="button"
            className={`bd-edge-seg-btn${showNoEdge ? ' on' : ''}`}
            aria-pressed={showNoEdge}
            onClick={() => onShowNoEdge(true)}
          >
            All studies
          </button>
        </div>
      </div>
    </div>
  );
}
