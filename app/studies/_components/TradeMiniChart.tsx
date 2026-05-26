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
  'FOMC':                                  'fomc',
  'ADP':                                   'adp',
  'JOLTS':                                 'jolts',
  'ISM Manufacturing PMI':                 'ism_mfg',
  'ISM Services PMI':                      'ism_services',
  'CB Consumer Confidence':                'cb_confidence',
  'Philadelphia Fed Manufacturing':        'philly_fed',
  'Durable Goods Orders':                  'durable_goods',
};

interface Props {
  eventShort: string;
  asset: 'nq' | 'gc' | 'es' | 'si' | 'ym';
  tradeDate: string;
  side: 'long' | 'short';
  pnl_pts: number;
  outcome: string;
  entryPrice?: number;
  slPrice?: number;
  tpPrice?: number;
  entryTs?: string;
  exitTs?: string;
  exitPrice?: number;
  ts?: string;
  dataHigh?: number;
  dataLow?: number;
  sweepTs?: string;
  sweepSide?: 'UP' | 'DOWN';
  ifvgTop?: number;
  ifvgBottom?: number;
  ifvgFormationTs?: string;
  variant?: string;
  barsSlug?: string;
  slLabel?: string;
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

// base time is T0 = 8:30 ET = 12:30 UTC (or 13:30 UTC in EDT — we use the t0_iso from JSON)
function toCandles(bars: EventBar[], t0IsoMs: number): CandlestickData<UTCTimestamp>[] {
  return bars.map((b) => ({
    time: ((t0IsoMs + b.m * 60_000) / 1000) as UTCTimestamp,
    open: b.o, high: b.h, low: b.l, close: b.c,
  }));
}

interface IfvgZone {
  gap_high: number;
  gap_low: number;
}

function detectIfvgZone(bars: EventBar[], entryMinute: number, side: 'long' | 'short'): IfvgZone | null {
  const entryIdx = bars.findIndex((b) => b.m === entryMinute);
  if (entryIdx < 3) return null;
  for (let i = entryIdx - 1; i >= Math.max(2, entryIdx - 5); i--) {
    const a = bars[i - 2];
    const c = bars[i];
    if (!a || !c) continue;
    if (side === 'long') {
      // bearish FVG: bar A low > bar C high (gap down) → IFVG filled from below
      if (a.l > c.h) return { gap_high: a.l, gap_low: c.h };
    } else {
      // bullish FVG: bar A high < bar C low (gap up) → IFVG filled from above
      if (a.h < c.l) return { gap_high: c.l, gap_low: a.h };
    }
  }
  return null;
}

function LegendPill({ color, label, value }: { color: string; label: string; value: number | string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 7px', borderRadius: 4,
      background: '#1c1812',
      border: '1px solid #2c2620',
    }}>
      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 1, background: color }} />
      <span style={{ fontWeight: 600, color: 'var(--c-ink)' }}>{label}</span>
      <span style={{ color: 'var(--c-muted)' }}>{value}</span>
    </span>
  );
}

