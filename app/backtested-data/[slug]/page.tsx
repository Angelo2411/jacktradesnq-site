import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getAllEntries, getEntry } from '@/lib/backtested-data';
import { IconArrowUpRight } from '../_components/icons';
import StraddleExplorer, { type ExplorerConfig } from '../_components/StraddleExplorer';
import StraddleSwitcher from '../_components/StraddleSwitcher';
import StraddleTrades from '../_components/StraddleTrades';
import KillzoneSwitcher from '../_components/KillzoneSwitcher';
import NwogSwitcher from '../_components/NwogSwitcher';
import News830Explorer from '../_components/News830Explorer';
import MobileTabs, { type MobileTab } from '../_components/MobileTabs';
import BilingualProse from '../_components/BilingualProse';
import BilingualPdfLink from '../_components/BilingualPdfLink';
import BilingualLede from '../_components/BilingualLede';
import BilingualTitle from '../_components/BilingualTitle';
import V3Tabs from '../_components/V3Tabs';
import { getStrategyStats, getStrategyStatsByVariant, getStrategyStatsByVariantAndSmt, getWeekdayBreakdown, getYearBreakdown, getTradeList } from '@/lib/study-stats';

const EXPLORER_CONFIGS: Record<string, ExplorerConfig> = {
  cpi: {
    eventType: 'CPI',
    title: 'CPI straddle — interactive explorer',
    subtitle: 'Pick filters → live stats refresh → download a tailored PDF report.',
    dataUrl: '/data/cpi-straddle.json',
    offsetKey: 'stop_pts',
    offsetLabel: 'Stop offset',
  },
  nfp: {
    eventType: 'NFP',
    title: 'NFP straddle — interactive explorer',
    subtitle: 'Pick filters → live stats refresh → download a tailored PDF report.',
    dataUrl: '/data/nfp-straddle.json',
    offsetKey: 'entry_offset',
    offsetLabel: 'Entry offset',
  },
};

const GC_EXPLORER_CONFIGS: Record<string, ExplorerConfig> = {
  cpi: {
    eventType: 'CPI',
    title: 'CPI straddle (Gold) — interactive explorer',
    subtitle: 'Pick filters → live stats refresh → download a tailored PDF report.',
    dataUrl: '/data/cpi-straddle-gc.json',
    offsetKey: 'stop_pts',
    offsetLabel: 'Stop offset',
  },
  nfp: {
    eventType: 'NFP',
    title: 'NFP straddle (Gold) — interactive explorer',
    subtitle: 'Pick filters → live stats refresh → download a tailored PDF report.',
    dataUrl: '/data/nfp-straddle-gc.json',
    offsetKey: 'entry_offset',
    offsetLabel: 'Entry offset',
  },
};

const EXPLORER_RE =
  /<div data-explorer="(cpi|nfp|nfp-ifvg-smt|cpi-ifvg-smt|ppi-ifvg-smt|retailsales-ifvg-smt|pce-ifvg-smt|gdp-ifvg-smt|joblessclaims-ifvg-smt|empirestate-ifvg-smt|employmentcostindex-ifvg-smt)">\s*<\/div>/i;

const SWITCHER_SLUGS = new Set(['cpi-day-stats', 'nfp']);
const KILLZONE_SLUG = 'killzone-past-vs-now';
const NWOG_SLUG = 'asia-open';

