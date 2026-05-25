'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import { useAsset } from './AssetContext';
import AssetPills from './AssetPills';
import EquityCurve from './EquityCurve';
import ManipTradeChart, { type ManipExample } from './ManipTradeChart';

type RegimeKey = 'full' | '2024+' | '2025+' | '2026';
type RegimeStat = { n: number; pf: number; net_pts: number; wr: number };
type Summary = { n: number; w: number; l: number; wr: number; pf: number; net_pts: number; avg_R: number; expectancy_pts: number; max_dd_pts: number };
type Trade = { ts: string; year: number; side: 'short' | 'long'; pnl_pts: number; R: number; outcome: 'win' | 'loss'; level: string };
type ByYear = { year: number; n: number; pf: number; net_pts: number; wr: number };
type VariantData = {
  summary: Summary;
  by_year: ByYear[];
  by_regime: Record<RegimeKey, RegimeStat>;
  trades: Trade[];
};

export interface ManipData {
  meta: {
    asset: string;
    window_manip: string;
    window_trade: string;
    levels: string[];
    dateFrom: string;
    dateTo: string;
    manip_days: number;
    skipped: number;
    point_value_usd: number;
  };
  variants: {
    tp1R: VariantData;
    tp2R: VariantData;
    hold11: VariantData;
  };
}

type AssetKey = 'nq' | 'gc' | 'si' | 'ym' | 'es';
type VariantKey = 'tp1R' | 'tp2R' | 'hold11';
type TabKey = 'overview' | 'regime' | 'year' | 'trades' | 'methodology';

const VARIANT_LABELS: Record<VariantKey, string> = {
  tp1R: 'TP 1R',
  tp2R: 'TP 2R',
  hold11: 'Hold to 11:00',
};

const TAB_LIST: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'regime', label: 'By regime' },
  { key: 'year', label: 'By year' },
  { key: 'trades', label: 'Trade list' },
  { key: 'methodology', label: 'Methodology' },
];

const REGIME_LABELS: Record<RegimeKey, string> = {
  full: 'Full period',
  '2024+': '2024+',
  '2025+': '2025+',
  '2026': '2026',
};

const REGIME_ORDER: RegimeKey[] = ['full', '2024+', '2025+', '2026'];

function formatUsd(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toFixed(0);
}

