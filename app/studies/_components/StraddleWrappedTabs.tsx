'use client';

import { useMemo, Suspense } from 'react';
import { useAsset, type AssetKey } from './AssetContext';
import V3Tabs from './V3Tabs';
import type { TradeRow } from '@/lib/study-stats';
import { MIN_DISPLAY_PF } from '@/lib/study-display-config';
import { computeKPI, computeYearBreakdown, computeWeekdayBreakdown } from '@/lib/client-stats';

const STOP_GRIDS: Record<string, number[]> = {
  nq: [25, 30, 35, 40],
  es: [5, 6, 7, 8],
  ym: [50, 60, 70, 80],
  gc: [3, 4, 5, 6],
  si: [0.05, 0.07, 0.10, 0.12],
};

const TP_GRIDS: Record<string, number[]> = {
  nq: [15, 20, 25],
  es: [3, 4, 5],
  ym: [30, 40, 50],
  gc: [2, 2.5, 3],
  si: [0.03, 0.05, 0.07],
};

const SIDE_OPTS = [
  { key: 'both', label: 'Both' },
  { key: 'long', label: 'Long' },
  { key: 'short', label: 'Short' },
];

function formatNum(n: number): string {
  return Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2);
}

const ASSET_LABEL: Record<string, string> = {
  nq: 'NQ',
  gc: 'GC',
  si: 'SI',
  ym: 'YM',
  es: 'ES',
};

export default function StraddleWrappedTabs({
  slug,
  allTrades,
  barsSlug,
  eventName,
  releaseTime,
  dateFrom,
  dateTo,
  overviewContent,
}: {
  slug: string;
  allTrades: Record<string, TradeRow[]>;
  barsSlug: string;
  eventName: string;
  releaseTime?: string;
  dateFrom: string;
  dateTo: string;
  overviewContent: React.ReactNode;
}) {
  const { asset } = useAsset();
  const assetKey = asset as string;

  const stopGrid = STOP_GRIDS[assetKey] ?? STOP_GRIDS.nq;
  const tpGrid = TP_GRIDS[assetKey] ?? TP_GRIDS.nq;

  const trades = allTrades[assetKey] ?? [];

  // Compute lifetime PF per (stop × tp) combo from all trades (both sides)
  const comboPfMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const stop of stopGrid) {
      for (const tp of tpGrid) {
        const filtered = trades.filter(
          (t) => t.x_stop === stop && t.y_tp === tp
        );
        const wins = filtered.filter((t) => t.pnl_pts > 0);
        const losses = filtered.filter((t) => t.pnl_pts < 0);
        const grossW = wins.reduce((s, t) => s + t.pnl_pts, 0);
        const grossL = Math.abs(losses.reduce((s, t) => s + t.pnl_pts, 0));
        const pf = grossL > 0 ? grossW / grossL : grossW > 0 ? 99 : 0;
        map.set(`${formatNum(stop)}|${formatNum(tp)}`, pf);
      }
    }
    return map;
  }, [trades, stopGrid, tpGrid]);

  const filterBarOverride = useMemo(() => {
    // Surviving stop values: at least one tp partner makes PF >= MIN_DISPLAY_PF
    const survivingStops = stopGrid.filter((stop) =>
      tpGrid.some((tp) => (comboPfMap.get(`${formatNum(stop)}|${formatNum(tp)}`) ?? 0) >= MIN_DISPLAY_PF)
    );
    // Surviving tp values: at least one stop partner makes PF >= MIN_DISPLAY_PF
    const survivingTps = tpGrid.filter((tp) =>
      stopGrid.some((stop) => (comboPfMap.get(`${formatNum(stop)}|${formatNum(tp)}`) ?? 0) >= MIN_DISPLAY_PF)
    );
    // Fall back to full grid if nothing survives (safety: should not happen per spec)
    const vOpts = (survivingStops.length > 0 ? survivingStops : stopGrid).map((v) => ({ key: formatNum(v), label: formatNum(v) }));
    const tOpts = (survivingTps.length > 0 ? survivingTps : tpGrid).map((v) => ({ key: formatNum(v), label: formatNum(v) }));
    // Best default: combo with highest PF among survivors
    let bestStop = survivingStops[0] ?? stopGrid[0];
    let bestTp = survivingTps[0] ?? tpGrid[0];
    let bestPf = -1;
    for (const stop of (survivingStops.length > 0 ? survivingStops : stopGrid)) {
      for (const tp of (survivingTps.length > 0 ? survivingTps : tpGrid)) {
        const pf = comboPfMap.get(`${formatNum(stop)}|${formatNum(tp)}`) ?? 0;
        if (pf > bestPf) { bestPf = pf; bestStop = stop; bestTp = tp; }
      }
    }
    return {
      variantOptions: vOpts,
      tpOptions: tOpts,
      smtOptions: SIDE_OPTS,
      variantLabel: 'Stop',
      tpLabel: 'TP',
      smtLabel: 'Side',
      defaultVariant: formatNum(bestStop),
      defaultSmt: 'both',
      defaultTp: formatNum(bestTp),
    };
  }, [stopGrid, tpGrid, comboPfMap]);

  const initialBreakdown = useMemo(() => computeWeekdayBreakdown(trades), [trades]);
  const initialYearBreakdown = useMemo(() => computeYearBreakdown(trades), [trades]);

  const assetLabel = ASSET_LABEL[assetKey] ?? assetKey.toUpperCase();

  return (
    <>
      <h1 className="v3-sub-h1">
        <span className="v3-sub-ev">{eventName}</span>
        {' · Straddle'}
      </h1>
      <p className="v3-sub-sub">
        {assetLabel} futures · {releaseTime ?? '8:30 ET'} release · {dateFrom}–{dateTo} backtest
        {trades.length > 0 ? ` · ${new Set(trades.map((t) => t.ts.slice(0, 10))).size} events` : ''}
      </p>
      <Suspense fallback={<div className="v3-tabs" style={{ height: 48 }} />}>
        <V3Tabs
          slug={slug}
          breakdown={initialBreakdown}
          yearBreakdown={initialYearBreakdown}
          trades={trades}
          tradesByVariant={null}
          tradesByVariantOff={null}
          statsByVariant={null}
          statsByVariantAndSmt={null}
          dateFrom={dateFrom}
          dateTo={dateTo}
          overviewContent={overviewContent}
          eventShort={eventName}
          asset={(assetKey as 'nq' | 'gc' | 'es' | 'si' | 'ym')}
          filterBarOverride={filterBarOverride}
          barsSlug={barsSlug}
          flat={true}
        />
      </Suspense>
    </>
  );
}
