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

// Studies that switch asset in-place (one slug, asset chosen via ?asset=)
// instead of navigating to a per-asset sibling slug.
const INLINE_SWITCHER_ASSETS: Record<string, AssetKey[]> = {
  'killzone-past-vs-now': ['nq', 'gc', 'es'],
  'asia-open': ['nq', 'gc', 'es', 'si'],
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
  const currentSlug = pathname.match(/^\/studies\/([^\/]+)\/?/)?.[1] ?? '';
  const switcherAssets = INLINE_SWITCHER_ASSETS[currentSlug] ?? null;
  const inlineMode = !!switcherAssets || !availableSlugs || availableSlugs.length === 0;

  if (!onSlugRoute) return null;

  function handleClick(value: AssetKey) {
    setAsset(value);
    // Clear filter params that may be invalid under the new asset's grid
    // (Stop/TP grids differ per asset; keeping stale variant/tp causes "No trade data available").
    const params = new URLSearchParams(window.location.search);
    params.delete('year');
    params.delete('variant');
    params.delete('tp');
    params.delete('smt');
    if (switcherAssets) {
      // In-place asset switch: persist choice in the URL so it's shareable.
      if (value === 'nq') params.delete('asset');
      else params.set('asset', value);
      const qs = params.toString();
      router.replace(pathname + (qs ? '?' + qs : ''), { scroll: false });
      return;
    }
    const hadFilters = params.has('variant') || params.has('tp') || params.has('smt') || params.has('asset') || params.has('year');
    params.delete('asset');
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
      {(switcherAssets ?? availableAssets)
        .filter((key) => {
          if (switcherAssets) return true;
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
