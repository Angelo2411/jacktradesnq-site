import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getAllEntries, getEntry } from '@/lib/studies';
import { IconArrowUpRight } from '../_components/icons';
import { AssetProvider, type AssetKey } from '../_components/AssetContext';
import AssetPills from '../_components/AssetPills';
import KillzoneSwitcher from '../_components/KillzoneSwitcher';
import NwogSwitcher from '../_components/NwogSwitcher';
import News830Explorer from '../_components/News830Explorer';
import EquityCurveWidget from '../_components/EquityCurveWidget';
import MobileTabs, { type MobileTab } from '../_components/MobileTabs';
import BilingualProse from '../_components/BilingualProse';
import BilingualPdfLink from '../_components/BilingualPdfLink';
import BilingualLede from '../_components/BilingualLede';
import BilingualTitle from '../_components/BilingualTitle';
import V3Tabs from '../_components/V3Tabs';
import StraddleWrappedTabs from '../_components/StraddleWrappedTabs';
import PerformanceTearsheet from '../_components/PerformanceTearsheet';
import ManipStrategyTabs, { type ManipData } from '../_components/ManipStrategyTabs';
import { type ManipExample } from '../_components/ManipTradeChart';
import { getStrategyStats, getStrategyStatsByVariant, getStrategyStatsByVariantAndSmt, getWeekdayBreakdown, getYearBreakdown, getTradeList, getStraddleAllTrades } from '@/lib/study-stats';

const EXPLORER_RE =
  /<div data-explorer="(cpi|nfp|jobless-claims|ppi|retail-sales|durable-goods|pce|nfp-ifvg-smt|cpi-ifvg-smt|ppi-ifvg-smt|retailsales-ifvg-smt|pce-ifvg-smt|gdp-ifvg-smt|joblessclaims-ifvg-smt|empirestate-ifvg-smt|employmentcostindex-ifvg-smt)">\s*<\/div>/i;

const STRADDLE_BARS_KEY: Record<string, string> = {
  'cpi-day-stats': 'cpi',
  'nfp': 'nfp',
  'jobless-claims': 'jobless-claims',
  'ppi': 'ppi',
  'retail-sales': 'retail-sales',
  'durable-goods': 'durable-goods',
  'pce': 'pce',
};

const EVENT_INFO: Record<string, { eventType: string; titlePrefix: string }> = {
  cpi: { eventType: 'CPI', titlePrefix: 'CPI' },
  nfp: { eventType: 'NFP', titlePrefix: 'NFP' },
  'jobless-claims': { eventType: 'Jobless Claims', titlePrefix: 'Jobless Claims' },
  ppi: { eventType: 'PPI', titlePrefix: 'PPI' },
  'retail-sales': { eventType: 'Retail Sales', titlePrefix: 'Retail Sales' },
  'durable-goods': { eventType: 'Durable Goods', titlePrefix: 'Durable Goods' },
  pce: { eventType: 'PCE', titlePrefix: 'PCE' },
};

const KILLZONE_SLUG = 'killzone-past-vs-now';
const NWOG_SLUG = 'asia-open';
const MANIP_SLUG = 'manip930-distribution';

const STRADDLE_V3_SLUGS = new Set(['cpi-day-stats', 'nfp', 'jobless-claims', 'ppi', 'retail-sales', 'durable-goods', 'pce']);

const STRADDLE_BARS_SLUG: Record<string, string> = {
  'cpi-day-stats': 'cpi',
  'nfp': 'nfp',
  'jobless-claims': 'jobless-claims',
  'ppi': 'ppi',
  'retail-sales': 'retail-sales',
  'durable-goods': 'durable-goods',
  'pce': 'pce',
};

