'use client';

import type { AssetType } from '@/lib/study-stats';
import type { DayPlaybook } from '@/lib/today-events';

const DOW_SHORT_LABELS = ['M', 'T', 'W', 'T', 'F'];

function cellHint(day: DayPlaybook): string {
  if (day.events.length === 0) return '—';
  const named = day.events.find((e) =>
    ['CPI', 'NFP', 'FOMC', 'PPI', 'PCE', 'GDP', 'JC', 'ISM', 'ADP'].includes(e.event),
  );
  if (named) return named.event;
  return `${day.events.length} ev`;
}

type AssetFilter = AssetType | 'All';

interface HubTopBarProps {
  asset: AssetFilter;
  showNoEdge: boolean;
  selectedDow: number | null;
  mounted: boolean;
  weekly?: DayPlaybook[];
  onAsset: (a: AssetFilter) => void;
  onShowNoEdge: (v: boolean) => void;
  onDow: (i: number | null) => void;
}

export default function HubTopBar({
  asset,
  showNoEdge,
  selectedDow,
  mounted,
  weekly,
  onAsset,
  onShowNoEdge,
  onDow,
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

      {/* Day playbook */}
      {weekly && weekly.length >= 5 && (
        <div className="bd-hub-topbar-group bd-hub-topbar-group--playbook">
          <span className="bd-topbar-playbook-lbl">Day playbook</span>
          <div className="bd-dow-strip bd-dow-strip--inline" role="group" aria-label="Day of week playbook">
            {weekly.slice(0, 5).map((day, i) => {
              const isSel = mounted && selectedDow === i;
              return (
                <button
                  key={i}
                  className={`bd-dow-cell bd-dow-cell--compact${isSel ? ' bd-dow-cell--on' : ''}`}
                  aria-pressed={isSel}
                  aria-label={`${day.dowLabel}: ${day.events.length} release${day.events.length !== 1 ? 's' : ''}`}
                  onClick={() => onDow(isSel ? null : i)}
                >
                  <span className="bd-dow-cell-lbl">{DOW_SHORT_LABELS[i]}</span>
                  <span className="bd-dow-cell-sub">{cellHint(day)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Show no-edge toggle — pushed to the right */}
      <div className="bd-hub-topbar-group bd-hub-topbar-group--end">
        <label className="bd-flt-toggle-row bd-flt-toggle-row--inline">
          <span>Show no-edge</span>
          <button
            role="switch"
            aria-checked={showNoEdge}
            className={`bd-flt-switch${showNoEdge ? ' on' : ''}`}
            onClick={() => onShowNoEdge(!showNoEdge)}
          >
            <span className="bd-flt-switch-thumb" />
          </button>
        </label>
      </div>
    </div>
  );
}
