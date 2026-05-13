'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TradeChart, { type Bar, type TradeSim } from './TradeChart';

type EventType = 'cpi' | 'nfp';

interface EventBars {
  date: string;
  t0_iso: string;
  entry_price: number;
  bars: Bar[];
}

interface SimResult {
  date: string;
  entry_price: number;
  bars: Bar[];
  sim: TradeSim;
}

const ALL = 'ALL';

function simulate(
  ev: EventBars,
  stop: number,
  tp: number,
  side: 'BOTH' | 'LONG' | 'SHORT',
): TradeSim {
  const entry = ev.entry_price;
  const buyStop = entry + stop;
  const sellStop = entry - stop;
  const tpBuy = buyStop + tp;
  const tpSell = sellStop - tp;

  let filled: 'long' | 'short' | 'done' | null = null;
  let fillPrice: number | null = null;
  let fillBarIdx: number | null = null;
  let exitPrice: number | null = null;
  let exitBarIdx: number | null = null;
  let outcome: 'tp' | 'expired' | 'no_fill' = 'no_fill';

  const lastClose = ev.bars[ev.bars.length - 1].c;

  for (let i = 0; i < ev.bars.length; i++) {
    const b = ev.bars[i];
    if (b.m < 0) continue;
    if (filled === null) {
      let longTrig = side !== 'SHORT' && b.h >= buyStop;
      let shortTrig = side !== 'LONG' && b.l <= sellStop;
      if (longTrig && shortTrig) {
        if (Math.abs(b.o - b.h) < Math.abs(b.o - b.l)) {
          shortTrig = false;
        } else {
          longTrig = false;
        }
      }
      if (longTrig) {
        filled = 'long';
        fillPrice = buyStop;
        fillBarIdx = i;
      } else if (shortTrig) {
        filled = 'short';
        fillPrice = sellStop;
        fillBarIdx = i;
      } else {
        continue;
      }
    }

    if (filled === 'long' && fillPrice !== null) {
      if (b.h >= tpBuy) {
        outcome = 'tp';
        exitPrice = tpBuy;
        exitBarIdx = i;
        filled = 'done';
        break;
      }
    } else if (filled === 'short' && fillPrice !== null) {
      if (b.l <= tpSell) {
        outcome = 'tp';
        exitPrice = tpSell;
        exitBarIdx = i;
        filled = 'done';
        break;
      }
    }
  }

  if (filled === 'long' || filled === 'short') {
    outcome = 'expired';
    exitPrice = lastClose;
    exitBarIdx = ev.bars.length - 1;
  }
  if (filled === null) {
    outcome = 'no_fill';
  }

  let pnl = 0;
  if (outcome === 'tp') pnl = tp;
  else if (outcome === 'expired' && fillPrice !== null && exitPrice !== null) {
    pnl = filled === 'long' ? exitPrice - fillPrice : fillPrice - exitPrice;
  }

  return {
    entry,
    buyStop,
    sellStop,
    tpBuy,
    tpSell,
    side: filled === 'done' ? (fillPrice === buyStop ? 'long' : 'short') : (filled as 'long' | 'short' | null),
    fillPrice,
    fillBarIdx,
    exitPrice,
    exitBarIdx,
    outcome,
    pnl,
    stopPts: stop,
    tpPts: tp,
  };
}

