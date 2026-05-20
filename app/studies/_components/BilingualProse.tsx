'use client';
import { useAsset } from './AssetContext';

export default function BilingualProse({
  htmlNq,
  htmlGc,
  className = 'bd-prose',
}: {
  htmlNq: string;
  htmlGc: string;
  className?: string;
}) {
  const { asset } = useAsset();
  const html = asset === 'nq' ? htmlNq : htmlGc;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
