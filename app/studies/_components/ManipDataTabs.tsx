'use client';

import { useState } from 'react';
import { useAsset, type AssetKey } from './AssetContext';
import AssetPills from './AssetPills';
import ManipExampleChart, { type ManipExample } from './ManipExampleChart';

// ── data JSON shape (manip930-distribution-cont{,-asset}.json) ─────────

interface ContByYear { year: number; n: number; continuation_rate: number; }
interface ContRegime { n_days: number; continuation_rate: number; }

export interface ContDataFile {
  meta: {
    asset: string;
    window1: string;
    window2: string;
    dateFrom: string;
    dateTo: string;
    n_days: number;
    point_value_usd: number;
  };
  continuation: {
    continuation_rate: number;
    reversal_rate: number;
    avg_move1: number;
    avg_move2: number;
    avg_move2_continuation: number;
    avg_move2_reversal: number;
    by_year: ContByYear[];
    by_regime: Record<string, ContRegime>;
    manip: {
      n_days: number;
      continuation_rate: number;
    };
  };
}

// ── helpers ────────────────────────────────────────────────────────────


const REGIME_LABELS: Record<string, string> = {
  full: 'Full period',
  '2024+': '2024+',
  '2025+': '2025+',
  '2026': '2026',
};

const REGIME_ORDER = ['2025+', '2026', '2024+', 'full'];

