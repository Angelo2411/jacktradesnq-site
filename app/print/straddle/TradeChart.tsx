'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  createChart,
  createSeriesMarkers,
  CandlestickSeries,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  type CandlestickData,
  type SeriesMarker,
} from 'lightweight-charts';

export interface Bar {
  m: number; // minutes from release (m=0 is release bar, m=-1 is pre-release)
  o: number;
  h: number;
  l: number;
  c: number;
}

export interface TradeSim {
  entry: number;
  buyStop: number;
  sellStop: number;
  tpBuy: number;
  tpSell: number;
  side: 'long' | 'short' | null;
  fillPrice: number | null;
  fillBarIdx: number | null;
  exitPrice: number | null;
  exitBarIdx: number | null;
  outcome: 'tp' | 'expired' | 'no_fill';
  pnl: number;
  stopPts: number;
  tpPts: number;
}

interface Props {
  eventLabel: string; // 'CPI' | 'NFP'
  date: string; // 'YYYY-MM-DD'
  bars: Bar[];
  sim: TradeSim;
  onReady?: () => void;
}

function forwardFillBars(bars: Bar[]): Bar[] {
  if (bars.length < 2) return bars;
  const barByM = new Map(bars.map((b) => [b.m, b]));
  const minM = Math.min(...bars.map((b) => b.m));
  const maxM = Math.max(...bars.map((b) => b.m));
  const filled: Bar[] = [];
  let lastC = barByM.get(minM)?.c ?? bars[0].c;
  for (let m = minM; m <= maxM; m++) {
    const exist = barByM.get(m);
    if (exist) {
      filled.push(exist);
      lastC = exist.c;
    } else {
      filled.push({ m, o: lastC, h: lastC, l: lastC, c: lastC });
    }
  }
  return filled;
}

function remapSimIdx(origBars: Bar[], filledBars: Bar[], idx: number | null): number | null {
  if (idx === null || idx < 0 || idx >= origBars.length) return null;
  const m = origBars[idx].m;
  return filledBars.findIndex((b) => b.m === m);
}

// Build a synthetic UTC timestamp per bar so lightweight-charts can render time axis.
// We anchor at 08:30 UTC purely so the axis displays "08:30" — actual release is 8:30 ET.
function barsToCandles(bars: Bar[], dateISO: string): CandlestickData<UTCTimestamp>[] {
  const baseUtc = Date.UTC(
    Number(dateISO.slice(0, 4)),
    Number(dateISO.slice(5, 7)) - 1,
    Number(dateISO.slice(8, 10)),
    8,
    30,
    0,
  );
  return bars.map((b) => ({
    time: ((baseUtc + b.m * 60_000) / 1000) as UTCTimestamp,
    open: b.o,
    high: b.h,
    low: b.l,
    close: b.c,
  }));
}

