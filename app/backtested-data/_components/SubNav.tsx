'use client';

import Link from 'next/link';
import { IconMenu } from './icons';

export default function SubNav({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="bd-nav">
      <div className="bd-nav-left">
        <button
          className="bd-hamburger"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <IconMenu style={{ width: 16, height: 16 }} />
        </button>
        <Link className="bd-logo" href="/" aria-label="jacktradesnq home" title="jacktradesnq">
          J
        </Link>
      </div>
      <div className="bd-nav-center">
        <span className="bd-nav-title">
          <em>section</em>Backtested data
        </span>
      </div>
      <div className="bd-nav-right">
        <Link className="bd-nav-link bd-link-gold" href="/">
          <span style={{ marginRight: 6, color: 'var(--c-muted)' }}>←</span>
          Home
        </Link>
      </div>
    </header>
  );
}
