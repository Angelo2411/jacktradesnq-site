// StudyHero — report-first data-viz fold (prototype: nfp-ifvg-smt)
// Edgeful-style: numbers exposed on a gauge + bars inside a dark card. Our gold/dark palette.
import type { CSSProperties } from 'react';

interface Props {
  title: string;
  meta: string;
  winRate: number;   // 0-100
  pf: string;
  net: string;       // already signed, e.g. "+906.5"
  netSub: string;    // e.g. "GC points · 2016–2026"
  bias: string;      // Long | Short | Both
}

export default function StudyHero({ title, meta, winRate, pf, net, netSub, bias }: Props) {
  const lossRate = Math.max(0, 100 - winRate);
  return (
    <section className="sh-card" aria-label="Study headline">
      <div className="sh-card-head">
        <span className="sh-card-title">{title}</span>
        <span className="sh-card-meta">{meta}</span>
      </div>

      <div className="sh-card-body">
        {/* Win-rate gauge */}
        <div className="sh-gauge">
          <div className="sh-gauge-ring" style={{ '--p': winRate } as CSSProperties}>
            <div className="sh-gauge-hole">
              <span className="sh-gauge-val">{winRate}<span className="sh-gauge-pct">%</span></span>
              <span className="sh-gauge-lbl">win rate</span>
            </div>
          </div>
        </div>

        {/* Headline numbers */}
        <div className="sh-bignums">
          <div className="sh-bn">
            <span className="sh-bn-val">{pf}</span>
            <span className="sh-bn-lbl">Profit factor</span>
            <span className="sh-bn-sub">${pf} won per $1 lost</span>
          </div>
          <div className="sh-bn">
            <span className={`sh-bn-val ${net.trim().startsWith('-') ? 'neg' : 'pos'}`}>{net}</span>
            <span className="sh-bn-lbl">Net result</span>
            <span className="sh-bn-sub">{netSub}</span>
          </div>
          <div className="sh-bn">
            <span className="sh-bn-val">{bias}</span>
            <span className="sh-bn-lbl">Bias</span>
            <span className="sh-bn-sub">direction of the edge</span>
          </div>
        </div>

        {/* Win / loss split bars */}
        <div className="sh-bars">
          <div className="sh-bar-col">
            <span className="sh-bar-pct">{winRate}%</span>
            <div className="sh-bar-track">
              <div className="sh-bar-fill win" style={{ height: `${winRate}%` }} />
            </div>
            <span className="sh-bar-name">wins</span>
          </div>
          <div className="sh-bar-col">
            <span className="sh-bar-pct">{lossRate}%</span>
            <div className="sh-bar-track">
              <div className="sh-bar-fill loss" style={{ height: `${lossRate}%` }} />
            </div>
            <span className="sh-bar-name">losses</span>
          </div>
        </div>
      </div>
    </section>
  );
}
