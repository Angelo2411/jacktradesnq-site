'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface FamilyCounts {
  total: number;
  news: number;
  ib: number;
  ema: number;
  time: number;
  misc: number;
}

const SUB_ITEMS = [
  { key: 'all', label: 'All', cat: null },
  { key: 'news', label: 'News', cat: 'news' },
  { key: 'ib', label: 'IB', cat: 'ib' },
  { key: 'ema', label: 'EMA', cat: 'ema' },
  { key: 'time', label: 'Time', cat: 'time' },
  { key: 'misc', label: 'Misc', cat: 'misc' },
] as const;

export default function V3SideNav({ counts }: { counts: FamilyCounts }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get('cat');

  const isCalendar = pathname.includes('/calendar');
  const isMethodology = pathname.includes('/methodology');
  const isData = !isCalendar && !isMethodology;

  const getCount = (key: string) => {
    const map: Record<string, number> = {
      all: counts.total,
      news: counts.news,
      ib: counts.ib,
      ema: counts.ema,
      time: counts.time,
      misc: counts.misc,
    };
    return map[key] ?? 0;
  };

  return (
    <aside className="v3-sidenav">
      {/* Data (parent) */}
      <Link
        href="/studies/"
        className={'v3-nav-btn' + (isData && !activeCat ? ' active' : '')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0, opacity: 0.8 }}>
          <rect x="1" y="2" width="14" height="3" rx="1" />
          <rect x="1" y="7" width="14" height="3" rx="1" />
          <rect x="1" y="12" width="14" height="2" rx="1" />
        </svg>
        Data
      </Link>

      {/* Sub-items */}
      <ul className="v3-nav-sublist">
        {SUB_ITEMS.filter((sub) => sub.key === 'all' || getCount(sub.key) > 0).map((sub) => {
          const href = sub.cat ? `/studies/?cat=${sub.cat}` : '/studies/';
          const active = sub.cat ? activeCat === sub.cat : isData && !activeCat;
          return (
            <li key={sub.key}>
              <Link
                href={href}
                className={'v3-nav-sub' + (active ? ' active' : '')}
              >
                <span className="v3-nav-sub-dot" aria-hidden="true" />
                {sub.label}
                <span className="v3-nav-sub-count">({getCount(sub.key)})</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Calendar */}
      <Link
        href="/studies/calendar/"
        className={'v3-nav-btn' + (isCalendar ? ' active' : '')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, opacity: 0.8 }}>
          <rect x="2" y="3" width="12" height="11" rx="1" />
          <line x1="2" y1="6" x2="14" y2="6" />
          <line x1="5" y1="1" x2="5" y2="4" />
          <line x1="11" y1="1" x2="11" y2="4" />
        </svg>
        Calendar
      </Link>

      {/* Methodology */}
      <Link
        href="/studies/methodology/"
        className={'v3-nav-btn' + (isMethodology ? ' active' : '')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, opacity: 0.8 }}>
          <circle cx="8" cy="8" r="6.25" />
          <line x1="8" y1="4.5" x2="8" y2="8.5" />
          <circle cx="8" cy="11.25" r="0.6" fill="currentColor" />
        </svg>
        Methodology
      </Link>

      <div className="v3-nav-spacer" />
      <p className="v3-nav-disclaimer">
        Historical backtests on 1-min data. Past performance ≠ future results.
      </p>
    </aside>
  );
}
