'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { NavFamily } from '@/lib/study-stats';

interface FamilyCounts {
  total: number;
  news: number;
  ib: number;
  ema: number;
  time: number;
  misc: number;
}

export default function V3SideNav({ counts, tree }: { counts: FamilyCounts; tree: NavFamily[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get('cat');
  const activeEvent = searchParams.get('event');

  const isBasics = pathname.includes('/basics');
  const isCalendar = pathname.includes('/calendar');
  const isMethodology = pathname.includes('/methodology');
  const isData = !isBasics && !isCalendar && !isMethodology;
  const [dataOpen, setDataOpen] = useState(true);

  return (
    <aside className="v3-sidenav">
      {/* Basics */}
      <Link
        href="/studies/basics/"
        className={'v3-nav-btn' + (isBasics ? ' active' : '')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, opacity: 0.8 }}>
          <path d="M2 3h4l2 6-2 4h7" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="4" r="1.2" fill="currentColor" />
        </svg>
        Basics
      </Link>

      {/* Data (parent) */}
      <button
        type="button"
        onClick={() => setDataOpen((v) => !v)}
        className={'v3-nav-btn v3-nav-btn-toggle' + (isData && !activeCat && !activeEvent ? ' active' : '')}
        aria-expanded={dataOpen}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0, opacity: 0.8 }}>
          <rect x="1" y="2" width="14" height="3" rx="1" />
          <rect x="1" y="7" width="14" height="3" rx="1" />
          <rect x="1" y="12" width="14" height="2" rx="1" />
        </svg>
        Data
        <svg className={'v3-nav-chevron' + (dataOpen ? ' open' : '')} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', flexShrink: 0 }} aria-hidden="true">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* Sub-items */}
      {dataOpen && (
      <ul className="v3-nav-sublist">
        {/* All */}
        <li>
          <Link
            href="/studies/"
            className={'v3-nav-sub' + (isData && !activeCat && !activeEvent ? ' active' : '')}
          >
            <span className="v3-nav-sub-dot" aria-hidden="true" />
            All
            <span className="v3-nav-sub-count">({counts.total})</span>
          </Link>
        </li>

        {/* Family groups with nested events */}
        {tree.map((fam) => (
          <li key={fam.family}>
            <div className="v3-nav-grouplbl">{fam.label}</div>
            <ul className="v3-nav-sublist">
              {fam.events.map((ev) => (
                <li key={ev.key}>
                  <Link
                    href={`/studies/?event=${ev.key}`}
                    className={'v3-nav-sub' + (activeEvent === ev.key ? ' active' : '')}
                  >
                    <span className="v3-nav-sub-dot" aria-hidden="true" />
                    {ev.label}
                    <span className="v3-nav-sub-count">({ev.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      )}

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
