'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { DayPlaybook, KillzoneByDow } from '@/lib/today-events';

const DOW_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DOW_LONG  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  });
}

function EdgeBadge({ n, pf, wr, edgePts }: { n: number; pf: number; wr: number; edgePts: number }) {
  const isStrong = pf >= 1.5;
  return (
    <span className={`ts-edge-badge${isStrong ? ' ts-edge-badge--sage' : ' ts-edge-badge--mute'}`}>
      PF {pf.toFixed(2)} · N={n} · WR {wr}% · {edgePts > 0 ? '+' : ''}{edgePts} pts
    </span>
  );
}

function KillzoneRow({ kz, isTop }: { kz: KillzoneByDow; isTop: boolean }) {
  return (
    <div className={`ts-kz-row${isTop ? ' ts-kz-row--top' : ''}`}>
      <span className="ts-kz-label">{kz.session}</span>
      <span className="ts-kz-range">
        {kz.avgRange.toFixed(1)} <span className="ts-kz-unit">pts avg</span>
      </span>
    </div>
  );
}

export function TodaySidebar({ weekly }: { weekly: DayPlaybook[] }) {
  const [dow, setDow] = useState<number | null>(null);
  const [nowDate, setNowDate] = useState<string>('');

  useEffect(() => {
    const ny = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
    );
    setDow(ny.getDay());
    setNowDate(formatDate(new Date()));
  }, []);

  if (dow === null) {
    return <aside className="ts-sidebar" aria-label="Today's playbook" />;
  }

  // weekend → show Monday
  const idx = dow >= 1 && dow <= 5 ? dow - 1 : 0;
  const today = weekly[idx];
  const otherDays = weekly.filter((_, i) => i !== idx);

  const topKz = today.killzone.length > 0
    ? today.killzone.reduce((a, b) => (a.avgRange > b.avgRange ? a : b))
    : null;

  return (
    <aside className="ts-sidebar" aria-label="Today's playbook">
      {/* ── Header ── */}
      <div className="ts-header">
        <h2 className="ts-day">{DOW_LONG[idx]}</h2>
        <p className="ts-date">{nowDate}</p>
      </div>

      {/* ── News events ── */}
      <section className="ts-section">
        <h3 className="ts-section-hd">Today&apos;s releases</h3>
        {today.events.length === 0 ? (
          <p className="ts-quiet">Quiet day. No scheduled releases.</p>
        ) : (
          <ul className="ts-event-list">
            {today.events.map((ev) => {
              const inner = (
                <>
                  <div className="ts-event-top">
                    <span className="ts-event-name">{ev.event}</span>
                    <span className="ts-event-time">{ev.time}</span>
                  </div>
                  {ev.edgeOnDow ? (
                    <EdgeBadge {...ev.edgeOnDow} />
                  ) : ev.linkedSlug ? (
                    <span className="ts-edge-badge ts-edge-badge--mute">No isolated edge on this weekday</span>
                  ) : null}
                </>
              );

              return (
                <li key={ev.event} className="ts-event-card">
                  {ev.linkedSlug ? (
                    <Link
                      href={`/studies/${ev.linkedSlug}/`}
                      className="ts-event-link"
                      aria-label={`View ${ev.event} backtest`}
                    >
                      {inner}
                      <span className="ts-event-arrow" aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <div className="ts-event-link ts-event-link--static">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Killzone ranges ── */}
      <section className="ts-section">
        <h3 className="ts-section-hd">Session ranges · GC</h3>
        {today.killzone.length === 0 ? (
          <p className="ts-quiet">No session data for this day.</p>
        ) : (
          <div className="ts-kz-list">
            {today.killzone.map((kz) => (
              <KillzoneRow
                key={kz.session}
                kz={kz}
                isTop={kz === topKz}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Other days chips ── */}
      <section className="ts-section ts-section--chips">
        <h3 className="ts-section-hd">Other days</h3>
        <div className="ts-chips">
          {otherDays.map((d) => {
            const dayIdx = d.dow as number;
            const topEvent = d.events[0];
            return (
              <button
                key={d.dow}
                className="ts-chip"
                title={topEvent ? `${topEvent.event} @ ${topEvent.time}` : d.dowLabel}
                aria-label={`${d.dowLabel}: ${topEvent?.event ?? 'no releases'}`}
                onClick={() => setDow(dayIdx + 1)}
              >
                <span className="ts-chip-day">{DOW_SHORT[dayIdx]}</span>
                <span className="ts-chip-event">{topEvent?.event ?? '—'}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Footer ── */}
      <p className="ts-footer">Click any event to drill to its full backtest.</p>
    </aside>
  );
}