const IFVG_SLUGS = new Set([
  'cpi-ifvg-smt', 'nfp-ifvg-smt', 'ppi-ifvg-smt', 'pce-ifvg-smt',
  'joblessclaims-ifvg-smt', 'retailsales-ifvg-smt', 'empirestate-ifvg-smt',
  'employmentcostindex-ifvg-smt', 'gdp-ifvg-smt', 'gc-ifvg-smt',
  'fomc-ifvg-smt', 'adp-ifvg-smt', 'jolts-ifvg-smt',
  'ism-mfg-ifvg-smt', 'ism-services-ifvg-smt', 'cb-confidence-ifvg-smt',
  'philly-fed-ifvg-smt', 'durable-goods-ifvg-smt',
  // 9 individual GC event slugs
  'cpi-ifvg-smt-gc', 'nfp-ifvg-smt-gc', 'ppi-ifvg-smt-gc', 'pce-ifvg-smt-gc',
  'gdp-ifvg-smt-gc', 'joblessclaims-ifvg-smt-gc', 'retailsales-ifvg-smt-gc',
  'empirestate-ifvg-smt-gc', 'employmentcostindex-ifvg-smt-gc',
  'fomc-ifvg-smt-gc', 'adp-ifvg-smt-gc', 'jolts-ifvg-smt-gc',
  'ism-mfg-ifvg-smt-gc', 'ism-services-ifvg-smt-gc', 'cb-confidence-ifvg-smt-gc',
  'philly-fed-ifvg-smt-gc', 'durable-goods-ifvg-smt-gc',
  // 17 individual ES event slugs + 1 combined
  'cpi-ifvg-smt-es', 'nfp-ifvg-smt-es', 'ppi-ifvg-smt-es', 'pce-ifvg-smt-es',
  'gdp-ifvg-smt-es', 'joblessclaims-ifvg-smt-es', 'retailsales-ifvg-smt-es',
  'empirestate-ifvg-smt-es', 'employmentcostindex-ifvg-smt-es',
  'fomc-ifvg-smt-es', 'adp-ifvg-smt-es', 'jolts-ifvg-smt-es',
  'ism-mfg-ifvg-smt-es', 'ism-services-ifvg-smt-es', 'cb-confidence-ifvg-smt-es',
  'philly-fed-ifvg-smt-es', 'durable-goods-ifvg-smt-es', 'es-ifvg-smt',
  // 17 individual YM event slugs + 1 combined
  'cpi-ifvg-smt-ym', 'nfp-ifvg-smt-ym', 'ppi-ifvg-smt-ym', 'pce-ifvg-smt-ym',
  'gdp-ifvg-smt-ym', 'joblessclaims-ifvg-smt-ym', 'retailsales-ifvg-smt-ym',
  'empirestate-ifvg-smt-ym', 'employmentcostindex-ifvg-smt-ym',
  'fomc-ifvg-smt-ym', 'adp-ifvg-smt-ym', 'jolts-ifvg-smt-ym',
  'ism-mfg-ifvg-smt-ym', 'ism-services-ifvg-smt-ym', 'cb-confidence-ifvg-smt-ym',
  'philly-fed-ifvg-smt-ym', 'durable-goods-ifvg-smt-ym', 'ym-ifvg-smt',
]);

const catLabel = (c: string) => (c === 'tradingview' ? 'TRADINGVIEW' : 'DATA');

const NEWS830_CONFIGS: Record<string, { dataUrl: string; pdfTitle: string; dataUrlGc?: string; pdfTitleGc?: string }> = {
  'nfp-ifvg-smt':                 { dataUrl: '/data/nfp-ifvg-smt.json',               pdfTitle: 'NFP IFVG + ES SMT',            dataUrlGc: '/data/nfp-ifvg-smt_gc.json',               pdfTitleGc: 'NFP IFVG + SI SMT' },
  'cpi-ifvg-smt':                 { dataUrl: '/data/cpi-ifvg-smt.json',               pdfTitle: 'CPI IFVG + ES SMT',            dataUrlGc: '/data/cpi-ifvg-smt_gc.json',               pdfTitleGc: 'CPI IFVG + SI SMT' },
  'ppi-ifvg-smt':                 { dataUrl: '/data/ppi-ifvg-smt.json',               pdfTitle: 'PPI IFVG + ES SMT',            dataUrlGc: '/data/ppi-ifvg-smt_gc.json',               pdfTitleGc: 'PPI IFVG + SI SMT' },
  'retailsales-ifvg-smt':         { dataUrl: '/data/retailsales-ifvg-smt.json',       pdfTitle: 'Retail Sales IFVG + ES SMT',   dataUrlGc: '/data/retailsales-ifvg-smt_gc.json',       pdfTitleGc: 'Retail Sales IFVG + SI SMT' },
  'pce-ifvg-smt':                 { dataUrl: '/data/pce-ifvg-smt.json',               pdfTitle: 'PCE IFVG + ES SMT',            dataUrlGc: '/data/pce-ifvg-smt_gc.json',               pdfTitleGc: 'PCE IFVG + SI SMT' },
  'gdp-ifvg-smt':                 { dataUrl: '/data/gdp-ifvg-smt.json',               pdfTitle: 'GDP IFVG + ES SMT',            dataUrlGc: '/data/gdp-ifvg-smt_gc.json',               pdfTitleGc: 'GDP IFVG + SI SMT' },
  'joblessclaims-ifvg-smt':       { dataUrl: '/data/joblessclaims-ifvg-smt.json',     pdfTitle: 'Jobless Claims IFVG + ES SMT', dataUrlGc: '/data/joblessclaims-ifvg-smt_gc.json',     pdfTitleGc: 'Jobless Claims IFVG + SI SMT' },
  'empirestate-ifvg-smt':         { dataUrl: '/data/empirestate-ifvg-smt.json',       pdfTitle: 'Empire State IFVG + ES SMT',   dataUrlGc: '/data/empirestate-ifvg-smt_gc.json',       pdfTitleGc: 'Empire State IFVG + SI SMT' },
  'employmentcostindex-ifvg-smt': { dataUrl: '/data/employmentcostindex-ifvg-smt.json', pdfTitle: 'ECI IFVG + ES SMT',          dataUrlGc: '/data/employmentcostindex-ifvg-smt_gc.json', pdfTitleGc: 'ECI IFVG + SI SMT' },
};

