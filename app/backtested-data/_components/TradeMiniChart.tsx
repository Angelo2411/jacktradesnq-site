'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  createSeriesMarkers,
  CandlestickSeries,
  CrosshairMode,
  LineSeries,
  LineStyle,
  type IChartApi,
  type UTCTimestamp,
  type CandlestickData,
} from 'lightweight-charts';

interface EventBar {
  m: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

interface EventBarsEntry {
  date: string;
  t0_iso: string;
  entry_price: number;
  bars: EventBar[];
}

const EVENT_SHORT: Record<string, string> = {
  'CPI':              'cpi',
  'NFP':              'nfp',
  'PPI':              'ppi',
  'PCE':              'pce',
  'GDP':              'gdp',
  'Jobless Claims':   'joblessclaims',
  'Retail Sales':     'retailsales',
  'Empire State':     'empirestate',
  'Employment Cost':  'employmentcostindex',
};

interface Props {
  eventShort: string;
  asset: 'nq' | 'gc';
  tradeDate: string;
  side: 'long' | 'short';
  pnl_pts: number;
  outcome: string;
  entryPrice?: number;
  slPrice?: number;
  tpPrice?: number;
  exitTs?: string;
  exitPrice?: number;
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

function toCandles(bars: EventBar[], dateISO: string): CandlestickData<UTCTimestamp>[] {
  const base = Date.UTC(
    Number(dateISO.slice(0, 4)),
    Number(dateISO.slice(5, 7)) - 1,
    Number(dateISO.slice(8, 10)),
    8, 30, 0,
  );
  return bars.map((b) => ({
    time: ((base + b.m * 60_000) / 1000) as UTCTimestamp,
    open: b.o, high: b.h, low: b.l, close: b.c,
  }));
}

export default function TradeMiniChart({ eventShort, asset, tradeDate, side, pnl_pts, outcome, entryPrice: entryPriceProp, slPrice, tpPrice, exitTs, exitPrice }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'found' | 'missing'>('loading');
  const entryRef = useRef<number | null>(null);
  const candlesRef = useRef<CandlestickData<UTCTimestamp>[]>([]);

  // Resolve eventShort: could already be a short key, or needs mapping
  const resolvedShort = EVENT_SHORT[eventShort] ?? eventShort;
  const suffix = asset === 'gc' ? '_gc' : '';
  const jsonPath = `/data/${resolvedShort}_event_bars${suffix}.json`;

  useEffect(() => {
    let cancelled = false;
    fetch(jsonPath)
      .then((r) => r.json())
      .then((data: EventBarsEntry[]) => {
        if (cancelled) return;
        const entry = data.find((e) => e.date === tradeDate);
        if (!entry) { setStatus('missing'); return; }
        const filled = forwardFill(entry.bars);
        candlesRef.current = toCandles(filled, tradeDate);
        entryRef.current = entry.entry_price;
        setStatus('found');
      })
      .catch(() => { if (!cancelled) setStatus('missing'); });
    return () => { cancelled = true; };
  }, [jsonPath, tradeDate]);

  useEffect(() => {
    if (status !== 'found') return;
    if (!containerRef.current) return;
    const candles = candlesRef.current;
    const entryPrice = entryRef.current;
    if (candles.length === 0) return;

    const el = containerRef.current;

    // Warm-editorial hex palette (OKLCH not supported by LWC)
    const cPaper    = '#faf6ee';
    const cEdge     = '#ece5d3';
    const cInkDim   = '#5b5868';
    const cInkQuiet = '#7d7a86';
    const cUp       = '#7da274';   // sage green
    const cDown     = '#c97558';   // terra
    const cGold     = '#b08932';   // gold accent — entry line

    const chart: IChartApi = createChart(el, {
      width: 280,
      height: 280,
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
        rightOffset: 1,
        barSpacing: 12,
        fixLeftEdge: true,
        fixRightEdge: true,
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

    const hasLevels = entryPrice !== null && entryPriceProp !== undefined && slPrice !== undefined && tpPrice !== undefined;

    if (entryPrice !== null) {
      candleSeries.createPriceLine({
        price: entryPrice,
        color: cGold,
        lineWidth: 2,
        lineStyle: 0, // solid
        axisLabelVisible: true,
        title: hasLevels ? `Entry · ${entryPrice}` : 'Entry',
      });
    }

    if (hasLevels && slPrice !== undefined) {
      candleSeries.createPriceLine({
        price: slPrice,
        color: cDown,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `SL · ${slPrice}`,
      });
    }

    if (hasLevels && tpPrice !== undefined) {
      candleSeries.createPriceLine({
        price: tpPrice,
        color: cUp,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `TP · ${tpPrice}`,
      });
    }

    // Exit marker
    if (exitTs !== undefined && exitPrice !== undefined) {
      const exitTime = (Math.floor(new Date(exitTs).getTime() / 1000)) as UTCTimestamp;
      const exitSeries = chart.addSeries(LineSeries, {
        color: '#00000000',
        lineWidth: 1,
        lastValueVisible: false,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });
      exitSeries.setData([{ time: exitTime, value: exitPrice }]);
      createSeriesMarkers(exitSeries, [{
        time: exitTime,
        position: outcome === 'win' ? 'aboveBar' : 'belowBar',
        color: outcome === 'win' ? cUp : cDown,
        shape: 'circle',
        text: outcome.toUpperCase(),
      }]);
    }

    // Invisible range series to pad Y-axis
    const allH = candles.map((c) => c.high);
    const allL = candles.map((c) => c.low);
    const extraPrices = [entryPrice, slPrice, tpPrice, exitPrice].filter((v): v is number => v !== undefined && v !== null);
    const yMax = Math.max(...allH, ...extraPrices);
    const yMin = Math.min(...allL, ...extraPrices);
    const pad = Math.max((yMax - yMin) * 0.08, 2);
    const rangeSeries = chart.addSeries(LineSeries, {
      color: '#00000000',
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    rangeSeries.setData([
      { time: candles[0].time, value: yMin - pad },
      { time: candles[candles.length - 1].time, value: yMax + pad },
    ]);

    chart.timeScale().fitContent();

    return () => { chart.remove(); };
  }, [status]);

  const outcomeColor =
    outcome === 'win' ? '#4a8c3f'
    : outcome === 'loss' ? '#b8452a'
    : '#7d7a86';
  const pnlSign = pnl_pts >= 0 ? '+' : '';

  return (
    <div className="v3-tr-chart-wrap">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        {status === 'loading' && (
          <div style={{
            width: 280, height: 280,
            background: 'oklch(0.97 0.01 80)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--f-sans)', fontSize: '0.75rem', color: 'var(--c-muted)',
          }}>
            Loading…
          </div>
        )}
        {status === 'missing' && (
          <div style={{
            width: 280, height: 280,
            background: 'oklch(0.97 0.01 80)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--f-sans)', fontSize: '0.75rem', color: 'var(--c-muted)',
            textAlign: 'center', padding: '0 24px',
          }}>
            Chart data not available for this date.
          </div>
        )}
        <div style={{ position: 'relative', display: status === 'found' ? 'block' : 'none' }}>
          <div className="v3-tc-side-badge" data-side={side}>{side.toUpperCase()}</div>
          <div
            ref={containerRef}
            style={{
              width: 280, height: 280,
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid oklch(0.90 0.02 80)',
            }}
          />
        </div>
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          fontFamily: 'var(--f-sans)', fontSize: '0.72rem', color: 'var(--c-muted)',
        }}>
          <span style={{ color: outcomeColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {outcome}
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: pnl_pts > 0 ? '#4a8c3f' : pnl_pts < 0 ? '#b8452a' : 'var(--c-muted)' }}>
            {pnlSign}{pnl_pts.toFixed(2)} pts
          </span>
        </div>
      </div>
    </div>
  );
}
