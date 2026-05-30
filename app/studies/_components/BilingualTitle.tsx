'use client';
import { useAsset } from './AssetContext';

export default function BilingualTitle({
  nq,
  gc,
  fallback,
}: { nq?: string; gc?: string; fallback: string }) {
  const { asset } = useAsset();
  if (asset === 'gc' && gc) return <>{gc}</>;
  if (asset === 'nq' && nq) return <>{nq}</>;
  return <>{fallback}</>;
}