const FULLPORT_PDFS: Record<string, { nq: string; gc: string; label: string }> = {
  nfp: { nq: '/downloads/backtested-data/nfp-fullport.pdf', gc: '/downloads/backtested-data/nfp-fullport.pdf', label: 'Download — NFP Fullport PDF' },
  cpi: { nq: '/downloads/backtested-data/cpi-fullport.pdf', gc: '/downloads/backtested-data/cpi-fullport.pdf', label: 'Download — CPI Fullport PDF' },
};

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

  const isStraddleSwitcher = SWITCHER_SLUGS.has(slug);
  const isKillzone = slug === KILLZONE_SLUG;
  const isNwog = slug === NWOG_SLUG;
  const isIfvg = IFVG_SLUGS.has(slug);

  const match = entry.explanationHtmlNq.match(EXPLORER_RE);
  const explorerKey = match ? match[1].toLowerCase() : null;
  const explorerConfig = explorerKey && EXPLORER_CONFIGS[explorerKey] ? EXPLORER_CONFIGS[explorerKey] : null;
  const news830Config = explorerKey && NEWS830_CONFIGS[explorerKey] ? NEWS830_CONFIGS[explorerKey] : null;
  const isNews830 = news830Config !== null;

  const hasSplit = isStraddleSwitcher && !!explorerKey;
  const splitter = (html: string) =>
    hasSplit || explorerConfig || isNews830
      ? html.split(EXPLORER_RE).filter((_, i) => i !== 1)
      : [html, ''];
  const [htmlBeforeNq, htmlAfterNq] = splitter(entry.explanationHtmlNq);
  const [htmlBeforeGc, htmlAfterGc] = splitter(entry.explanationHtmlGc);

  const mobileHasExplorer = !!(entry.mobileHtml && EXPLORER_RE.test(entry.mobileHtml));
  const [mobileBefore, mobileAfter] = mobileHasExplorer
    ? entry.mobileHtml!.split(EXPLORER_RE).filter((_, i) => i !== 1)
    : [entry.mobileHtml ?? '', ''];

  const hasBilingualMobile = !!(entry.mobileHtmlNq && entry.mobileHtmlGc);
  const [mobileBeforeNq, mobileAfterNq] =
    hasBilingualMobile && EXPLORER_RE.test(entry.mobileHtmlNq!)
      ? entry.mobileHtmlNq!.split(EXPLORER_RE).filter((_, i) => i !== 1)
      : [entry.mobileHtmlNq ?? '', ''];
  const [mobileBeforeGc, mobileAfterGc] =
    hasBilingualMobile && EXPLORER_RE.test(entry.mobileHtmlGc!)
      ? entry.mobileHtmlGc!.split(EXPLORER_RE).filter((_, i) => i !== 1)
      : [entry.mobileHtmlGc ?? '', ''];

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
        let explorerNode: React.ReactNode = null;
        if (SWITCHER_SLUGS.has(slug) && EXPLORER_CONFIGS[key] && GC_EXPLORER_CONFIGS[key]) {
          const fpM = FULLPORT_PDFS[key];
          explorerNode = (
            <StraddleSwitcher
              nqConfig={EXPLORER_CONFIGS[key]}
              gcConfig={GC_EXPLORER_CONFIGS[key]}
              fullportPdfNq={fpM?.nq}
              fullportPdfGc={fpM?.gc}
              fullportLabel={fpM?.label}
            />
          );
        } else if (EXPLORER_CONFIGS[key]) {
          explorerNode = <StraddleExplorer config={EXPLORER_CONFIGS[key]} embedded />;
        } else if (NEWS830_CONFIGS[key]) {
          explorerNode = (
            <News830Explorer
              dataUrl={NEWS830_CONFIGS[key].dataUrl}
              pdfTitle={NEWS830_CONFIGS[key].pdfTitle}
              dataUrlGc={NEWS830_CONFIGS[key].dataUrlGc}
              pdfTitleGc={NEWS830_CONFIGS[key].pdfTitleGc}
            />
          );
        }
        mobileTabs.push({ label, htmlBefore: hb, explorer: explorerNode, htmlAfter: ha });
      } else {
        mobileTabs.push({ label, htmlBefore: body });
      }
    }
  }

  let desktopExplorerNode: React.ReactNode = null;
  if (isStraddleSwitcher && explorerKey && EXPLORER_CONFIGS[explorerKey] && GC_EXPLORER_CONFIGS[explorerKey]) {
    const fp = FULLPORT_PDFS[explorerKey];
    desktopExplorerNode = (
      <StraddleSwitcher
        nqConfig={EXPLORER_CONFIGS[explorerKey]}
        gcConfig={GC_EXPLORER_CONFIGS[explorerKey]}
        fullportPdfNq={fp?.nq}
        fullportPdfGc={fp?.gc}
        fullportLabel={fp?.label}
      />
    );
  } else if (explorerConfig) {
    desktopExplorerNode = <StraddleExplorer config={explorerConfig} embedded />;
  } else if (isNews830) {
    desktopExplorerNode = (
      <News830Explorer
        dataUrl={news830Config!.dataUrl}
        pdfTitle={news830Config!.pdfTitle}
        dataUrlGc={news830Config!.dataUrlGc}
        pdfTitleGc={news830Config!.pdfTitleGc}
      />
    );
  }

  const hasDesktopSplit = desktopExplorerNode !== null;

  // Pager shared between both layouts
  const pager = (
    <div className="bd-pager" style={{ marginTop: 64 }}>
      <span>
        {prev ? (
          <Link href={`/backtested-data/${prev.slug}/`} className="bd-link-gold">
            ← {prev.title.length > 38 ? prev.title.slice(0, 36) + '…' : prev.title}
          </Link>
        ) : <span className="bd-meta" style={{ opacity: 0.4 }}>—</span>}
      </span>
      <span>
        {next ? (
          <Link href={`/backtested-data/${next.slug}/`} className="bd-link-gold">
            {next.title.length > 38 ? next.title.slice(0, 36) + '…' : next.title} →
          </Link>
        ) : <span className="bd-meta" style={{ opacity: 0.4 }}>—</span>}
      </span>
    </div>
  );

  // Overview prose node (passed to V3Tabs as children for the Overview tab)
  const overviewNode = (
    <>
      {isKillzone ? <KillzoneSwitcher /> : null}
      {isNwog ? <NwogSwitcher /> : null}
      {entry.mobileHtml ? (
        useMobileTabs ? (
          <div className="bd-show-mobile">
            <MobileTabs tabs={mobileTabs} />
          </div>
        ) : mobileHasExplorer && hasDesktopSplit ? (
          <div className="bd-show-mobile">
            {hasBilingualMobile ? (
              <BilingualProse htmlNq={mobileBeforeNq} htmlGc={mobileBeforeGc} className="bd-prose" />
            ) : (
              <div className="bd-prose" dangerouslySetInnerHTML={{ __html: mobileBefore }} />
            )}
            {desktopExplorerNode}
            {hasBilingualMobile ? (
              <BilingualProse htmlNq={mobileAfterNq} htmlGc={mobileAfterGc} className="bd-prose" />
            ) : (
              <div className="bd-prose" dangerouslySetInnerHTML={{ __html: mobileAfter }} />
            )}
          </div>
        ) : hasBilingualMobile ? (
          <BilingualProse htmlNq={entry.mobileHtmlNq!} htmlGc={entry.mobileHtmlGc!} className="bd-prose bd-show-mobile" />
        ) : (
          <div className="bd-prose bd-show-mobile" dangerouslySetInnerHTML={{ __html: entry.mobileHtml }} />
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
      {entry.pdfFileNq ? (
        <div className="bd-ctas" style={{ marginTop: 32 }}>
          <BilingualPdfLink
            pdfFileNq={entry.pdfFileNq}
            pdfFileGc={entry.pdfFileGc}
            pdfLabel={entry.pdfLabel ?? `Download — ${entry.title} PDF`}
          />
        </div>
      ) : null}
    </>
  );

  // IFVG slugs: v3 report-first layout with KPI band + tabs
  if (isIfvg) {
    const stratStats = getStrategyStats(slug);
    const breakdown = getWeekdayBreakdown(slug, true);
    const breakdownOff = getWeekdayBreakdown(slug, false);
    const yearBreakdown = getYearBreakdown(slug, true);
    const yearBreakdownOff = getYearBreakdown(slug, false);
    const tradesByVariant = {
      tp1_be: getTradeList(slug, true, 'tp1_be'),
      be_50:  getTradeList(slug, true, 'be_50'),
      no_be:  getTradeList(slug, true, 'no_be'),
    };
    const tradesByVariantOff = {
      tp1_be: getTradeList(slug, false, 'tp1_be'),
      be_50:  getTradeList(slug, false, 'be_50'),
      no_be:  getTradeList(slug, false, 'no_be'),
    };
    const trades = tradesByVariant.tp1_be;
    const statsByVariant = getStrategyStatsByVariant(slug);
    const statsByVariantAndSmt = getStrategyStatsByVariantAndSmt(slug);
    const eventLabel = stratStats?.event ?? entry.title;
    const assetLabel = stratStats?.asset ?? 'NQ';
    const dateFrom = stratStats?.dateFrom ? stratStats.dateFrom.slice(0, 4) : '2016';
    const dateTo = stratStats?.dateTo ? stratStats.dateTo.slice(0, 4) : '2026';

    return (
      <div>
        <Link href="/backtested-data/" className="v3-back">
          ← back to Data
        </Link>

        <h1 className="v3-sub-h1">
          <span className="v3-sub-ev">{eventLabel}</span>
          {' · IFVG + SMT'}
        </h1>
        <p className="v3-sub-sub">
          {assetLabel} futures · {stratStats?.releaseTime ?? '8:30 ET'} release · {dateFrom}–{dateTo} backtest
          {stratStats ? ` · ${stratStats.n} events` : ''}
        </p>

        {/* V3Tabs is a client component that reads ?tab from URL and renders the KPI band + tabs */}
        <Suspense fallback={<div className="v3-tabs" style={{ height: 48 }} />}>
          <V3Tabs slug={slug} breakdown={breakdown} breakdownOff={breakdownOff} yearBreakdown={yearBreakdown} yearBreakdownOff={yearBreakdownOff} trades={trades} tradesByVariant={tradesByVariant} tradesByVariantOff={tradesByVariantOff} statsByVariant={statsByVariant} statsByVariantAndSmt={statsByVariantAndSmt} dateFrom={dateFrom} dateTo={dateTo} overviewContent={overviewNode} eventShort={stratStats?.event ?? ''} asset={(stratStats?.asset?.toLowerCase() ?? 'nq') as 'nq' | 'gc' | 'es' | 'ym'} />
        </Suspense>

        {pager}
      </div>
    );
  }

  // Non-IFVG slugs: existing article layout
  return (
    <article className="bd-article">
      <Link href="/backtested-data/" className="v3-back">
        ← back to Data
      </Link>

      <div className="bd-article-meta">
        <span className="bd-tag">{catLabel(entry.category)}</span>
        <span className="bd-meta">{entry.date}</span>
        <span className="bd-meta">· {readMin} min read</span>
      </div>

      <h1 className="bd-h1 bd-article-title">
        <BilingualTitle nq={entry.titleNq} gc={entry.titleGc} fallback={entry.title} /><span className="bd-dot">.</span>
      </h1>

      {entry.excerpt ? (
        <BilingualLede nq={entry.excerptNq} gc={entry.excerptGc} fallback={entry.excerpt} />
      ) : null}

      {isKillzone ? <KillzoneSwitcher /> : null}
      {isNwog ? <NwogSwitcher /> : null}

      {entry.mobileHtml ? (
        useMobileTabs ? (
          <div className="bd-show-mobile">
            <MobileTabs tabs={mobileTabs} />
          </div>
        ) : mobileHasExplorer && hasDesktopSplit ? (
          <div className="bd-show-mobile">
            {hasBilingualMobile ? (
              <BilingualProse htmlNq={mobileBeforeNq} htmlGc={mobileBeforeGc} className="bd-prose" />
            ) : (
              <div className="bd-prose" dangerouslySetInnerHTML={{ __html: mobileBefore }} />
            )}
            {desktopExplorerNode}
            {hasBilingualMobile ? (
              <BilingualProse htmlNq={mobileAfterNq} htmlGc={mobileAfterGc} className="bd-prose" />
            ) : (
              <div className="bd-prose" dangerouslySetInnerHTML={{ __html: mobileAfter }} />
            )}
          </div>
        ) : hasBilingualMobile ? (
          <BilingualProse htmlNq={entry.mobileHtmlNq!} htmlGc={entry.mobileHtmlGc!} className="bd-prose bd-show-mobile" />
        ) : (
          <div className="bd-prose bd-show-mobile" dangerouslySetInnerHTML={{ __html: entry.mobileHtml }} />
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

      {slug === 'cpi-day-stats' ? (
        <div style={{ marginTop: 48 }}>
          <StraddleTrades
            eventShort="cpi"
            jsonUrl="/data/cpi-straddle-trades.json"
            offsetLabel="Stop offset"
          />
        </div>
      ) : null}
      {slug === 'nfp' ? (
        <div style={{ marginTop: 48 }}>
          <StraddleTrades
            eventShort="nfp"
            jsonUrl="/data/nfp-straddle-trades.json"
            offsetLabel="Entry offset"
          />
        </div>
      ) : null}

      <div className="bd-ctas" style={{ marginTop: 48 }}>
        {entry.category === 'tradingview' && entry.tradingviewUrl ? (
          <a className="bd-btn bd-btn-primary" href={entry.tradingviewUrl} target="_blank" rel="noreferrer noopener">
            Open on TradingView
            <IconArrowUpRight />
          </a>
        ) : null}
        {entry.pdfFileNq ? (
          <BilingualPdfLink
            pdfFileNq={entry.pdfFileNq}
            pdfFileGc={entry.pdfFileGc}
            pdfLabel={entry.pdfLabel ?? `Download — ${entry.title} PDF`}
          />
        ) : null}
      </div>

      <div className="mt-16 max-w-[720px] border-t pt-6" style={{ borderColor: 'oklch(0.85 0.02 85)' }}>
        <h3 className="mb-2 font-semibold uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--f-sans)', fontWeight: 500, fontSize: '0.75rem', color: 'var(--c-muted)' }}>
          Methodology &amp; limitations
        </h3>
        <p className="max-w-[65ch]" style={{ fontFamily: 'var(--f-sans)', fontWeight: 400, fontSize: '0.875rem', lineHeight: 1.6, color: 'oklch(0.55 0.01 60)' }}>
          Results are derived from historical data via AI-assisted backtesting over a 10-year window.
          Past performance does not predict future results — market microstructure evolves, and edges
          captured in historical samples may decay or disappear in live conditions.
        </p>
      </div>

      {pager}
    </article>
  );
}
