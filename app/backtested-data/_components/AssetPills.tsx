'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAsset, type AssetKey } from './AssetContext';

const PILLS: { label: string; value: AssetKey }[] = [
  { label: 'NQ', value: 'nq' },
  { label: 'GC', value: 'gc' },
  { label: 'All', value: 'all' },
];

export default function AssetPills() {
  const { asset, setAsset } = useAsset();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(value: AssetKey) {
    setAsset(value);
    const params = new URLSearchParams(window.location.search);
    params.set('asset', value);
    router.replace(`${pathname}?${params.toString()}`);
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
