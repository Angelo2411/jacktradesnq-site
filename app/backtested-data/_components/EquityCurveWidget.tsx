import fs from 'fs';
import path from 'path';

/* ─────────────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────────── */

interface Trade {
  ts: string;
  date: string;
  year: string;
  variant: string;
  smt: boolean;
  side: string;
  pnl_pts: number;
  outcome: string;
}

interface TradesData {
  meta: {
    source: string;
    date_from: string;
    date_to: string;
    event_filter: string;
    generated_at: string;
    n_trades: number;
  };
  trades: Trade[];
}

/* ─────────────────────────────────────────────────────────────────────────────
   Computation helpers
   ───────────────────────────────────────────────────────────────────────── */

function buildEquitySeries(trades: Trade[]): number[] {
  const series: number[] = [0];
  let cum = 0;
  for (const t of trades) {
    cum += t.pnl_pts;
    series.push(cum);
  }
  return series;
}

function maxDrawdown(series: number[]): number {
  let peak = series[0];
  let maxDD = 0;
  for (const v of series) {
    if (v > peak) peak = v;
    const dd = peak - v;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

function longestLosingStreak(trades: Trade[]): number {
  let streak = 0;
  let best = 0;
  for (const t of trades) {
    if (t.pnl_pts < 0) {
      streak++;
      if (streak > best) best = streak;
    } else {
      streak = 0;
    }
  }
  return best;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SVG geometry
   ───────────────────────────────────────────────────────────────────────── */

const SVG_W = 640;
const SVG_H = 320;
const PAD_LEFT = 52;
const PAD_RIGHT = 16;
const PAD_TOP = 24;
const PAD_BOTTOM = 36;

const PLOT_W = SVG_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = SVG_H - PAD_TOP - PAD_BOTTOM;

function niceStep(range: number, maxTicks = 6): number {
  const rough = range / maxTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / magnitude;
  if (residual < 1.5) return magnitude;
  if (residual < 3.5) return 2 * magnitude;
  if (residual < 7.5) return 5 * magnitude;
  return 10 * magnitude;
}

interface SvgCurveData {
  points: string;           // polyline points attr
  zeroY: number;            // y-coordinate of the zero line
  gridLines: { y: number; label: string; isZero: boolean }[];
  xTicks: { x: number; label: string }[];
  areaBelow: string;        // polygon points for drawdown shading (below zero)
  areaAbove: string;        // polygon points for equity shading (above zero)
  finalY: number;
}

function computeSvg(series: number[]): SvgCurveData {
  const n = series.length; // includes the 0 starting point
  const minV = Math.min(...series);
  const maxV = Math.max(...series);

  // Pad the vertical range a bit
  const padding = Math.max(20, (maxV - minV) * 0.08);
  const domainMin = minV - padding;
  const domainMax = maxV + padding;
  const domainRange = domainMax - domainMin;

  function scaleX(i: number): number {
    return PAD_LEFT + (i / (n - 1)) * PLOT_W;
  }
  function scaleY(v: number): number {
    return PAD_TOP + ((domainMax - v) / domainRange) * PLOT_H;
  }

  const zeroY = scaleY(0);

  // Polyline points
  const pts = series.map((v, i) => `${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`).join(' ');

  // Grid lines — nice multiples of 100 (or step)
  const step = niceStep(domainRange);
  const gridLines: { y: number; label: string; isZero: boolean }[] = [];
  const firstTick = Math.ceil(domainMin / step) * step;
  for (let tick = firstTick; tick <= domainMax; tick += step) {
    const y = scaleY(tick);
    if (y < PAD_TOP - 4 || y > PAD_TOP + PLOT_H + 4) continue;
    gridLines.push({
      y,
      label: tick === 0 ? '0' : `${tick > 0 ? '+' : ''}${tick.toFixed(0)}`,
      isZero: tick === 0,
    });
  }

  // X-axis ticks: at 0%, 25%, 50%, 75%, 100% of trade count
  const tradeCount = n - 1; // exclude starting 0
  const xTicks: { x: number; label: string }[] = [];
  for (let pct = 0; pct <= 1.0001; pct += 0.25) {
    const idx = Math.round(pct * tradeCount);
    const clampedIdx = Math.min(idx, tradeCount);
    const x = PAD_LEFT + (clampedIdx / (n - 1)) * PLOT_W;
    xTicks.push({ x, label: String(clampedIdx) });
  }

  // Area shading below zero (drawdown periods)
  // Build polygon: walk the series, clamp at zeroY
  const belowPts: string[] = [];
  const abovePts: string[] = [];

  // For the area fill, we trace the equity line clamped to zero
  // Below zero: polygon from zeroLine → equity → back to zeroLine
  // We'll do a full polygon covering the entire curve, clipped at zero
  // Simpler: just do area from bottom to equity for "below", top to equity for "above"
  const bottomY = PAD_TOP + PLOT_H;
  const topY = PAD_TOP;

  // Below zero shading: polygon tracing zero line then equity then back
  belowPts.push(`${scaleX(0).toFixed(1)},${zeroY.toFixed(1)}`);
  for (let i = 0; i < n; i++) {
    const x = scaleX(i).toFixed(1);
    const y = Math.min(scaleY(series[i]), zeroY + 0.5); // clamp to zero line
    belowPts.push(`${x},${y.toFixed(1)}`);
  }
  belowPts.push(`${scaleX(n - 1).toFixed(1)},${zeroY.toFixed(1)}`);

  // Above zero shading (positive equity area)
  abovePts.push(`${scaleX(0).toFixed(1)},${zeroY.toFixed(1)}`);
  for (let i = 0; i < n; i++) {
    const x = scaleX(i).toFixed(1);
    const y = Math.max(scaleY(series[i]), zeroY - 0.5); // clamp to zero line
    abovePts.push(`${x},${y.toFixed(1)}`);
  }
  abovePts.push(`${scaleX(n - 1).toFixed(1)},${zeroY.toFixed(1)}`);

  const finalY = scaleY(series[n - 1]);

  return {
    points: pts,
    zeroY,
    gridLines,
    xTicks,
    areaBelow: belowPts.join(' '),
    areaAbove: abovePts.join(' '),
    finalY,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Card sub-component (pure SVG, server-renderable)
   ───────────────────────────────────────────────────────────────────────── */

interface CurveCardProps {
  label: string;
  trades: Trade[];
}

function CurveCard({ label, trades }: CurveCardProps) {
  const series = buildEquitySeries(trades);
  const finalPnl = series[series.length - 1];
  const dd = maxDrawdown(series);
  const streak = longestLosingStreak(trades);
  const svg = computeSvg(series);

  const ariaLabel = `Equity curve ${label.toLowerCase()}, ${trades.length} trades, net ${finalPnl >= 0 ? '+' : ''}${finalPnl.toFixed(0)} pts, max drawdown ${dd.toFixed(0)} points`;

  return (
    <div className="ec-card">
      {/* Header */}
      <div className="ec-card-header">
        <span className="ec-card-title">{label}</span>
        <span className="ec-trade-count">{trades.length} trades</span>
      </div>

      {/* SVG chart */}
      <svg
        className="ec-svg"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        aria-label={ariaLabel}
        role="img"
      >
        {/* Grid lines */}
        {svg.gridLines.map((gl, i) => (
          <g key={i}>
            <line
              x1={PAD_LEFT}
              y1={gl.y}
              x2={SVG_W - PAD_RIGHT}
              y2={gl.y}
              className={gl.isZero ? 'ec-grid-zero' : 'ec-grid-line'}
            />
            <text
              x={PAD_LEFT - 6}
              y={gl.y}
              className="ec-axis-label ec-axis-label-y"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {gl.label}
            </text>
          </g>
        ))}

        {/* Y-axis label "pts" */}
        <text
          x={10}
          y={PAD_TOP + PLOT_H / 2}
          className="ec-axis-label ec-axis-unit"
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(-90, 10, ${PAD_TOP + PLOT_H / 2})`}
        >
          pts
        </text>

        {/* X-axis ticks */}
        {svg.xTicks.map((xt, i) => (
          <g key={i}>
            <line
              x1={xt.x}
              y1={PAD_TOP + PLOT_H}
              x2={xt.x}
              y2={PAD_TOP + PLOT_H + 4}
              className="ec-tick"
            />
            <text
              x={xt.x}
              y={PAD_TOP + PLOT_H + 16}
              className="ec-axis-label ec-axis-label-x"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {xt.label}
            </text>
          </g>
        ))}

        {/* Area above zero — positive equity */}
        {finalPnl > 0 || series.some((v) => v > 0) ? (
          <polygon
            points={svg.areaAbove}
            className="ec-area-above"
          />
        ) : null}

        {/* Area below zero — drawdown shading */}
        {series.some((v) => v < 0) ? (
          <polygon
            points={svg.areaBelow}
            className="ec-area-below"
          />
        ) : null}

        {/* Equity curve polyline */}
        <polyline
          points={svg.points}
          className="ec-curve"
          fill="none"
        />

        {/* Clipping bounding box (to avoid lines bleeding outside the plot) */}
        <rect
          x={0}
          y={0}
          width={PAD_LEFT}
          height={SVG_H}
          className="ec-clip-mask"
        />
        <rect
          x={SVG_W - PAD_RIGHT}
          y={0}
          width={PAD_RIGHT + 4}
          height={SVG_H}
          className="ec-clip-mask"
        />
        <rect
          x={0}
          y={0}
          width={SVG_W}
          height={PAD_TOP}
          className="ec-clip-top"
        />

        {/* Axis frame */}
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP}
          x2={PAD_LEFT}
          y2={PAD_TOP + PLOT_H}
          className="ec-axis-line"
        />
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP + PLOT_H}
          x2={SVG_W - PAD_RIGHT}
          y2={PAD_TOP + PLOT_H}
          className="ec-axis-line"
        />
      </svg>

      {/* Footer stats */}
      <div className="ec-stats">
        <div className="ec-stat-row">
          <span className="ec-stat-lbl">Net P&amp;L</span>
          <span className={`ec-stat-val${finalPnl >= 0 ? ' ec-stat-pos' : ' ec-stat-neg'}`}>
            {finalPnl >= 0 ? '+' : ''}{finalPnl.toFixed(0)} pts
          </span>
        </div>
        <div className="ec-stat-row">
          <span className="ec-stat-lbl">Max DD</span>
          <span className="ec-stat-val ec-stat-neg">{dd > 0 ? `−${dd.toFixed(0)} pts` : '0 pts'}</span>
        </div>
        <div className="ec-stat-row">
          <span className="ec-stat-lbl">Longest losing streak</span>
          <span className="ec-stat-val">{streak}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main widget (server component — reads JSON via fs)
   ───────────────────────────────────────────────────────────────────────── */

interface EquityCurveWidgetProps {
  dataPath: string; // e.g. "/data/nfp-trades.json"
}

export default function EquityCurveWidget({ dataPath }: EquityCurveWidgetProps) {
  const filePath = path.join(process.cwd(), 'public', dataPath);

  let data: TradesData | null = null;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(raw) as TradesData;
  } catch {
    return (
      <div className="ec-error">
        Equity curve data unavailable.
      </div>
    );
  }

  // Filter to the baseline series: no_be variant, both sides (LONG + SHORT)
  // withoutSmt = all no_be trades (no SMT filter applied — smt field ignored)
  // withSmt    = only no_be trades where ES confirmed (smt === true)
  const withoutSmt = data.trades.filter(
    (t) => t.variant === 'no_be',
  );
  const withSmt = data.trades.filter(
    (t) => t.variant === 'no_be' && t.smt,
  );

  const widgetId = 'ec-heading';

  return (
    <section className="ec-widget" aria-labelledby={widgetId}>
      <h3 className="ec-widget-title" id={widgetId}>
        Equity curve<span className="ec-widget-title-sep"> — </span>NQ points cumulated
      </h3>
      <p className="ec-widget-sub">
        Trade-by-trade running P&amp;L · no_be variant · both sides · NQ points
      </p>

      <div className="ec-grid">
        <CurveCard label="Without SMT" trades={withoutSmt} />
        <CurveCard label="With SMT" trades={withSmt} />
      </div>
    </section>
  );
}
