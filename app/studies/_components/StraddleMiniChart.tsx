'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  CrosshairMode,
  LineSeries,
  LineStyle,
  type IChartApi,
  type UTCTimestamp,
  type CandlestickData,
} from 'lightweight-charts';

interface EventBar { m: number; o: number; h: number; l: number; c: number; }
interface EventBarsEntry { date: string; t0_iso: string; entry_price: number; bars: EventBar[]; }

interface Props {
  eventShort: 'cpi' | 'nfp';
  tradeDate: string;
  entryPrice: number;
  buyStop: number;
  sellStop: number;
  tpBuy: number;
  tpSell: number;
  filledSide: 'long' | 'short' | null;
  fillTs?: string | null;
  fillPrice?: number | null;
  exitTs?: string | null;
  exitPrice?: number | null;
  pnl: number;
  outcome: string;
}

function forwardFill(bars: EventBar[]): EventBar[] {
  if (bars.length < 2) return bars;
  const byM = new Map(bars.map((b) => [b.m, b]));
  const minM = Math.min(...bars.map((b) => b.m));
  const maxM = Math.max(...bars.map((b) => b.m));
  const out: EventBar[] = [];
  let lastC = byM.get(minM)?.c ?? bars[0].c;
  for (let m = minM; m <= maxM; m++) {
    const b = byM.get(m);
    if (b) { out.push(b); lastC = b.c; }
    else out.push({ m, o: lastC, h: lastC, l: lastC, c: lastC });
  }
  return out;
}

function toCandles(bars: EventBar[], t0Ms: number): CandlestickData<UTCTimestamp>[] {
  return bars.map((b) => ({
    time: ((t0Ms + b.m * 60_000) / 1000) as UTCTimestamp,
    open: b.o, high: b.h, low: b.l, close: b.c,
  }));
}

function LegendPill({ color, label, value }: { color: string; label: string; value: number | string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 7px', borderRadius: 4,
      background: 'oklch(0.97 0.01 80)',
      border: '1px solid oklch(0.90 0.02 80)',
    }}>
      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 1, background: color }} />
      <span style={{ fontWeight: 600, color: 'var(--c-ink)' }}>{label}</span>
      <span style={{ color: 'var(--c-muted)' }}>{value}</span>
    </span>
  );
}

