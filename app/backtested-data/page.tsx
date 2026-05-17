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

      {/* Client component handles asset filtering + filters + KPIs + both tables */}
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
