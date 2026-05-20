const DAYS = ['M', 'T', 'W', 'T', 'F'];

function barClass(wr: number): string {
  if (wr === 0) return 'bd-wd-bar--mute';
  if (wr >= 60) return 'bd-wd-bar--sage';
  if (wr >= 50) return 'bd-wd-bar--gold';
  return 'bd-wd-bar--terra';
}

export default function WeekdayBars({
  wr,
  n,
  asset,
}: {
  wr: number[];
  n: number[];
  asset?: string;
}) {
  const hasAnyData = n.some((v) => v > 0);
  if (!hasAnyData) return null;

  return (
    <div className="bd-wd-block">
      <div className="bd-wd-cap">
        <span>win rate · weekday</span>
        {asset && <span>{asset}</span>}
      </div>
      <div className="bd-wd-bars">
        {wr.map((w, i) => {
          const h = w > 0 ? Math.max(w, 8) : 4;
          return (
            <div key={i} className="bd-wd-bar-wrap">
              <span className="bd-wd-bar-pct">{w > 0 ? `${w}%` : '–'}</span>
              <div
                className={`bd-wd-bar ${barClass(w)}`}
                style={{ height: `${h}%` }}
                aria-label={`${DAYS[i]}: ${w > 0 ? `${w}% win rate` : 'no data'} (n=${n[i]})`}
              />
              <span className="bd-wd-bar-lbl">{DAYS[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
