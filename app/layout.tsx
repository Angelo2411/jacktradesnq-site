import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JackTradesNQ',
  description: 'JackTradesNQ — NQ Futures trader. Free TradingView indicators and trading content.',
  metadataBase: new URL('https://jacktradesnq.com'),
  openGraph: {
    type: 'website',
    url: 'https://jacktradesnq.com/',
    title: 'JackTradesNQ — NQ Futures Trader',
    description: 'Free TradingView indicators and trading content on NQ Futures.',
    siteName: 'JackTradesNQ',
  },
  twitter: {
    card: 'summary',
    site: '@jacktradesnq',
    title: 'JackTradesNQ — NQ Futures Trader',
    description: 'Free TradingView indicators and trading content on NQ Futures.',
  },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
