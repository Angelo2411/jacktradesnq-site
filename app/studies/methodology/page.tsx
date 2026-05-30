export const metadata = {
  title: 'Methodology · jacktradesnq',
  description: 'Where the data comes from, how backtests are run, and what this site is not.',
};

export default function MethodologyPage() {
  return (
    <div className="v3-main">
      <div className="v3-hero-crumb">Methodology</div>
      <h1 className="v3-hero-h1">
        Methodology<span className="v3-hero-dot">.</span>
      </h1>
      <p className="v3-hero-sub">
        Transparency on data, backtests, and what these numbers are not.
      </p>

      <hr className="v3-divider" />

      <section className="v3-doc-section">
        <h2 className="v3-doc-h2">Where the data comes from</h2>
        <p className="v3-doc-p">
          All charts and backtests use <strong>1-minute OHLCV bars</strong> from
          <a className="v3-doc-link" href="https://databento.com" target="_blank" rel="noopener noreferrer"> Databento</a>,
          covering 10 years of continuous futures (NQ and GC) from
          2016 through 2026. Bars are forward-filled across illiquid sessions
          (Asian hours on GC, holidays) to keep timestamps consistent for
          event-driven studies.
        </p>
        <p className="v3-doc-p">
          We do not use tick data — we explicitly trade off resolution for cost
          and storage. For sub-minute precision (e.g. spread captures around an
          8:30 release) the numbers here are a fair approximation, not a
          microsecond-accurate replay.
        </p>
      </section>

      <section className="v3-doc-section">
        <h2 className="v3-doc-h2">How backtests are run</h2>
        <p className="v3-doc-p">
          Every study runs through the same Python engine: a setup is encoded
          as a rule-based entry trigger, with optional confirmation filters, a
          fixed stop, and a target-management variant. The exact logic of
          each setup lives on its own page — this is a generic methodology
          note, not a description of any single edge.
        </p>
        <p className="v3-doc-p">
          For every study we explore a small grid of parameter variants and
          surface the one with the highest profit factor on the full sample.
          Trade-by-trade logs are stored as JSON, so the weekday and year
          breakdowns you see are recomputed from the underlying ledger — not
          from a pre-rounded summary.
        </p>
        <p className="v3-doc-p">
          Backtests are AI-assisted: the engine is human-written, the
          orchestration and the per-study analysis prose are drafted with the
          help of LLMs and then reviewed before publishing.
        </p>
      </section>

      <section className="v3-doc-section">
        <h2 className="v3-doc-h2">What this is not</h2>
        <ul className="v3-doc-ul">
          <li>
            <strong>Not financial advice.</strong> Every page here is a research
            note. Sample sizes are often small (N&lt;30 on rare events) and
            backtests overstate edge if you ignore slippage, fills, and the
            mental cost of holding losers.
          </li>
          <li>
            <strong>Past performance ≠ future results.</strong> A setup that
            printed +320 pts over 10 years can spend its next 18 months in
            drawdown without breaking statistical assumptions.
          </li>
          <li>
            <strong>No live signals, no alerts.</strong> Nothing on this site
            tells you what to do at 08:30 ET. The Calendar tab shows
            historically profitable setups for each weekday; reading it is not
            the same as taking a trade.
          </li>
          <li>
            <strong>Re-verify before risking capital.</strong> If a study
            matters for your decision, replay it yourself in TradingView or
            your own backtester before sizing into it.
          </li>
        </ul>
      </section>

      <section className="v3-doc-section">
        <p className="v3-doc-p v3-doc-foot">
          Have a question on a specific study or want the raw trade log?
          Reach out on <a className="v3-doc-link" href="https://x.com/jacktradesnq" target="_blank" rel="noopener noreferrer">X (@jacktradesnq)</a>.
        </p>
      </section>
    </div>
  );
}
