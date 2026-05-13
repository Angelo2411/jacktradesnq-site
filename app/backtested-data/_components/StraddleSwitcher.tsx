'use client';

import StraddleExplorer, { type ExplorerConfig } from './StraddleExplorer';
import { useAsset } from './AssetContext';

interface Props {
  nqConfig: ExplorerConfig;
  gcConfig: ExplorerConfig;
}

export default function StraddleSwitcher({ nqConfig, gcConfig }: Props) {
  const { asset } = useAsset();
  const config = asset === 'nq' ? nqConfig : gcConfig;

  return (
    <div className="bd-asset-scope" data-asset={asset}>
      {/* key forces full remount + refetch when asset switches */}
      <StraddleExplorer key={config.dataUrl} config={config} embedded />
    </div>
  );
}
