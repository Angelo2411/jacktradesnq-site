'use client';
import Link from 'next/link';
import { useAsset } from './AssetContext';
import type { StrategyStats, MarketStudyStats } from '@/lib/study-stats';

function pct(v: number) { return `${v}%`; }
function netFmt(v: number) { const sign = v >= 0 ? '+' : ''; return `${sign}${v.toFixed(1)}`; }

type Props = {
  strats: StrategyStats[];
  marketStudies: MarketStudyStats[];
  totalTrades: number;
  period: string;
  allAssets: string;
};

export default function DataTables({ strats, marketStudies, totalTrades, period, allAssets }: Props) {
  const { asset } = useAsset();

  const filteredStrats = asset === 'all'
    ? strats
    : strats.filter((s) => s.asset.toLowerCase() === asset);

  const filteredStudies = asset === 'all'
    ? marketStudies
    : marketStudies.filter((ms) => ms.asset.toLowerCase() === asset);

  const visibleTrades = filteredStrats.reduce((s, st) => s + st.n, 0);
  const visibleAssets = asset === 'all'
    ? allAssets
    : asset.toUpperCase();

  return (
    <>
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
                  onClick={`document.location='/backtested-data/${s.slug}/'` as unknown as React.MouseEventHandler}
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
                <tr key={ms.slug}>
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
