import type { TearsheetData } from '@/lib/tearsheet';

interface Props {
  data: TearsheetData;
}

const SVG_W = 420;
const SVG_H = 200;
const PAD_L = 20;
const PAD_R = 10;
const PAD_T = 28;
const PAD_B = 32;
const CHART_W = SVG_W - PAD_L - PAD_R;
const CHART_H = SVG_H - PAD_T - PAD_B;

const COUNT_FILL = 'oklch(0.52 0.012 270)';

export default function PnLDistribution({ data }: Props) {
  const { distribution } = data;
  const allBins = distribution;

  const maxCount = Math.max(...allBins.map((b) => b.count), 1);
  const totalBins = allBins.length;
  const binW = CHART_W / totalBins;
  const gap = 2;

  // Zero line X position
  const minBin = allBins[0].binStart;
  const maxBin = allBins[allBins.length - 1].binEnd;
  const range = maxBin - minBin;
  const zeroPct = (-minBin) / range;
  const zeroX = PAD_L + zeroPct * CHART_W;
  const axisY = PAD_T + CHART_H;

  const binSize = allBins[0].binEnd - allBins[0].binStart;

  return (
    <div className="ts-dist-card">
      <h4 className="ts-dist-h4">PnL distribution</h4>
      <p className="ts-dist-sub">Bins of {binSize} pts · n={data.sample}</p>
      <svg
        className="ts-dist-svg"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        role="img"
        aria-label="PnL distribution histogram"
      >
        {/* X axis */}
        <line x1={PAD_L} y1={axisY} x2={SVG_W - PAD_R} y2={axisY}
          stroke="oklch(0.20 0.02 270 / 0.20)" strokeWidth="1" />

        {/* Zero marker — dashed line only, no text label */}
        <line x1={zeroX} y1={PAD_T} x2={zeroX} y2={axisY}
          stroke="oklch(0.20 0.02 270 / 0.28)" strokeWidth="1" strokeDasharray="2 2" />

        {/* Bars */}
        {allBins.map((b, i) => {
          if (b.count === 0) return null;
          const barH = Math.max(4, (b.count / maxCount) * CHART_H);
          const barX = PAD_L + i * binW + gap / 2;
          const barY = axisY - barH;
          const isWin = b.binStart >= 0;
          const fill = isWin ? 'var(--c-sage)' : 'var(--c-terra)';
          return (
            <g key={i}>
              <rect
                x={barX.toFixed(1)} y={barY.toFixed(1)}
                width={(binW - gap).toFixed(1)} height={barH.toFixed(1)}
                fill={fill} rx="2"
              />
              <text
                x={(barX + (binW - gap) / 2).toFixed(1)}
                y={(barY - 3).toFixed(1)}
                textAnchor="middle"
                fontFamily="Fraunces" fontSize="9"
                fontWeight="600" fill={COUNT_FILL}
              >
                {b.count}
              </text>
            </g>
          );
        })}

        {/* X axis tick labels — every other bin to avoid crowding */}
        <g fontFamily="Satoshi" fontSize="8" fill="oklch(0.52 0.012 270)" fontWeight="600">
          {allBins.map((b, i) => {
            if (i % 2 !== 0) return null;
            const labelX = PAD_L + i * binW + binW / 2;
            const label = b.binStart === 0 ? '0' : b.binStart > 0 ? `+${b.binStart}` : String(b.binStart);
            return (
              <text key={i} x={labelX.toFixed(1)} y={SVG_H - 2} textAnchor="middle">
                {label}
              </text>
            );
          })}
        </g>
      </svg>
      <p className="ts-dist-note">
        {data.avgWin >= 0 ? '+' : ''}{data.avgWin} avg win ·{' '}
        {data.avgLoss} avg loss · right-skewed cluster
      </p>
    </div>
  );
}
