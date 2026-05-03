import { getAllEntries } from '@/lib/backtested-data';
import SubNav from './_components/SubNav';
import BacktestedShell from './_components/BacktestedShell';

export default function BacktestedLayout({ children }: { children: React.ReactNode }) {
  const entries = getAllEntries();

  return (
    <div className="bd-root">
      <SubNav />
      <BacktestedShell entries={entries}>
        {children}
      </BacktestedShell>
    </div>
  );
}
