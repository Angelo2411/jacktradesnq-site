'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAsset, type AssetKey } from './AssetContext';
import AssetPills from './AssetPills';
import ManipExampleChart, { type ManipExample } from './ManipExampleChart';

// ── data JSON shape (manip930-distribution-data{,-asset}.json) ────────

interface ManipByLevel { level: string; n: number; pct: number; }
interface DirStat { n: number; pct: number; }
interface ManipByYear { year: number; n_days: number; manip_days: number; manip_rate_pct: number; }
interface DistByYear { year: number; n: number; follow_through_rate_pct: number; avg_move_pts: number; }
interface DistRegime { n: number; follow_through_rate_pct: number; avg_move_pts: number; }

export interface ManipDataFile {
  meta: {
    asset: string;
    window_manip: string;
    window_distrib: string;
    dateFrom: string;
    dateTo: string;
    n_days: number;
    point_value_usd: number;
  };
  manipulation: {
    total_manip_days: number;
    manip_rate_pct: number;
    by_level: ManipByLevel[];
    by_direction: { up_manip: DirStat; down_manip: DirStat };
    by_year: ManipByYear[];
  };
  distribution: {
    follow_through_rate_pct: number;
    avg_move_pts: number;
    median_move_pts: number;
    avg_mfe_pts: number;
    by_year: DistByYear[];
    by_regime: Record<string, DistRegime>;
  };
}

// ── helpers ────────────────────────────────────────────────────────────

type TabKey = 'overview' | 'manipulation' | 'distribution' | 'examples' | 'methodology';

const TAB_LIST: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'manipulation', label: 'Manipulation' },
  { key: 'distribution', label: 'Distribution' },
  { key: 'examples', label: 'Examples' },
  { key: 'methodology', label: 'Methodology' },
];

const REGIME_LABELS: Record<string, string> = {
  full: 'Full period',
  '2024+': '2024+',
  '2025+': '2025+',
  '2026': '2026',
};

const REGIME_ORDER = ['2025+', '2026', '2024+', 'full'];

const LEVEL_ORDER = ['PDH', 'PDL', 'PMH', 'PML', 'AsiaHi', 'AsiaLo'];

function coinFlipFootnote(rate: number): string {
  if (rate >= 47 && rate <= 53) return '≈ coin-flip — no directional edge';
  return '';
}

function pctBar(pct: number, max: number): string {
  return `${Math.max(3, (pct / max) * 100)}%`;
}

// ── component ──────────────────────────────────────────────────────────

