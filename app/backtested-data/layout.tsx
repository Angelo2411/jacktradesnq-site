import { getAllEntries } from '@/lib/backtested-data';
import BacktestedShell from './_components/BacktestedShell';
import PandaMascot from './_components/PandaMascot';

export default function BacktestedLayout({ children }: { children: React.ReactNode }) {
  const entries = getAllEntries();
  return (
    <div className="bd-root">
      <BacktestedShell entries={entries}>
        {children}
      </BacktestedShell>
      <PandaMascot />
    </div>
  );
}
