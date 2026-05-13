'use client';

import { useEffect, useState } from 'react';
import StraddleExplorer, { type ExplorerConfig } from './StraddleExplorer';

type AssetKey = 'nq' | 'gc';

const ASSETS: { key: AssetKey; label: string; dot: string }[] = [
  { key: 'nq', label: 'Nasdaq', dot: 'oklch(0.86 0.16 95)' },
  { key: 'gc', label: 'Gold', dot: 'oklch(0.74 0.16 78)' },
];

interface Props {
  nqConfig: ExplorerConfig;
  gcConfig: ExplorerConfig;
}

export default function StraddleSwitcher({ nqConfig, gcConfig }: Props) {
  const [asset, setAsset] = useState<AssetKey>('nq');

  // Read ?asset=gc from URL at mount (compatible with static export)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const a = params.get('asset');
    if (a === 'gc') setAsset('gc');
  }, []);

  const config = asset === 'nq' ? nqConfig : gcConfig;

  return (
    <div className="bd-asset-scope" data-asset={asset}>
      <div className="bd-asset-topbar">
        <div className="bd-asset-switch" role="tablist" aria-label="Asset selector">
          {ASSETS.map((a, i) => (
            <button
              key={a.key}
              role="tab"
              type="button"
              aria-selected={asset === a.key}
              onClick={() => setAsset(a.key)}
              className="bd-asset-switch-btn"
              style={{ ['--btn-dot' as string]: a.dot }}
            >
              {a.label}
              {i === 0 ? (
                <span className="bd-asset-switch-sep" aria-hidden="true">
                  /
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
      {/* key forces full remount + refetch when asset switches */}
      <StraddleExplorer key={config.dataUrl} config={config} embedded />
    </div>
  );
}
