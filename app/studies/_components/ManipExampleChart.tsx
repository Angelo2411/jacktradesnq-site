'use client';

import { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  CrosshairMode,
  type IChartApi,
  type UTCTimestamp,
  type CandlestickData,
} from 'lightweight-charts';

export interface ManipExample {
  date: string;
  side: 'long' | 'short';
  manip_window: { start_ts: string; end_ts: string };
  trade_window: { start_ts: string; end_ts: string };
  bars: Array<{ ts: string; o: number; h: number; l: number; c: number }>;
}

interface Props {
  example: ManipExample;
}

export default function ManipExampleChart({ example }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const cPaper     = '#1c1812';
    const cEdge      = '#2c2620';
    const cInkDim    = '#efe7d8';
    const cInkQuiet  = '#9b948a';
    const cUp        = '#e9b44b';
    const cDown      = '#a55f44';

    const candles: CandlestickData<UTCTimestamp>[] = example.bars.map((b) => ({
      time: Math.floor(new Date(b.ts).getTime() / 1000) as UTCTimestamp,
      open: b.o,
      high: b.h,
      low: b.l,
      close: b.c,
    }));

    const chart: IChartApi = createChart(el, {
      width: el.clientWidth || 520,
      height: 300,
      layout: {
        background: { color: cPaper },
        textColor: cInkDim,
        fontFamily: '"Satoshi", -apple-system, sans-serif',
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: cEdge },
        horzLines: { color: cEdge },
      },
      crosshair: { mode: CrosshairMode.Hidden },
      rightPriceScale: {
        borderColor: cEdge,
        textColor: cInkQuiet,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: cEdge,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 3,
        barSpacing: 8,
        tickMarkFormatter: (time: number) => {
          const d = new Date(time * 1000);
          return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/New_York' });
        },
      },
      localization: {
        timeFormatter: (time: number) => {
          const d = new Date(time * 1000);
          return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/New_York' }) + ' ET';
        },
      },
      handleScroll: false,
      handleScale: false,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
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

    const firstTs = candles[0]?.time as number | undefined;
    const lastTs = candles[candles.length - 1]?.time as number | undefined;
    if (firstTs !== undefined && lastTs !== undefined) {
      chart.timeScale().setVisibleRange({
        from: firstTs as UTCTimestamp,
        to: lastTs as UTCTimestamp,
      });
    }

    return () => { chart.remove(); };
  }, [example]);

  const manipStartMs = new Date(example.manip_window.start_ts).getTime();
  const manipEndMs = new Date(example.manip_window.end_ts).getTime();
  const tradeStartMs = new Date(example.trade_window.start_ts).getTime();
  const tradeEndMs = new Date(example.trade_window.end_ts).getTime();

  const moveBars = example.bars.filter(
    (b) => new Date(b.ts).getTime() >= manipStartMs && new Date(b.ts).getTime() <= manipEndMs,
  );
  const nextBars = example.bars.filter(
    (b) => new Date(b.ts).getTime() >= tradeStartMs && new Date(b.ts).getTime() <= tradeEndMs,
  );

  let moveUp: boolean;
  let nextUp: boolean;

  if (moveBars.length > 0) {
    const lastMove = moveBars[moveBars.length - 1];
    const firstMove = moveBars[0];
    moveUp = lastMove.c - firstMove.o > 0;
  } else {
    moveUp = example.side === 'long';
  }

  if (nextBars.length > 0) {
    const lastNext = nextBars[nextBars.length - 1];
    const firstNext = nextBars[0];
    nextUp = lastNext.c - firstNext.o > 0;
  } else {
    nextUp = true;
  }

  const direction = moveUp ? 'up' : 'down';
  const continued = moveUp === nextUp;
  const directionColor = direction === 'up' ? '#e9b44b' : '#a55f44';
  const outcomeColor = continued ? '#e9b44b' : '#a55f44';
  const outcomeLabel = continued ? 'continued' : 'reversed';

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: 520,
          height: 300,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid #2c2620',
        }}
      />
      <div style={{
        fontFamily: 'var(--f-sans)',
        fontSize: '0.7rem',
        color: 'var(--c-muted)',
        marginTop: 6,
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontWeight: 600, color: 'var(--c-ink)' }}>{example.date}</span>
        <span>·</span>
        <span>09:30–10:00</span>
        <span style={{ color: directionColor, fontWeight: 700 }}>
          {direction}
        </span>
        <span>→</span>
        <span>10:00–11:00</span>
        <span style={{ color: outcomeColor, fontWeight: 700 }}>
          {outcomeLabel}
        </span>
      </div>
    </div>
  );
}