function formatNum(n: number, decimals = 0): string {
  if (n >= 1e6 || n <= -1e6) return n.toLocaleString('en-US', { maximumFractionDigits: decimals });
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const MAX_TRADES = 200;

export default function ManipStrategyTabs({
  allAssetData,
  overviewContent,
  examplesByAsset,
}: {
  allAssetData: Record<AssetKey, ManipData>;
  overviewContent: React.ReactNode;
  examplesByAsset?: Partial<Record<AssetKey, ManipExample[]>>;
}) {
  const { asset } = useAsset();
  const searchParams = useSearchParams();
  const router = useRouter();

  const variant = (searchParams.get('variant') ?? 'hold11') as VariantKey;
  const activeVariant: VariantKey = (['tp1R', 'tp2R', 'hold11'] as VariantKey[]).includes(variant) ? variant : 'hold11';
  const tab = (searchParams.get('tab') ?? 'overview') as TabKey;
  const activeTab: TabKey = TAB_LIST.some((t) => t.key === tab) ? tab : 'overview';

  const data = allAssetData[asset];
  const variantData = data?.variants[activeVariant];

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const tabHref = (t: TabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', t);
    return `?${params.toString()}`;
  };

  const kpi = useMemo(() => {
    if (!variantData) return null;
    const s = variantData.summary;
    const netUsd = s.net_pts * data.meta.point_value_usd;
    return { pf: s.pf, n: s.n, wr: s.wr, net_pts: s.net_pts, net_usd: netUsd };
  }, [variantData, data]);

  const yearMaxAbsNet = useMemo(() => {
    if (!variantData) return 1;
    const abs = variantData.by_year.map((y) => Math.abs(y.net_pts));
    return Math.max(...abs, 1);
  }, [variantData]);

  const hasRelevantRegime = useMemo(() => {
    if (!variantData) return false;
    const r = variantData.by_regime;
    return r['2025+'].n > 0 || r['2026'].n > 0;
  }, [variantData]);

  if (!data || !variantData) {
    return <div className="v3-coming-soon">No data available for this asset.</div>;
  }

  const displayTrades = variantData.trades.slice(0, MAX_TRADES);
  const tradeCount = variantData.trades.length;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <AssetPills />
      </div>

      <h1 className="v3-sub-h1">
        <span className="v3-sub-ev">9:30 Manip.</span>
        {' → Distribution'}
      </h1>
      <p className="v3-sub-sub">
        {data.meta.asset} futures · {data.meta.window_manip} manip → {data.meta.window_trade} distribution · {data.meta.dateFrom.slice(0, 4)}–{data.meta.dateTo.slice(0, 4)} backtest
        {data.meta.manip_days ? ` · ${data.meta.manip_days} days` : ''}
      </p>

      <div className="manip-variant-tabs">
        {(['tp1R', 'tp2R', 'hold11'] as VariantKey[]).map((v) => (
          <button
            key={v}
            onClick={() => setParam('variant', v)}
            className={'manip-variant-tab' + (activeVariant === v ? ' active' : '')}
          >
            {VARIANT_LABELS[v]}
          </button>
        ))}
      </div>

      {kpi && (
        <div className="manip-kpi-band">
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Profit factor</div>
            <div className={'v3-kpi-band-val' + (kpi.pf >= 1.5 ? ' pos' : '')}>{kpi.pf.toFixed(2)}</div>
            <div className="v3-kpi-band-foot">{kpi.pf >= 1.2 ? 'net-positive edge' : 'marginal'}</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Trades</div>
            <div className="v3-kpi-band-val">{kpi.n}</div>
            <div className="v3-kpi-band-foot">{variantData.summary.w}W / {variantData.summary.l}L</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Win rate</div>
            <div className="v3-kpi-band-val gold">{kpi.wr.toFixed(1)}%</div>
            <div className="v3-kpi-band-foot">avg R {variantData.summary.avg_R >= 0 ? '+' : ''}{variantData.summary.avg_R.toFixed(2)}</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Net (pts)</div>
            <div className={'v3-kpi-band-val' + (kpi.net_pts > 0 ? ' pos' : '')}>{kpi.net_pts >= 0 ? '+' : ''}{kpi.net_pts.toFixed(1)}</div>
            <div className="v3-kpi-band-foot">expectancy {variantData.summary.expectancy_pts >= 0 ? '+' : ''}{variantData.summary.expectancy_pts.toFixed(2)}</div>
          </div>
          <div className="v3-kpi-cell">
            <div className="v3-kpi-band-lbl">Net ($)</div>
            <div className={'v3-kpi-band-val' + (kpi.net_usd > 0 ? ' pos' : '')}>{kpi.net_usd >= 0 ? '+' : ''}{formatUsd(kpi.net_usd)}</div>
            <div className="v3-kpi-band-foot">${data.meta.point_value_usd}/pt</div>
          </div>
        </div>
      )}

      <div className="v3-tabs">
        {TAB_LIST.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={'v3-tab' + (activeTab === t.key ? ' active' : '')}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="v3-prose">{overviewContent}</div>
          {examplesByAsset && examplesByAsset[asset] && examplesByAsset[asset]!.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <div className="v3-wd-h">Example setups</div>
              <div className="v3-wd-sub">
                {data.meta.asset} · selected example trades with intraday price action
              </div>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {examplesByAsset[asset]!.map((ex, i) => (
                  <ManipTradeChart key={`${ex.date}-${i}`} example={ex} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'regime' && (
        <div>
          <div className="v3-wd-h">Performance by regime</div>
          <div className="v3-wd-sub">{data.meta.asset} · {VARIANT_LABELS[activeVariant]} · regime comparison</div>
          <div className="v3-yr-table-wrap">
            <table className="v3-yr-table">
              <thead>
                <tr>
                  <th>Regime</th>
                  <th>N</th>
                  <th>PF</th>
                  <th>WR</th>
                  <th>Net pts</th>
                </tr>
              </thead>
              <tbody>
                {REGIME_ORDER.map((key) => {
                  const r = variantData.by_regime[key];
                  const isRecentHighlight = (key === '2025+' || key === '2026') && hasRelevantRegime && r.n > 0;
                  const isEmpty = r.n === 0;
                  const rowClass = 'v3-yr-row' +
                    (key === 'full' ? ' total' : '') +
                    (isRecentHighlight ? ' selected' : '');
                  return (
                    <tr key={key} className={rowClass}>
                      <td className="v3-yr-year" style={isRecentHighlight ? { color: 'var(--c-accent-deep)', fontWeight: 700 } : undefined}>
                        {REGIME_LABELS[key]}
                        {isRecentHighlight ? ' ⬤' : ''}
                      </td>
                      <td className="v3-yr-num">{isEmpty ? '—' : r.n}</td>
                      <td className={'v3-yr-num' + (!isEmpty && r.pf >= 1.2 ? ' sage' : '')}>{isEmpty ? '—' : r.pf.toFixed(2)}</td>
                      <td className={'v3-yr-num' + (!isEmpty && r.wr >= 55 ? ' gold' : '')}>{isEmpty ? '—' : r.wr.toFixed(1) + '%'}</td>
                      <td className={'v3-yr-num' + (isEmpty ? '' : r.net_pts > 0 ? ' sage' : r.net_pts < 0 ? ' terra' : '')}>
                        {isEmpty ? '—' : (r.net_pts >= 0 ? '+' : '') + formatNum(r.net_pts, 1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'year' && (
        <div>
          <div className="v3-wd-h">Performance by year</div>
          <div className="v3-wd-sub">{data.meta.asset} · {VARIANT_LABELS[activeVariant]} · annual breakdown</div>
          <div className="v3-yr-table-wrap">
            <table className="v3-yr-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>N</th>
                  <th>PF</th>
                  <th>WR</th>
                  <th>Net pts</th>
                  <th style={{ width: '35%' }}></th>
                </tr>
              </thead>
              <tbody>
                {variantData.by_year.map((y) => (
                  <tr key={y.year} className="v3-yr-row">
                    <td className="v3-yr-year">{y.year}</td>
                    <td className="v3-yr-num">{y.n}</td>
                    <td className={'v3-yr-num' + (y.pf >= 1.2 ? ' sage' : '')}>{y.pf.toFixed(2)}</td>
                    <td className={'v3-yr-num' + (y.wr >= 55 ? ' gold' : '')}>{y.wr.toFixed(1)}%</td>
                    <td className={'v3-yr-num' + (y.net_pts > 0 ? ' sage' : y.net_pts < 0 ? ' terra' : '')}>
                      {y.net_pts >= 0 ? '+' : ''}{formatNum(y.net_pts, 1)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 20, minWidth: 80 }}>
                        <div style={{
                          height: 8,
                          width: `${Math.max(3, (Math.abs(y.net_pts) / yearMaxAbsNet) * 100)}%`,
                          background: y.net_pts >= 0 ? 'var(--c-sage)' : 'var(--c-terra)',
                          borderRadius: 4,
                          minWidth: 3,
                        }} />
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.7rem', color: 'var(--c-muted)', whiteSpace: 'nowrap', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {y.net_pts >= 0 ? '+' : ''}{Math.round(y.net_pts)} pts
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'trades' && (
        <div>
          <EquityCurve
            trades={variantData.trades.map((t) => ({ ts: t.ts, pnl_pts: t.pnl_pts }))}
            title="Equity curve"
            subtitle={`${data.meta.asset} · ${VARIANT_LABELS[activeVariant]}`}
          />
          <div className="v3-wd-h" style={{ marginTop: 32 }}>Trade list</div>
          <div className="v3-wd-sub">{data.meta.asset} · {VARIANT_LABELS[activeVariant]} · most recent first.</div>
          <div className="v3-tr-table-wrap">
            <table className="v3-tr-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Side</th>
                  <th>Level</th>
                  <th>PnL (pts)</th>
                  <th>R</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {displayTrades.map((t, i) => {
                  const outcomeClass = 'v3-tr-badge' + (t.outcome === 'win' ? ' win' : ' loss');
                  const pnlClass = 'v3-tr-pnl' + (t.pnl_pts > 0 ? ' pos' : t.pnl_pts < 0 ? ' neg' : ' zero');
                  const rClass = 'v3-tr-pnl' + (t.R > 0 ? ' pos' : t.R < 0 ? ' neg' : ' zero');
                  return (
                    <tr key={i} className="v3-tr-row">
                      <td className="v3-tr-date">{t.ts.slice(0, 10)}</td>
                      <td className="v3-tr-side">{t.side.toUpperCase()}</td>
                      <td className="v3-tr-side">{t.level}</td>
                      <td className={pnlClass}>{t.pnl_pts >= 0 ? '+' : ''}{t.pnl_pts.toFixed(2)}</td>
                      <td className={rClass}>{t.R >= 0 ? '+' : ''}{t.R.toFixed(2)}</td>
                      <td><span className={outcomeClass}>{t.outcome}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="v3-tr-count">
            {tradeCount > MAX_TRADES
              ? `Showing ${MAX_TRADES} of ${tradeCount} total trades`
              : `${tradeCount} total trades`}
          </div>
        </div>
      )}

      {activeTab === 'methodology' && (
        <div className="v3-prose">
          <h2>Setup detection</h2>
          <p>
            Each day between 09:30 and 10:00 ET, the algorithm checks whether price sweeps a key level
            (PDH, PDL, PMH, PML, Asia High, Asia Low) and immediately rejects. This sweep-reject pattern
            signals a manipulation — a false breakout designed to trap breakout traders before reversing.
          </p>
          <h2>Trade execution</h2>
          <p>
            Entry is taken at 10:00 ET in the direction of the rejection (distribution leg).
            The stop-loss is placed at the extreme of the manipulation window (the W1 candle high/low),
            and the position is managed according to the selected variant:
          </p>
          <ul>
            <li><strong>TP 1R:</strong> Take-profit at 1× the initial risk. Closes at 1R or at 11:00 ET if not hit.</li>
            <li><strong>TP 2R:</strong> Take-profit at 2× the initial risk. Closes at 2R or at 11:00 ET if not hit.</li>
            <li><strong>Hold to 11:00:</strong> No take-profit target — position held until 11:00 ET market close.</li>
          </ul>
          <h2>Limitations</h2>
          <p>
            This backtest uses historical intraday data (1-minute candles). Slippage and commissions are not modeled.
            The definition of &ldquo;sweep&rdquo; and &ldquo;rejection&rdquo; is mechanical (price exceeds a level by ≥1 tick and closes
            back inside the range within the manipulation window). Past performance does not guarantee future results.
          </p>
        </div>
      )}
    </>
  );
}
