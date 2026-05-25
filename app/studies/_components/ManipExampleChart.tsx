'use client';

import { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  createSeriesMarkers,
  CrosshairMode,
  LineStyle,
  type IChartApi,
  type UTCTimestamp,
  type CandlestickData,
  type SeriesMarker,
} from 'lightweight-charts';

export interface ManipExample {
  date: string;
  side: 'long' | 'short';
  level: string;
  level_price: number;
  entry_ts: string;
  entry_price: number;
  sl_price: number;
  tp1R_price: number;
  pnl_pts: number;
  outcome: string;
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

    const cPaper     = '#faf6ee';
    const cEdge      = '#ece5d3';
    const cInkDim    = '#5b5868';
    const cInkQuiet  = '#7d7a86';
    const cUp        = '#7da274';
    const cDown      = '#c97558';
    const cGold      = '#b08932';
    const cManipBg   = 'rgba(180,140,60,0.06)';
    const cDistribBg = 'rgba(120,120,160,0.06)';

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

    // Swept level line
    candleSeries.createPriceLine({
      price: example.level_price,
      color: '#8a8a8a',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: example.level,
    });

    const manipStartTs = Math.floor(new Date(example.manip_window.start_ts).getTime() / 1000) as UTCTimestamp;
    const manipEndTs = Math.floor(new Date(example.manip_window.end_ts).getTime() / 1000) as UTCTimestamp;
    const distribEndTs = Math.floor(new Date(example.trade_window.end_ts).getTime() / 1000) as UTCTimestamp;

    // Window shading via markers — lightweight-charts supports background markers
    const markers: SeriesMarker<UTCTimestamp>[] = [
      {
        time: manipStartTs,
        position: 'inBar',
        color: cManipBg,
        shape: 'circle',
        text: '',
        size: 2,
      },
      {
        time: manipEndTs,
        position: 'inBar',
        color: cManipBg,
        shape: 'circle',
        text: '',
        size: 2,
      },
    ];

    // Sweep marker label at 09:30
    markers.push({
      time: manipStartTs,
      position: 'aboveBar',
      color: '#8a8a8a',
      shape: 'arrowDown',
      text: 'sweep',
      size: 2,
    });

    // Distribution start marker at 10:00
    markers.push({
      time: manipEndTs,
      position: 'belowBar',
      color: cGold,
      shape: 'arrowUp',
      text: 'distrib',
      size: 2,
    });

    createSeriesMarkers(candleSeries, markers);

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

  const continued = example.pnl_pts > 0;
  const continuedColor = continued ? '#4a8c3f' : '#b8452a';
  const continuedLabel = continued ? 'continued' : 'failed';
  const sideColor = example.side === 'long' ? '#4a8c3f' : '#b8452a';

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
          border: '1px solid oklch(0.90 0.02 80)',
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
        <span>swept {example.level}</span>
        <span>·</span>
        <span style={{ color: sideColor, fontWeight: 700, textTransform: 'uppercase' }}>
          {example.side}
        </span>
        <span>manipulation</span>
        <span>→</span>
        <span>distribution</span>
        <span style={{ color: continuedColor, fontWeight: 700 }}>
          {continuedLabel}
        </span>
      </div>
    </div>
  );
}
