import { getAllStudyStats } from '@/lib/study-stats';
import { getWeeklyPlaybook } from '@/lib/today-events';
import HubFilters from './_components/HubFilters';
import { TodaySidebar } from './_components/TodaySidebar';

export default function BacktestedHub() {
  const studies = getAllStudyStats();
  const weekly = getWeeklyPlaybook(studies);

  const totalTrades = studies.reduce((s, st) => s + st.n, 0);
  const assets = [...new Set(studies.map((s) => s.asset))].length;
  const count = studies.length;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bd-hub-3col">
      <div className="bd-hub-center">
        <header className="bd-hub-head">
          <div className="bd-hub-crumb">Atlas · Updated {today}</div>
          <h1 className="bd-h1">
            The data<span className="bd-dot">.</span>
          </h1>
          <p className="bd-hub-sub">
            Every futures setup, backtested on 10 years of 1-minute OHLCV data
            (Databento). Numbers first — methodology underneath. Re-verify before
            risking capital.
          </p>
          <div className="bd-hub-meta">
            <div className="bd-hub-meta-item">
              <b className="bd-hub-meta-num">{count}</b>
              <i className="bd-hub-meta-lbl">studies</i>
            </div>
            <div className="bd-hub-meta-item">
              <b className="bd-hub-meta-num">{totalTrades.toLocaleString()}</b>
              <i className="bd-hub-meta-lbl">trades backtested</i>
            </div>
            <div className="bd-hub-meta-item">
              <b className="bd-hub-meta-num">10y</b>
              <i className="bd-hub-meta-lbl">NQ · GC · ES · SI</i>
            </div>
            <div className="bd-hub-meta-item">
              <b className="bd-hub-meta-num">{assets}</b>
              <i className="bd-hub-meta-lbl">assets</i>
            </div>
          </div>
        </header>

        <HubFilters studies={studies} />
      </div>

      <TodaySidebar weekly={weekly} />
    </div>
  );
}
