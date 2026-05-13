'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type AssetKey = 'nq' | 'gc';

type Ctx = { asset: AssetKey; setAsset: (a: AssetKey) => void };
const AssetCtx = createContext<Ctx | null>(null);

export function AssetProvider({ children }: { children: ReactNode }) {
  const [asset, setAssetState] = useState<AssetKey>('nq');

  // Hydrate from URL query OR localStorage on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('asset');
    if (fromUrl === 'gc' || fromUrl === 'nq') { setAssetState(fromUrl); return; }
    const stored = localStorage.getItem('jtnq-asset');
    if (stored === 'gc' || stored === 'nq') setAssetState(stored);
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
