'use client';
import { useAsset } from './AssetContext';

export default function AssetSwitch() {
  const { asset, setAsset } = useAsset();
  return (
    <div className="bd-asset-switch" role="tablist" aria-label="Asset selector">
      <button
        role="tab"
        type="button"
        aria-selected={asset === 'nq'}
        onClick={() => setAsset('nq')}
        className="bd-asset-switch-btn"
        style={{ ['--btn-dot' as string]: 'oklch(0.86 0.16 95)' }}
      >
        NQ
      </button>
      <span className="bd-asset-switch-sep" aria-hidden="true">/</span>
      <button
        role="tab"
        type="button"
        aria-selected={asset === 'gc'}
        onClick={() => setAsset('gc')}
        className="bd-asset-switch-btn"
        style={{ ['--btn-dot' as string]: 'oklch(0.74 0.16 78)' }}
      >
        GC
      </button>
    </div>
  );
}
