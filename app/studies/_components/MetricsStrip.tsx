import type { TearsheetData } from '@/lib/tearsheet';

interface Props {
  data: TearsheetData;
}

export default function MetricsStrip({ data }: Props) {
  const metrics = [
    {
      label: 'Profit factor',
      value: data.profitFactor.toFixed(2),
      cls: 'pos',
      sub: 'gross / loss',
    },
    {
      label: 'Win rate',
      value: `${data.winRate}%`,
      cls: '',
      sub: `${data.wins} W / ${data.losses} L`,
    },
    {
      label: 'Sample',
      value: String(data.sample),
      cls: '',
      sub: `trades · ${+data.periodEnd - +data.periodStart}y`,
    },
    {
      label: 'Net pts',
      value: data.netPts >= 0 ? `+${Math.round(data.netPts)}` : String(Math.round(data.netPts)),
      cls: data.netPts >= 0 ? 'pos' : 'neg',
      sub: 'cumulative',
    },
    {
      label: 'Avg R',
      value: data.avgR.toFixed(2),
      cls: '',
      sub: 'win / risk',
    },
    {
      label: 'Max drawdown',
      value: String(data.maxDrawdown),
      cls: 'neg',
      sub: 'pts depth',
    },
    {
      label: 'Recovery',
      value: String(data.recoveryFactor),
      cls: '',
      sub: 'net / DD',
    },
  ];

  return (
    <div className="ts-metrics">
      {metrics.map((m, i) => (
        <div key={i} className="ts-metric">
          <span className="ts-metric-l">{m.label}</span>
          <span className={`ts-metric-v${m.cls ? ' ' + m.cls : ''}`}>{m.value}</span>
          <span className="ts-metric-sub">{m.sub}</span>
        </div>
      ))}
    </div>
  );
}
