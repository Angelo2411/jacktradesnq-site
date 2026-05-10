'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Entry } from '@/lib/backtested-data';
import { IconSearch, IconChevDown, IconArrowUpRight } from './icons';

const catLabel = (c: string) => (c === 'tradingview' ? 'TRADINGVIEW' : 'DATA');

function SideGroup({
  label,
  items,
  currentSlug,
}: {
  label: string;
  items: Entry[];
  currentSlug: string | null;
}) {
  const hasActive = items.some((it) => it.slug === currentSlug);
  const [open, setOpen] = useState(hasActive);
  const listRef = useRef<HTMLUListElement>(null);
  const [maxH, setMaxH] = useState<string>(hasActive ? 'none' : '0px');

  useEffect(() => {
    if (!listRef.current) return;
    const h = listRef.current.scrollHeight;
    setMaxH(open ? h + 'px' : '0px');
  }, [open, items]);

  return (
    <div className="bd-side-group">
      <button
        className={'bd-side-toggle bd-side-group-toggle' + (open ? '' : ' collapsed')}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="bd-section-hd bd-group-label">{label}</span>
        <IconChevDown className="chev" />
      </button>
      <div className="bd-side-list" style={{ maxHeight: maxH }}>
        <ul ref={listRef}>
          {items.map((it) => (
            <li key={it.slug}>
              <Link
                href={`/backtested-data/${it.slug}/`}
                className={'bd-side-item bd-side-item--child' + (currentSlug === it.slug ? ' active' : '')}
              >
                <span className="bd-side-item-title">{it.title}</span>
                <span className="item-meta">{it.date}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SideSection({
  label,
  items,
  currentSlug,
}: {
  label: string;
  items: Entry[];
  currentSlug: string | null;
}) {
  const [open, setOpen] = useState(true);
  const listRef = useRef<HTMLUListElement>(null);
  const [maxH, setMaxH] = useState<string>('none');

  // Separate ungrouped vs grouped
  const ungrouped = items.filter((e) => !e.group);
  const groupMap = new Map<string, Entry[]>();
  for (const e of items) {
    if (e.group) {
      if (!groupMap.has(e.group)) groupMap.set(e.group, []);
      groupMap.get(e.group)!.push(e);
    }
  }
  const groups = Array.from(groupMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  useEffect(() => {
    if (!listRef.current) return;
    const h = listRef.current.scrollHeight;
    setMaxH(open ? h + 'px' : '0px');
  }, [open, items]);

  if (!items.length) return null;

  return (
    <div className="bd-side-section">
      <button
        className={'bd-side-toggle' + (open ? '' : ' collapsed')}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="bd-section-hd">{label}</span>
        <IconChevDown className="chev" />
      </button>
      <div className="bd-side-list" style={{ maxHeight: maxH }}>
        <ul ref={listRef}>
          {ungrouped.map((it) => (
            <li key={it.slug}>
              <Link
                href={`/backtested-data/${it.slug}/`}
                className={'bd-side-item' + (currentSlug === it.slug ? ' active' : '')}
              >
                <span className="bd-side-item-title">{it.title}</span>
                <span className="item-meta">{it.date}</span>
              </Link>
            </li>
          ))}
          {groups.map(([groupName, groupItems]) => (
            <li key={groupName}>
              <SideGroup label={groupName} items={groupItems} currentSlug={currentSlug} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Sidebar({
  entries,
  open,
  onClose,
}: {
  entries: Entry[];
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [q, setQ] = useState('');
  const norm = q.trim().toLowerCase();

  const currentSlug = pathname.startsWith('/backtested-data/')
    ? pathname.replace('/backtested-data/', '').replace(/\/$/, '')
    : null;

  const filtered = norm
    ? entries.filter((e) => e.title.toLowerCase().includes(norm))
    : entries;

  const tv = filtered.filter((e) => e.category === 'tradingview');
  const data = filtered.filter((e) => e.category === 'data');
  const empty = norm !== '' && filtered.length === 0;

  return (
    <>
      <div
        className={'bd-scrim' + (open ? ' open' : '')}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={'bd-side' + (open ? ' open' : '')} aria-label="Section navigation">
        <div className="bd-side-search">
          <div className="bd-search-wrap">
            <IconSearch />
            <input
              type="text"
              className="bd-search-input"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search entries"
            />
          </div>
        </div>

        <div className="bd-side-tv">
          <a
            className="bd-tv-link"
            href="https://www.tradingview.com/u/jacktradesnq/"
            target="_blank"
            rel="noreferrer noopener"
          >
            Open on TradingView
            <IconArrowUpRight />
          </a>
        </div>

        {empty ? (
          <div className="bd-empty-search">No entries match &ldquo;{q}&rdquo;.</div>
        ) : (
          <>
            <SideSection label="Tradingview" items={tv} currentSlug={currentSlug} />
            <SideSection label="Data" items={data} currentSlug={currentSlug} />
          </>
        )}
      </aside>
    </>
  );
}
