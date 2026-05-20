'use client';

import { useMemo, useState, useCallback, useRef } from 'react';

type Trade = { ts: string; pnl_pts: number };

type Props = {
  trades: Trade[];
  title?: string;
  subtitle?: string;
};

const PAD = { top: 20, right: 20, bottom: 36, left: 56 };
const CHART_W = 760;
const CHART_H_DESKTOP = 280;
const CHART_H_MOBILE = 220;

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

function yearTicks(
  minIdx: number,
  maxIdx: number,
  trades: Trade[],
  innerW: number,
): { x: number; label: string }[] {
  const ticks: { x: number; label: string }[] = [];
  let prevYear = -1;
  for (let i = 0; i < trades.length; i++) {
    const year = new Date(trades[i].ts).getUTCFullYear();
    if (year !== prevYear) {
      prevYear = year;
      const x = PAD.left + (i / Math.max(trades.length - 1, 1)) * innerW;
      ticks.push({ x, label: String(year) });
    }
  }
  void minIdx; void maxIdx;
  return ticks;
}

export default function DailyPnlBars({
  trades,
  title = 'Trade-by-trade PnL',
  subtitle,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; date: string; pnl: number;
  } | null>(null);

  const { bars, yTicks, xTicks, zeroY } = useMemo(() => {
    if (trades.length === 0) {
      return { bars: [], yTicks: [], xTicks: [], zeroY: 0 };
    }

    const innerW = CHART_W - PAD.left - PAD.right;
    const innerH = CHART_H_DESKTOP - PAD.top - PAD.bottom;

    const pnls = trades.map((t) => t.pnl_pts);
    const maxAbs = Math.max(...pnls.map(Math.abs));
    const dataMin = Math.min(0, ...pnls);
    const dataMax = Math.max(0, ...pnls);
    const span = dataMax - dataMin || 1;
    const yPad = span * 0.12;
    const yMin = dataMin - yPad;
    const yMax = dataMax + yPad;
    const yRange = yMax - yMin;

    function mapY(v: number): number {
      return PAD.top + (1 - (v - yMin) / yRange) * innerH;
    }

    const zeroYVal = mapY(0);

    /* Bar width — adaptive */
    const totalBars = trades.length;
    const rawBarW = (innerW / totalBars) - 1.5;
    const barW = Math.max(1.5, Math.min(rawBarW, 16));

    const barsArr = trades.map((t, i) => {
      const x = PAD.left + (i / Math.max(totalBars - 1, 1)) * innerW;
      const y0 = zeroYVal;
      const y1 = mapY(t.pnl_pts);
      const top = Math.min(y0, y1);
      const h = Math.abs(y0 - y1) || 1;
      return {
        x: x - barW / 2,
        top,
        h,
        barW,
        pnl: t.pnl_pts,
        ts: new Date(t.ts).getTime(),
        cx: x,
      };
    });

    /* Y ticks */
    const rawStep = maxAbs / 3;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
    const niceStep = Math.ceil(rawStep / mag) * mag || 25;
    const tickVals: number[] = [];
    const startTick = Math.ceil(yMin / niceStep) * niceStep;
    for (let v = startTick; v <= yMax + 0.001; v += niceStep) {
      if (tickVals.length >= 6) break;
      tickVals.push(Math.round(v));
    }
    const yTickArr = tickVals.map((v) => ({ v, y: mapY(v) }));
    const xTickArr = yearTicks(0, totalBars - 1, trades, innerW);

    void maxAbs;

    return { bars: barsArr, yTicks: yTickArr, xTicks: xTickArr, zeroY: zeroYVal };
  }, [trades]);

  const handleMouseEnter = useCallback(
    (bar: typeof bars[0], e: React.MouseEvent<SVGRectElement>) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const svgEl = (e.currentTarget as SVGRectElement).ownerSVGElement;
      if (!svgEl) return;
      const svgRect = svgEl.getBoundingClientRect();
      const scaleX = svgRect.width / CHART_W;
      const scaleY = svgRect.height / CHART_H_DESKTOP;
      const renderedX = svgRect.left - rect.left + bar.cx * scaleX;
      const renderedY = svgRect.top - rect.top + bar.top * scaleY;
      setTooltip({ x: renderedX, y: renderedY, date: formatDate(bar.ts), pnl: bar.pnl });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  if (trades.length === 0) {
    return (
      <div className="dpb-card">
        <p className="dpb-title">{title}</p>
        {subtitle && <p className="dpb-subtitle">{subtitle}</p>}
        <div className="eq-empty">No trades to display.</div>
      </div>
    );
  }

  /* Mobile remap helper */
  const remapY = (y: number) => {
    const innerH_d = CHART_H_DESKTOP - PAD.top - PAD.bottom;
    const innerH_m = CHART_H_MOBILE - PAD.top - PAD.bottom;
    return PAD.top + ((y - PAD.top) / innerH_d) * innerH_m;
  };

  const mZeroY = remapY(zeroY);

  return (
    <div className="dpb-card">
      <div className="dpb-header">
        <p className="dpb-title">{title}</p>
        {subtitle && <p className="dpb-subtitle">{subtitle}</p>}
      </div>

      <div className="dpb-chart-wrap" ref={wrapRef} style={{ position: 'relative' }}>
        {/* Desktop SVG */}
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H_DESKTOP}`}
          preserveAspectRatio="xMidYMid meet"
          aria-label={`${title} bar chart`}
          role="img"
          className="dpb-svg-desktop"
        >
          {/* Y grid + labels */}
          {yTicks.map(({ v, y }) => (
            <g key={v}>
              <line x1={PAD.left} y1={y} x2={CHART_W - PAD.right} y2={y}
                className={v === 0 ? 'dpb-zero-line' : 'dpb-grid-line'} />
              <text x={PAD.left - 6} y={y} className="dpb-axis-label"
                dominantBaseline="middle" textAnchor="end">
                {v === 0 ? '0' : v > 0 ? `+${v}` : v}
              </text>
            </g>
          ))}

          {/* X labels */}
          {xTicks.map(({ x, label }) => (
            <text key={label} x={x} y={CHART_H_DESKTOP - PAD.bottom + 16}
              className="dpb-axis-label" dominantBaseline="auto" textAnchor="middle">
              {label}
            </text>
          ))}

          {/* Bars */}
          {bars.map((bar, i) => (
            <rect
              key={i}
              x={bar.x}
              y={bar.top}
              width={bar.barW}
              height={bar.h}
              className={`dpb-bar ${bar.pnl > 0 ? 'dpb-bar-pos' : 'dpb-bar-neg'}`}
              rx={1}
              onMouseEnter={(e) => handleMouseEnter(bar, e)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </svg>

        {/* Mobile SVG */}
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H_MOBILE}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="dpb-svg-mobile"
        >
          {yTicks.map(({ v, y }) => {
            const yM = remapY(y);
            return (
              <g key={v}>
                <line x1={PAD.left} y1={yM} x2={CHART_W - PAD.right} y2={yM}
                  className={v === 0 ? 'dpb-zero-line' : 'dpb-grid-line'} />
                <text x={PAD.left - 6} y={yM} className="dpb-axis-label"
                  dominantBaseline="middle" textAnchor="end">
                  {v === 0 ? '0' : v > 0 ? `+${v}` : v}
                </text>
              </g>
            );
          })}
          {xTicks.map(({ x, label }) => (
            <text key={label} x={x} y={CHART_H_MOBILE - PAD.bottom + 16}
              className="dpb-axis-label" dominantBaseline="auto" textAnchor="middle">
              {label}
            </text>
          ))}
          {bars.map((bar, i) => {
            const mTop = remapY(bar.top);
            const mBot = remapY(bar.top + bar.h);
            return (
              <rect
                key={i}
                x={bar.x}
                y={Math.min(mTop, mZeroY)}
                width={bar.barW}
                height={Math.abs(mBot - mTop) || 1}
                className={bar.pnl > 0 ? 'dpb-bar-pos' : 'dpb-bar-neg'}
                rx={1}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="dpb-tooltip"
            style={{ left: tooltip.x + 12, top: tooltip.y - 16 }}
          >
            <div className="dpb-tooltip-date">{tooltip.date}</div>
            <div className={`dpb-tooltip-pnl ${tooltip.pnl > 0 ? 'dpb-tooltip-pnl--pos' : 'dpb-tooltip-pnl--neg'}`}>
              {tooltip.pnl > 0 ? '+' : ''}{tooltip.pnl.toFixed(1)} pts
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
