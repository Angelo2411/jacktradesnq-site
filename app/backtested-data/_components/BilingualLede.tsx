'use client';
import { useAsset } from './AssetContext';

export default function BilingualLede({
  nq,
  gc,
  fallback,
}: {
  nq?: string;
  gc?: string;
  fallback: string;
}) {
  const { asset } = useAsset();
  const text = asset === 'gc' ? (gc ?? fallback) : (nq ?? fallback);
  return <p className="bd-article-lede">{text}</p>;
}
