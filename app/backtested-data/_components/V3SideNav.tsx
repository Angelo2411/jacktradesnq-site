'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  {
    key: 'data',
    label: 'Data',
    href: '/backtested-data/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0, opacity: 0.8 }}>
        <rect x="1" y="2" width="14" height="3" rx="1" />
        <rect x="1" y="7" width="14" height="3" rx="1" />
        <rect x="1" y="12" width="14" height="2" rx="1" />
      </svg>
    ),
  },
  {
    key: 'calendar',
    label: 'Calendar',
    href: '/backtested-data/calendar/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, opacity: 0.8 }}>
        <rect x="2" y="3" width="12" height="11" rx="1" />
        <line x1="2" y1="6" x2="14" y2="6" />
        <line x1="5" y1="1" x2="5" y2="4" />
        <line x1="11" y1="1" x2="11" y2="4" />
      </svg>
    ),
  },
  {
    key: 'methodology',
    label: 'Methodology',
    href: '/backtested-data/methodology/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, opacity: 0.8 }}>
        <circle cx="8" cy="8" r="6.25" />
        <line x1="8" y1="4.5" x2="8" y2="8.5" />
        <circle cx="8" cy="11.25" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
];

export default function V3SideNav() {
  const pathname = usePathname();
  const isCalendar = pathname.includes('/calendar');
  const isMethodology = pathname.includes('/methodology');

  return (
    <aside className="v3-sidenav">
      {NAV.map((item) => {
        const active =
          (item.key === 'calendar' && isCalendar) ||
          (item.key === 'methodology' && isMethodology) ||
          (item.key === 'data' && !isCalendar && !isMethodology);
        return (
          <Link
            key={item.key}
            href={item.href}
            className={'v3-nav-btn' + (active ? ' active' : '')}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
      <div className="v3-nav-spacer" />
      <p className="v3-nav-disclaimer">
        Historical backtests on 1-min data. Past performance ≠ future results.
      </p>
    </aside>
  );
}
