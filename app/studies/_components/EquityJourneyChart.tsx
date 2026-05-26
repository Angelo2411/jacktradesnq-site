import type { TearsheetData } from '@/lib/tearsheet';

interface Props {
  data: TearsheetData;
}

const W = 740;
const H = 360;
const PAD_L = 52;
const PAD_R = 20;
const PAD_T = 70;
const PAD_B = 36;
const CHART_W = W - PAD_L - PAD_R;
const CHART_H = H - PAD_T - PAD_B;

function toX(i: number, n: number) {
  return PAD_L + (i / (n - 1)) * CHART_W;
}

function toY(val: number, minVal: number, maxVal: number) {
  const range = maxVal - minVal || 1;
  return PAD_T + CHART_H - ((val - minVal) / range) * CHART_H;
}

function fmtPts(v: number) {
  return v >= 0 ? `+${v}` : String(v);
}

export default function EquityJourneyChart({ data }: Props) {
  const { curve, peakPts, peakDate, troughPts, troughDate, periodStart, periodEnd } = data;
  const n = curve.length;
  if (n < 2) return null;

  const cumVals = curve.map((c) => c.cumulative);
  const minVal = Math.min(0, ...cumVals);
  const maxVal = Math.max(...cumVals);
  const paddedMax = maxVal * 1.12;
  const paddedMin = Math.min(0, minVal - Math.abs(minVal) * 0.1);

  // Y axis ticks
  const yRange = paddedMax - paddedMin;
  const tickStep = yRange > 600 ? 200 : yRange > 300 ? 100 : 50;
  const yTicks: number[] = [];
  const firstTick = Math.ceil(paddedMin / tickStep) * tickStep;
  for (let t = firstTick; t <= paddedMax; t += tickStep) yTicks.push(t);

  // Zero Y
  const zeroY = toY(0, paddedMin, paddedMax);

  // Points
  const pts = curve.map((c, i) => ({
    x: toX(i, n),
    y: toY(c.cumulative, paddedMin, paddedMax),
    pnl: c.tradePnl,
    isWin: c.isWin,
    date: c.date,
    cum: c.cumulative,
  }));

  // Line path
  const linePath = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  // Area fill
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${zeroY.toFixed(1)} L ${pts[0].x.toFixed(1)} ${zeroY.toFixed(1)} Z`;

  // Peak & trough indices
  const peakIdx = cumVals.indexOf(Math.max(...cumVals));
  const troughIdx = (() => {
    let minDD = 0; let idx = 0;
    let runPeak = 0;
    for (let i = 0; i < n; i++) {
      if (cumVals[i] > runPeak) runPeak = cumVals[i];
      const dd = cumVals[i] - runPeak;
      if (dd < minDD) { minDD = dd; idx = i; }
    }
    return idx;
  })();

  // X axis year labels
  const startYear = parseInt(periodStart);
  const endYear = parseInt(periodEnd);
  const yearLabels: { x: number; label: string }[] = [];
  for (let y = startYear; y <= endYear; y += 2) {
    const firstDate = new Date(curve[0].date).getTime();
    const lastDate = new Date(curve[n - 1].date).getTime();
    const yearDate = new Date(`${y}-01-01`).getTime();
    const frac = Math.max(0, Math.min(1, (yearDate - firstDate) / (lastDate - firstDate)));
    yearLabels.push({ x: PAD_L + frac * CHART_W, label: String(y) });
  }

  // Bar dimensions: thinner (max 4px wide), more discreet
  const maxAbsPnl = Math.max(...curve.map((c) => Math.abs(c.tradePnl)));
  const barMaxH = 80;
  const barW = Math.max(2, Math.min(4, CHART_W / n - 2));

  const peakPt = pts[peakIdx];
  const troughPt = pts[troughIdx];

  // Peak label: anchor right if peak is in right third of chart
  const peakFrac = (peakPt.x - PAD_L) / CHART_W;
  const peakAnchor = peakFrac > 0.67 ? 'end' : peakFrac < 0.33 ? 'start' : 'middle';

  return (
    <div className="ts-chart-card">
      <h3 className="ts-chart-h3">Equity journey</h3>
      <p className="ts-chart-sub">Cumulative PnL + per-trade overlay · SMT-on</p>

      <svg
        className="ts-chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Cumulative equity curve from 0 to ${fmtPts(Math.round(maxVal))} pts over ${n} FOMC trades ${periodStart}–${periodEnd}`}
      >
        {/* Grid lines */}
        <g stroke="oklch(0.62 0.02 70 / 0.07)" strokeWidth="1" strokeDasharray="2 4">
          {yTicks.map((t) => {
            const y = toY(t, paddedMin, paddedMax);
            return <line key={t} x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} />;
          })}
        </g>

        {/* Zero baseline */}
        <line
          x1={PAD_L} y1={zeroY} x2={W - PAD_R} y2={zeroY}
          stroke="oklch(0.62 0.02 70 / 0.22)" strokeWidth="1"
        />

        {/* Y axis labels */}
        <g fontFamily="Satoshi" fontSize="11" fill="oklch(0.62 0.02 70)" fontWeight="600">
          {yTicks.map((t) => (
            <text key={t} x={PAD_L - 6} y={toY(t, paddedMin, paddedMax) + 4} textAnchor="end">
              {t >= 0 ? `+${t}` : t}
            </text>
          ))}
        </g>

        {/* X axis year labels */}
        <g fontFamily="Satoshi" fontSize="10" fill="oklch(0.62 0.02 70)" fontWeight="600">
          {yearLabels.map(({ x, label }) => (
            <text key={label} x={x} y={H - 4} textAnchor="middle">{label}</text>
          ))}
        </g>

        {/* Per-trade bars — gains above zero, losses below, opacity 0.20 */}
        <g opacity="0.20">
          {pts.map((p, i) => {
            const barH = Math.max(2, (Math.abs(p.pnl) / maxAbsPnl) * barMaxH);
            const barX = p.x - barW / 2;
            const barY = p.isWin ? zeroY - barH : zeroY;
            return (
              <rect
                key={i}
                x={barX.toFixed(1)}
                y={barY.toFixed(1)}
                width={barW}
                height={barH.toFixed(1)}
                fill={p.isWin ? 'var(--c-sage)' : 'var(--c-terra)'}
              />
            );
          })}
        </g>

        {/* Area fill */}
        <path d={areaPath} fill="var(--c-sage)" opacity="0.10" />

        {/* Equity line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--c-sage)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Peak marker */}
        {peakIdx > 0 && (
          <g transform={`translate(${peakPt.x.toFixed(1)},${peakPt.y.toFixed(1)})`}>
            <circle r="5" fill="var(--c-sage)" stroke="oklch(0.96 0.02 82)" strokeWidth="2" />
            <line x1="0" y1="-8" x2="0" y2="-22" stroke="oklch(0.42 0.10 82)" strokeWidth="1" strokeDasharray="2 2" />
            {/* Single compact label block: line1 "PEAK +753", line2 date */}
            <text
              x="0" y="-26"
              textAnchor={peakAnchor}
              fontFamily="Fraunces"
              fontSize="12"
              fontStyle="italic"
              fontWeight="700"
              fill="var(--c-sage)"
            >
              PEAK {fmtPts(Math.round(peakPts))}
            </text>
            <text
              x="0" y="-38"
              textAnchor={peakAnchor}
              fontFamily="Satoshi"
              fontSize="9"
              fill="oklch(0.62 0.02 70)"
            >
              {peakDate}
            </text>
          </g>
        )}

        {/* Trough marker */}
        {troughIdx > 0 && (
          <g transform={`translate(${troughPt.x.toFixed(1)},${troughPt.y.toFixed(1)})`}>
            <circle r="5" fill="var(--c-terra)" stroke="oklch(0.96 0.012 42)" strokeWidth="2" />
            <line x1="0" y1="8" x2="0" y2="22" stroke="var(--c-terra)" strokeWidth="1" strokeDasharray="2 2" />
            <text
              x="0" y="34"
              textAnchor="middle"
              fontFamily="Fraunces"
              fontSize="11"
              fontStyle="italic"
              fontWeight="700"
              fill="var(--c-terra)"
            >
              {troughPts} DD · {troughDate}
            </text>
          </g>
        )}
      </svg>

      <div className="ts-chart-legend">
        <div className="ts-legend-item">
          <span className="ts-legend-line" />
          Cumulative equity
        </div>
        <div className="ts-legend-item">
          <span className="ts-legend-swatch" style={{ background: 'var(--c-sage)' }} />
          Trade win
        </div>
        <div className="ts-legend-item">
          <span className="ts-legend-swatch" style={{ background: 'var(--c-terra)' }} />
          Trade loss
        </div>
      </div>
    </div>
  );
}
