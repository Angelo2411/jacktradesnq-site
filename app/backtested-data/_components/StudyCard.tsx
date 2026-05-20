import Link from 'next/link';
import type { StudyStats } from '@/lib/study-stats';
import { WeekdayBarsSimple } from './WeekdayBars';

function pfClass(pf: number): string {
  if (pf >= 2.5) return 'bd-sc-val--pos';
  if (pf >= 1.5) return 'bd-sc-val--gold';
  return 'bd-sc-val--mute';
}

function formatVariant(v?: string): string {
  if (!v) return '';
  return v.replace('no_be', 'no BE').replace('tp1_be', 'TP1 BE').replace('be_50', 'BE 50%');
}

// ── Descriptive card (study) ──────────────────────────────────────────────────

function DescriptiveCard({ s }: { s: StudyStats }) {
  const d = s.descriptive;

  // Stacked bar: segments sum to 100, render as flex with proportional widths
  const hasBar = d?.barSegments && d.barSegments.length > 0;
  const isKillzone = hasBar && d!.barSegments!.every((seg) => typeof seg.value === 'number' && seg.value < 200);
  // killzone bars are avgRange values (not percentages), normalise to 100
  const maxBarVal = isKillzone
    ? Math.max(...(d?.barSegments ?? []).map((s) => s.value))
    : 100;

  return (
    <Link
      href={`/backtested-data/${s.slug}/`}
      className="bd-sc bd-sc--study"
      aria-label={`${s.title} — ${d?.primaryValue ?? ''} ${d?.primaryLabel ?? ''}`}
    >
      <div className="bd-sc-row1">
        <span className="bd-sc-tag">
          {s.family} · {s.asset}
        </span>
        <span className="bd-sc-period">10y</span>
      </div>

      <h3 className="bd-sc-title">{s.title}</h3>

      {d ? (
        <>
          <div className="bd-sc-desc-primary">
            <span className="bd-sc-desc-val">{d.primaryValue}</span>
            <span className="bd-sc-desc-lbl">{d.primaryLabel}</span>
          </div>

          <div className="bd-sc-desc-secondary">
            <span className="bd-sc-desc-meta">{d.secondaryValue}</span>
            <span className="bd-sc-desc-sep">·</span>
            <span className="bd-sc-desc-meta">{d.secondaryLabel}</span>
          </div>

          {d.tertiary && (
            <p className="bd-sc-desc-tertiary">{d.tertiary}</p>
          )}

          {hasBar && (
            <div className="bd-sc-bar-track" aria-hidden="true">
              {d!.barSegments!.map((seg) => {
                const pct = isKillzone
                  ? (seg.value / maxBarVal) * 100
                  : seg.value;
                return (
                  <div
                    key={seg.label}
                    className={`bd-sc-bar-seg bd-sc-bar-seg--${seg.color}`}
                    style={{ width: `${pct}%` }}
                    title={`${seg.label}: ${seg.value}${isKillzone ? ' pts' : '%'}`}
                  />
                );
              })}
            </div>
          )}

          {hasBar && (
            <div className="bd-sc-bar-legend">
              {d!.barSegments!.map((seg) => (
                <span key={seg.label} className={`bd-sc-bar-legend-item bd-sc-bar-legend-item--${seg.color}`}>
                  {seg.label}
                  {isKillzone ? ` ${seg.value} pts` : ` ${seg.value}%`}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="bd-sc-desc-tertiary">{s.excerpt}</p>
      )}

      <div className="bd-sc-foot">
        <span className="bd-sc-foot-note">Explore →</span>
      </div>
    </Link>
  );
}

// ── Strategy card ─────────────────────────────────────────────────────────────

function StrategyCard({ s }: { s: StudyStats }) {
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

      <WeekdayBarsSimple wr={s.wrByWeekday} n={s.nByWeekday} asset={s.asset} />

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

// ── Export ────────────────────────────────────────────────────────────────────

export default function StudyCard({ s }: { s: StudyStats }) {
  if (s.kind === 'study') return <DescriptiveCard s={s} />;
  return <StrategyCard s={s} />;
}
