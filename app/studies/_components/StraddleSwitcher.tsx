'use client';
import StraddleExplorer, { type ExplorerConfig } from './StraddleExplorer';
import { useAsset } from './AssetContext';

interface Props {
  nqConfig?: ExplorerConfig;
  gcConfig?: ExplorerConfig;
  siConfig?: ExplorerConfig;
  ymConfig?: ExplorerConfig;
  esConfig?: ExplorerConfig;
  fullportPdfNq?: string;
  fullportPdfGc?: string;
  fullportLabel?: string;
}
export default function StraddleSwitcher(props: Props) {
  const { asset } = useAsset();
  const map = { nq: props.nqConfig, gc: props.gcConfig, si: props.siConfig, ym: props.ymConfig, es: props.esConfig };
  const config = map[asset] ?? props.nqConfig;
  if (!config) return null;
  return (
    <div className="bd-asset-scope" data-asset={asset}>
      <StraddleExplorer key={config.dataUrl} config={config} embedded
        fullportPdfNq={props.fullportPdfNq} fullportPdfGc={props.fullportPdfGc} fullportLabel={props.fullportLabel} />
    </div>
  );
}
