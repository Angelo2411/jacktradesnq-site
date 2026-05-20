'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAsset, type AssetKey } from './AssetContext';

const PILLS: { label: string; value: AssetKey }[] = [
  { label: 'NQ', value: 'nq' },
  { label: 'GC', value: 'gc' },
  { label: 'ES', value: 'es' },
  { label: 'All', value: 'all' },
];

function computeTargetSlug(currentPath: string, asset: AssetKey): string | null {
  const match = currentPath.match(/^\/backtested-data\/([^\/]+)\/?/);
  if (!match) return null;
  const base = match[1].replace(/-(gc|es)$/, '');
  if (asset === 'nq') return `/backtested-data/${base}/`;
  if (asset === 'gc') return `/backtested-data/${base}-gc/`;
  if (asset === 'es') return `/backtested-data/${base}-es/`;
  return null;
}

export default function AssetPills() {
  const { asset, setAsset } = useAsset();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(value: AssetKey) {
    setAsset(value);
    const target = computeTargetSlug(pathname, value);
    const normPath = pathname.replace(/\/$/, '');
    if (!target || target.replace(/\/$/, '') === normPath) return;
    const params = new URLSearchParams(window.location.search);
    params.delete('asset');
    params.delete('year');
    const qs = params.toString();
    router.push(qs ? `${target}?${qs}` : target);
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
