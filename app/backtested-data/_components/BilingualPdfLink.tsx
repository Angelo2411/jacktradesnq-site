'use client';
import { useAsset } from './AssetContext';
import { IconArrowUpRight } from './icons';

export default function BilingualPdfLink({
  pdfFileNq,
  pdfFileGc,
  pdfLabel,
}: {
  pdfFileNq: string;
  pdfFileGc: string;
  pdfLabel: string;
}) {
  const { asset } = useAsset();
  const pdfFile = asset === 'nq' ? pdfFileNq : pdfFileGc;
  return (
    <a
      className="bd-btn bd-btn-primary"
      href={`/downloads/backtested-data/${pdfFile}`}
      download
    >
      {pdfLabel}
      <IconArrowUpRight />
    </a>
  );
}
