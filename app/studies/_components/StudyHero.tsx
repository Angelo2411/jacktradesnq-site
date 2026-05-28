// StudyHero — server component (prototype: nfp-ifvg-smt)
// Report-first fold: one dominant headline number + plain-language verdict + supporting micro-stats.
// Editorial dark + single gold accent (no edgeful copy). Fed by getStrategyStats values.

interface MicroStat {
  label: string;
  value: string;
  tone?: 'pos' | 'neutral';
}

interface Props {
  eyebrow: string;
  value: string;
  valueLabel: string;
  valueSub: string;
  verdict: string;
  micro: MicroStat[];
}

export default function StudyHero({ eyebrow, value, valueLabel, valueSub, verdict, micro }: Props) {
  return (
    <section className="sh-hero" aria-label="Study headline">
      <p className="sh-eyebrow">{eyebrow}</p>
      <div className="sh-body">
        <div className="sh-numblock">
          <span className="sh-num">{value}</span>
          <span className="sh-numside">
            <span className="sh-numlabel">{valueLabel}</span>
            <span className="sh-numsub">{valueSub}</span>
          </span>
        </div>
        <div className="sh-right">
          <p className="sh-verdict">{verdict}</p>
          <dl className="sh-micro">
            {micro.map((m) => (
              <div className="sh-micro-item" key={m.label}>
                <dt className="sh-micro-lbl">{m.label}</dt>
                <dd className={`sh-micro-val${m.tone === 'pos' ? ' pos' : ''}`}>{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
