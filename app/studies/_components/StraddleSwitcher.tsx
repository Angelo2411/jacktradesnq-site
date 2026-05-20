'use client';

import StraddleExplorer, { type ExplorerConfig } from './StraddleExplorer';
import { useAsset } from './AssetContext';

interface Props {
  nqConfig: ExplorerConfig;
  gcConfig: ExplorerConfig;
  fullportPdfNq?: string;
  fullportPdfGc?: string;
  fullportLabel?: string;
}

export default function StraddleSwitcher({ nqConfig, gcConfig, fullportPdfNq, fullportPdfGc, fullportLabel }: Props) {
  const { asset } = useAsset();
  const config = asset === 'nq' ? nqConfig : gcConfig;

  return (
    <div className="bd-asset-scope" data-asset={asset}>
      {/* key forces full remount + refetch when asset switches */}
      <StraddleExplorer
        key={config.dataUrl}
        config={config}
        embedded
        fullportPdfNq={fullportPdfNq}
        fullportPdfGc={fullportPdfGc}
        fullportLabel={fullportLabel}
      />
    </div>
  );
}
