import type { YearBreakdown, YearStats } from './study-stats';

export function aggregateYearTotals(breakdown: YearBreakdown): YearStats {
  if (breakdown.length === 0) {
    return { year: 0, n: 0, w: 0, be: 0, l: 0, net: 0, wr: 0, bePct: 0, lPct: 0, pf: 0, avgWin: 0, avgLoss: 0, maxDD: 0 };
  }

  let n = 0, w = 0, be = 0, l = 0, net = 0;
  let winWeightSum = 0, lossWeightSum = 0;
  let minMaxDD = 0;

  for (const y of breakdown) {
    n += y.n;
    w += y.w;
    be += y.be;
    l += y.l;
    net += y.net;
    winWeightSum += y.avgWin * y.w;
    lossWeightSum += y.avgLoss * y.l;
    if (y.maxDD < minMaxDD) minMaxDD = y.maxDD;
  }

  const totalWinPts = winWeightSum;
  const totalLossPts = lossWeightSum;
  const pf = totalLossPts > 0 ? totalWinPts / totalLossPts : totalWinPts > 0 ? 99 : 0;

  return {
    year: 0,
    n,
    w,
    be,
    l,
    net: Math.round(net * 10) / 10,
    wr: n > 0 ? Math.round((w / n) * 100) : 0,
    bePct: n > 0 ? Math.round((be / n) * 100) : 0,
    lPct: n > 0 ? Math.round((l / n) * 100) : 0,
    pf: Math.round(pf * 100) / 100,
    avgWin: w > 0 ? Math.round((winWeightSum / w) * 10) / 10 : 0,
    avgLoss: l > 0 ? Math.round((lossWeightSum / l) * 10) / 10 : 0,
    maxDD: Math.round(minMaxDD * 10) / 10,
  };
}
