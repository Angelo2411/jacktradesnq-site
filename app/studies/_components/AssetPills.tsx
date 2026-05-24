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
    // Clear filter params that may be invalid under the new asset's grid
    // (Stop/TP grids differ per asset; keeping stale variant/tp causes "No trade data available").
    const params = new URLSearchParams(window.location.search);
    const hadFilters = params.has('variant') || params.has('tp') || params.has('smt') || params.has('asset') || params.has('year');
    params.delete('asset');
    params.delete('year');
    params.delete('variant');
    params.delete('tp');
    params.delete('smt');
    if (inlineMode) {
      if (hadFilters) {
        const qs = params.toString();
        router.replace(pathname + (qs ? '?' + qs : ''), { scroll: false });
      }
      return;
    }
    const target = computeTargetSlug(pathname, value);
    const normPath = pathname.replace(/\/$/, '');
    if (!target || target.replace(/\/$/, '') === normPath) return;
    const targetSlug = slugFromTarget(target);
    if (slugSet && !slugSet.has(targetSlug)) return;
    const qs = params.toString();
    router.push(qs ? `${target}?${qs}` : target);
  }

  return (
    <div className="v3-asset-pills" data-inline={inlineMode ? '' : undefined}>
      {availableAssets
        .filter((key) => {
          if (!slugSet) return true;
          if (key === asset) return true;
          const target = computeTargetSlug(pathname, key);
          const tslug = target ? slugFromTarget(target) : null;
          return tslug != null && slugSet.has(tslug);
        })
        .map((key) => (
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
