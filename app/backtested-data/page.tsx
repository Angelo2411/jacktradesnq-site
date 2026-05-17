import Link from 'next/link';
import { getAllStrategyStats, getMarketStudyStats } from '@/lib/study-stats';

// Derive meta-row KPIs from live JSON data
function deriveMetaKpis(strats: ReturnType<typeof getAllStrategyStats>) {
  const totalTrades = strats.reduce((s, st) => s + st.n, 0);
  const assets = [...new Set(strats.map((s) => s.asset))].join(' · ');
  const years = strats.flatMap((s) => [s.dateFrom, s.dateTo]).filter(Boolean);
  const minYear = years.length ? years.sort()[0].slice(0, 4) : '2016';
  const maxYear = years.length ? years.sort().at(-1)!.slice(0, 4) : '2026';
  return {
    studyCount: strats.length,
    totalTrades,
    period: `${minYear}–${maxYear}`,
    assets,
  };
}

function pct(v: number) {
  return `${v}%`;
}

function netFmt(v: number) {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}`;
}

export default function BacktestedHub() {
  const strats = getAllStrategyStats();
  const marketStudies = getMarketStudyStats();
  const kpis = deriveMetaKpis(strats);

  return (
    <>
      {/* Hero */}
      <div className="v3-hero-crumb">Data</div>
      <h1 className="v3-hero-h1">
        The data<span className="v3-hero-dot">.</span>
      </h1>
      <p className="v3-hero-sub">
        10 years of NQ &amp; GC futures · 1-min bars · AI-backtested entry models.
      </p>

      {/* Meta-row KPIs */}
      <div className="v3-meta-row">
        <div className="v3-kpi-item">
          <span className="v3-kpi-val">{kpis.studyCount}</span>
          <span className="v3-kpi-lbl">Strategies</span>
        </div>
        <div className="v3-kpi-div" />
        <div className="v3-kpi-item">
          <span className="v3-kpi-val">{kpis.totalTrades.toLocaleString()}</span>
          <span className="v3-kpi-lbl">Total trades</span>
        </div>
        <div className="v3-kpi-div" />
        <div className="v3-kpi-item">
          <span className="v3-kpi-val">{kpis.period}</span>
          <span className="v3-kpi-lbl">Period</span>
        </div>
        <div className="v3-kpi-div" />
        <div className="v3-kpi-item">
          <span className="v3-kpi-val">{kpis.assets}</span>
          <span className="v3-kpi-lbl">Assets</span>
        </div>
      </div>

      {/* Filters row — UI only, non-functional */}
      <div className="v3-filters">
        <button className="v3-flt-pill active">All</button>
        <button className="v3-flt-pill">NQ</button>
        <button className="v3-flt-pill">GC</button>
        <div className="v3-flt-sep" />
        <select className="v3-flt-select" defaultValue="">
          <option value="">Family</option>
          <option>8:30 News</option>
          <option>Market structure</option>
        </select>
        <select className="v3-flt-select" defaultValue="">
          <option value="">Event</option>
          <option>CPI</option>
          <option>NFP</option>
          <option>Jobless Claims</option>
        </select>
        <select className="v3-flt-select" defaultValue="">
          <option value="">Session</option>
          <option>8:30 ET</option>
          <option>Asia</option>
          <option>London</option>
        </select>
        <div className="v3-flt-sep" />
        <button className="v3-flt-pill">↑ Sort: PF</button>
        <button className="v3-flt-pill">Show no-edge</button>
      </div>

      {/* Strategies table */}
      <div className="v3-section-h">Strategies</div>
      <p className="v3-section-sub">
        IFVG + SMT model · best variant (tp1_be · SMT-on) · 10y backtest.
      </p>
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
            {strats.map((s) => (
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
                  <span className={s.pf >= 1.5 ? 'td-pos' : s.pf >= 1 ? '' : 'td-neg'} style={{ color: s.pf >= 1.5 ? 'var(--c-sage)' : s.pf < 1 ? 'var(--c-terra)' : 'inherit', fontWeight: s.pf >= 1.5 ? 700 : 400 }}>
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

      {/* Market studies table */}
      <div className="v3-section-h">Market studies</div>
      <p className="v3-section-sub">
        Structure, range, and fill-rate studies — no directional edge, pure data.
      </p>
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
            {marketStudies.map((ms) => (
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
    </>
  );
}
