import type { JSX } from 'react';

type Trade = { ts: string; pnl_pts: number; outcome?: string };

type Props = {
  trades: Trade[];
  title?: string;
  subtitle?: string;
};

type MonthKey = `${number}-${number}`;
type MonthAgg = { sum: number; count: number; dates: string[] };

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] as const;

/**
 * Map aggregate pnl to one of 5 intensity steps (0 = empty).
 * Steps 1–5 go light→dark for both wins and losses.
 */
function intensity(pnl: number, maxAbs: number): 1 | 2 | 3 | 4 | 5 {
  if (maxAbs === 0) return 1;
  const ratio = Math.abs(pnl) / maxAbs;
  if (ratio < 0.2) return 1;
  if (ratio < 0.4) return 2;
  if (ratio < 0.6) return 3;
  if (ratio < 0.8) return 4;
  return 5;
}

/**
 * OKLCH warm greens (sage-family, hue 145) — light to dark
 * All values chosen to stay in warm-editorial palette (no cold greens)
 */
const WIN_COLORS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'oklch(0.88 0.06 82)',
  2: 'oklch(0.78 0.09 82)',
  3: 'oklch(0.66 0.11 82)',
  4: 'oklch(0.54 0.12 82)',
  5: 'oklch(0.42 0.10 82)',
};

/**
 * OKLCH warm reds (terra-family, hue 25) — light to dark
 */
const LOSS_COLORS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'oklch(0.92 0.03 42)',
  2: 'oklch(0.82 0.063 42)',
  3: 'oklch(0.68 0.091 42)',
  4: 'oklch(0.56 0.105 42)',
  5: 'oklch(0.44 0.105 42)',
};

function buildGrid(trades: Trade[]): {
  years: number[];
  grid: Map<MonthKey, MonthAgg>;
  maxWin: number;
  maxLoss: number;
} {
  const grid = new Map<MonthKey, MonthAgg>();

  for (const trade of trades) {
    const d = new Date(trade.ts);
    if (isNaN(d.getTime())) continue;
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1; // 1-12
    const key: MonthKey = `${year}-${month}`;
    const dateStr = d.toISOString().slice(0, 10);

    if (!grid.has(key)) {
      grid.set(key, { sum: 0, count: 0, dates: [] });
    }
    const agg = grid.get(key)!;
    agg.sum += trade.pnl_pts;
    agg.count += 1;
    agg.dates.push(`${dateStr} · ${trade.pnl_pts > 0 ? '+' : ''}${trade.pnl_pts.toFixed(1)} pts`);
  }

  let maxWin = 0;
  let maxLoss = 0;
  for (const agg of grid.values()) {
    if (agg.sum > 0) maxWin = Math.max(maxWin, agg.sum);
    if (agg.sum < 0) maxLoss = Math.max(maxLoss, Math.abs(agg.sum));
  }

  // Collect unique years, sort descending (most recent on top)
  const yearSet = new Set<number>();
  for (const key of grid.keys()) {
    yearSet.add(parseInt(key.split('-')[0], 10));
  }
  const years = Array.from(yearSet).sort((a, b) => b - a);

  return { years, grid, maxWin, maxLoss };
}

function CellTooltip(agg: MonthAgg): string {
  if (agg.count === 1) return agg.dates[0];
  const sign = agg.sum > 0 ? '+' : '';
  return `${agg.count} trades · ${sign}${agg.sum.toFixed(1)} pts total\n${agg.dates.slice(0, 8).join('\n')}${agg.dates.length > 8 ? `\n…+${agg.dates.length - 8} more` : ''}`;
}

export default function EventHeatmap({ trades, title = 'Past releases', subtitle }: Props): JSX.Element {
  const { years, grid, maxWin, maxLoss } = buildGrid(trades);

  return (
    <div className="eh-card">
      {/* Header */}
      <div className="eh-header">
        <h3 className="eh-title">{title}</h3>
        {subtitle && <p className="eh-subtitle">{subtitle}</p>}
      </div>

      {/* Grid */}
      <div className="eh-grid-wrap" role="table" aria-label={title}>
        {/* Month column headers */}
        <div className="eh-row eh-row--header" role="row">
          <div className="eh-year-label" role="columnheader" aria-label="Year" />
          {MONTH_LABELS.map((m, i) => (
            <div key={i} className="eh-month-hd" role="columnheader" aria-label={`Month ${i + 1}`}>
              {m}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {years.map((year) => (
          <div key={year} className="eh-row" role="row">
            <div className="eh-year-label" role="rowheader">{year}</div>
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              const key: MonthKey = `${year}-${month}`;
              const agg = grid.get(key);

              if (!agg) {
                return (
                  <div
                    key={month}
                    className="eh-cell eh-cell--empty"
                    role="cell"
                    aria-label={`${year}-${String(month).padStart(2, '0')}: no trade`}
                  />
                );
              }

              const isWin = agg.sum >= 0;
              const step = intensity(agg.sum, isWin ? maxWin : maxLoss);
              const color = isWin ? WIN_COLORS[step] : LOSS_COLORS[step];
              const sign = agg.sum > 0 ? '+' : '';
              const ariaLabel = `${year}-${String(month).padStart(2, '0')}: ${sign}${agg.sum.toFixed(1)} pts (${agg.count} trade${agg.count !== 1 ? 's' : ''})`;

              return (
                <div
                  key={month}
                  className={`eh-cell eh-cell--${isWin ? 'win' : 'loss'}`}
                  style={{ backgroundColor: color }}
                  title={CellTooltip(agg)}
                  role="cell"
                  aria-label={ariaLabel}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="eh-legend" aria-hidden="true">
        <span className="eh-legend-label">Loss</span>
        <div className="eh-legend-scale eh-legend-scale--loss">
          {([5, 4, 3, 2, 1] as const).map((step) => (
            <div
              key={step}
              className="eh-legend-swatch"
              style={{ backgroundColor: LOSS_COLORS[step] }}
            />
          ))}
        </div>
        <div className="eh-legend-empty" />
        <div className="eh-legend-scale eh-legend-scale--win">
          {([1, 2, 3, 4, 5] as const).map((step) => (
            <div
              key={step}
              className="eh-legend-swatch"
              style={{ backgroundColor: WIN_COLORS[step] }}
            />
          ))}
        </div>
        <span className="eh-legend-label">Win</span>
        <span className="eh-legend-divider" />
        <div className="eh-legend-empty-swatch" />
        <span className="eh-legend-label">No trade</span>
      </div>
    </div>
  );
}