export default function TradeChart({ eventLabel, date, bars, sim, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filled = useMemo(() => forwardFillBars(bars), [bars]);
  const candles = useMemo(() => barsToCandles(filled, date), [filled, date]);
  const simAdj = useMemo(
    () => ({
      ...sim,
      fillBarIdx: remapSimIdx(bars, filled, sim.fillBarIdx),
      exitBarIdx: remapSimIdx(bars, filled, sim.exitBarIdx),
    }),
    [bars, filled, sim],
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    // Lightweight Charts cannot parse oklch(...) — convert design tokens to hex/rgb upfront.
    // Hex values eyeballed-equivalent to OKLCH tokens defined in app/globals.css.
    const cInk = '#1f1c2c';        // --c-ink ≈ oklch(0.20 0.02 270)
    const cInkDim = '#5b5868';     // --c-ink-dim
    const cInkQuiet = '#7d7a86';   // --c-ink-quiet
    const cPaper = '#faf6ee';      // --c-paper
    const cPaperEdge = '#ece5d3';  // --c-paper-edge
    const cUp = '#7da274';         // warm sage green ≈ oklch(0.62 0.10 145)
    const cDown = '#c97558';       // warm terracotta ≈ oklch(0.55 0.13 30)
    const cYellow = '#c8a13a';     // --c-yellow-deep ≈ oklch(0.72 0.18 90)

    const chart: IChartApi = createChart(el, {
      width: el.clientWidth,
      height: 380,
      layout: {
        background: { color: cPaper },
        textColor: cInkDim,
        fontFamily: '"Satoshi", -apple-system, system-ui, sans-serif',
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: cPaperEdge, style: 0 },
        horzLines: { color: cPaperEdge, style: 0 },
      },
      crosshair: { mode: CrosshairMode.Hidden },
      rightPriceScale: {
        borderColor: cPaperEdge,
        textColor: cInkQuiet,
      },
      timeScale: {
        borderColor: cPaperEdge,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 2,
        barSpacing: 22,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: false,
      handleScale: false,
    });

    const candleSeries: ISeriesApi<'Candlestick'> = chart.addSeries(CandlestickSeries, {
      upColor: cUp,
      downColor: cDown,
      borderUpColor: cUp,
      borderDownColor: cDown,
      wickUpColor: cUp,
      wickDownColor: cDown,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    candleSeries.setData(candles);

    // Price levels (entry/buy stop/sell stop/TP) as horizontal price lines on the candle series
    const addLine = (
      price: number,
      color: string,
      title: string,
      style: 'solid' | 'dashed' | 'dotted' = 'dashed',
    ) => {
      candleSeries.createPriceLine({
        price,
        color,
        lineWidth: 1,
        lineStyle: style === 'solid' ? 0 : style === 'dashed' ? 2 : 3,
        axisLabelVisible: true,
        title,
      });
    };

    // Entry reference (release-bar close)
    addLine(sim.entry, cInkQuiet, 'Entry ref', 'dotted');
    // Stop entries
    addLine(sim.buyStop, cUp, `Buy stop ${sim.buyStop.toFixed(2)}`, 'dashed');
    addLine(sim.sellStop, cDown, `Sell stop ${sim.sellStop.toFixed(2)}`, 'dashed');

    // TP target only on filled side
    if (sim.side === 'long') {
      addLine(sim.tpBuy, cYellow, `TP ${sim.tpBuy.toFixed(2)}`, 'solid');
    } else if (sim.side === 'short') {
      addLine(sim.tpSell, cYellow, `TP ${sim.tpSell.toFixed(2)}`, 'solid');
    }

    // Markers for fill / exit
    const markers: SeriesMarker<UTCTimestamp>[] = [];
    // Release-bar marker (m=0): find bar index in filled bars
    const releaseIdx = filled.findIndex((b) => b.m === 0);
    if (releaseIdx >= 0) {
      markers.push({
        time: candles[releaseIdx].time,
        position: 'aboveBar',
        color: cInkDim,
        shape: 'arrowDown',
        text: 'Release 8:30 ET',
      });
    }
    if (simAdj.fillBarIdx !== null && sim.side) {
      markers.push({
        time: candles[simAdj.fillBarIdx].time,
        position: sim.side === 'long' ? 'belowBar' : 'aboveBar',
        color: sim.side === 'long' ? cUp : cDown,
        shape: sim.side === 'long' ? 'arrowUp' : 'arrowDown',
        text: `Fill ${sim.fillPrice?.toFixed(2)}`,
      });
    }
    if (simAdj.exitBarIdx !== null && sim.side && sim.outcome !== 'no_fill') {
      markers.push({
        time: candles[simAdj.exitBarIdx].time,
        position: sim.side === 'long' ? 'aboveBar' : 'belowBar',
        color: sim.outcome === 'tp' ? cYellow : cInkDim,
        shape: 'circle',
        text: sim.outcome === 'tp' ? `TP ${sim.exitPrice?.toFixed(2)}` : `Exit ${sim.exitPrice?.toFixed(2)}`,
      });
    }
    createSeriesMarkers(candleSeries, markers);

    chart.timeScale().fitContent();

    // ResizeObserver for responsive width
    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth });
    });
    ro.observe(el);

    // Signal ready on next frame so DOM has painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => onReady?.());
    });

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [candles, filled, sim, simAdj, onReady]);

  // Outcome badge color
  const badgeClass =
    sim.outcome === 'tp' ? 'badge badge-tp' : sim.outcome === 'expired' ? 'badge badge-expired' : 'badge badge-nofill';
  const badgeLabel =
    sim.outcome === 'tp' ? 'TP Hit' : sim.outcome === 'expired' ? 'Expired filled' : 'No fill';

  const sideLabel = sim.side === 'long' ? 'Long' : sim.side === 'short' ? 'Short' : '—';

  return (
    <section className="print-page trade-page">
      <header className="trade-header">
        <div>
          <p className="kicker">{eventLabel} straddle · 8:30 ET</p>
          <h2>{date}</h2>
        </div>
        <span className={badgeClass}>{badgeLabel}</span>
      </header>

      <div ref={containerRef} className="trade-chart" />

      <dl className="trade-meta">
        <div>
          <dt>Side</dt>
          <dd>{sideLabel}</dd>
        </div>
        <div>
          <dt>Entry ref</dt>
          <dd>{sim.entry.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Stop offset</dt>
          <dd>±{sim.stopPts} pts</dd>
        </div>
        <div>
          <dt>TP target</dt>
          <dd>{sim.tpPts} pts</dd>
        </div>
        <div>
          <dt>Fill</dt>
          <dd>{sim.fillPrice !== null ? sim.fillPrice.toFixed(2) : '—'}</dd>
        </div>
        <div>
          <dt>Exit</dt>
          <dd>{sim.exitPrice !== null ? sim.exitPrice.toFixed(2) : '—'}</dd>
        </div>
        <div className="pnl">
          <dt>P&L</dt>
          <dd className={sim.pnl > 0 ? 'pos' : sim.pnl < 0 ? 'neg' : 'flat'}>
            {sim.pnl > 0 ? '+' : ''}
            {sim.pnl.toFixed(2)} pts
          </dd>
        </div>
      </dl>

      <style jsx>{`
        .trade-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .trade-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid var(--border-strong);
          padding-bottom: 12px;
        }
        .trade-header .kicker {
          font-size: 0.75rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--c-ink-quiet);
          margin: 0 0 4px;
        }
        .trade-header h2 {
          font-family: var(--font-display);
          font-weight: 300;
          font-size: 2rem;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .badge {
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 999px;
        }
        .badge-tp {
          background: var(--c-up-soft);
          color: oklch(0.32 0.10 145);
        }
        .badge-expired {
          background: var(--c-down-soft);
          color: oklch(0.32 0.13 30);
        }
        .badge-nofill {
          background: var(--c-paper-edge);
          color: var(--c-ink-quiet);
        }
        .trade-chart {
          width: 100%;
          height: 380px;
          border-radius: 12px;
          overflow: hidden;
          background: var(--c-paper);
        }
        .trade-meta {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 12px;
          margin: 0;
          padding: 16px 0 0;
          border-top: 1px solid var(--c-paper-edge);
        }
        .trade-meta > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .trade-meta dt {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--c-ink-quiet);
          margin: 0;
        }
        .trade-meta dd {
          font-family: var(--font-display);
          font-size: 1.125rem;
          font-weight: 400;
          color: var(--c-ink);
          margin: 0;
        }
        .trade-meta .pnl dd.pos {
          color: oklch(0.45 0.12 145);
        }
        .trade-meta .pnl dd.neg {
          color: oklch(0.45 0.13 30);
        }
        .trade-meta .pnl dd.flat {
          color: var(--c-ink-quiet);
        }
      `}</style>
    </section>
  );
}
