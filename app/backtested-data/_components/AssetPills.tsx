'use client';
import { useAsset, type AssetKey } from './AssetContext';

const PILLS: { label: string; value: AssetKey }[] = [
  { label: 'NQ', value: 'nq' },
  { label: 'GC', value: 'gc' },
  { label: 'ES', value: 'es' },
  { label: 'All', value: 'all' },
];

export default function AssetPills() {
  const { asset, setAsset } = useAsset();

  function handleClick(value: AssetKey) {
    setAsset(value);
    const params = new URLSearchParams(window.location.search);
    params.set('asset', value);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }

  return (
    <div className="v3-asset-pills">
      {PILLS.map((p) => (
        <button
          key={p.value}
          onClick={() => handleClick(p.value)}
          className={'v3-asset-pill' + (asset === p.value ? ' active' : '')}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
