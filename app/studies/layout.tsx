import Link from 'next/link';
import { Suspense } from 'react';
import V3SideNav from './_components/V3SideNav';
import { AssetProvider } from './_components/AssetContext';
import AssetPills from './_components/AssetPills';
import { getStudyCountsByFamily, getAllStudyStats } from '@/lib/study-stats';

export default function BacktestedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cf = getStudyCountsByFamily();
  const allSlugs = getAllStudyStats().map((s) => s.slug);

  return (
    <AssetProvider assets={['nq', 'gc', 'si', 'es']}>
    <div className="bd-root">
      {/* Topbar */}
      <header className="v3-topbar">
        <Link href="/" className="v3-back-home" aria-label="Back to home">
          <span aria-hidden="true">←</span>
          <span className="v3-back-home-label">Home</span>
        </Link>
        <Link href="/studies/" className="v3-logo">
          J<span className="v3-logo-dot">.</span>
        </Link>
        <div className="v3-topbar-spacer" />
        <AssetPills availableSlugs={allSlugs} />
        <a
          href="https://jacktradesnq.com"
          className="v3-home-link"
          target="_blank"
          rel="noreferrer"
        >
          jacktradesnq.com
        </a>
      </header>

      {/* Body: sidenav (client, pathname-aware) + main */}
      <div className="v3-body">
        <Suspense fallback={null}>
          <V3SideNav counts={cf} />
        </Suspense>
        <main className="v3-main">{children}</main>
      </div>
    </div>
    </AssetProvider>
  );
}
