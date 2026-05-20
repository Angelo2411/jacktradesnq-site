'use client';

import { useMemo, useId } from 'react';

type Trade = { ts: string; pnl_pts: number };

interface Props {
  trades: Trade[];
  title?: string;
  subtitle?: string;
}

/* ── helpers ── */

function buildCumulative(trades: Trade[]): { ts: number; cum: number }[] {
  let running = 0;
  return trades.map((t) => {
    running += t.pnl_pts;
    return { ts: new Date(t.ts).getTime(), cum: running };
  });
}

function yearTicks(minMs: number, maxMs: number): { ms: number; label: string }[] {
  const minYear = new Date(minMs).getUTCFullYear();
  const maxYear = new Date(maxMs).getUTCFullYear();
  const ticks: { ms: number; label: string }[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    const ms = Date.UTC(y, 0, 1);
    if (ms >= minMs && ms <= maxMs) {
      ticks.push({ ms, label: String(y) });
    }
  }
  return ticks;
}

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');
}

function buildAreaPath(
  points: { x: number; y: number }[],
  zeroY: number,
): string {
  if (points.length === 0) return '';
  const line = buildPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${line} L ${last.x.toFixed(2)} ${zeroY.toFixed(2)} L ${first.x.toFixed(2)} ${zeroY.toFixed(2)} Z`;
}

/* ── component ── */

export default function EquityCurve({
  trades,
  title = 'Equity curve',
  subtitle,
}: Props) {
  const gradId = useId().replace(/:/g, '');

  /* chart geometry */
  const PAD = { top: 20, right: 20, bottom: 36, left: 56 };
  const CHART_W = 760;
  const CHART_H_DESKTOP = 280;
  const CHART_H_MOBILE = 220;

  const { points, zeroY, yTicks, xTicks, finalPositive } = useMemo(() => {
    if (trades.length === 0) {
      return { points: [], zeroY: 0, yTicks: [], xTicks: [], finalPositive: true };
    }

    const cum = buildCumulative(trades);
    const minMs = cum[0].ts;
    const maxMs = cum[cum.length - 1].ts;

    /* Y domain — always include 0 */
    const vals = cum.map((p) => p.cum);
    const dataMin = Math.min(0, ...vals);
    const dataMax = Math.max(0, ...vals);
    const span = dataMax - dataMin || 1;
    const yPad = span * 0.12;
    const yMin = dataMin - yPad;
    const yMax = dataMax + yPad;
    const yRange = yMax - yMin;

    /* Helpers: map data coords → SVG coords */
    const innerW = CHART_W - PAD.left - PAD.right;

    function mapX(ms: number, h: number): number {
      const innerH = h - PAD.top - PAD.bottom;
      void innerH; // used via mapY closure
      return PAD.left + ((ms - minMs) / (maxMs - minMs || 1)) * innerW;
    }

    function mapY(v: number, h: number): number {
      const innerH = h - PAD.top - PAD.bottom;
      return PAD.top + (1 - (v - yMin) / yRange) * innerH;
    }

    /* Build points for desktop height — mobile will scale via viewBox */
    const H = CHART_H_DESKTOP;
    const pts = cum.map((p) => ({ x: mapX(p.ts, H), y: mapY(p.cum, H) }));
    const zero = mapY(0, H);

    /* Y axis ticks — up to 5 */
    const rawStep = span / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(rawStep) || 1)));
    const niceStep = Math.ceil(rawStep / mag) * mag || 50;
    const tickVals: number[] = [];
    const startTick = Math.ceil(yMin / niceStep) * niceStep;
    for (let v = startTick; v <= yMax + 0.001; v += niceStep) {
      if (tickVals.length >= 6) break;
      tickVals.push(Math.round(v));
    }

    const yTickArr = tickVals.map((v) => ({ v, y: mapY(v, H) }));

    /* X ticks */
    const xTickArr = yearTicks(minMs, maxMs).map((t) => ({
      ...t,
      x: mapX(t.ms, H),
    }));

    return {
      points: pts,
      zeroY: zero,
      yTicks: yTickArr,
      xTicks: xTickArr,
      finalPositive: vals[vals.length - 1] >= 0,
    };
  }, [trades]);

  /* Colors — OKLCH only via CSS variables, SVG fill via currentColor trick */
  /* Warm sage for positive, warm terra for negative */
  const areaGradColor = finalPositive
    ? 'var(--c-sage)'        /* oklch(0.42 0.10 145) */
    : 'var(--c-terra)';      /* oklch(0.44 0.15 25) */
  const areaSoftColor = finalPositive
    ? 'var(--c-sage-soft)'   /* oklch(0.88 0.07 145) */
    : 'var(--c-terra-soft)'; /* oklch(0.92 0.06 25) */

  if (trades.length === 0) {
    return (
      <div className="eq-card">
        <p className="eq-title">{title}</p>
        {subtitle && <p className="eq-subtitle">{subtitle}</p>}
        <div className="eq-empty">No trades to display.</div>
      </div>
    );
  }

  const linePath = buildPath(points);
  const areaPath = buildAreaPath(points, zeroY);

  return (
    <div className="eq-card">
      <div className="eq-header">
        <p className="eq-title">{title}</p>
        {subtitle && <p className="eq-subtitle">{subtitle}</p>}
      </div>

      <div className="eq-chart-wrap">
        {/* Desktop SVG */}
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H_DESKTOP}`}
          preserveAspectRatio="xMidYMid meet"
          aria-label={`${title} equity curve chart`}
          role="img"
          className="eq-svg eq-svg-desktop"
        >
          <defs>
            <linearGradient id={`${gradId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={areaGradColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={areaSoftColor} stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines + labels */}
          {yTicks.map(({ v, y }) => (
            <g key={v}>
              <line
                x1={PAD.left}
                y1={y}
                x2={CHART_W - PAD.right}
                y2={y}
                className={v === 0 ? 'eq-grid-zero' : 'eq-grid-line'}
              />
              <text
                x={PAD.left - 6}
                y={y}
                className="eq-axis-label"
                dominantBaseline="middle"
                textAnchor="end"
              >
                {v === 0 ? '0' : v > 0 ? `+${v}` : v}
              </text>
            </g>
          ))}

          {/* X-axis tick labels */}
          {xTicks.map(({ ms, label, x }) => (
            <text
              key={ms}
              x={x}
              y={CHART_H_DESKTOP - PAD.bottom + 16}
              className="eq-axis-label"
              dominantBaseline="auto"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}

          {/* Area fill */}
          <path
            d={areaPath}
            fill={`url(#${gradId}-area)`}
            className="eq-area"
          />

          {/* Equity line */}
          <path
            d={linePath}
            fill="none"
            className={finalPositive ? 'eq-line eq-line-pos' : 'eq-line eq-line-neg'}
          />

          {/* Terminal dot */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={3.5}
              className={finalPositive ? 'eq-dot eq-dot-pos' : 'eq-dot eq-dot-neg'}
            />
          )}
        </svg>

        {/* Mobile SVG — same viewBox but different CSS height */}
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H_MOBILE}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="eq-svg eq-svg-mobile"
        >
          <defs>
            <linearGradient id={`${gradId}-area-m`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={areaGradColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={areaSoftColor} stopOpacity="0.03" />
            </linearGradient>
          </defs>
          {yTicks.map(({ v, y: yD }) => {
            /* Remap y from desktop H to mobile H */
            const innerH_d = CHART_H_DESKTOP - PAD.top - PAD.bottom;
            const innerH_m = CHART_H_MOBILE - PAD.top - PAD.bottom;
            const frac = (yD - PAD.top) / innerH_d;
            const yM = PAD.top + frac * innerH_m;
            return (
              <g key={v}>
                <line
                  x1={PAD.left}
                  y1={yM}
                  x2={CHART_W - PAD.right}
                  y2={yM}
                  className={v === 0 ? 'eq-grid-zero' : 'eq-grid-line'}
                />
                <text
                  x={PAD.left - 6}
                  y={yM}
                  className="eq-axis-label"
                  dominantBaseline="middle"
                  textAnchor="end"
                >
                  {v === 0 ? '0' : v > 0 ? `+${v}` : v}
                </text>
              </g>
            );
          })}
          {xTicks.map(({ ms, label, x }) => (
            <text
              key={ms}
              x={x}
              y={CHART_H_MOBILE - PAD.bottom + 16}
              className="eq-axis-label"
              dominantBaseline="auto"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}
          {/* Remap area + line points to mobile H */}
          {(() => {
            const innerH_d = CHART_H_DESKTOP - PAD.top - PAD.bottom;
            const innerH_m = CHART_H_MOBILE - PAD.top - PAD.bottom;
            const remapY = (y: number) => PAD.top + ((y - PAD.top) / innerH_d) * innerH_m;
            const mPoints = points.map((p) => ({ x: p.x, y: remapY(p.y) }));
            const mZeroY = remapY(zeroY);
            const mLine = buildPath(mPoints);
            const mArea = buildAreaPath(mPoints, mZeroY);
            const last = mPoints[mPoints.length - 1];
            return (
              <>
                <path d={mArea} fill={`url(#${gradId}-area-m)`} className="eq-area" />
                <path d={mLine} fill="none" className={finalPositive ? 'eq-line eq-line-pos' : 'eq-line eq-line-neg'} />
                {last && (
                  <circle cx={last.x} cy={last.y} r={3} className={finalPositive ? 'eq-dot eq-dot-pos' : 'eq-dot eq-dot-neg'} />
                )}
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
