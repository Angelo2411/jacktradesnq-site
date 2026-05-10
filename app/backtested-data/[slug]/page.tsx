import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllEntries, getEntry } from '@/lib/backtested-data';
import { IconArrowUpRight } from '../_components/icons';
import StraddleExplorer, { type ExplorerConfig } from '../_components/StraddleExplorer';
import News830Explorer from '../_components/News830Explorer';

const EXPLORER_CONFIGS: Record<string, ExplorerConfig> = {
  cpi: {
    eventType: 'CPI',
    title: 'CPI straddle — interactive explorer',
    subtitle:
      'Pick filters → live stats refresh → download a tailored PDF report.',
    dataUrl: '/data/cpi-straddle.json',
    offsetKey: 'stop_pts',
    offsetLabel: 'Stop offset',
  },
  nfp: {
    eventType: 'NFP',
    title: 'NFP straddle — interactive explorer',
    subtitle:
      'Pick filters → live stats refresh → download a tailored PDF report.',
    dataUrl: '/data/nfp-straddle.json',
    offsetKey: 'entry_offset',
    offsetLabel: 'Entry offset',
  },
};

const EXPLORER_RE = /<div data-explorer="(cpi|nfp|nfp-ifvg-smt|cpi-ifvg-smt)">\s*<\/div>/i;

const catLabel = (c: string) => (c === 'tradingview' ? 'TRADINGVIEW' : 'DATA');

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllEntries().map((entry) => ({ slug: entry.slug }));
}

export default async function BacktestedDetail({ params }: PageProps) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  const entries = getAllEntries();
  const idx = entries.findIndex((e) => e.slug === slug);
  const prev = idx > 0 ? entries[idx - 1] : null;
  const next = idx < entries.length - 1 ? entries[idx + 1] : null;

  const wordCount = entry.explanationHtml.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.ceil(wordCount / 200));

  const NEWS830_CONFIGS: Record<string, { dataUrl: string; pdfTitle: string }> = {
    'nfp-ifvg-smt': { dataUrl: '/data/nfp-ifvg-smt.json', pdfTitle: 'NFP IFVG + ES SMT' },
    'cpi-ifvg-smt': { dataUrl: '/data/cpi-ifvg-smt.json', pdfTitle: 'CPI IFVG + ES SMT' },
  };

  const match = entry.explanationHtml.match(EXPLORER_RE);
  const explorerKey = match ? match[1].toLowerCase() : null;
  const explorerConfig =
    explorerKey && EXPLORER_CONFIGS[explorerKey] ? EXPLORER_CONFIGS[explorerKey] : null;
  const news830Config = explorerKey && NEWS830_CONFIGS[explorerKey] ? NEWS830_CONFIGS[explorerKey] : null;
  const isNews830 = news830Config !== null;
  const [htmlBefore, htmlAfter] = (explorerConfig || isNews830)
    ? entry.explanationHtml.split(EXPLORER_RE).filter((_, i) => i !== 1)
    : [entry.explanationHtml, ''];

  return (
    <article className="bd-article">
      <Link
        href="/backtested-data/"
        className="bd-meta bd-link-gold"
        style={{ display: 'inline-block', marginBottom: 32 }}
      >
        ← Backtested data
      </Link>

      <div className="bd-article-meta">
        <span className="bd-tag">{catLabel(entry.category)}</span>
        <span className="bd-meta">{entry.date}</span>
        <span className="bd-meta">· {readMin} min read</span>
      </div>

      <h1 className="bd-h1 bd-article-title">
        {entry.title}<span className="bd-dot">.</span>
      </h1>

      <p className="bd-article-lede">{entry.excerpt}</p>

      {entry.mobileHtml ? (
        <div
          className="bd-prose bd-show-mobile"
          dangerouslySetInnerHTML={{ __html: entry.mobileHtml }}
        />
      ) : null}

      <div className={entry.mobileHtml ? 'bd-show-desktop' : undefined}>
        {explorerConfig ? (
          <>
            <div
              className="bd-prose"
              dangerouslySetInnerHTML={{ __html: htmlBefore }}
            />
            <StraddleExplorer config={explorerConfig} embedded />
            <div
              className="bd-prose"
              dangerouslySetInnerHTML={{ __html: htmlAfter }}
            />
          </>
        ) : isNews830 ? (
          <>
            <div
              className="bd-prose"
              dangerouslySetInnerHTML={{ __html: htmlBefore }}
            />
            <News830Explorer dataUrl={news830Config!.dataUrl} pdfTitle={news830Config!.pdfTitle} />
            <div
              className="bd-prose"
              dangerouslySetInnerHTML={{ __html: htmlAfter }}
            />
          </>
        ) : (
          <div
            className="bd-prose"
            dangerouslySetInnerHTML={{ __html: entry.explanationHtml }}
          />
        )}
      </div>

      <div className="bd-ctas">
        {entry.category === 'tradingview' && entry.tradingviewUrl ? (
          <a
            className="bd-btn bd-btn-primary"
            href={entry.tradingviewUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            Open on TradingView
            <IconArrowUpRight />
          </a>
        ) : null}
      </div>

      <div className="mt-16 max-w-[720px] border-t pt-6" style={{ borderColor: 'oklch(0.85 0.02 85)' }}>
        <h3
          className="mb-2 font-semibold uppercase tracking-[0.12em]"
          style={{
            fontFamily: 'var(--f-sans)',
            fontWeight: 500,
            fontSize: '0.75rem',
            color: 'var(--c-muted)',
          }}
        >
          Methodology &amp; limitations
        </h3>
        <p
          className="max-w-[65ch]"
          style={{
            fontFamily: 'var(--f-sans)',
            fontWeight: 400,
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: 'oklch(0.55 0.01 60)',
          }}
        >
          Results are derived from historical data via AI-assisted backtesting
          over a 10-year window. Past performance does not predict future
          results — market microstructure evolves, and edges captured in
          historical samples may decay or disappear in live conditions. Numbers
          are shared for educational and research purposes only, not as
          financial advice or trading signals.
        </p>
      </div>

      <div className="bd-pager">
        <span>
          {prev ? (
            <Link href={`/backtested-data/${prev.slug}/`} className="bd-link-gold">
              ← {prev.title.length > 38 ? prev.title.slice(0, 36) + '…' : prev.title}
            </Link>
          ) : (
            <span className="bd-meta" style={{ opacity: 0.4 }}>—</span>
          )}
        </span>
        <span>
          {next ? (
            <Link href={`/backtested-data/${next.slug}/`} className="bd-link-gold">
              {next.title.length > 38 ? next.title.slice(0, 36) + '…' : next.title} →
            </Link>
          ) : (
            <span className="bd-meta" style={{ opacity: 0.4 }}>—</span>
          )}
        </span>
      </div>
    </article>
  );
}