function continuationFootnote(rate: number): string {
  if (rate > 53) return 'leans continuation';
  if (rate >= 47) return '≈ coin-flip';
  return 'leans reversal';
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
  allData: Record<AssetKey, ContDataFile>;
  overviewContent: React.ReactNode;
  examplesByAsset?: Partial<Record<AssetKey, ManipExample[]>>;
}) {
  const { asset } = useAsset();
  // compact switcher (edgeful-style): data-first chips, prose/method demoted
  const [sec, setSec] = useState<'by_regime' | 'by_year' | 'examples'>('by_regime');
  const [notesOpen, setNotesOpen] = useState(false);

  const data = allData[asset];

  if (!data) {
    return <div className="v3-coming-soon">No data available for this asset.</div>;
  }

  const m = data.meta;
  const c = data.continuation;

  // ── recent regime computation ─────────────────────────────────────────

  const regime2025p = c.by_regime['2025+'];
  const has2025 = regime2025p && regime2025p.n_days > 0;

  const recentKey = has2025 ? '2025+' : '2024+';
  const recentRegime = c.by_regime[recentKey];
  const recentContRate = recentRegime && recentRegime.n_days > 0 ? recentRegime.continuation_rate : c.continuation_rate;

  const recentLabel = has2025 ? '2025–26' : '2024';
  const lastYear = m.dateTo.slice(0, 4);

  // ── KPI band ──────────────────────────────────────────────────────────

  const kpiBand = (
    <>
      <div className="manip-data-kpi-band">
        <div className="v3-kpi-cell">
          <div className="v3-kpi-band-lbl">Continuation ({recentLabel})</div>
          <div className="v3-kpi-band-val gold">{recentContRate.toFixed(1)}%</div>
          <div className="v3-kpi-band-foot">
            {continuationFootnote(recentContRate)}{continuationFootnote(recentContRate) ? ' · ' : ''}10-yr: {c.continuation_rate.toFixed(1)}%
          </div>
        </div>
        <div className="v3-kpi-cell">
          <div className="v3-kpi-band-lbl">Reversal ({recentLabel})</div>
          <div className="v3-kpi-band-val">{(100 - recentContRate).toFixed(1)}%</div>
          <div className="v3-kpi-band-foot">{c.continuation_rate > 50 ? '09:30 direction reverses ~' + c.reversal_rate.toFixed(0) + '% of the time' : 'continues ~' + c.continuation_rate.toFixed(0) + '%'}</div>
        </div>
        <div className="v3-kpi-cell">
          <div className="v3-kpi-band-lbl">Avg 2nd-hour move ({recentLabel})</div>
          <div className="v3-kpi-band-val">{c.avg_move2 >= 0 ? '+' : ''}{c.avg_move2.toFixed(1)} pts</div>
          <div className="v3-kpi-band-foot">10:00–11:00 net, signed</div>
        </div>
        <div className="v3-kpi-cell">
          <div className="v3-kpi-band-lbl">On sweep days</div>
          <div className="v3-kpi-band-val">{c.manip.continuation_rate.toFixed(1)}%</div>
          <div className="v3-kpi-band-foot">when 09:30 swept a key level — {c.manip.n_days} days</div>
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
        Recent regime ({recentLabel}) shown. Full 2016–{lastYear} below.
      </p>
    </>
  );

  // ── By year tab ───────────────────────────────────────────────────────

  const byYearTab = (
    <div>
      <div className="v3-wd-h">By year</div>
      <div className="v3-wd-sub">{m.asset} · continuation rate per calendar year</div>
      <div className="v3-yr-table-wrap">
        <table className="v3-yr-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>N</th>
              <th>Continuation %</th>
              <th style={{ width: '35%' }}></th>
            </tr>
          </thead>
          <tbody>
            {c.by_year.map((y) => {
              const lean = y.continuation_rate >= 53 ? 'gold' : y.continuation_rate <= 47 ? 'terra' : '';
              return (
                <tr key={y.year} className="v3-yr-row">
                  <td className="v3-yr-year">{y.year}</td>
                  <td className="v3-yr-num">{y.n}</td>
                  <td className={`v3-yr-num ${lean}`}>{y.continuation_rate.toFixed(1)}%</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', height: 20, minWidth: 80 }}>
                      <div style={{
                        height: 8,
                        width: pctBar(y.continuation_rate, 100),
                        background: y.continuation_rate >= 53 ? 'var(--c-accent-deep)' : y.continuation_rate <= 47 ? 'var(--c-terra)' : 'var(--c-muted)',
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
    </div>
  );

  // ── By regime tab ─────────────────────────────────────────────────────

  const byRegimeTab = (
    <div>
      <div className="v3-wd-h">By regime</div>
      <div className="v3-wd-sub">{m.asset} · continuation vs reversal by regime window</div>
      <div className="v3-yr-table-wrap">
        <table className="v3-yr-table">
          <thead>
            <tr>
              <th>Regime</th>
              <th>N</th>
              <th>Continuation %</th>
              <th>Reversal %</th>
            </tr>
          </thead>
          <tbody>
            {REGIME_ORDER.map((key) => {
              const r = c.by_regime[key];
              if (!r) return null;
              const isRecent = key === '2025+' || key === '2026';
              const isFull = key === 'full';
              const hasData = r.n_days > 0;
              const rowClass = 'v3-yr-row' +
                (isFull ? ' total' : '') +
                (isRecent && hasData ? ' selected' : '');
              return (
                <tr key={key} className={rowClass}>
                  <td className="v3-yr-year" style={isRecent && hasData ? { color: 'var(--c-accent-deep)', fontWeight: 700 } : isFull ? { color: 'var(--c-muted)' } : undefined}>
                    {REGIME_LABELS[key]}
                    {isRecent && hasData ? ' ⬤' : ''}
                  </td>
                  <td className="v3-yr-num" style={isFull ? { color: 'var(--c-muted)' } : undefined}>{hasData ? r.n_days : '—'}</td>
                  <td className="v3-yr-num" style={isFull ? { color: 'var(--c-muted)' } : undefined}>{hasData ? `${r.continuation_rate.toFixed(1)}%` : '— no data'}</td>
                  <td className="v3-yr-num" style={isFull ? { color: 'var(--c-muted)' } : undefined}>{hasData ? `${(100 - r.continuation_rate).toFixed(1)}%` : '— no data'}</td>
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
        {m.asset} · selected 09:30–10:00 → 10:00–11:00 days with intraday price action
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
      <h2>Direction definition</h2>
      <p>
        The direction of the <strong>09:30–10:00 ET</strong> window is the sign of
        <code> close(09:59) − open(09:30)</code>. The direction of the
        <strong> 10:00–11:00 ET</strong> window is the sign of
        <code> close(10:59) − open(10:00)</code>.
      </p>
      <h2>Continuation vs reversal</h2>
      <p>
        A <strong>continuation</strong> occurs when both windows have the same sign — the 10:00–11:00
        hour moves in the same direction as the 09:30–10:00 hour. A <strong>reversal</strong> occurs
        when the signs differ — the second hour reverses the direction established in the first.
      </p>
      <h2>Sweep days</h2>
      <p>
        A "sweep day" is defined as any day where price sweeps a key reference level (PDH, PDL, PMH,
        PML, Asia High, Asia Low) during 09:30–10:00 and immediately rejects back inside the range.
        Continuation rate on these days measures whether the 10:00–11:00 window continues the
        post-sweep direction — the direction implied by the false breakout.
      </p>
      <h2>Important</h2>
      <p>
        This is an <strong>observational study</strong>, not a trading strategy. There are no entries,
        stop-losses, or profit targets. The purpose is to measure whether the 10:00–11:00 hour
        systematically continues or reverses the direction established by 09:30–10:00 — and whether
        that behavior is predictive or random.
      </p>
      <h2>Limitations</h2>
      <p>
        Direction is defined mechanically based on open and close within each window. Slippage,
        commissions, and order-book depth are not modeled. Past market behavior does not predict
        future behavior — microstructure evolves, and patterns observed in historical data may not
        persist.
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
        9:30–10:00 → 10:00–11:00: Continuation or Reversal?
      </h1>
      <p className="v3-sub-sub">
        {m.asset} futures · does the 10:00–11:00 hour continue or reverse the 09:30–10:00 move? · {m.n_days} days
      </p>

      {kpiBand}

      <div className="v3-flat-chips">
        <button type="button" className={'v3-flat-chip' + (sec === 'by_regime' ? ' active' : '')} onClick={() => setSec('by_regime')}>By regime</button>
        <button type="button" className={'v3-flat-chip' + (sec === 'by_year' ? ' active' : '')} onClick={() => setSec('by_year')}>By year</button>
        <button type="button" className={'v3-flat-chip' + (sec === 'examples' ? ' active' : '')} onClick={() => setSec('examples')}>Examples</button>
      </div>

      <div className="fb-animated">
        {sec === 'by_year' ? byYearTab : sec === 'examples' ? examplesTab : byRegimeTab}

        <div className="v3-flat-secondary">
          <button type="button" className="v3-flat-sec-link" onClick={() => setNotesOpen((v) => !v)}>
            {notesOpen ? 'Hide notes' : 'Notes'}
          </button>
          <button type="button" className="v3-flat-sec-link" onClick={() => setNotesOpen((v) => !v)}>Methodology</button>
        </div>
        {notesOpen && (
          <div className="v3-prose v3-flat-notes-body">
            {overviewContent}
            {methodologyTab}
          </div>
        )}
      </div>
    </>
  );
}