const IFVG_SLUGS = new Set([
  'cpi-ifvg-smt', 'nfp-ifvg-smt', 'ppi-ifvg-smt', 'pce-ifvg-smt',
  'joblessclaims-ifvg-smt', 'retailsales-ifvg-smt', 'empirestate-ifvg-smt',
  'employmentcostindex-ifvg-smt', 'gdp-ifvg-smt',
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
  // SI aggregate
  'si-ifvg-smt',
  // 40 YM slugs
  'cpi-ifvg-smt-ym', 'cpi-ifvg-smt-ym-vs-es', 'cpi-ifvg-smt-es-vs-ym', 'cpi-ifvg-smt-nq-vs-ym', 'cpi-ifvg-smt-gc-vs-ym',
  'nfp-ifvg-smt-nq-vs-ym', 'nfp-ifvg-smt-es-vs-ym', 'nfp-ifvg-smt-ym-vs-es',
  'fomc-ifvg-smt-ym', 'fomc-ifvg-smt-ym-vs-es', 'fomc-ifvg-smt-es-vs-ym', 'fomc-ifvg-smt-nq-vs-ym',
  'pce-ifvg-smt-ym', 'pce-ifvg-smt-ym-vs-es', 'pce-ifvg-smt-gc-vs-ym',
  'ppi-ifvg-smt-ym-vs-es', 'ppi-ifvg-smt-es-vs-ym',
  'retailsales-ifvg-smt-ym', 'retailsales-ifvg-smt-ym-vs-es', 'retailsales-ifvg-smt-es-vs-ym', 'retailsales-ifvg-smt-nq-vs-ym',
  'philly-fed-ifvg-smt-ym', 'philly-fed-ifvg-smt-ym-vs-es', 'philly-fed-ifvg-smt-nq-vs-ym',
  'durable-goods-ifvg-smt-ym', 'durable-goods-ifvg-smt-ym-vs-es', 'durable-goods-ifvg-smt-es-vs-ym',
  'ism-services-ifvg-smt-ym', 'ism-services-ifvg-smt-ym-vs-es', 'ism-services-ifvg-smt-es-vs-ym',
  'cb-confidence-ifvg-smt-ym', 'cb-confidence-ifvg-smt-ym-vs-es',
  'joblessclaims-ifvg-smt-es-vs-ym', 'joblessclaims-ifvg-smt-ym-vs-es',
  'es-ifvg-smt-vs-ym', 'nq-ifvg-smt-vs-ym',
  // SI anchor + GC SMT (canonical precious-metals pair)
  'nfp-ifvg-smt-si-vs-gc', 'pce-ifvg-smt-si-vs-gc', 'retailsales-ifvg-smt-si-vs-gc', 'empirestate-ifvg-smt-si-vs-gc',
]);
const EQUITY_RE  = /<div data-equity="(nfp)">\s*<\/div>/i;

