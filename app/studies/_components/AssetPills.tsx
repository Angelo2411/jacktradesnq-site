'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAsset, type AssetKey } from './AssetContext';

const PILLS: { label: string; value: AssetKey }[] = [
  { label: 'NQ', value: 'nq' },
  { label: 'GC', value: 'gc' },
  { label: 'ES', value: 'es' },
  { label: 'YM', value: 'ym' },
  { label: 'SI', value: 'si' },
  { label: 'All', value: 'all' },
];

// Pages where assets are rendered inline (no sister-slug routing).
// On these, pills set context only and stay on the same URL.
const VIRTUAL_ASSET_SLUGS: Record<string, AssetKey[]> = {
  'asia-open': ['nq', 'gc', 'es', 'si', 'ym'],
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

export default function AssetPills({ availableSlugs }: { availableSlugs: string[] }) {
  const { asset, setAsset } = useAsset();
  const router = useRouter();
  const pathname = usePathname();

  const slugSet = new Set(availableSlugs);
  const onSlugRoute = /^\/studies\/[^\/]+\/?$/.test(pathname);

  if (!onSlugRoute) return null;

  const base = currentBase(pathname) ?? '';
  const virtualSet = new Set(VIRTUAL_ASSET_SLUGS[base] ?? []);

  function handleClick(value: AssetKey) {
    setAsset(value);
    if (virtualSet.has(value)) return; // inline render, no nav
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
        const exists = p.value === 'all' || virtualSet.has(p.value) || slugSet.has(targetSlug);
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
