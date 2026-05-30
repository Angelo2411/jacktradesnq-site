'use client';

import { useState } from 'react';
import type { Entry } from '@/lib/studies';
import Sidebar from './Sidebar';
import SubNav from './SubNav';

export default function StudiesShell({
  entries,
  children,
}: {
  entries: Entry[];
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <SubNav onMenu={() => setDrawerOpen(true)} />
      <div className="bd-shell">
        <Sidebar
          entries={entries}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
        <main className="bd-main">{children}</main>
      </div>
    </>
  );
}
