import Link from 'next/link';
import V3SideNav from './_components/V3SideNav';
import { AssetProvider } from './_components/AssetContext';
import AssetPills from './_components/AssetPills';
import { getAllEntries } from '@/lib/studies';

export default function BacktestedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const availableSlugs = getAllEntries().map((e) => e.slug);
  return (
    <AssetProvider>
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
        <AssetPills availableSlugs={availableSlugs} />
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
        <V3SideNav />
        <main className="v3-main">{children}</main>
      </div>
    </div>
    </AssetProvider>
  );
}
