'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAsset } from './AssetContext';
import type { StrategyStats, MarketStudyStats } from '@/lib/study-stats';

function pct(v: number) { return `${v}%`; }
function netFmt(v: number) { const sign = v >= 0 ? '+' : ''; return `${sign}${v.toFixed(1)}`; }

type SortBy = 'pf' | 'n' | 'net' | 'wr';


type Props = {
  strats: StrategyStats[];
  marketStudies: MarketStudyStats[];
  totalTrades: number;
  period: string;
  allAssets: string;
};

export default function DataTables({ strats, marketStudies, totalTrades, period, allAssets }: Props) {
  const { asset } = useAsset();
  const [family, setFamily] = useState('');
  const [event, setEvent] = useState('');
  const [session, setSession] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('pf');
  const [showNoEdge, setShowNoEdge] = useState(false);

  const filteredStrats = useMemo(() => {
    let list = strats;
    if (asset !== 'all') list = list.filter((s) => s.asset.toLowerCase() === asset);
    if (event) list = list.filter((s) => s.event === event);
    if (session === '8:30 ET') { /* all strats are 8:30, no-op */ }
    else if (session) list = [];
    if (family === 'Market structure') list = [];
    // family === '8:30 News' → all strats, no-op
    if (!showNoEdge) list = list.filter((s) => s.pf >= 1.2);
    return [...list].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [strats, asset, family, event, session, sortBy, showNoEdge]);

  const filteredStudies = useMemo(() => {
    let list = marketStudies;
    if (asset !== 'all') list = list.filter((ms) => ms.asset.toLowerCase() === asset);
    if (family === '8:30 News') list = [];
    if (event) list = [];
    if (session && session !== '8:30 ET') list = [];
    return list;
  }, [marketStudies, asset, family, event, session]);

  const visibleTrades = filteredStrats.reduce((s, st) => s + st.n, 0);
  const visibleAssets = asset === 'all' ? allAssets : asset.toUpperCase();

  return (
    <>
      {/* Filters bar — wired */}
      <div className="v3-filters">
        <div className="v3-flt-sep" />
        <select className="v3-flt-select" value={family} onChange={(e) => setFamily(e.target.value)}>
          <option value="">Family</option>
          <option value="8:30 News">8:30 News</option>
          <option value="Market structure">Market structure</option>
        </select>
        <select className="v3-flt-select" value={event} onChange={(e) => setEvent(e.target.value)}>
          <option value="">Event</option>
          <option value="CPI">CPI</option>
          <option value="NFP">NFP</option>
          <option value="Jobless Claims">Jobless Claims</option>
          <option value="PPI">PPI</option>
          <option value="PCE">PCE</option>
          <option value="GDP">GDP</option>
          <option value="Retail Sales">Retail Sales</option>
          <option value="Empire State">Empire State</option>
          <option value="Employment Cost">Employment Cost</option>
        </select>
        <select className="v3-flt-select" value={session} onChange={(e) => setSession(e.target.value)}>
          <option value="">Session</option>
          <option value="8:30 ET">8:30 ET</option>
          <option value="Asia">Asia</option>
          <option value="London">London</option>
        </select>
        <div className="v3-flt-sep" />
        <select
          className="v3-flt-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
        >
          <option value="pf">↑ Sort: PF</option>
          <option value="n">↑ Sort: N</option>
          <option value="net">↑ Sort: Net</option>
          <option value="wr">↑ Sort: WR</option>
        </select>
        <button
          className={'v3-flt-pill' + (showNoEdge ? ' active' : '')}
          onClick={() => setShowNoEdge((v) => !v)}
          title="Show strategies with PF<1.2"
        >
          {showNoEdge ? '✓ ' : ''}Show no-edge
        </button>
      </div>

      {/* Meta-row KPIs */}
      <div className="v3-meta-row">
        <div className="v3-kpi-item">
          <span className="v3-kpi-val">{filteredStrats.length}</span>
          <span className="v3-kpi-lbl">Strategies</span>
        </div>
        <div className="v3-kpi-div" />
        <div className="v3-kpi-item">
          <span className="v3-kpi-val">{visibleTrades.toLocaleString()}</span>
          <span className="v3-kpi-lbl">Total trades</span>
        </div>
        <div className="v3-kpi-div" />
        <div className="v3-kpi-item">
          <span className="v3-kpi-val">{period}</span>
          <span className="v3-kpi-lbl">Period</span>
        </div>
        <div className="v3-kpi-div" />
        <div className="v3-kpi-item">
          <span className="v3-kpi-val">{visibleAssets}</span>
          <span className="v3-kpi-lbl">Assets</span>
        </div>
      </div>

      {/* Strategies table */}
      <div className="v3-section-h">Strategies</div>
      <p className="v3-section-sub">
        IFVG + SMT model · best variant (tp1_be · SMT-on) · 10y backtest.
        {filteredStrats.length === 0 && <span style={{ color: 'var(--c-muted)' }}> — No strategies for this asset yet.</span>}
      </p>
      {filteredStrats.length > 0 && (
        <div className="v3-table-wrap">
          <table className="v3-table">
            <thead>
              <tr>
                <th>Study</th>
                <th>Asset</th>
                <th className="r">PF</th>
                <th className="r">N</th>
                <th className="r">Net (pts)</th>
                <th className="r">Win rate</th>
                <th>Bias</th>
              </tr>
            </thead>
            <tbody>
              {filteredStrats.map((s) => (
                <tr
                  key={s.slug}
                  onClick={() => { window.location.href = `/backtested-data/${s.slug}/`; }}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <Link href={`/backtested-data/${s.slug}/`} className="td-study" style={{ fontFamily: 'var(--f-serif)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {s.event} IFVG+SMT
                    </Link>
                  </td>
                  <td>
                    <span className="td-asset" style={{ fontFamily: 'var(--f-sans)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-muted)' }}>
                      {s.asset}
                    </span>
                  </td>
                  <td className="r">
                    <span style={{ color: s.pf >= 1.5 ? 'var(--c-sage)' : s.pf < 1 ? 'var(--c-terra)' : 'inherit', fontWeight: s.pf >= 1.5 ? 700 : 400 }}>
                      {s.pf.toFixed(2)}
                    </span>
                  </td>
                  <td className="r">{s.n}</td>
                  <td className="r">
                    <span style={{ color: s.net > 0 ? 'var(--c-sage)' : s.net < 0 ? 'var(--c-terra)' : 'var(--c-muted)', fontWeight: s.net !== 0 ? 700 : 400 }}>
                      {netFmt(s.net)}
                    </span>
                  </td>
                  <td className="r">{pct(s.wr)}</td>
                  <td style={{ color: 'var(--c-muted)', fontSize: '0.8rem' }}>{s.bias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Market studies table */}
      <div className="v3-section-h">Market studies</div>
      <p className="v3-section-sub">
        Structure, range, and fill-rate studies — no directional edge, pure data.
        {filteredStudies.length === 0 && <span style={{ color: 'var(--c-muted)' }}> — No studies for this asset yet.</span>}
      </p>
      {filteredStudies.length > 0 && (
        <div className="v3-table-wrap">
          <table className="v3-table">
            <thead>
              <tr>
                <th>Study</th>
                <th>Asset</th>
                <th>Headline metric</th>
                <th className="r">Sample</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudies.map((ms) => (
                <tr
                  key={ms.slug}
                  onClick={() => { window.location.href = `/backtested-data/${ms.slug}/`; }}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <Link href={`/backtested-data/${ms.slug}/`} style={{ fontFamily: 'var(--f-serif)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {ms.title}
                    </Link>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--f-sans)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--c-muted)' }}>
                      {ms.asset}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--f-serif)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--c-accent-deep)' }}>
                      {ms.headline}
                    </span>
                  </td>
                  <td className="r">{ms.sample}</td>
                  <td style={{ color: 'var(--c-muted)', fontSize: '0.8rem' }}>{ms.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
