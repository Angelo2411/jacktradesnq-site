'use client';

import { useAsset, type AssetKey } from '../_components/AssetContext';

type Asset = {
  key: AssetKey;
  label: string;
  ticker: string;
  eyebrow: string;
  headlineA: string;
  headlineEm: string;
  headlineB: string;
  sub: string;
  metrics: { label: string; value: string; foot: string }[];
  dot: string;
};

const ASSETS: Asset[] = [
  {
    key: 'nq',
    label: 'Nasdaq',
    ticker: 'NQ',
    eyebrow: 'Equity index · CME',
    headlineA: 'The',
    headlineEm: 'Nasdaq',
    headlineB: 'tape — chill, fast, mean.',
    sub:
      'Most of the backtests on this site live on NQ. Warm yellow stays — it is the house tone for the index book.',
    metrics: [
      { label: 'Studies live', value: '08', foot: 'IB / news / killzone' },
      { label: 'Best edge', value: 'PF 2.41', foot: 'Stacked EMA v3, 10y' },
      { label: 'Sample', value: '3.46M', foot: 'M1 bars, 2016 → 2026' },
    ],
    dot: 'oklch(0.86 0.16 95)',
  },
  {
    key: 'gc',
    label: 'Gold',
    ticker: 'GC',
    eyebrow: 'Precious metal · COMEX',
    headlineA: 'Gold',
    headlineEm: 'runs',
    headlineB: 'on a deeper, slower pulse.',
    sub:
      'Same models, different temperament. The accent leans into saturated gold to mark the switch — still warm-editorial, just richer.',
    metrics: [
      { label: 'Studies live', value: '02', foot: 'IB50 + news 8:30' },
      { label: 'Best edge', value: 'PF 1.92', foot: 'GC IB50 NY AM, 10y' },
      { label: 'Sample', value: '133K', foot: 'M1 bars, Databento pull' },
    ],
    dot: 'oklch(0.74 0.16 78)',
  },
];

export default function MetalsVibePage() {
  const { asset: active, setAsset: setActive } = useAsset();
  const asset = ASSETS.find((a) => a.key === active)!;

  return (
    <div className="bd-asset-scope" data-asset={active}>
      <div className="bd-asset-topbar">
        <div
          className="bd-asset-switch"
          role="tablist"
          aria-label="Asset selector"
        >
          {ASSETS.map((a, i) => (
            <button
              key={a.key}
              role="tab"
              type="button"
              aria-selected={active === a.key}
              onClick={() => setActive(a.key)}
              className="bd-asset-switch-btn"
              style={{ ['--btn-dot' as string]: a.dot }}
            >
              {a.label}
              {i === 0 ? <span className="bd-asset-switch-sep" aria-hidden="true">/</span> : null}
            </button>
          ))}
        </div>
      </div>

      <header className="bd-hub-head">
        <span className="bd-meta">Demo · vibe shifter</span>
        <h1 className="bd-h1" style={{ marginTop: 8 }}>
          Asset accents<span className="bd-dot">.</span>
        </h1>
        <p className="bd-hub-sub">
          Same warm-editorial system, two temperatures. Switch between NQ and
          Gold — only the accent token moves, the structure stays.
        </p>
      </header>

      <div>
        <section className="bd-asset-stage" aria-live="polite">
          <div className="bd-asset-eyebrow">{asset.eyebrow}</div>
          <h2 className="bd-asset-headline">
            {asset.headlineA} <em>{asset.headlineEm}</em> {asset.headlineB}
          </h2>
          <p className="bd-asset-sub">{asset.sub}</p>

          <div className="bd-asset-rule" />

          <div className="bd-asset-metrics">
            {asset.metrics.map((m) => (
              <div key={m.label} className="bd-asset-metric">
                <div className="bd-asset-metric-label">{m.label}</div>
                <div className="bd-asset-metric-value">{m.value}</div>
                <div className="bd-asset-metric-foot">{m.foot}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