export default function TradeMiniChart({ eventShort, asset, tradeDate, side, pnl_pts, outcome, entryPrice: entryPriceProp, slPrice, tpPrice, entryTs, exitTs, exitPrice, ts, dataHigh, dataLow, sweepTs, sweepSide, ifvgTop, ifvgBottom, ifvgFormationTs, variant = 'tp1_be', barsSlug, slLabel }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'found' | 'missing'>('loading');
  const [snappedSL, setSnappedSL] = useState<number | null>(null);
  const entryRef = useRef<number | null>(null);
  const candlesRef = useRef<CandlestickData<UTCTimestamp>[]>([]);
  const barsRef = useRef<EventBar[]>([]);
  const t0MsRef = useRef<number>(0);

  const isMultiEvent = eventShort === 'Multi-event' || eventShort === 'multi-event' || eventShort === '';
  const suffix = asset === 'nq' ? '' : asset === 'gc' ? '-gc' : asset === 'es' ? '-es' : asset === 'si' ? '-si' : asset === 'ym' ? '-ym' : '';
  const jsonPath = (() => {
    if (isMultiEvent) return null;
    if (barsSlug) return `/data/event_bars/${barsSlug}-bars${suffix}.json`;
    const resolvedShort = EVENT_SHORT[eventShort] ?? eventShort;
    const oldSuffix = asset === 'gc' ? '_gc' : asset === 'es' ? '_es' : asset === 'si' ? '_si' : asset === 'ym' ? '_ym' : '';
    return `/data/${resolvedShort}_event_bars${oldSuffix}.json`;
  })();

  useEffect(() => {
    if (isMultiEvent) { setStatus('missing'); return; }
    let cancelled = false;
    fetch(jsonPath!)
      .then((r) => r.json())
      .then((data: EventBarsEntry[]) => {
        if (cancelled) return;
        const entry = data.find((e) => e.date === tradeDate);
        if (!entry) { setStatus('missing'); return; }
        const t0Ms = new Date(entry.t0_iso).getTime();
        t0MsRef.current = t0Ms;
        const filled = forwardFill(entry.bars);
        barsRef.current = filled;
        candlesRef.current = toCandles(filled, t0Ms);
        entryRef.current = entry.entry_price;
        setStatus('found');
      })
      .catch(() => { if (!cancelled) setStatus('missing'); });
    return () => { cancelled = true; };
  }, [jsonPath, tradeDate, isMultiEvent]);

  useEffect(() => {
    if (status !== 'found') return;
    if (!containerRef.current) return;
    const candles = candlesRef.current;
    const entryPrice = entryRef.current;
    const bars = barsRef.current;
    const t0Ms = t0MsRef.current;
    if (candles.length === 0) return;

    const el = containerRef.current;

    const cPaper    = '#1c1812';
    const cEdge     = '#2c2620';
    const cInkDim   = '#efe7d8';
    const cInkQuiet = '#9b948a';
    const cUp       = '#e9b44b';
    const cDown     = '#a55f44';
    const cGold     = '#b08932';

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

    const hasLevels = entryPriceProp !== undefined && slPrice !== undefined && tpPrice !== undefined;
    // Prefer real IFVG entry (overlay) over event_bars release-bar open.
    const effectiveEntryPrice = entryPriceProp !== undefined ? entryPriceProp : entryPrice;

    // Segment lines: entry_ts → exit_ts (not infinite priceLines)
    if (hasLevels && entryTs !== undefined && exitTs !== undefined && entryPriceProp !== undefined && slPrice !== undefined && tpPrice !== undefined) {
      // entry_ts is the OPEN of the breaking bar; trade fills at its CLOSE → +60s.
      const entrySec = (Math.floor(new Date(entryTs).getTime() / 1000) + 60) as UTCTimestamp;
      // Extend segment from entry to end of visible chart (not just exit_ts which can be 1min away = invisible).
      const lastCandle = candles[candles.length - 1];
      const chartEndSec = (lastCandle?.time as number) ?? Math.floor(new Date(exitTs).getTime() / 1000);
      // Guard: if bars end at/before entry (incomplete data window for this trade), skip overlay segments to avoid lightweight-charts asc-order assert. Candles still render.
      if (chartEndSec <= entrySec) {
        return;
      }
      const exitSec = chartEndSec as UTCTimestamp;

      // ── Fibo overlay (0 = entry, 0.5 = TP1, 1 = TP final) ────────────────
      // Entry = 0.0
      const entrySegment = chart.addSeries(LineSeries, {
        color: cGold,
        lineWidth: 2,
        lineStyle: 0,
        priceLineVisible: false,
        lastValueVisible: true,
        title: '0.0 · Entry',
      });
      entrySegment.setData([
        { time: entrySec, value: entryPriceProp },
        { time: exitSec, value: entryPriceProp },
      ]);

      // TP1 = 0.5 (midpoint entry → TP)
      const tp1Price = entryPriceProp + 0.5 * (tpPrice - entryPriceProp);
      const tp1Segment = chart.addSeries(LineSeries, {
        color: cUp,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceLineVisible: false,
        lastValueVisible: true,
        title: '0.5 · TP1',
      });
      tp1Segment.setData([
        { time: entrySec, value: tp1Price },
        { time: exitSec, value: tp1Price },
      ]);

      // TP final = 1.0
      const tpSegment = chart.addSeries(LineSeries, {
        color: cUp,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: true,
        title: '1.0 · TP',
      });
      tpSegment.setData([
        { time: entrySec, value: tpPrice },
        { time: exitSec, value: tpPrice },
      ]);

      // ── SL line: snap to actual sweep wick extreme (not buffered price) ──
      // Walk bars between sweep_ts and entry_ts; use the max wick high (short)
      // or min wick low (long) so the SL line physically touches the wick.
      const sweepMs = sweepTs !== undefined ? new Date(sweepTs).getTime() : new Date(entryTs).getTime() - 60_000;
      const sweepMin = Math.round((sweepMs - t0Ms) / 60_000);
      const entryMin = Math.round((new Date(entryTs).getTime() - t0Ms) / 60_000);
      const sweepBars = bars.filter((b) => b.m >= sweepMin && b.m <= entryMin);
      let displaySL = slPrice;
      if (sweepBars.length > 0) {
        displaySL = side === 'short'
          ? Math.max(...sweepBars.map((b) => b.h))
          : Math.min(...sweepBars.map((b) => b.l));
      }
      setSnappedSL(displaySL);
      const slSegment = chart.addSeries(LineSeries, {
        color: cDown,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: true,
        title: 'Stop loss',
      });
      const slStartSec = (sweepTs !== undefined
        ? Math.floor(new Date(sweepTs).getTime() / 1000)
        : entrySec) as UTCTimestamp;
      slSegment.setData([
        { time: slStartSec, value: displaySL },
        { time: exitSec, value: displaySL },
      ]);
    } else if (entryPriceProp !== undefined && tpPrice !== undefined && slPrice === undefined && entryTs !== undefined) {
      // Straddle overlay: entry + TP lines, no SL
      const entrySec = (Math.floor(new Date(entryTs).getTime() / 1000)) as UTCTimestamp;
      const lastCandle = candles[candles.length - 1];
      const chartEndSec = (lastCandle?.time as number) ?? entrySec;
      if (chartEndSec > entrySec) {
        const exitSec = chartEndSec as UTCTimestamp;

        const entrySegment = chart.addSeries(LineSeries, {
          color: cGold,
          lineWidth: 2,
          lineStyle: 0,
          priceLineVisible: false,
          lastValueVisible: true,
          title: 'Entry',
        });
        entrySegment.setData([
          { time: entrySec, value: entryPriceProp },
          { time: exitSec, value: entryPriceProp },
        ]);

        const tpSegment = chart.addSeries(LineSeries, {
          color: cUp,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          priceLineVisible: false,
          lastValueVisible: true,
          title: 'TP',
        });
        tpSegment.setData([
          { time: entrySec, value: tpPrice },
          { time: exitSec, value: tpPrice },
        ]);
      }
    } else if (effectiveEntryPrice !== null && effectiveEntryPrice !== undefined) {
      // GC fallback: no segments, just a price line for entry only
      candleSeries.createPriceLine({
        price: effectiveEntryPrice,
        color: cGold,
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: hasLevels ? `Entry · ${effectiveEntryPrice}` : 'Entry',
      });
    }

    // A. Entry triangle removed — Entry line already indicates entry; IFVG detection still uses bars.
    if (entryTs !== undefined && entryPriceProp !== undefined) {
      // C. IFVG zone detection
      if (bars.length > 0 && t0Ms > 0) {
        const entryMs = new Date(entryTs).getTime();
        const entryMinute = Math.round((entryMs - t0Ms) / 60_000);
        const zone = detectIfvgZone(bars, entryMinute, side);
        if (zone !== null) {
          candleSeries.createPriceLine({
            price: zone.gap_high,
            color: 'rgba(180,150,100,0.5)',
            lineWidth: 1,
            lineStyle: LineStyle.Dotted,
            axisLabelVisible: false,
            title: 'IFVG top',
          });
          candleSeries.createPriceLine({
            price: zone.gap_low,
            color: 'rgba(180,150,100,0.5)',
            lineWidth: 1,
            lineStyle: LineStyle.Dotted,
            axisLabelVisible: false,
            title: 'IFVG bot',
          });
        }
      }
    }

    // D. Exit marker
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
    }

    // E. Data range lines: each extends individually until its own sweep (or chart end if never).
    if (dataHigh !== undefined && dataLow !== undefined && ts !== undefined) {
      const releaseTimeSec = Math.floor(new Date(ts).getTime() / 1000) as UTCTimestamp;
      const lastCandle = candles[candles.length - 1];
      const chartEndSec = (lastCandle?.time as number) ?? releaseTimeSec;

      // Find first candle (time > releaseTimeSec) where high > dataHigh / low < dataLow
      let dataHighEndSec: UTCTimestamp = chartEndSec as UTCTimestamp;
      let dataLowEndSec: UTCTimestamp = chartEndSec as UTCTimestamp;
      for (const c of candles) {
        const ct = c.time as number;
        if (ct <= releaseTimeSec) continue;
        if ((dataHighEndSec as number) === chartEndSec && c.high > dataHigh) {
          dataHighEndSec = ct as UTCTimestamp;
        }
        if ((dataLowEndSec as number) === chartEndSec && c.low < dataLow) {
          dataLowEndSec = ct as UTCTimestamp;
        }
        if ((dataHighEndSec as number) !== chartEndSec && (dataLowEndSec as number) !== chartEndSec) break;
      }

      const cDataLine = 'rgba(122, 110, 90, 0.7)';

      const dataHighLine = chart.addSeries(LineSeries, {
        color: cDataLine,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      dataHighLine.setData([
        { time: releaseTimeSec, value: dataHigh },
        { time: dataHighEndSec, value: dataHigh },
      ]);

      const dataLowLine = chart.addSeries(LineSeries, {
        color: cDataLine,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      dataLowLine.setData([
        { time: releaseTimeSec, value: dataLow },
        { time: dataLowEndSec, value: dataLow },
      ]);
    }

    // F. IFVG: localized to formation→entry window (3-5 min), thick lines for thin zones.
    if (ifvgTop !== undefined && ifvgBottom !== undefined && ifvgFormationTs !== undefined && entryTs !== undefined) {
      // Extend back 2 minutes to include the FVG formation context.
      const formSec = (Math.floor(new Date(ifvgFormationTs).getTime() / 1000) - 120) as UTCTimestamp;
      // Stop IFVG at the entry bar's CLOSE (entry_ts + 60s) so the breaking bar is inside the zone.
      const entrySec = (Math.floor(new Date(entryTs).getTime() / 1000) + 60) as UTCTimestamp;
      const cIfvg = 'rgba(20, 20, 20, 0.9)';

      const topEdge = chart.addSeries(LineSeries, {
        color: cIfvg, lineWidth: 1, lineStyle: LineStyle.Solid,
        priceLineVisible: false, lastValueVisible: true,
        title: 'IFVG',
      });
      topEdge.setData([
        { time: formSec, value: ifvgTop },
        { time: entrySec, value: ifvgTop },
      ]);

      const bottomEdge = chart.addSeries(LineSeries, {
        color: cIfvg, lineWidth: 1, lineStyle: LineStyle.Solid,
        priceLineVisible: false, lastValueVisible: false,
      });
      bottomEdge.setData([
        { time: formSec, value: ifvgBottom },
        { time: entrySec, value: ifvgBottom },
      ]);
    }

    // Y-axis range: focus on trade levels (~300 pts window centered on trade).
    // If SL/Entry/TP exist, build window around them; else fall back to full candles range.
    const levels = [entryPriceProp, slPrice, tpPrice, ifvgTop, ifvgBottom].filter((v): v is number => v !== undefined && v !== null);
    let yMin: number;
    let yMax: number;
    if (levels.length >= 3) {
      const levelMin = Math.min(...levels);
      const levelMax = Math.max(...levels);
      // Also include candles around entry to keep price action visible.
      const entrySec = entryTs ? Math.floor(new Date(entryTs).getTime() / 1000) : 0;
      const nearby = candles.filter((c) => Math.abs((c.time as number) - entrySec) <= 30 * 60);
      const candleMax = nearby.length > 0 ? Math.max(...nearby.map((c) => c.high)) : levelMax;
      const candleMin = nearby.length > 0 ? Math.min(...nearby.map((c) => c.low)) : levelMin;
      const fullMin = Math.min(levelMin, candleMin);
      const fullMax = Math.max(levelMax, candleMax);
      const span = (fullMax - fullMin) * 1.15; // 15% padding above + below combined
      const center = (fullMin + fullMax) / 2;
      yMin = center - span / 2;
      yMax = center + span / 2;
    } else {
      const allH = candles.map((c) => c.high);
      const allL = candles.map((c) => c.low);
      const extraPrices = [entryPrice, slPrice, tpPrice, exitPrice, dataHigh, dataLow].filter((v): v is number => v !== undefined && v !== null);
      yMax = Math.max(...allH, ...extraPrices);
      yMin = Math.min(...allL, ...extraPrices);
    }
    const pad = 0;
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

    const trySetRange = () => {
      const firstTs = candles[0]?.time as number | undefined;
      const lastTs = candles[candles.length - 1]?.time as number | undefined;
      if (firstTs === undefined || lastTs === undefined) return;
      const anchorMs = entryTs ? new Date(entryTs).getTime() : (ts ? new Date(ts).getTime() : t0Ms);
      const anchorSec = Math.floor(anchorMs / 1000);
      const from = Math.max(firstTs, anchorSec - 25 * 60) as UTCTimestamp;
      const to = Math.min(lastTs, anchorSec + 25 * 60) as UTCTimestamp;
      if ((to as number) > (from as number)) {
        chart.timeScale().setVisibleRange({ from, to });
      } else {
        chart.timeScale().fitContent();
      }
    };
    trySetRange();

    return () => { chart.remove(); };
  }, [status]);

  const outcomeColor =
    outcome === 'win' ? '#e9b44b'
    : outcome === 'loss' ? '#a55f44'
    : '#9b948a';
  const pnlSign = pnl_pts >= 0 ? '+' : '';

  return (
    <div className="v3-tr-chart-wrap">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8, width: '100%', maxWidth: 720, margin: '0 auto' }}>
        {status === 'loading' && (
          <div style={{
            width: '100%', maxWidth: 720, height: 520,
            background: '#1c1812',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--f-sans)', fontSize: '0.75rem', color: 'var(--c-muted)',
          }}>
            Loading…
          </div>
        )}
        {status === 'missing' && (
          <div style={{
            width: '100%', maxWidth: 720, height: 520,
            background: '#1c1812',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--f-sans)', fontSize: '0.75rem', color: 'var(--c-muted)',
            textAlign: 'center', padding: '0 24px',
          }}>
            {isMultiEvent
              ? 'Multi-event aggregate — see per-event sub-pages for trade charts.'
              : 'Chart data not available for this date.'}
          </div>
        )}
        <div style={{ display: status === 'found' ? 'block' : 'none' }}>
          <div
            ref={containerRef}
            style={{
              width: '100%', maxWidth: 720, height: 520,
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid #2c2620',
            }}
          />
        </div>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
          fontFamily: 'var(--f-sans)', fontSize: '0.7rem', color: 'var(--c-muted)',
          paddingTop: 4,
        }}>
          <span style={{ color: outcomeColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {outcome}
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: pnl_pts > 0 ? '#e9b44b' : pnl_pts < 0 ? '#a55f44' : 'var(--c-muted)' }}>
            {pnlSign}{pnl_pts.toFixed(2)} pts
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap', fontVariantNumeric: 'tabular-nums' }}>
            {(variant !== 'tp1_be' || (tpPrice !== undefined && entryPriceProp !== undefined && pnl_pts > 0.5 * Math.abs(tpPrice - entryPriceProp))) && tpPrice !== undefined && (<LegendPill color="#4a8c3f" label="TP" value={tpPrice} />)}
            {variant === 'tp1_be' && tpPrice !== undefined && entryPriceProp !== undefined && (
              <LegendPill color="#4a8c3f" label="TP1" value={(entryPriceProp + 0.5 * (tpPrice - entryPriceProp)).toFixed(2)} />
            )}
            {dataHigh !== undefined && (<LegendPill color="rgba(122,110,90,0.85)" label="Release H" value={dataHigh} />)}
            {ifvgTop !== undefined && ifvgBottom !== undefined && (
              <LegendPill color="#141414" label="IFVG" value={`${ifvgBottom}–${ifvgTop}`} />
            )}
            {dataLow !== undefined && (<LegendPill color="rgba(122,110,90,0.85)" label="Release L" value={dataLow} />)}
            {entryPriceProp !== undefined && (<LegendPill color="#b08932" label="Entry" value={entryPriceProp} />)}
            {slPrice !== undefined && (<LegendPill color="#b8452a" label={slLabel ?? "SL"} value={snappedSL ?? slPrice} />)}
          </span>
        </div>
      </div>
    </div>
  );
}
