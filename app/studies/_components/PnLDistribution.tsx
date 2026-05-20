import type { TearsheetData } from '@/lib/tearsheet';

interface Props {
  data: TearsheetData;
}

const SVG_W = 320;
const SVG_H = 140;
const PAD_L = 20;
const PAD_R = 10;
const PAD_T = 20;
const PAD_B = 30;
const CHART_W = SVG_W - PAD_L - PAD_R;
const CHART_H = SVG_H - PAD_T - PAD_B;

export default function PnLDistribution({ data }: Props) {
  const { distribution } = data;
  const bins = distribution.filter((b) => b.count > 0 || (b.binStart <= 0 && b.binEnd >= 0));
  const allBins = distribution;

  const maxCount = Math.max(...allBins.map((b) => b.count), 1);
  const totalBins = allBins.length;
  const binW = CHART_W / totalBins;
  const gap = 2;

  // Zero bin X position
  const minBin = allBins[0].binStart;
  const maxBin = allBins[allBins.length - 1].binEnd;
  const range = maxBin - minBin;
  const zeroPct = (-minBin) / range;
  const zeroX = PAD_L + zeroPct * CHART_W;
  const axisY = PAD_T + CHART_H;

  return (
    <div className="ts-dist-card">
      <h4 className="ts-dist-h4">PnL distribution</h4>
      <p className="ts-dist-sub">Bins of {allBins[0].binEnd - allBins[0].binStart} pts · n={data.sample}</p>
      <svg
        className="ts-dist-svg"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        role="img"
        aria-label="PnL distribution histogram"
      >
        {/* X axis */}
        <line x1={PAD_L} y1={axisY} x2={SVG_W - PAD_R} y2={axisY}
          stroke="oklch(0.20 0.02 270 / 0.20)" strokeWidth="1" />

        {/* Zero marker */}
        <line x1={zeroX} y1={PAD_T - 4} x2={zeroX} y2={axisY}
          stroke="oklch(0.20 0.02 270 / 0.28)" strokeWidth="1" strokeDasharray="2 2" />
        <text x={zeroX} y={PAD_T - 7} textAnchor="middle"
          fontFamily="Satoshi" fontSize="9" fontWeight="700"
          fill="oklch(0.52 0.012 270)" letterSpacing="0.08em">0</text>

        {/* Bars */}
        {allBins.map((b, i) => {
          if (b.count === 0) return null;
          const barH = Math.max(4, (b.count / maxCount) * CHART_H);
          const barX = PAD_L + i * binW + gap / 2;
          const barY = axisY - barH;
          const isWin = b.binStart >= 0;
          const fill = isWin ? 'var(--c-sage)' : 'var(--c-terra)';
          const labelFill = b.count >= 3 ? fill : 'oklch(0.52 0.012 270)';
          return (
            <g key={i}>
              <rect
                x={barX.toFixed(1)} y={barY.toFixed(1)}
                width={(binW - gap).toFixed(1)} height={barH.toFixed(1)}
                fill={fill} rx="2"
              />
              <text
                x={(barX + (binW - gap) / 2).toFixed(1)}
                y={(barY - 4).toFixed(1)}
                textAnchor="middle"
                fontFamily="Fraunces" fontSize={b.count >= 3 ? "10" : "9"}
                fontWeight="600" fill={labelFill}
              >
                {b.count}
              </text>
            </g>
          );
        })}

        {/* X labels: leftmost, zero, rightmost positive */}
        <g fontFamily="Satoshi" fontSize="9" fill="oklch(0.52 0.012 270)" fontWeight="600">
          <text x={PAD_L + binW / 2} y={SVG_H - 2} textAnchor="middle">
            {allBins[0].binStart}
          </text>
          <text x={zeroX} y={SVG_H - 2} textAnchor="middle">0</text>
          <text x={SVG_W - PAD_R - binW / 2} y={SVG_H - 2} textAnchor="end">
            +{allBins[allBins.length - 1].binEnd}
          </text>
        </g>
      </svg>
      <p className="ts-dist-note">
        {data.avgWin >= 0 ? '+' : ''}{data.avgWin} avg win ·{' '}
        {data.avgLoss} avg loss · right-skewed cluster
      </p>
    </div>
  );
}
