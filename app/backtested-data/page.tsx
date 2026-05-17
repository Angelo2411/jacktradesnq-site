import { getAllStrategyStats, getMarketStudyStats } from '@/lib/study-stats';
import DataTables from './_components/DataTables';

export default function BacktestedHub() {
  const strats = getAllStrategyStats();
  const marketStudies = getMarketStudyStats();

  const totalTrades = strats.reduce((s, st) => s + st.n, 0);
  const years = strats.flatMap((s) => [s.dateFrom, s.dateTo]).filter(Boolean);
  const minYear = years.length ? years.sort()[0].slice(0, 4) : '2016';
  const maxYear = years.length ? years.sort().at(-1)!.slice(0, 4) : '2026';
  const period = `${minYear}–${maxYear}`;
  const allAssets = [...new Set(strats.map((s) => s.asset))].join(' · ');

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

      {/* Filters row — asset pills now live in topbar; keep family/event/sort UI */}
      <div className="v3-filters">
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

      {/* Client component handles asset filtering + KPIs + both tables */}
      <DataTables
        strats={strats}
        marketStudies={marketStudies}
        totalTrades={totalTrades}
        period={period}
        allAssets={allAssets}
      />
    </>
  );
}
