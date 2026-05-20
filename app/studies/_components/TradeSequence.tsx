import type { TearsheetData } from '@/lib/tearsheet';

interface Props {
  data: TearsheetData;
}

export default function TradeSequence({ data }: Props) {
  const { streaks, longestWStreak, longestLStreak } = data;

  return (
    <div className="ts-streak-card">
      <h4 className="ts-streak-h4">Trade sequence</h4>
      <div className="ts-streak-bar">
        {streaks.map((s, i) => (
          <div
            key={i}
            className={`ts-streak-seg ${s.type === 'W' ? 'w' : 'l'}`}
            style={{ flex: s.length }}
            title={`${s.length}${s.type}`}
          >
            {s.length > 1 ? `${s.length}${s.type}` : s.type}
          </div>
        ))}
      </div>
      <div className="ts-streak-legend">
        <span>
          Longest W{' '}
          <strong className="ts-streak-w">{longestWStreak}</strong>
        </span>
        <span>
          Longest L{' '}
          <strong className="ts-streak-l">{longestLStreak}</strong>
        </span>
      </div>
    </div>
  );
}
