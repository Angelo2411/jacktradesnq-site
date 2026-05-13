import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllEntries, getEntry } from '@/lib/backtested-data';
import { IconArrowUpRight } from '../_components/icons';
import StraddleExplorer, { type ExplorerConfig } from '../_components/StraddleExplorer';
import StraddleSwitcher from '../_components/StraddleSwitcher';
import KillzoneSwitcher from '../_components/KillzoneSwitcher';
import NwogSwitcher from '../_components/NwogSwitcher';
import News830Explorer from '../_components/News830Explorer';
import MobileTabs, { type MobileTab } from '../_components/MobileTabs';
import BilingualProse from '../_components/BilingualProse';
import BilingualPdfLink from '../_components/BilingualPdfLink';

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

const GC_EXPLORER_CONFIGS: Record<string, ExplorerConfig> = {
  cpi: {
    eventType: 'CPI',
    title: 'CPI straddle (Gold) — interactive explorer',
    subtitle:
      'Pick filters → live stats refresh → download a tailored PDF report.',
    dataUrl: '/data/cpi-straddle-gc.json',
    offsetKey: 'stop_pts',
    offsetLabel: 'Stop offset ($/oz)',
  },
  nfp: {
    eventType: 'NFP',
    title: 'NFP straddle (Gold) — interactive explorer',
    subtitle:
      'Pick filters → live stats refresh → download a tailored PDF report.',
    dataUrl: '/data/nfp-straddle-gc.json',
    offsetKey: 'entry_offset',
    offsetLabel: 'Entry offset ($/oz)',
  },
};

const EXPLORER_RE = /<div data-explorer="(cpi|nfp|nfp-ifvg-smt|cpi-ifvg-smt|ppi-ifvg-smt|retailsales-ifvg-smt|pce-ifvg-smt|gdp-ifvg-smt|joblessclaims-ifvg-smt|empirestate-ifvg-smt|employmentcostindex-ifvg-smt)">\s*<\/div>/i;

