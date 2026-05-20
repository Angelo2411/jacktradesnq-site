'use client';

import { useEffect, useMemo, useState } from 'react';
import StraddleMiniChart from './StraddleMiniChart';

interface Trade {
  date: string;
  ts: string;
  entry_price: number;
  X: number;
  Y: number;
  buy_stop: number;
  sell_stop: number;
  tp_buy: number;
  tp_sell: number;
  filled_side: 'long' | 'short' | null;
  fill_ts: string | null;
  fill_price: number | null;
  exit_ts: string | null;
  exit_price: number | null;
  pnl: number;
  outcome: string;
}

interface ComboBlock { X: number; Y: number; trades: Trade[]; }
interface Payload { event: string; combos: ComboBlock[]; }

const PAGE_SIZE = 25;

export default function StraddleTrades({
  eventShort,
  jsonUrl,
  offsetLabel,
  pdfUrl,
  pdfLabel,
}: {
  eventShort: 'cpi' | 'nfp';
  jsonUrl: string;
  offsetLabel: string;
  pdfUrl?: string;
  pdfLabel?: string;
}) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [selectedX, setSelectedX] = useState<number | null>(null);
  const [selectedY, setSelectedY] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    fetch(jsonUrl).then((r) => r.json()).then((data: Payload) => {
      setPayload(data);
      if (data.combos.length > 0) {
        setSelectedX(data.combos[0].X);
        setSelectedY(data.combos[0].Y);
      }
    });
  }, [jsonUrl]);

  const xValues = useMemo(() => {
    if (!payload) return [];
    return Array.from(new Set(payload.combos.map((c) => c.X))).sort((a, b) => a - b);
  }, [payload]);

  const yValues = useMemo(() => {
    if (!payload) return [];
    return Array.from(new Set(payload.combos.map((c) => c.Y))).sort((a, b) => a - b);
  }, [payload]);

  const combo = useMemo(() => {
    if (!payload || selectedX === null || selectedY === null) return null;
    return payload.combos.find((c) => c.X === selectedX && c.Y === selectedY) ?? null;
  }, [payload, selectedX, selectedY]);

  const trades = combo?.trades ?? [];
  const sortedTrades = useMemo(() => [...trades].sort((a, b) => (a.ts < b.ts ? 1 : -1)), [trades]);
  const shown = sortedTrades.slice(0, visible);

  // Aggregate stats
  const stats = useMemo(() => {
    if (trades.length === 0) return null;
    const n = trades.length;
    const tp_hit = trades.filter((t) => t.outcome === 'tp_hit').length;
    const no_fill = trades.filter((t) => t.outcome === 'no_fill').length;
    const filled = n - no_fill;
    const net = trades.reduce((s, t) => s + t.pnl, 0);
    const wins = trades.filter((t) => t.pnl > 0).length;
    return {
      n,
      tp_hit,
      tp_hit_rate: Math.round((tp_hit / n) * 1000) / 10,
      fill_rate: Math.round((filled / n) * 1000) / 10,
      no_fill,
      net: Math.round(net * 10) / 10,
      avg_pnl: Math.round((net / n) * 100) / 100,
      win_rate: Math.round((wins / n) * 1000) / 10,
    };
  }, [trades]);

  if (!payload) {
    return <div style={{ padding: 16, color: 'var(--c-muted)', fontSize: 12 }}>Loading trades…</div>;
  }

  return (
    <div className="v3-straddle-trades">
      {pdfUrl ? (
        <div style={{ marginBottom: 16 }}>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="bd-link-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
            ↓ {pdfLabel ?? 'Download — Full report PDF'}
          </a>
        </div>
      ) : null}
      {stats && (
        <div className="v3-kpi-band" style={{ marginBottom: 12 }}>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Sample size</div>
            <div className="v3-kpi-band-val">{stats.n}</div>
            <div className="v3-kpi-band-foot">events tested</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Fill rate</div>
            <div className="v3-kpi-band-val">{stats.fill_rate}%</div>
            <div className="v3-kpi-band-foot">trades triggered</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">TP hit</div>
            <div className={'v3-kpi-band-val' + (stats.tp_hit_rate > 30 ? ' pos' : '')}>{stats.tp_hit_rate}%</div>
            <div className="v3-kpi-band-foot">of all events</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Net (pts)</div>
            <div className={'v3-kpi-band-val' + (stats.net > 0 ? ' pos' : '')}>{stats.net >= 0 ? '+' : ''}{stats.net.toFixed(1)}</div>
            <div className="v3-kpi-band-foot">avg {stats.avg_pnl.toFixed(2)}/event</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--c-muted)', fontWeight: 600 }}>{offsetLabel}:</span>
        {xValues.map((x) => (
          <button
            key={x}
            type="button"
            className={'v3-flt-pill' + (selectedX === x ? ' active' : '')}
            onClick={() => { setSelectedX(x); setExpandedIdx(null); setVisible(PAGE_SIZE); }}
          >
            ±{x}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--c-muted)', fontWeight: 600 }}>TP:</span>
        {yValues.map((y) => (
          <button
            key={y}
            type="button"
            className={'v3-flt-pill' + (selectedY === y ? ' active' : '')}
            onClick={() => { setSelectedY(y); setExpandedIdx(null); setVisible(PAGE_SIZE); }}
          >
            +{y}
          </button>
        ))}
      </div>

      <div className="v3-wd-h">Trade list</div>
      <div className="v3-wd-sub" style={{ marginBottom: 8 }}>
        OCO buy/sell stop ±{selectedX} from pre-news close · TP +{selectedY} pts · no SL · expire at last bar · most recent first.
      </div>

      <div className="v3-tr-table-wrap">
        <table className="v3-tr-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Filled</th>
              <th>PnL (pts)</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((t, i) => {
              const isOpen = expandedIdx === i;
              const filledLabel = t.filled_side ? t.filled_side.toUpperCase() : '—';
              const outcomeLabel =
                t.outcome === 'tp_hit' ? 'TP hit'
                : t.outcome === 'no_fill' ? 'no fill'
                : t.outcome.startsWith('expired') ? (t.pnl > 0 ? 'expired win' : 'expired loss')
                : t.outcome.replace(/_/g, ' ');
              const outcomeClass =
                t.outcome === 'tp_hit' ? 'v3-tr-badge win'
                : t.outcome === 'no_fill' ? 'v3-tr-badge be'
                : t.pnl > 0 ? 'v3-tr-badge win'
                : 'v3-tr-badge loss';
              const pnlClass =
                t.pnl > 0 ? 'v3-tr-pnl pos'
                : t.pnl < 0 ? 'v3-tr-pnl neg'
                : 'v3-tr-pnl zero';
              return (
                <>
                  <tr
                    key={`${t.date}-${i}`}
                    className={'v3-tr-row' + (isOpen ? ' expanded' : '')}
                    onClick={() => setExpandedIdx(isOpen ? null : i)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="v3-tr-date">
                      <span className="v3-tr-expand-icon">{isOpen ? '▾' : '▸'}</span>
                      {t.date}
                    </td>
                    <td className="v3-tr-side">{filledLabel}</td>
                    <td className={pnlClass}>{t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)}</td>
                    <td><span className={outcomeClass}>{outcomeLabel}</span></td>
                  </tr>
                  {isOpen && (
                    <tr key={`${t.date}-${i}-chart`} className="v3-tr-expanded">
                      <td colSpan={4} style={{ padding: '16px 16px 24px' }}>
                        <StraddleMiniChart
                          eventShort={eventShort}
                          tradeDate={t.date}
                          entryPrice={t.entry_price}
                          buyStop={t.buy_stop}
                          sellStop={t.sell_stop}
                          tpBuy={t.tp_buy}
                          tpSell={t.tp_sell}
                          filledSide={t.filled_side}
                          fillTs={t.fill_ts}
                          fillPrice={t.fill_price}
                          exitTs={t.exit_ts}
                          exitPrice={t.exit_price}
                          pnl={t.pnl}
                          outcome={t.outcome}
                        />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {visible < sortedTrades.length && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            type="button"
            className="v3-flt-pill"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            Load more ({sortedTrades.length - visible} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
