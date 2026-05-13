import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JackTradesNQ — Print',
  robots: { index: false, follow: false },
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
