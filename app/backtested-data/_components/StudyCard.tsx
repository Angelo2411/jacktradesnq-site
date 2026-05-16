import Link from 'next/link';
import type { StudyStats } from '@/lib/study-stats';
import WeekdayBars from './WeekdayBars';

function pfClass(pf: number): string {
  if (pf >= 2.5) return 'bd-sc-val--pos';
  if (pf >= 1.5) return 'bd-sc-val--gold';
  return 'bd-sc-val--mute';
}

function formatVariant(v?: string): string {
  if (!v) return '';
  return v.replace('no_be', 'no BE').replace('tp1_be', 'TP1 BE').replace('be_50', 'BE 50%');
}

export default function StudyCard({ s }: { s: StudyStats }) {
  const isMarginal = s.pf < 1.5 || s.n === 0;
  const edgeSign = s.edgePts >= 0 ? '+' : '';
  const edgeCls = s.edgePts >= 0 ? 'bd-sc-val--pos' : 'bd-sc-val--neg';
  const variantLabel = s.bestVariant ? formatVariant(s.bestVariant) : '';
  const smtLabel = s.smt !== undefined ? (s.smt ? 'SMT on' : 'no SMT') : '';
  const footerText = [variantLabel, smtLabel].filter(Boolean).join(' · ');

  return (
    <Link
      href={`/backtested-data/${s.slug}/`}
      className={`bd-sc${isMarginal ? ' bd-sc--muted' : ''}`}
      aria-label={`${s.title} — PF ${s.pf}, N ${s.n}`}
    >
      <div className="bd-sc-row1">
        <span className="bd-sc-tag">
          {s.family} · {s.asset}
        </span>
        <span className="bd-sc-period">10y</span>
      </div>

      <h3 className="bd-sc-title">{s.title}</h3>

      <div className="bd-sc-stats">
        <div className="bd-sc-stat">
          <span className="bd-sc-lbl">PF</span>
          <span className={`bd-sc-val ${pfClass(s.pf)}`}>
            {s.pf > 0 ? s.pf.toFixed(2) : '—'}
          </span>
        </div>
        <div className="bd-sc-stat">
          <span className="bd-sc-lbl">N</span>
          <span className="bd-sc-val">{s.n > 0 ? s.n : '—'}</span>
        </div>
        <div className="bd-sc-stat">
          <span className="bd-sc-lbl">Edge</span>
          <span className={`bd-sc-val ${s.n > 0 ? edgeCls : 'bd-sc-val--mute'}`}>
            {s.n > 0 ? `${edgeSign}${s.edgePts}` : '—'}
          </span>
        </div>
      </div>

      <WeekdayBars wr={s.wrByWeekday} n={s.nByWeekday} asset={s.asset} />

      <div className="bd-sc-foot">
        {isMarginal ? (
          <span className="bd-sc-foot-note">marginal — published for honesty</span>
        ) : (
          <span className="bd-sc-foot-note">{footerText}</span>
        )}
        <span className="bd-sc-arrow">View →</span>
      </div>
    </Link>
  );
}
