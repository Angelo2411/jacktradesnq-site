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
  const match = currentPath.match(/^\/studies\/([^\/]+)\/?/);
  if (!match) return null;
  const base = match[1].replace(/-(gc|es)$/, '');
  if (asset === 'nq') return `/studies/${base}/`;
  if (asset === 'gc') return `/studies/${base}-gc/`;
  if (asset === 'es') return `/studies/${base}-es/`;
  return null;
}

function slugFromTarget(target: string): string {
  return target.replace(/^\/studies\//, '').replace(/\/$/, '');
}

export default function AssetPills({ availableSlugs }: { availableSlugs: string[] }) {
  const { asset, setAsset } = useAsset();
  const router = useRouter();
  const pathname = usePathname();

  const slugSet = new Set(availableSlugs);
  const onSlugRoute = /^\/studies\/[^\/]+\/?$/.test(pathname);

  if (!onSlugRoute) return null;

  function handleClick(value: AssetKey) {
    setAsset(value);
    const target = computeTargetSlug(pathname, value);
    const normPath = pathname.replace(/\/$/, '');
    if (!target || target.replace(/\/$/, '') === normPath) return;
    const targetSlug = slugFromTarget(target);
    if (!slugSet.has(targetSlug)) return;
    const params = new URLSearchParams(window.location.search);
    params.delete('asset');
    params.delete('year');
    const qs = params.toString();
    router.push(qs ? `${target}?${qs}` : target);
  }

  return (
    <div className="v3-asset-pills">
      {PILLS.map((p) => {
        const target = computeTargetSlug(pathname, p.value);
        const targetSlug = target ? slugFromTarget(target) : '';
        const exists = p.value === 'all' || slugSet.has(targetSlug);
        if (!exists) return null;
        return (
          <button
            key={p.value}
            onClick={() => handleClick(p.value)}
            className={'v3-asset-pill' + (asset === p.value ? ' active' : '')}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