const SWITCHER_SLUGS = new Set(['cpi-day-stats', 'nfp']);
const KILLZONE_SLUG = 'killzone-past-vs-now';
const NWOG_SLUG = 'asia-open';

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
    'ppi-ifvg-smt': { dataUrl: '/data/ppi-ifvg-smt.json', pdfTitle: 'PPI IFVG + ES SMT' },
    'retailsales-ifvg-smt': { dataUrl: '/data/retailsales-ifvg-smt.json', pdfTitle: 'Retail Sales IFVG + ES SMT' },
    'pce-ifvg-smt': { dataUrl: '/data/pce-ifvg-smt.json', pdfTitle: 'PCE IFVG + ES SMT' },
    'gdp-ifvg-smt': { dataUrl: '/data/gdp-ifvg-smt.json', pdfTitle: 'GDP IFVG + ES SMT' },
    'joblessclaims-ifvg-smt': { dataUrl: '/data/joblessclaims-ifvg-smt.json', pdfTitle: 'Jobless Claims IFVG + ES SMT' },
    'empirestate-ifvg-smt': { dataUrl: '/data/empirestate-ifvg-smt.json', pdfTitle: 'Empire State IFVG + ES SMT' },
    'employmentcostindex-ifvg-smt': { dataUrl: '/data/employmentcostindex-ifvg-smt.json', pdfTitle: 'ECI IFVG + ES SMT' },
  };

  // Determine rendering mode
  const isStraddleSwitcher = SWITCHER_SLUGS.has(slug);
  const isKillzone = slug === KILLZONE_SLUG;
  const isNwog = slug === NWOG_SLUG;

  const match = entry.explanationHtmlNq.match(EXPLORER_RE);
  const explorerKey = match ? match[1].toLowerCase() : null;
  const explorerConfig =
    explorerKey && EXPLORER_CONFIGS[explorerKey] ? EXPLORER_CONFIGS[explorerKey] : null;
  const news830Config = explorerKey && NEWS830_CONFIGS[explorerKey] ? NEWS830_CONFIGS[explorerKey] : null;
  const isNews830 = news830Config !== null;

  // For straddle switcher slugs, split HTML around the explorer div
  const hasSplit = isStraddleSwitcher && !!explorerKey;
  const splitter = (html: string) =>
    (hasSplit || explorerConfig || isNews830)
      ? html.split(EXPLORER_RE).filter((_, i) => i !== 1)
      : [html, ''];
  const [htmlBeforeNq, htmlAfterNq] = splitter(entry.explanationHtmlNq);
  const [htmlBeforeGc, htmlAfterGc] = splitter(entry.explanationHtmlGc);

  const mobileHasExplorer = !!(entry.mobileHtml && EXPLORER_RE.test(entry.mobileHtml));
  const [mobileBefore, mobileAfter] = mobileHasExplorer
    ? entry.mobileHtml!.split(EXPLORER_RE).filter((_, i) => i !== 1)
    : [entry.mobileHtml ?? '', ''];

  const mobileH2Count = entry.mobileHtml ? (entry.mobileHtml.match(/<h2[\s>]/g) ?? []).length : 0;
  const useMobileTabs = mobileH2Count >= 2;
  const mobileTabs: MobileTab[] = [];
  if (useMobileTabs && entry.mobileHtml) {
    const parts = entry.mobileHtml.split(/(?=<h2[\s>])/);
    for (const part of parts) {
      const labelMatch = part.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
      if (!labelMatch) continue;
      const label = labelMatch[1].replace(/<[^>]+>/g, '').replace(/^Article\s+\d+\s*[—-]\s*/i, '').trim();
      const body = part.replace(/<h2[^>]*>[\s\S]*?<\/h2>/, '').trim();
      const expMatch = body.match(EXPLORER_RE);
      if (expMatch) {
        const [hb, ha] = body.split(EXPLORER_RE).filter((_, i) => i !== 1);
        const key = expMatch[1].toLowerCase();
        let explorerNode = null;
        if (SWITCHER_SLUGS.has(slug) && EXPLORER_CONFIGS[key] && GC_EXPLORER_CONFIGS[key]) {
          explorerNode = (
            <StraddleSwitcher
              nqConfig={EXPLORER_CONFIGS[key]}
              gcConfig={GC_EXPLORER_CONFIGS[key]}
            />
          );
        } else if (EXPLORER_CONFIGS[key]) {
          explorerNode = <StraddleExplorer config={EXPLORER_CONFIGS[key]} embedded />;
        } else if (NEWS830_CONFIGS[key]) {
          explorerNode = <News830Explorer dataUrl={NEWS830_CONFIGS[key].dataUrl} pdfTitle={NEWS830_CONFIGS[key].pdfTitle} />;
        }
        mobileTabs.push({ label, htmlBefore: hb, explorer: explorerNode, htmlAfter: ha });
      } else {
        mobileTabs.push({ label, htmlBefore: body });
      }
    }
  }

  // Build desktop explorer node
  let desktopExplorerNode: React.ReactNode = null;
  if (isStraddleSwitcher && explorerKey && EXPLORER_CONFIGS[explorerKey] && GC_EXPLORER_CONFIGS[explorerKey]) {
    desktopExplorerNode = (
      <StraddleSwitcher
        nqConfig={EXPLORER_CONFIGS[explorerKey]}
        gcConfig={GC_EXPLORER_CONFIGS[explorerKey]}
      />
    );
  } else if (explorerConfig) {
    desktopExplorerNode = <StraddleExplorer config={explorerConfig} embedded />;
  } else if (isNews830) {
    desktopExplorerNode = (
      <News830Explorer dataUrl={news830Config!.dataUrl} pdfTitle={news830Config!.pdfTitle} />
    );
  }

  const hasDesktopSplit = desktopExplorerNode !== null;

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

      {entry.excerpt ? <p className="bd-article-lede">{entry.excerpt}</p> : null}

      {/* Killzone switcher — topbar above article prose */}
      {isKillzone ? <KillzoneSwitcher /> : null}
      {/* NWOG switcher — topbar above article prose */}
      {isNwog ? <NwogSwitcher /> : null}

      {entry.mobileHtml ? (
        useMobileTabs ? (
          <div className="bd-show-mobile">
            <MobileTabs tabs={mobileTabs} />
          </div>
        ) : mobileHasExplorer && hasDesktopSplit ? (
          <div className="bd-show-mobile">
            <div className="bd-prose" dangerouslySetInnerHTML={{ __html: mobileBefore }} />
            {desktopExplorerNode}
            <div className="bd-prose" dangerouslySetInnerHTML={{ __html: mobileAfter }} />
          </div>
        ) : (
          <div
            className="bd-prose bd-show-mobile"
            dangerouslySetInnerHTML={{ __html: entry.mobileHtml }}
          />
        )
      ) : null}

      <div className={entry.mobileHtml ? 'bd-show-desktop' : undefined}>
        {hasDesktopSplit ? (
          <>
            <BilingualProse htmlNq={htmlBeforeNq} htmlGc={htmlBeforeGc} />
            {desktopExplorerNode}
            <BilingualProse htmlNq={htmlAfterNq} htmlGc={htmlAfterGc} />
          </>
        ) : (
          <BilingualProse htmlNq={entry.explanationHtmlNq} htmlGc={entry.explanationHtmlGc} />
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
        <BilingualPdfLink
          pdfFileNq={entry.pdfFileNq}
          pdfFileGc={entry.pdfFileGc}
          pdfLabel={entry.pdfLabel ?? `Download — ${entry.title} PDF`}
        />
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
