'use client';
import { useAsset } from './AssetContext';

export default function BilingualProse({
  htmlNq,
  htmlGc,
  htmlEs,
  htmlSi,
  className = 'bd-prose',
}: {
  htmlNq: string;
  htmlGc: string;
  htmlEs?: string;
  htmlSi?: string;
  className?: string;
}) {
  const { asset } = useAsset();
  const html =
    asset === 'es' ? (htmlEs ?? htmlNq)
    : asset === 'si' ? (htmlSi ?? htmlNq)
    : asset === 'gc' ? htmlGc
    : htmlNq;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