export default function ManipDataTabs({
  allData,
  overviewContent,
  examplesByAsset,
}: {
  allData: Record<AssetKey, ManipDataFile>;
  overviewContent: React.ReactNode;
  examplesByAsset?: Partial<Record<AssetKey, ManipExample[]>>;
}) {
  const { asset } = useAsset();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tab = (searchParams.get('tab') ?? 'overview') as TabKey;
  const activeTab: TabKey = TAB_LIST.some((t) => t.key === tab) ? tab : 'overview';

  const data = allData[asset];

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

  if (!data) {
    return <div className="v3-coming-soon">No data available for this asset.</div>;
  }

  const m = data.meta;
  const manip = data.manipulation;
  const dist = data.distribution;

  // ── recent regime computation ─────────────────────────────────────────

  function computeRecentRegime() {
    const has2025 = manip.by_year.some((y) => y.year >= 2025);
    const baseYear = has2025 ? 2025 : 2024;
    const recentYears = manip.by_year.filter((y) => y.year >= baseYear);
    const totalDays = recentYears.reduce((s, y) => s + y.n_days, 0);
    const totalManip = recentYears.reduce((s, y) => s + y.manip_days, 0);
    const recentManipRate = totalDays > 0 ? (totalManip / totalDays) * 100 : 0;

    const regimeKey = has2025 ? '2025+' : '2024+';
    const regime = dist.by_regime[regimeKey];
    const recentFollowThrough = regime && regime.n > 0 ? regime.follow_through_rate_pct : 0;
    const recentAvgMove = regime && regime.n > 0 ? regime.avg_move_pts : 0;

    const recentLabel = has2025 ? '2025–26' : '2024';
    const lastYear = m.dateTo.slice(0, 4);

    return {
      recentManipRate,
      recentFollowThrough,
      recentAvgMove,
      recentLabel,
      lastYear,
    };
  }

  const recent = computeRecentRegime();

  // ── KPI band ──────────────────────────────────────────────────────────

  const kpiBand = (
    <>
      <div className="manip-data-kpi-band">
        <div className="v3-kpi-cell">
          <div className="v3-kpi-band-lbl">Manipulation rate ({recent.recentLabel})</div>
          <div className="v3-kpi-band-val gold">{recent.recentManipRate.toFixed(1)}%</div>
          <div className="v3-kpi-band-foot">10-yr: {manip.manip_rate_pct.toFixed(1)}%</div>
        </div>
        <div className="v3-kpi-cell">
          <div className="v3-kpi-band-lbl">Distribution follow-through ({recent.recentLabel})</div>
          <div className="v3-kpi-band-val">{recent.recentFollowThrough.toFixed(1)}%</div>
          <div className="v3-kpi-band-foot">
            {coinFlipFootnote(recent.recentFollowThrough)}{coinFlipFootnote(recent.recentFollowThrough) ? ' · ' : ''}10-yr: {dist.follow_through_rate_pct.toFixed(1)}%
          </div>
        </div>
        <div className="v3-kpi-cell">
          <div className="v3-kpi-band-lbl">Avg distribution move ({recent.recentLabel})</div>
          <div className="v3-kpi-band-val">{recent.recentAvgMove >= 0 ? '+' : ''}{recent.recentAvgMove.toFixed(1)} pts</div>
          <div className="v3-kpi-band-foot">post-sweep, ~flat</div>
        </div>
        <div className="v3-kpi-cell">
          <div className="v3-kpi-band-lbl">Avg fav. excursion</div>
          <div className="v3-kpi-band-val">{dist.avg_mfe_pts.toFixed(1)} pts</div>
          <div className="v3-kpi-band-foot">MFE within 10:00–11:00 ET</div>
        </div>
      </div>
      <p style={{
        fontFamily: 'var(--f-mono)',
        fontSize: '0.75rem',
        color: 'var(--c-muted)',
        marginTop: 6,
        marginBottom: 0,
        textAlign: 'center',
      }}>
        Figures shown are the recent regime ({recent.recentLabel}). Full 2016–{recent.lastYear} below.
      </p>
    </>
  );

  // ── Manipulation tab ──────────────────────────────────────────────────

  const levelMaxPct = Math.max(...manip.by_level.map((l) => l.pct), 1);

  const manipulationTab = (
    <div>
      <div className="v3-wd-h">By level</div>
      <div className="v3-wd-sub">{m.asset} · which levels get swept 09:30–10:00 ET</div>
      <div className="v3-yr-table-wrap">
        <table className="v3-yr-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>N</th>
              <th>% of manip days</th>
              <th style={{ width: '35%' }}></th>
            </tr>
          </thead>
          <tbody>
            {LEVEL_ORDER.map((level) => {
              const row = manip.by_level.find((l) => l.level === level);
              if (!row) return null;
              return (
                <tr key={level} className="v3-yr-row">
                  <td className="v3-yr-year">{level}</td>
                  <td className="v3-yr-num">{row.n}</td>
                  <td className="v3-yr-num gold">{row.pct.toFixed(1)}%</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', height: 20, minWidth: 80 }}>
                      <div style={{
                        height: 8,
                        width: pctBar(row.pct, levelMaxPct),
                        background: 'var(--c-accent-deep)',
                        borderRadius: 4,
                        minWidth: 3,
                        opacity: 0.6,
                      }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="v3-wd-h" style={{ marginTop: 40 }}>By direction</div>
      <div className="v3-wd-sub">{m.asset} · up_manip (sweep above → reject down) vs down_manip (sweep below → reject up)</div>
      <div className="v3-yr-table-wrap">
        <table className="v3-yr-table">
          <thead>
            <tr>
              <th>Direction</th>
              <th>N</th>
              <th>% of manip days</th>
            </tr>
          </thead>
          <tbody>
            <tr className="v3-yr-row">
              <td className="v3-yr-year" style={{ color: 'var(--c-terra)' }}>Up manip</td>
              <td className="v3-yr-num">{manip.by_direction.up_manip.n}</td>
              <td className="v3-yr-num">{manip.by_direction.up_manip.pct.toFixed(1)}%</td>
            </tr>
            <tr className="v3-yr-row">
              <td className="v3-yr-year" style={{ color: 'var(--c-sage)' }}>Down manip</td>
              <td className="v3-yr-num">{manip.by_direction.down_manip.n}</td>
              <td className="v3-yr-num">{manip.by_direction.down_manip.pct.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="v3-wd-h" style={{ marginTop: 40 }}>By year</div>
      <div className="v3-wd-sub">{m.asset} · manipulation frequency per calendar year</div>
      <div className="v3-yr-table-wrap">
        <table className="v3-yr-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Days</th>
              <th>Manip days</th>
              <th>Manip rate</th>
              <th style={{ width: '35%' }}></th>
            </tr>
          </thead>
          <tbody>
            {manip.by_year.map((y) => (
              <tr key={y.year} className="v3-yr-row">
                <td className="v3-yr-year">{y.year}</td>
                <td className="v3-yr-num">{y.n_days}</td>
                <td className="v3-yr-num">{y.manip_days}</td>
                <td className="v3-yr-num gold">{y.manip_rate_pct.toFixed(1)}%</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', height: 20, minWidth: 80 }}>
                    <div style={{
                      height: 8,
                      width: pctBar(y.manip_rate_pct, 100),
                      background: 'var(--c-accent-deep)',
                      borderRadius: 4,
                      minWidth: 3,
                      opacity: 0.6,
                    }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Distribution tab ──────────────────────────────────────────────────

  const distributionTab = (
    <div>
      <div className="v3-prose" style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', color: 'var(--c-muted)' }}>
          Recent regime ({recent.recentLabel}): follow-through ≈ {recent.recentFollowThrough.toFixed(0)}% — the distribution window does <strong>not</strong>
          {' '}systematically continue in the post-sweep direction. It is indistinguishable from a coin flip.
          The average move across all manipulation days is near zero ({recent.recentAvgMove >= 0 ? '+' : ''}{recent.recentAvgMove.toFixed(1)} pts).
          The full 10-year picture is the same: {dist.follow_through_rate_pct.toFixed(0)}% follow-through.
          This is an observational study of market behavior — <strong>not a tradable edge</strong>.
        </p>
      </div>

      <div className="v3-wd-h">By year</div>
      <div className="v3-wd-sub">{m.asset} · distribution follow-through and average move per calendar year</div>
      <div className="v3-yr-table-wrap">
        <table className="v3-yr-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>N</th>
              <th>Follow-through</th>
              <th>Avg move (pts)</th>
            </tr>
          </thead>
          <tbody>
            {dist.by_year.map((y) => (
              <tr key={y.year} className="v3-yr-row">
                <td className="v3-yr-year">{y.year}</td>
                <td className="v3-yr-num">{y.n}</td>
                <td className={'v3-yr-num' + (y.follow_through_rate_pct >= 55 ? ' sage' : y.follow_through_rate_pct <= 45 ? ' terra' : '')}>
                  {y.follow_through_rate_pct.toFixed(1)}%
                </td>
                <td className={'v3-yr-num' + (y.avg_move_pts > 0 ? ' sage' : y.avg_move_pts < 0 ? ' terra' : '')}>
                  {y.avg_move_pts >= 0 ? '+' : ''}{y.avg_move_pts.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="v3-wd-h" style={{ marginTop: 40 }}>By regime</div>
      <div className="v3-wd-sub">{m.asset} · distribution behavior aggregated by regime windows</div>
      <div className="v3-yr-table-wrap">
        <table className="v3-yr-table">
          <thead>
            <tr>
              <th>Regime</th>
              <th>N</th>
              <th>Follow-through</th>
              <th>Avg move (pts)</th>
            </tr>
          </thead>
          <tbody>
            {REGIME_ORDER.map((key) => {
              const r = dist.by_regime[key];
              if (!r) return null;
              const isRecent = key === '2025+' || key === '2026';
              const isFull = key === 'full';
              const hasData = r.n > 0;
              const rowClass = 'v3-yr-row' +
                (isFull ? ' total' : '') +
                (isRecent && hasData ? ' selected' : '');
              return (
                <tr key={key} className={rowClass}>
                  <td className="v3-yr-year" style={isRecent && hasData ? { color: 'var(--c-accent-deep)', fontWeight: 700 } : isFull ? { color: 'var(--c-muted)' } : undefined}>
                    {REGIME_LABELS[key]}
                    {isRecent && hasData ? ' ⬤' : ''}
                  </td>
                  <td className="v3-yr-num" style={isFull ? { color: 'var(--c-muted)' } : undefined}>{r.n > 0 ? r.n : '—'}</td>
                  <td className="v3-yr-num" style={isFull ? { color: 'var(--c-muted)' } : undefined}>{r.n > 0 ? `${r.follow_through_rate_pct.toFixed(1)}%` : '— no data'}</td>
                  <td className={'v3-yr-num' + (r.n > 0 && r.avg_move_pts > 0 ? ' sage' : r.n > 0 && r.avg_move_pts < 0 ? ' terra' : '') + (isFull ? '' : '')}>
                    {r.n > 0 ? `${r.avg_move_pts >= 0 ? '+' : ''}${r.avg_move_pts.toFixed(1)}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Examples tab ──────────────────────────────────────────────────────

  const examples = examplesByAsset?.[asset] ?? [];

  const examplesTab = (
    <div>
      <div className="v3-wd-h">Example illustrations</div>
      <div className="v3-wd-sub">
        {m.asset} · selected manipulation-distribution days with intraday price action
      </div>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {examples.slice(0, 3).map((ex, i) => (
          <ManipExampleChart key={`${ex.date}-${i}`} example={ex} />
        ))}
      </div>
    </div>
  );

  // ── Methodology tab ───────────────────────────────────────────────────

  const methodologyTab = (
    <div className="v3-prose">
      <h2>Manipulation detection</h2>
      <p>
        Each trading day between <strong>09:30 and 10:00 ET</strong>, the algorithm checks whether
        price sweeps a key reference level (PDH, PDL, PMH, PML, Asia High, Asia Low) and immediately
        rejects back inside the range. A sweep is defined as price exceeding the level by ≥1 tick and
        then closing back inside the range before 10:00 ET. This sweep-reject pattern is labeled
        a "manipulation" — a false breakout.
      </p>
      <h2>Distribution measurement</h2>
      <p>
        Between <strong>10:00 and 11:00 ET</strong>, the distribution window is measured.
        The direction is determined by the post-sweep rejection: if price swept a high and rejected,
        the distribution is measured to the downside. If price swept a low and rejected, distribution
        is measured to the upside. The close-to-close move from 10:00 to 11:00 ET in this direction
        is recorded — this is the "follow-through" move.
      </p>
      <h2>Important</h2>
      <p>
        This is an <strong>observational study</strong>, not a trading strategy. There are no entries,
        stop-losses, or profit targets. The purpose is to measure how often manipulation leads to
        directional follow-through — and whether that behavior is systematic or random.
      </p>
      <h2>Limitations</h2>
      <p>
        The definition of sweep and rejection is mechanical (≥1 tick beyond level, close-back within
        the manipulation window). Slippage, commissions, and order-book depth are not modeled. Past
        market behavior does not predict future behavior — microstructure evolves, and patterns
        observed in historical data may not persist.
      </p>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <AssetPills />
      </div>

      <h1 className="v3-sub-h1">
        <span className="v3-sub-ev">9:30 Manipulation</span>
        {' → 10:00 Distribution'}
      </h1>
      <p className="v3-sub-sub">
        {m.asset} futures · {m.window_manip} sweep → {m.window_distrib} · {m.dateFrom.slice(0, 4)}–{m.dateTo.slice(0, 4)} · {m.n_days} days
      </p>

      {kpiBand}

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
        <div className="v3-prose">{overviewContent}</div>
      )}

      {activeTab === 'manipulation' && manipulationTab}
      {activeTab === 'distribution' && distributionTab}
      {activeTab === 'examples' && examplesTab}
      {activeTab === 'methodology' && methodologyTab}
    </>
  );
}
