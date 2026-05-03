'use client';

import { useState } from 'react';
import type { Entry } from '@/lib/backtested-data';
import Sidebar from './Sidebar';

export default function BacktestedShell({
  entries,
  children,
}: {
  entries: Entry[];
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="bd-shell">
      <Sidebar
        entries={entries}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <main className="bd-main">{children}</main>
    </div>
  );
}
