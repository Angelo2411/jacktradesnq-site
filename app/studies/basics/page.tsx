import { CONCEPTS } from '@/lib/terminology';

export const metadata = {
  title: 'Basics · jacktradesnq',
  description: 'Plain-language guide to reading these trading studies.',
};

export default function BasicsPage() {
  return (
    <div className="v3-main">
      <div className="v3-hero-crumb">Basics</div>
      <h1 className="v3-hero-h1">
        Basics<span className="v3-hero-dot">.</span>
      </h1>
      <p className="v3-hero-sub">
        New to this? Read this first — what the numbers mean and how to read a study.
      </p>

      <hr className="v3-divider" />

      <section className="v3-doc-section">
        <h2 className="v3-doc-h2">How to read a study</h2>
        <p className="v3-doc-p">
          Every study card has four headline stats. Here&rsquo;s what they mean in plain language:
        </p>
        <p className="v3-doc-p">
          <strong>Win rate</strong> — What percentage of trades ended in profit.
          A 60% win rate means 6 out of 10 trades made money.
        </p>
        <p className="v3-doc-p">
          <strong>Profit factor (PF)</strong> — How many dollars you won for every $1 lost.
          A PF above 1.0 means the setup is profitable overall. A PF of 2.0 means it won
          twice what it lost. Below 1.0 means it loses money. Higher is better, but
          always check the trade count too.
        </p>
        <p className="v3-doc-p">
          <strong>Trades</strong> — How many times the setup actually triggered over the
          test window. This is your sample size: more trades = more reliable. A setup
          with 20 trades and a PF of 3.0 is far less trustworthy than one with 200 trades
          and a PF of 1.6.
        </p>
        <p className="v3-doc-p">
          <strong>Net result</strong> — Total points gained or lost over the whole test
          window. This tells you the raw &ldquo;did it make money&rdquo; answer, before
          any compounding or position sizing.
        </p>
        <p className="v3-doc-p">
          We only keep setups that still work in the recent regime (2024+). A setup
          that worked years ago but is dead now gets removed — you won&rsquo;t see it
          here.
        </p>
      </section>

      <section className="v3-doc-section">
        <h2 className="v3-doc-h2">Variants</h2>
        <p className="v3-doc-p">
          A study tests a few parameter variants — different take-profit rules, different
          break-even rules, or slight entry-timing tweaks. We surface the best variant
          by profit factor. The idea is simple: the setup definition matters less than
          finding the parameter combination that actually held up.
        </p>
      </section>

      <section className="v3-doc-section">
        <h2 className="v3-doc-h2">The setups in plain English</h2>
        <p className="v3-doc-p">
          Trading jargon is a wall. Here&rsquo;s what each concept actually means:
        </p>
        <p className="v3-doc-p">
          <strong>IFVG (Inverse Fair Value Gap)</strong> — A price gap that got filled
          and then flipped into support or resistance. The market ran through an old gap
          and is now treating it as the opposite level.
        </p>
        <p className="v3-doc-p">
          <strong>SMT Divergence</strong> — Two related markets (like NQ and ES) disagree
          on direction. One makes a higher high while the other doesn&rsquo;t. ICT
          traders treat that disagreement as a reversal signal.
        </p>
        <p className="v3-doc-p">
          <strong>Straddle</strong> — Bracketing both sides of a news release. You
          enter in whichever direction fires after the number drops. If it rips up,
          you&rsquo;re long. If it dumps, you&rsquo;re short.
        </p>
        <p className="v3-doc-p">
          <strong>Killzone</strong> — A high-activity trading window during the session,
          like the London or New York open. ICT traders treat these as the most liquid
          and predictable hours to trade.
        </p>
        <p className="v3-doc-p">
          <strong>IB50 (Initial Balance 50%)</strong> — An entry at the 50% retracement
          of the session&rsquo;s first range. The idea is price will revisit the midpoint
          of its opening swing before continuing.
        </p>
        <p className="v3-doc-p">
          <strong>FVG (Fair Value Gap)</strong> — A price imbalance left by a fast
          move: three candles where the wicks don&rsquo;t overlap. Markets often
          revisit these gaps to &ldquo;fill&rdquo; them.
        </p>
        <p className="v3-doc-p">
          <strong>NWOG (New Week Opening Gap)</strong> — The gap between Friday&rsquo;s
          close and Sunday&rsquo;s open. Some setups use this as a magnet level for the
          early-week price action.
        </p>
        <p className="v3-doc-p">
          <strong>BE / SL / TP</strong> — Break Even (moving your stop to entry price
          so you can&rsquo;t lose), Stop Loss (the level that closes a losing trade),
          Take Profit (the target where you close a winning trade). These are the three
          exit points every trade has.
        </p>
      </section>

      <section className="v3-doc-section">
        <h2 className="v3-doc-h2">What this is / isn&rsquo;t</h2>
        <p className="v3-doc-p">
          This is a collection of educational backtests on 1-minute futures data. It is
          not trading signals, not financial advice, and not a roadmap for what to do
          at the next 8:30&nbsp;AM data release (when most US economic numbers drop).
          Every figure here is a rear-view mirror — past performance does not
          guarantee future results. Always re-verify before risking money.
        </p>
        <p className="v3-doc-p">
          <a className="v3-doc-link" href="/studies/methodology/">Methodology →</a>
        </p>
      </section>
    </div>
  );
}
