'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAsset, type AssetKey } from './AssetContext';

const LABELS: Record<AssetKey, string> = {
  nq: 'NQ',
  gc: 'GC',
  si: 'SI',
  ym: 'YM',
  es: 'ES',
};

function currentBase(currentPath: string): string | null {
  const match = currentPath.match(/^\/studies\/([^\/]+)\/?/);
  if (!match) return null;
  return match[1].replace(/-(gc|es|si|ym)$/, '');
}

function computeTargetSlug(currentPath: string, asset: AssetKey): string | null {
  const base = currentBase(currentPath);
  if (!base) return null;
  if (asset === 'nq') return `/studies/${base}/`;
  if (asset === 'gc') return `/studies/${base}-gc/`;
  if (asset === 'es') return `/studies/${base}-es/`;
  if (asset === 'si') return `/studies/${base}-si/`;
  if (asset === 'ym') return `/studies/${base}-ym/`;
  return null;
}

function slugFromTarget(target: string): string {
  return target.replace(/^\/studies\//, '').replace(/\/$/, '');
}

export default function AssetPills({ availableSlugs }: { availableSlugs?: string[] }) {
  const { asset, setAsset, availableAssets } = useAsset();
  const router = useRouter();
  const pathname = usePathname();

  const slugSet = availableSlugs ? new Set(availableSlugs) : null;
  const onSlugRoute = /^\/studies\/[^\/]+\/?$/.test(pathname);
  const inlineMode = !availableSlugs || availableSlugs.length === 0;

  if (!onSlugRoute) return null;

  function handleClick(value: AssetKey) {
    setAsset(value);
    if (inlineMode) return;
    const target = computeTargetSlug(pathname, value);
    const normPath = pathname.replace(/\/$/, '');
    if (!target || target.replace(/\/$/, '') === normPath) return;
    const targetSlug = slugFromTarget(target);
    if (slugSet && !slugSet.has(targetSlug)) return;
    const params = new URLSearchParams(window.location.search);
    params.delete('asset');
    params.delete('year');
    const qs = params.toString();
    router.push(qs ? `${target}?${qs}` : target);
  }

  return (
    <div className="v3-asset-pills" data-inline={inlineMode ? '' : undefined}>
      {availableAssets.map((key) => (
        <button
          key={key}
          onClick={() => handleClick(key)}
          className={'v3-asset-pill' + (asset === key ? ' active' : '')}
        >
          {LABELS[key]}
        </button>
      ))}
    </div>
  );
}