export default function PrintReport() {
  const params = useSearchParams();
  const event = ((params.get('event') ?? 'cpi').toLowerCase() as EventType);
  const stopRaw = params.get('stop') ?? ALL;
  const tpRaw = params.get('tp') ?? ALL;
  const yearRaw = params.get('year') ?? ALL;
  const sideRaw = (params.get('side') ?? 'BOTH').toUpperCase() as 'BOTH' | 'LONG' | 'SHORT';
  const limitRaw = params.get('limit');
  const limit = limitRaw ? Math.max(1, parseInt(limitRaw, 10)) : null;

  const [events, setEvents] = useState<EventBars[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/data/${event}_event_bars.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: EventBars[]) => {
        if (cancelled) return;
        setEvents(j);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Load failed');
      });
    return () => {
      cancelled = true;
    };
  }, [event]);

  const filteredCombos = useMemo(() => {
    if (stopRaw === ALL || tpRaw === ALL) return null;
    return { stop: Number(stopRaw), tp: Number(tpRaw) };
  }, [stopRaw, tpRaw]);

  const trades: SimResult[] = useMemo(() => {
    if (!events || !filteredCombos) return [];
    const filtered = yearRaw === ALL ? events : events.filter((e) => e.date.startsWith(yearRaw));
    const all = filtered.map((e) => ({
      date: e.date,
      entry_price: e.entry_price,
      bars: e.bars,
      sim: simulate(e, filteredCombos.stop, filteredCombos.tp, sideRaw),
    }));
    return limit ? all.slice(0, limit) : all;
  }, [events, filteredCombos, yearRaw, sideRaw, limit]);

  // Auto-trigger print when ready (only if ?print=1)
  const autoPrint = params.get('print') === '1';
  const [chartsReady, setChartsReady] = useState(0);
  useEffect(() => {
    if (!autoPrint) return;
    if (trades.length === 0) return;
    if (chartsReady < trades.length) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [autoPrint, trades.length, chartsReady]);

  if (error) {
    return <div style={{ padding: 40, fontFamily: 'system-ui' }}>Error: {error}</div>;
  }
  if (!events) {
    return <div style={{ padding: 40, fontFamily: 'system-ui' }}>Loading dataset…</div>;
  }
  if (!filteredCombos) {
    return (
      <div style={{ padding: 40, fontFamily: 'system-ui', maxWidth: 720 }}>
        <h1>Missing parameters</h1>
        <p>This page expects URL params: <code>?event=cpi|nfp&stop=N&tp=N[&year=YYYY|ALL][&side=BOTH|LONG|SHORT][&limit=N][&print=1]</code></p>
        <p>Example: <a href="/print/straddle/?event=cpi&stop=40&tp=15&year=ALL&side=BOTH&limit=3">/print/straddle/?event=cpi&stop=40&tp=15&year=ALL&side=BOTH&limit=3</a></p>
      </div>
    );
  }

  const eventLabel = event.toUpperCase();
  const today = new Date().toISOString().slice(0, 10);
  const wins = trades.filter((t) => t.sim.outcome === 'tp').length;
  const losses = trades.filter((t) => t.sim.outcome === 'expired').length;
  const noFills = trades.filter((t) => t.sim.outcome === 'no_fill').length;
  const totalPnl = trades.reduce((s, t) => s + t.sim.pnl, 0);

  return (
    <div className="print-report">
      {/* Cover */}
      <section className="print-page print-cover">
        <header>
          <p className="kicker">jacktradesnq.com — backtested-data</p>
          <h1>
            {eventLabel} <em>straddle</em> report
          </h1>
          <p className="subtitle">
            Entry offset ±{filteredCombos.stop} pts · TP {filteredCombos.tp} pts
            {yearRaw !== ALL ? ` · Year ${yearRaw}` : ' · 2016–2026'} ·{' '}
            {sideRaw === 'BOTH' ? 'Bilateral' : sideRaw === 'LONG' ? 'Long only' : 'Short only'}
          </p>
        </header>
        <div className="cover-grid">
          <div className="stat">
            <span className="stat-num">{trades.length}</span>
            <span className="stat-label">Events in scope</span>
          </div>
          <div className="stat">
            <span className="stat-num">{wins}</span>
            <span className="stat-label">TP hits</span>
          </div>
          <div className="stat">
            <span className="stat-num">{losses}</span>
            <span className="stat-label">Expired filled</span>
          </div>
          <div className="stat">
            <span className="stat-num">{noFills}</span>
            <span className="stat-label">No-fill</span>
          </div>
          <div className="stat stat-wide">
            <span className="stat-num">
              {totalPnl >= 0 ? '+' : ''}
              {totalPnl.toFixed(1)} pts
            </span>
            <span className="stat-label">Net P&L (sum)</span>
          </div>
        </div>
        <p className="cover-foot">
          Generated {today} · One page per event · {trades.length} chart{trades.length === 1 ? '' : 's'} follow
        </p>
      </section>

      {/* One page per trade */}
      {trades.map((t, i) => (
        <TradeChart
          key={`${t.date}-${i}`}
          eventLabel={eventLabel}
          date={t.date}
          bars={t.bars}
          sim={t.sim}
          onReady={() => setChartsReady((n) => n + 1)}
        />
      ))}

      {/* Print-only styles, embedded so this page is self-contained */}
      <style jsx global>{`
        :root {
          --c-up: oklch(0.62 0.10 145);
          --c-down: oklch(0.55 0.13 30);
          --c-up-soft: oklch(0.62 0.10 145 / 0.18);
          --c-down-soft: oklch(0.55 0.13 30 / 0.18);
        }
        body {
          background: var(--c-paper);
          color: var(--c-ink);
          font-family: var(--font-body);
          margin: 0;
          padding: 0;
        }
        .print-report {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .print-page {
          min-height: calc(100vh - 48px);
          padding: 48px 0 64px;
          page-break-after: always;
          break-after: page;
        }
        .print-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }

        .print-cover header .kicker {
          font-family: var(--font-body);
          font-size: 0.75rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--c-ink-quiet);
          margin: 0 0 12px;
        }
        .print-cover h1 {
          font-family: var(--font-display);
          font-weight: 300;
          font-size: 4.5rem;
          line-height: 1.02;
          letter-spacing: -0.02em;
          margin: 0;
          color: var(--c-ink);
        }
        .print-cover h1 em {
          font-style: italic;
          color: var(--c-yellow-deep);
          font-weight: 300;
        }
        .print-cover .subtitle {
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--c-ink-dim);
          margin: 16px 0 48px;
        }
        .cover-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 48px;
        }
        .cover-grid .stat {
          background: var(--c-paper-edge);
          border-radius: 12px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cover-grid .stat-wide {
          grid-column: span 4;
          background: oklch(0.93 0.10 95);
        }
        .cover-grid .stat-num {
          font-family: var(--font-display);
          font-size: 2.25rem;
          font-weight: 300;
          line-height: 1;
          color: var(--c-ink);
        }
        .cover-grid .stat-label {
          font-family: var(--font-body);
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--c-ink-quiet);
        }
        .cover-foot {
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--c-ink-quiet);
          border-top: 1px solid var(--border-strong);
          padding-top: 16px;
        }

        @page {
          size: Letter portrait;
          margin: 0.4in 0.4in 0.4in 0.4in;
        }
        @media print {
          body { background: var(--c-paper) !important; }
          .print-report { max-width: none; padding: 0; }
          .print-page {
            min-height: 0;
            padding: 0 0 24px;
          }
        }
      `}</style>
    </div>
  );
}
