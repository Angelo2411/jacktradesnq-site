'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type AssetKey = 'nq' | 'gc' | 'es' | 'ym' | 'all';

type Ctx = { asset: AssetKey; setAsset: (a: AssetKey) => void };
const AssetCtx = createContext<Ctx | null>(null);

export function AssetProvider({ children }: { children: ReactNode }) {
  const [asset, setAssetState] = useState<AssetKey>('nq');

  // Hydrate from URL query > slug suffix > localStorage on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('asset');
    if (fromUrl === 'gc' || fromUrl === 'nq' || fromUrl === 'es' || fromUrl === 'ym' || fromUrl === 'all') { setAssetState(fromUrl); return; }
    const path = window.location.pathname.replace(/\/+$/, '');
    if (/-ym$/.test(path)) { setAssetState('ym'); return; }
    if (/-es$/.test(path)) { setAssetState('es'); return; }
    if (/-gc$/.test(path)) { setAssetState('gc'); return; }
    const stored = localStorage.getItem('jtnq-asset');
    if (stored === 'gc' || stored === 'nq' || stored === 'es' || stored === 'ym' || stored === 'all') setAssetState(stored as AssetKey);
  }, []);

  const setAsset = (a: AssetKey) => {
    setAssetState(a);
    try { localStorage.setItem('jtnq-asset', a); } catch {}
  };

  return <AssetCtx.Provider value={{ asset, setAsset }}>{children}</AssetCtx.Provider>;
}

export function useAsset() {
  const ctx = useContext(AssetCtx);
  if (!ctx) throw new Error('useAsset must be used within AssetProvider');
  return ctx;
}
