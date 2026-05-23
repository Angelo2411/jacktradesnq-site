'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type AssetKey = 'nq' | 'gc' | 'si' | 'ym' | 'es';

type Ctx = { asset: AssetKey; setAsset: (a: AssetKey) => void; availableAssets: AssetKey[] };
const AssetCtx = createContext<Ctx | null>(null);

function studySlug(pathname: string): string | null {
  const m = pathname.match(/^\/studies\/([^\/]+)\/?/);
  return m ? m[1] : null;
}

export function AssetProvider({ children, assets = ['nq', 'gc'], slug }: { children: ReactNode; assets?: AssetKey[]; slug?: string }) {
  const [asset, setAssetState] = useState<AssetKey>('nq');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('asset');
    if (fromUrl && assets.includes(fromUrl as AssetKey)) { setAssetState(fromUrl as AssetKey); return; }
    const path = window.location.pathname.replace(/\/+$/, '');
    if (/-si$/.test(path)) { setAssetState('si'); return; }
    if (/-es$/.test(path)) { setAssetState('es'); return; }
    if (/-gc$/.test(path)) { setAssetState('gc'); return; }
    if (/-ym$/.test(path)) { setAssetState('ym'); return; }
    const effectiveSlug = slug ?? studySlug(window.location.pathname);
    if (effectiveSlug) {
      const perStudy = localStorage.getItem(`study-asset-${effectiveSlug}`);
      if (perStudy && assets.includes(perStudy as AssetKey)) { setAssetState(perStudy as AssetKey); return; }
    }
    const stored = localStorage.getItem('jtnq-asset');
    if (stored && assets.includes(stored as AssetKey)) setAssetState(stored as AssetKey);
  }, []);

  const setAsset = (a: AssetKey) => {
    setAssetState(a);
    try {
      const effectiveSlug = slug ?? studySlug(window.location.pathname);
      if (effectiveSlug) localStorage.setItem(`study-asset-${effectiveSlug}`, a);
      localStorage.setItem('jtnq-asset', a);
    } catch {}
  };

  return <AssetCtx.Provider value={{ asset, setAsset, availableAssets: assets }}>{children}</AssetCtx.Provider>;
}

export function useAsset() {
  const ctx = useContext(AssetCtx);
  if (!ctx) throw new Error('useAsset must be used within AssetProvider');
  return ctx;
}