const EQUITY_DATA: Record<string, string> = {
  nfp: '/data/nfp-trades.json',
};

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
  nfp: { nq: '/downloads/studies/nfp-fullport.pdf', gc: '/downloads/studies/nfp-fullport.pdf', label: 'Download — NFP Fullport PDF' },
  cpi: { nq: '/downloads/studies/cpi-fullport.pdf', gc: '/downloads/studies/cpi-fullport.pdf', label: 'Download — CPI Fullport PDF' },
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
  const hasTearsheet = fs.existsSync(path.join(process.cwd(), 'content', 'studies', slug, 'tearsheet.json'));

  const entries = getAllEntries();
  const idx = entries.findIndex((e) => e.slug === slug);
  const prev = idx > 0 ? entries[idx - 1] : null;
  const next = idx < entries.length - 1 ? entries[idx + 1] : null;

  const wordCount = entry.explanationHtml.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.ceil(wordCount / 200));

  const isStraddleSwitcher = false;
  const isKillzone = slug === KILLZONE_SLUG;
  const isNwog = slug === NWOG_SLUG;
  const isIfvg = IFVG_SLUGS.has(slug);
  const isManip = slug === MANIP_SLUG;
  const isStraddleV3 = STRADDLE_V3_SLUGS.has(slug);

  const match = entry.explanationHtmlNq.match(EXPLORER_RE);
  const explorerKey = match ? match[1].toLowerCase() : null;
  const news830Config = explorerKey && NEWS830_CONFIGS[explorerKey] ? NEWS830_CONFIGS[explorerKey] : null;
  const isNews830 = news830Config !== null;
  const splitter = (html: string) =>
    isNews830
      ? html.split(EXPLORER_RE).filter((_, i) => i !== 1)
      : [html, ''];
  const [htmlBeforeNq, htmlAfterNq] = splitter(entry.explanationHtmlNq);
  const [htmlBeforeGc, htmlAfterGc] = splitter(entry.explanationHtmlGc);
  const [htmlBeforeEs, htmlAfterEs] = entry.explanationHtmlEs ? splitter(entry.explanationHtmlEs) : ['', ''];
  const [htmlBeforeSi, htmlAfterSi] = entry.explanationHtmlSi ? splitter(entry.explanationHtmlSi) : ['', ''];
  const [htmlBeforeYm, htmlAfterYm] = entry.explanationHtmlYm ? splitter(entry.explanationHtmlYm) : ['', ''];

  // Second pass: detect equity curve placeholder inside htmlBefore (it appears before the explorer)
  const equityMatchBefore = entry.explanationHtmlNq.match(EQUITY_RE);
  const equityKey = equityMatchBefore ? equityMatchBefore[1].toLowerCase() : null;
  const equityDataUrl = equityKey ? EQUITY_DATA[equityKey] ?? null : null;
  // Split htmlBefore around the equity placeholder when found
  const [htmlBeforeEquity, htmlAfterEquity] = equityDataUrl
    ? entry.explanationHtmlNq.split(EQUITY_RE).filter((_, i) => i !== 1)
    : [entry.explanationHtmlNq, ''];

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
        if (isNews830 && NEWS830_CONFIGS[key]) {
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
  if (isNews830) {
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
          <Link href={`/studies/${prev.slug}/`} className="bd-link-gold">
            ← {prev.title.length > 38 ? prev.title.slice(0, 36) + '…' : prev.title}
          </Link>
        ) : <span className="bd-meta" style={{ opacity: 0.4 }}>—</span>}
      </span>
      <span>
        {next ? (
          <Link href={`/studies/${next.slug}/`} className="bd-link-gold">
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
            <BilingualProse htmlNq={htmlBeforeNq} htmlGc={htmlBeforeGc} htmlEs={htmlBeforeEs || undefined} htmlSi={htmlBeforeSi || undefined} htmlYm={htmlBeforeYm || undefined} />
            {desktopExplorerNode}
            <BilingualProse htmlNq={htmlAfterNq} htmlGc={htmlAfterGc} htmlEs={htmlAfterEs || undefined} htmlSi={htmlAfterSi || undefined} htmlYm={htmlAfterYm || undefined} />
          </>
        ) : (
          <BilingualProse htmlNq={entry.explanationHtmlNq} htmlGc={entry.explanationHtmlGc} htmlEs={entry.explanationHtmlEs} htmlSi={entry.explanationHtmlSi} htmlYm={entry.explanationHtmlYm} />
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

  // Straddle V3: unified V3Tabs UX (replaces StraddleSwitcher)
  if (isStraddleV3) {
    const barsSlug = STRADDLE_BARS_SLUG[slug] ?? slug;
    const eventName = EVENT_INFO[STRADDLE_BARS_KEY[slug] ?? slug]?.eventType ?? entry.title;
    const releaseTime = '8:30 ET';
    const allTrades: Record<string, import('@/lib/study-stats').TradeRow[]> = {};
    for (const asset of ['nq', 'gc', 'si', 'ym', 'es']) {
      allTrades[asset] = getStraddleAllTrades(slug, asset);
    }

    const allAllTrades = Object.values(allTrades).flat();
    const dates = allAllTrades.map((t) => t.ts.slice(0, 10)).sort();
    const dateFrom = dates[0]?.slice(0, 4) ?? '2016';
    const dateTo = dates[dates.length - 1]?.slice(0, 4) ?? '2026';

    const availableAssets: AssetKey[] = Object.entries(allTrades)
      .filter(([, trs]) => trs.length > 0)
      .map(([k]) => k as AssetKey);

    const straddleOverviewNode = (
      <>
        <BilingualProse htmlNq={entry.explanationHtmlNq} htmlGc={entry.explanationHtmlGc} htmlEs={entry.explanationHtmlEs} htmlSi={entry.explanationHtmlSi} htmlYm={entry.explanationHtmlYm} />
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

    return (
      <div>
        <Link href="/studies/" className="v3-back">
          ← back to Data
        </Link>

        <StraddleWrappedTabs
          slug={slug}
          allTrades={allTrades}
          barsSlug={barsSlug}
          eventName={eventName}
          releaseTime={releaseTime}
          dateFrom={dateFrom}
          dateTo={dateTo}
          overviewContent={straddleOverviewNode}
        />

        {pager}
      </div>
    );
  }

  // Manip930-Distribution: 5-asset strategy with variant tabs
  if (isManip) {
    const manipAssets: AssetKey[] = ['nq', 'gc', 'si', 'ym', 'es'];
    const allAssetData: Record<string, ManipData> = {};
    for (const a of manipAssets) {
      const suffix = a === 'nq' ? '' : `-${a}`;
      const raw = fs.readFileSync(path.join(process.cwd(), 'public', 'data', `manip930-distribution${suffix}.json`), 'utf-8');
      allAssetData[a] = JSON.parse(raw) as ManipData;
    }

    const examplesByAsset: Partial<Record<AssetKey, ManipExample[]>> = {};
    for (const a of manipAssets) {
      const suffix = a === 'nq' ? '' : `-${a}`;
      try {
        const raw = fs.readFileSync(path.join(process.cwd(), 'public', 'data', `manip930-distribution-examples${suffix}.json`), 'utf-8');
        const parsed = JSON.parse(raw);
        examplesByAsset[a] = parsed.examples ?? [];
      } catch {
        examplesByAsset[a] = [];
      }
    }

    const manipOverviewNode = (
      <BilingualProse htmlNq={entry.explanationHtmlNq} htmlGc={entry.explanationHtmlGc} htmlEs={entry.explanationHtmlEs} htmlSi={entry.explanationHtmlSi} htmlYm={entry.explanationHtmlYm} />
    );

    return (
      <div>
        <Link href="/studies/" className="v3-back">
          ← back to Data
        </Link>

        <Suspense fallback={<div className="v3-tabs" style={{ height: 48 }} />}>
          <AssetProvider assets={manipAssets} slug={slug}>
            <ManipStrategyTabs allAssetData={allAssetData} overviewContent={manipOverviewNode} examplesByAsset={examplesByAsset} />
          </AssetProvider>
        </Suspense>

        {pager}
      </div>
    );
  }

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
        <Link href="/studies/" className="v3-back">
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

        {/* Performance Tearsheet — pilot: fomc-ifvg-smt only. Extend by running gen_tearsheet.py for other slugs. */}
        <PerformanceTearsheet slug={slug} />

        {/* V3Tabs is a client component that reads ?tab from URL and renders the KPI band + tabs */}
        <Suspense fallback={<div className="v3-tabs" style={{ height: 48 }} />}>
          <V3Tabs slug={slug} breakdown={breakdown} breakdownOff={breakdownOff} yearBreakdown={yearBreakdown} yearBreakdownOff={yearBreakdownOff} trades={trades} tradesByVariant={tradesByVariant} tradesByVariantOff={tradesByVariantOff} statsByVariant={statsByVariant} statsByVariantAndSmt={statsByVariantAndSmt} dateFrom={dateFrom} dateTo={dateTo} overviewContent={overviewNode} eventShort={stratStats?.event ?? ''} asset={(stratStats?.asset?.toLowerCase() ?? 'nq') as 'nq' | 'gc' | 'es' | 'si' | 'ym'} hideKpiBand={hasTearsheet} />
        </Suspense>

        {pager}
      </div>
    );
  }

  // Non-IFVG slugs: existing article layout
  return (
    <article className="bd-article">
      <Link href="/studies/" className="v3-back">
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
            <BilingualProse htmlNq={htmlBeforeNq} htmlGc={htmlBeforeGc} htmlEs={htmlBeforeEs || undefined} htmlSi={htmlBeforeSi || undefined} htmlYm={htmlBeforeYm || undefined} />
            {desktopExplorerNode}
            <BilingualProse htmlNq={htmlAfterNq} htmlGc={htmlAfterGc} htmlEs={htmlAfterEs || undefined} htmlSi={htmlAfterSi || undefined} htmlYm={htmlAfterYm || undefined} />
          </>
        ) : equityDataUrl ? (
          <>
            <div className="bd-prose" dangerouslySetInnerHTML={{ __html: htmlBeforeEquity }} />
            <EquityCurveWidget dataPath={equityDataUrl} />
            <div className="bd-prose" dangerouslySetInnerHTML={{ __html: htmlAfterEquity }} />
          </>
        ) : (
          <BilingualProse htmlNq={entry.explanationHtmlNq} htmlGc={entry.explanationHtmlGc} htmlEs={entry.explanationHtmlEs} htmlSi={entry.explanationHtmlSi} htmlYm={entry.explanationHtmlYm} />
        )}
      </div>

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
