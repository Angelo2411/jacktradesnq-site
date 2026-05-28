import type { TearsheetData } from '@/lib/tearsheet';

interface Props {
  data: TearsheetData;
}

export default function QualityFactors({ data }: Props) {
  const rows: { k: string; v: string; cls?: string }[] = [
    { k: 'Sharpe (yearly)', v: String(data.sharpe) },
    { k: 'Avg win', v: `+${data.avgWin}`, cls: 'pos' },
    { k: 'Avg loss', v: String(data.avgLoss), cls: 'neg' },
    {
      k: 'Best trade',
      v: `+${data.bestTrade} (${data.bestTradeDate})`,
      cls: 'pos',
    },
    {
      k: 'Worst trade',
      v: `${data.worstTrade} (${data.worstTradeDate})`,
      cls: 'neg',
    },
    { k: 'Time in market', v: `${data.timeInMarketMinutes} min / trade` },
  ];

  return (
    <div className="ts-detail-card">
      <h4 className="ts-detail-h4">Quality factors</h4>
      {rows.map((r, i) => (
        <div key={i} className="ts-detail-row">
          <span className="ts-detail-k">{r.k}</span>
          <span className={`ts-detail-v${r.cls ? ' ' + r.cls : ''}`}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}
