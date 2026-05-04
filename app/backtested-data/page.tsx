import Link from 'next/link';
import { getAllEntries } from '@/lib/backtested-data';
import { IconArrowRight } from './_components/icons';

const catLabel = (c: string) => (c === 'tradingview' ? 'TRADINGVIEW' : 'DATA');

export default function BacktestedHub() {
  const entries = getAllEntries();
  const tvCount = entries.filter((e) => e.category === 'tradingview').length;
  const dataCount = entries.filter((e) => e.category === 'data').length;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div>
      <header className="bd-hub-head">
        <h1 className="bd-h1">
          Backtested data<span className="bd-dot">.</span>
        </h1>
        <p className="bd-hub-sub">
          Backtests run by AI on historical data. Numbers are indicative —
          assumptions, fills and slippage can be wrong. Always re-verify before
          risking capital.
        </p>
        <div className="bd-stats">
          <div className="bd-stat">
            <span className="bd-stat-num">
              {String(tvCount).padStart(2, '0')}
            </span>
            <span className="bd-stat-lbl">TradingView</span>
          </div>
          <span className="bd-stat-div" />
          <div className="bd-stat">
            <span className="bd-stat-num">
              {String(dataCount).padStart(2, '0')}
            </span>
            <span className="bd-stat-lbl">Data studies</span>
          </div>
          <span className="bd-stat-div" />
          <div className="bd-stat">
            <span className="bd-stat-lbl" style={{ marginRight: 6 }}>
              Updated
            </span>
            <span className="bd-stat-lbl" style={{ color: 'var(--c-ink)' }}>
              {today}
            </span>
          </div>
        </div>
      </header>

      <ul className="bd-list">
        {entries.map((e) => (
          <li key={e.slug}>
            <Link className="bd-entry" href={`/backtested-data/${e.slug}/`}>
              <div className="bd-entry-row">
                <span className="bd-tag">{catLabel(e.category)}</span>
                <span className="bd-meta">{e.date}</span>
                <IconArrowRight
                  className="bd-entry-arrow"
                  style={{ width: 18, height: 18 }}
                />
              </div>
              <h2 className="bd-card-title bd-entry-title">
                <span className="bd-entry-title-text">{e.title}</span>
              </h2>
              <p className="bd-entry-excerpt">{e.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
