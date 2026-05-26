import Link from 'next/link';
import type { StudyStats } from '@/lib/study-stats';

function pfClass(pf: number): string {
  if (pf >= 2.5) return 'bd-row-stat--pos';
  if (pf >= 1.5) return 'bd-row-stat--gold';
  return 'bd-row-stat--mute';
}

// Editorial index row — one study per line (kicker · title · key stat).
// Replaces the card grid: scannable, scales to 100+ entries, anti-slop.
export default function StudyRow({ s }: { s: StudyStats }) {
  const href = s.href ?? `/studies/${s.slug}/`;
  const isStrategy = s.kind === 'strategy';
  const d = s.descriptive;
  const edgeSign = s.edgePts > 0 ? '+' : '';

  return (
    <Link href={href} className="bd-row" aria-label={s.title}>
      <span className="bd-row-kicker">{s.family} · {s.asset}</span>
      <span className="bd-row-title">{s.title}</span>

      {isStrategy ? (
        <span className="bd-row-stats">
          {s.n > 0 ? (
            <>
              <span className={`bd-row-stat ${pfClass(s.pf)}`}>PF {s.pf.toFixed(2)}</span>
              <span className="bd-row-edge">{edgeSign}{s.edgePts}</span>
            </>
          ) : (
            <span className="bd-row-stat bd-row-stat--mute">— no data</span>
          )}
        </span>
      ) : (
        <span className="bd-row-stats">
          <span className="bd-row-stat bd-row-stat--gold">{d?.primaryValue ?? '—'}</span>
          {d?.primaryLabel && <span className="bd-row-edge">{d.primaryLabel}</span>}
        </span>
      )}

      <span className="bd-row-arrow" aria-hidden="true">→</span>
    </Link>
  );
}
