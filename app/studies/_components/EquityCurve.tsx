'use client';

import { useMemo, useId, useState, useCallback, useRef } from 'react';

type Trade = { ts: string; pnl_pts: number };

interface Props {
  trades: Trade[];
  title?: string;
  subtitle?: string;
}

/* ── helpers ── */

function buildCumulative(trades: Trade[]): { ts: number; cum: number; pnl: number }[] {
  let running = 0;
  return trades.map((t) => {
    running += t.pnl_pts;
    return { ts: new Date(t.ts).getTime(), cum: running, pnl: t.pnl_pts };
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

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

function calcStats(cum: { ts: number; cum: number; pnl: number }[], trades: Trade[]) {
  if (cum.length === 0) return null;
  const vals = cum.map((p) => p.cum);
  let maxEquity = -Infinity;
  let maxDD = 0;
  let peak = vals[0];
  for (const v of vals) {
    if (v > peak) peak = v;
    const dd = peak - v;
    if (dd > maxDD) maxDD = dd;
    if (v > maxEquity) maxEquity = v;
  }
  const finalEquity = vals[vals.length - 1];
  const wins = trades.filter((t) => t.pnl_pts > 0);
  const losses = trades.filter((t) => t.pnl_pts < 0);
  const pnlList = trades.map((t) => t.pnl_pts);
  const best = Math.max(...pnlList);
  const worst = Math.min(...pnlList);
  return { maxEquity, maxDD, finalEquity, winCount: wins.length, lossCount: losses.length, best, worst };
}

/* ── component ── */

export default function EquityCurve({
  trades,
  title = 'Equity curve',
  subtitle,
}: Props) {
  const gradId = useId().replace(/:/g, '');
  const wrapRef = useRef<HTMLDivElement>(null);

  const [tooltip, setTooltip] = useState<{
    x: number; y: number; date: string; pnl: number; cum: number;
  } | null>(null);

  /* chart geometry */
  const PAD = { top: 20, right: 20, bottom: 36, left: 56 };
  const CHART_W = 760;
  const CHART_H_DESKTOP = 280;
  const CHART_H_MOBILE = 220;

  const { points, zeroY, yTicks, xTicks, finalPositive, cum, stats } = useMemo(() => {
    if (trades.length === 0) {
      return { points: [], zeroY: 0, yTicks: [], xTicks: [], finalPositive: true, cum: [], stats: null };
    }

    const cumData = buildCumulative(trades);
    const minMs = cumData[0].ts;
    const maxMs = cumData[cumData.length - 1].ts;

    /* Y domain — always include 0 */
    const vals = cumData.map((p) => p.cum);
    const dataMin = Math.min(0, ...vals);
    const dataMax = Math.max(0, ...vals);
    const span = dataMax - dataMin || 1;
    const yPad = span * 0.12;
    const yMin = dataMin - yPad;
    const yMax = dataMax + yPad;
    const yRange = yMax - yMin;

    const innerW = CHART_W - PAD.left - PAD.right;

    function mapX(ms: number): number {
      return PAD.left + ((ms - minMs) / (maxMs - minMs || 1)) * innerW;
    }

    function mapY(v: number, h: number): number {
      const innerH = h - PAD.top - PAD.bottom;
      return PAD.top + (1 - (v - yMin) / yRange) * innerH;
    }

    const H = CHART_H_DESKTOP;
    const pts = cumData.map((p) => ({ x: mapX(p.ts), y: mapY(p.cum, H), ts: p.ts, pnl: p.pnl, cum: p.cum }));
    const zero = mapY(0, H);

    /* Y axis ticks */
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
    const xTickArr = yearTicks(minMs, maxMs).map((t) => ({ ...t, x: mapX(t.ms) }));

    return {
      points: pts,
      zeroY: zero,
      yTicks: yTickArr,
      xTicks: xTickArr,
      finalPositive: vals[vals.length - 1] >= 0,
      cum: cumData,
      stats: calcStats(cumData, trades),
    };
  }, [trades]);

  const handleMouseEnter = useCallback(
    (pt: typeof points[0], e: React.MouseEvent<SVGCircleElement>) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      // Scale from SVG coords to rendered coords
      const svgEl = (e.currentTarget as SVGCircleElement).ownerSVGElement;
      if (!svgEl) return;
      const svgRect = svgEl.getBoundingClientRect();
      const scaleX = svgRect.width / CHART_W;
      const scaleY = svgRect.height / CHART_H_DESKTOP;
      const renderedX = svgRect.left - rect.left + pt.x * scaleX;
      const renderedY = svgRect.top - rect.top + pt.y * scaleY;
      setTooltip({ x: renderedX, y: renderedY, date: formatDate(pt.ts), pnl: pt.pnl, cum: pt.cum });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const areaGradColor = finalPositive ? 'var(--c-sage)' : 'var(--c-terra)';
  const areaSoftColor = finalPositive ? 'var(--c-sage-soft)' : 'var(--c-terra-soft)';

  if (trades.length === 0) {
    return (
      <div className="eq-card">
        <p className="eq-title">{title}</p>
        {subtitle && <p className="eq-subtitle">{subtitle}</p>}
        <div className="eq-empty">No trades to display.</div>
      </div>
    );
  }

  const simplePoints = points.map((p) => ({ x: p.x, y: p.y }));
  const linePath = buildPath(simplePoints);
  const areaPath = buildAreaPath(simplePoints, zeroY);

  return (
    <div className="eq-card">
      <div className="eq-header">
        <p className="eq-title">{title}</p>
        {subtitle && <p className="eq-subtitle">{subtitle}</p>}
      </div>

      <div className="eq-chart-wrap" ref={wrapRef} style={{ position: 'relative' }}>
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

          {yTicks.map(({ v, y }) => (
            <g key={v}>
              <line x1={PAD.left} y1={y} x2={CHART_W - PAD.right} y2={y}
                className={v === 0 ? 'eq-grid-zero' : 'eq-grid-line'} />
              <text x={PAD.left - 6} y={y} className="eq-axis-label"
                dominantBaseline="middle" textAnchor="end">
                {v === 0 ? '0' : v > 0 ? `+${v}` : v}
              </text>
            </g>
          ))}

          {xTicks.map(({ ms, label, x }) => (
            <text key={ms} x={x} y={CHART_H_DESKTOP - PAD.bottom + 16}
              className="eq-axis-label" dominantBaseline="auto" textAnchor="middle">
              {label}
            </text>
          ))}

          <path d={areaPath} fill={`url(#${gradId}-area)`} className="eq-area" />
          <path d={linePath} fill="none"
            className={finalPositive ? 'eq-line eq-line-pos' : 'eq-line eq-line-neg'} />

          {/* Trade dots */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={2.5}
              className={`eq-trade-dot ${pt.pnl > 0 ? 'eq-dot-pos' : 'eq-dot-neg'}`}
              stroke="var(--cream-soft)"
              strokeWidth={0.5}
              onMouseEnter={(e) => handleMouseEnter(pt, e)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </svg>

        {/* Mobile SVG */}
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
            const innerH_d = CHART_H_DESKTOP - PAD.top - PAD.bottom;
            const innerH_m = CHART_H_MOBILE - PAD.top - PAD.bottom;
            const frac = (yD - PAD.top) / innerH_d;
            const yM = PAD.top + frac * innerH_m;
            return (
              <g key={v}>
                <line x1={PAD.left} y1={yM} x2={CHART_W - PAD.right} y2={yM}
                  className={v === 0 ? 'eq-grid-zero' : 'eq-grid-line'} />
                <text x={PAD.left - 6} y={yM} className="eq-axis-label"
                  dominantBaseline="middle" textAnchor="end">
                  {v === 0 ? '0' : v > 0 ? `+${v}` : v}
                </text>
              </g>
            );
          })}
          {xTicks.map(({ ms, label, x }) => (
            <text key={ms} x={x} y={CHART_H_MOBILE - PAD.bottom + 16}
              className="eq-axis-label" dominantBaseline="auto" textAnchor="middle">
              {label}
            </text>
          ))}
          {(() => {
            const innerH_d = CHART_H_DESKTOP - PAD.top - PAD.bottom;
            const innerH_m = CHART_H_MOBILE - PAD.top - PAD.bottom;
            const remapY = (y: number) => PAD.top + ((y - PAD.top) / innerH_d) * innerH_m;
            const mPoints = simplePoints.map((p) => ({ x: p.x, y: remapY(p.y) }));
            const mZeroY = remapY(zeroY);
            const mLine = buildPath(mPoints);
            const mArea = buildAreaPath(mPoints, mZeroY);
            return (
              <>
                <path d={mArea} fill={`url(#${gradId}-area-m)`} className="eq-area" />
                <path d={mLine} fill="none"
                  className={finalPositive ? 'eq-line eq-line-pos' : 'eq-line eq-line-neg'} />
                {mPoints.map((mp, i) => (
                  <circle key={i} cx={mp.x} cy={mp.y} r={2}
                    className={points[i].pnl > 0 ? 'eq-dot-pos' : 'eq-dot-neg'}
                    stroke="var(--cream-soft)" strokeWidth={0.5} />
                ))}
              </>
            );
          })()}
        </svg>

        {/* Hover tooltip */}
        {tooltip && (
          <div
            className="eq-tooltip"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 16,
            }}
          >
            <div className="eq-tooltip-date">{tooltip.date}</div>
            <div className={`eq-tooltip-pnl ${tooltip.pnl > 0 ? 'eq-tooltip-pnl--pos' : 'eq-tooltip-pnl--neg'}`}>
              {tooltip.pnl > 0 ? '+' : ''}{tooltip.pnl.toFixed(1)} pts
            </div>
            <div className="eq-tooltip-eq">
              Equity: {tooltip.cum > 0 ? '+' : ''}{tooltip.cum.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Stats footer */}
      {stats && (
        <div className="eq-stats-footer">
          <div className="eq-stat-cell">
            <span className="eq-stat-label">Max equity</span>
            <span className="eq-stat-value eq-stat-value--pos">+{stats.maxEquity.toFixed(0)}</span>
          </div>
          <div className="eq-stat-cell">
            <span className="eq-stat-label">Max DD</span>
            <span className="eq-stat-value eq-stat-value--neg">-{stats.maxDD.toFixed(0)}</span>
          </div>
          <div className="eq-stat-cell">
            <span className="eq-stat-label">Final equity</span>
            <span className={`eq-stat-value ${stats.finalEquity >= 0 ? 'eq-stat-value--pos' : 'eq-stat-value--neg'}`}>
              {stats.finalEquity >= 0 ? '+' : ''}{stats.finalEquity.toFixed(0)}
            </span>
          </div>
          <div className="eq-stat-cell">
            <span className="eq-stat-label">W / L</span>
            <span className="eq-stat-value">{stats.winCount} W / {stats.lossCount} L</span>
          </div>
          <div className="eq-stat-cell">
            <span className="eq-stat-label">Best / Worst</span>
            <span className="eq-stat-value">+{stats.best.toFixed(0)} / {stats.worst.toFixed(0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