export default function StraddleMiniChart({
  eventShort,
  tradeDate,
  entryPrice,
  buyStop,
  sellStop,
  tpBuy,
  tpSell,
  filledSide,
  fillTs,
  fillPrice,
  exitTs,
  exitPrice,
  pnl,
  outcome,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'found' | 'missing'>('loading');
  const candlesRef = useRef<CandlestickData<UTCTimestamp>[]>([]);
  const t0MsRef = useRef<number>(0);

  const jsonPath = `/data/${eventShort}_event_bars.json`;

  useEffect(() => {
    let cancelled = false;
    fetch(jsonPath)
      .then((r) => r.json())
      .then((data: EventBarsEntry[]) => {
        if (cancelled) return;
        const entry = data.find((e) => e.date === tradeDate);
        if (!entry) { setStatus('missing'); return; }
        const t0Ms = new Date(entry.t0_iso).getTime();
        t0MsRef.current = t0Ms;
        const filled = forwardFill(entry.bars);
        candlesRef.current = toCandles(filled, t0Ms);
        setStatus('found');
      })
      .catch(() => { if (!cancelled) setStatus('missing'); });
    return () => { cancelled = true; };
  }, [jsonPath, tradeDate]);

  useEffect(() => {
    if (status !== 'found') return;
    if (!containerRef.current) return;
    const candles = candlesRef.current;
    if (candles.length === 0) return;
    const el = containerRef.current;

    const cPaper = '#faf6ee';
    const cEdge = '#ece5d3';
    const cInkDim = '#5b5868';
    const cInkQuiet = '#7d7a86';
    const cUp = '#7da274';
    const cDown = '#c97558';
    const cGold = '#b08932';

    const chart: IChartApi = createChart(el, {
      width: el.clientWidth || 720,
      height: 520,
      layout: {
        background: { color: cPaper },
        textColor: cInkDim,
        fontFamily: '"Satoshi", -apple-system, sans-serif',
        fontSize: 10,
        attributionLogo: false,
      },
      grid: { vertLines: { color: cEdge }, horzLines: { color: cEdge } },
      crosshair: { mode: CrosshairMode.Hidden },
      rightPriceScale: { borderColor: cEdge, textColor: cInkQuiet, scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: {
        borderColor: cEdge,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 3,
        barSpacing: 14,
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
      upColor: cUp, downColor: cDown,
      borderUpColor: cUp, borderDownColor: cDown,
      wickUpColor: cUp, wickDownColor: cDown,
      priceLineVisible: false, lastValueVisible: false,
    });
    candleSeries.setData(candles);

    const t0Sec = (t0MsRef.current / 1000) as UTCTimestamp;
    const lastCandle = candles[candles.length - 1];
    const chartEndSec = (lastCandle?.time as number) ?? t0Sec;

    // Entry reference line (gold, dotted)
    const entrySegment = chart.addSeries(LineSeries, {
      color: cGold, lineWidth: 1, lineStyle: LineStyle.Dotted,
      priceLineVisible: false, lastValueVisible: true, title: 'Entry',
    });
    entrySegment.setData([
      { time: candles[0].time, value: entryPrice },
      { time: chartEndSec as UTCTimestamp, value: entryPrice },
    ]);

    // Buy-side: buy_stop + tp_buy (green dashed)
    const buyStopSeg = chart.addSeries(LineSeries, {
      color: cUp, lineWidth: 1, lineStyle: LineStyle.Dashed,
      priceLineVisible: false, lastValueVisible: true, title: 'Buy stop',
    });
    buyStopSeg.setData([
      { time: candles[0].time, value: buyStop },
      { time: chartEndSec as UTCTimestamp, value: buyStop },
    ]);

    const tpBuySeg = chart.addSeries(LineSeries, {
      color: cUp, lineWidth: 1, lineStyle: LineStyle.Dotted,
      priceLineVisible: false, lastValueVisible: true, title: 'TP buy',
    });
    tpBuySeg.setData([
      { time: candles[0].time, value: tpBuy },
      { time: chartEndSec as UTCTimestamp, value: tpBuy },
    ]);

    // Sell-side: sell_stop + tp_sell (red dashed)
    const sellStopSeg = chart.addSeries(LineSeries, {
      color: cDown, lineWidth: 1, lineStyle: LineStyle.Dashed,
      priceLineVisible: false, lastValueVisible: true, title: 'Sell stop',
    });
    sellStopSeg.setData([
      { time: candles[0].time, value: sellStop },
      { time: chartEndSec as UTCTimestamp, value: sellStop },
    ]);

    const tpSellSeg = chart.addSeries(LineSeries, {
      color: cDown, lineWidth: 1, lineStyle: LineStyle.Dotted,
      priceLineVisible: false, lastValueVisible: true, title: 'TP sell',
    });
    tpSellSeg.setData([
      { time: candles[0].time, value: tpSell },
      { time: chartEndSec as UTCTimestamp, value: tpSell },
    ]);

    // (Removed misleading diagonal fillSegment — outcome label + PnL pill explain the result.)

    // Y-axis: focus on the active range (entry ± max(X+Y) with 15% pad)
    const levels = [entryPrice, buyStop, sellStop, tpBuy, tpSell];
    if (fillPrice !== null && fillPrice !== undefined) levels.push(fillPrice);
    if (exitPrice !== null && exitPrice !== undefined) levels.push(exitPrice);
    const fullMin = Math.min(...levels);
    const fullMax = Math.max(...levels);
    const span = (fullMax - fullMin) * 1.25;
    const center = (fullMin + fullMax) / 2;
    const yMin = center - span / 2;
    const yMax = center + span / 2;
    const rangeSeries = chart.addSeries(LineSeries, {
      color: '#00000000', lineWidth: 1,
      lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false,
    });
    rangeSeries.setData([
      { time: candles[0].time, value: yMin },
      { time: candles[candles.length - 1].time, value: yMax },
    ]);

    // Zoom to trade window (anchor ± 25 min) for readable candle width.
    const firstTs = candles[0]?.time as number | undefined;
    const lastTs = candles[candles.length - 1]?.time as number | undefined;
    if (firstTs !== undefined && lastTs !== undefined) {
      const anchorMs = fillTs ? new Date(fillTs).getTime() : t0MsRef.current;
      const anchorSec = Math.floor(anchorMs / 1000);
      const from = Math.max(firstTs, anchorSec - 25 * 60) as UTCTimestamp;
      const to = Math.min(lastTs, anchorSec + 25 * 60) as UTCTimestamp;
      if ((to as number) > (from as number)) chart.timeScale().setVisibleRange({ from, to });
      else chart.timeScale().fitContent();
    } else {
      chart.timeScale().fitContent();
    }

    return () => { chart.remove(); };
  }, [status]);

  const outcomeColor =
    outcome === 'tp_hit' ? '#4a8c3f'
    : outcome === 'no_fill' ? '#7d7a86'
    : pnl > 0 ? '#4a8c3f' : '#b8452a';
  const pnlSign = pnl >= 0 ? '+' : '';
  const outcomeLabel = (
    outcome === 'tp_hit' ? 'TP HIT'
    : outcome === 'no_fill' ? 'NO FILL'
    : outcome.startsWith('expired') ? (pnl > 0 ? 'EXPIRED WIN' : 'EXPIRED LOSS')
    : outcome.replace(/_/g, ' ').toUpperCase()
  );

  return (
    <div className="v3-tr-chart-wrap">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8, width: '100%', maxWidth: 720, margin: '0 auto' }}>
        {status === 'loading' && (
          <div style={{
            width: '100%', maxWidth: 720, height: 520,
            background: 'oklch(0.97 0.01 80)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--f-sans)', fontSize: '0.75rem', color: 'var(--c-muted)',
          }}>Loading…</div>
        )}
        {status === 'missing' && (
          <div style={{
            width: '100%', maxWidth: 720, height: 520,
            background: 'oklch(0.97 0.01 80)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--f-sans)', fontSize: '0.75rem', color: 'var(--c-muted)',
            textAlign: 'center', padding: '0 24px',
          }}>Chart data not available for this date.</div>
        )}
        <div style={{ display: status === 'found' ? 'block' : 'none' }}>
          <div ref={containerRef} style={{
            width: '100%', maxWidth: 720, height: 520, borderRadius: 8,
            overflow: 'hidden', border: '1px solid oklch(0.90 0.02 80)',
          }} />
        </div>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
          fontFamily: 'var(--f-sans)', fontSize: '0.7rem', color: 'var(--c-muted)',
          paddingTop: 4,
        }}>
          <span style={{ color: outcomeColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {outcomeLabel}
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: pnl > 0 ? '#4a8c3f' : pnl < 0 ? '#b8452a' : 'var(--c-muted)' }}>
            {pnlSign}{pnl.toFixed(2)} pts
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap', fontVariantNumeric: 'tabular-nums' }}>
            <LegendPill color="#4a8c3f" label="TP buy" value={tpBuy} />
            <LegendPill color="#7da274" label="Buy stop" value={buyStop} />
            <LegendPill color="#b08932" label="Entry" value={entryPrice} />
            <LegendPill color="#c97558" label="Sell stop" value={sellStop} />
            <LegendPill color="#b8452a" label="TP sell" value={tpSell} />
          </span>
        </div>
      </div>
    </div>
  );
}
