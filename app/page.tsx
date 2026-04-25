import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* ── NAV ── */}
      <nav className="nav">
        <a className="nav-logo" href="#hero">JTNQ</a>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#indicators">Indicators</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#socials">Socials</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <main>
        {/* ── HERO ── */}
        <section className="hero" id="hero">
          <h1 className="hero-wordmark">JTNQ</h1>
          <p className="hero-tag">
            <em>NQ futures trader.</em> Free indicators on TradingView, code on GitHub,
            daily takes on socials. Built for traders who learn by watching, not by listening.
          </p>
          <a
            className="hero-cta"
            href="https://www.tradingview.com/u/darkness2364167717/"
            target="_blank"
            rel="noopener noreferrer"
          >
            See the indicators
            <span className="hero-cta-arrow">→</span>
          </a>
        </section>

        {/* ── ABOUT ── */}
        <section className="section" id="about">
          <p className="section-eyebrow">About</p>
          <h2 className="section-title">Three things I do.</h2>
          <div className="about-grid">
            <div className="about-card">
              <span className="list-num">01</span>
              <h3 className="list-title">Trade</h3>
              <p className="list-meta">
                NQ futures, full-time. Mostly intraday. ICT-flavoured but not religious about it.
              </p>
            </div>
            <div className="about-card">
              <span className="list-num">02</span>
              <h3 className="list-title">Build</h3>
              <p className="list-meta">
                TradingView indicators (free), trading journals, side projects.
                All open-source on GitHub.
              </p>
            </div>
            <div className="about-card">
              <span className="list-num">03</span>
              <h3 className="list-title">Share</h3>
              <p className="list-meta">
                TikTok, YouTube, Instagram, X. Daily setups, breakdowns, the wins and the misses.
              </p>
            </div>
          </div>
        </section>

        {/* ── INDICATORS ── */}
        <section className="section" id="indicators">
          <p className="section-eyebrow">Free indicators</p>
          <h2 className="section-title">Free indicators on TradingView</h2>
          <p className="section-lede">All my published tools, free to use. Open them on TradingView.</p>
          <ul className="list">
            <li className="list-item">
              <a
                href="https://www.tradingview.com/u/darkness2364167717/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="list-num">01</span>
                <span className="list-title">Indicator placeholder</span>
                <span className="list-meta">TradingView · free</span>
                <span className="list-arrow">→</span>
              </a>
            </li>
          </ul>
        </section>

        {/* ── PROJECTS ── */}
        <section className="section" id="projects">
          <p className="section-eyebrow">Open-source</p>
          <h2 className="section-title">Open-source projects</h2>
          <p className="section-lede">Tools I build and share. Pull requests welcome.</p>
          <ul className="list">
            <li className="list-item">
              <a
                href="https://github.com/Angelo2411/jacktradesnq-site"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="list-num">01</span>
                <span className="list-title">jacktradesnq-site</span>
                <span className="list-meta">Next.js · TS · public</span>
                <span className="list-arrow">→</span>
              </a>
            </li>
          </ul>
        </section>

        {/* ── SOCIALS ── */}
        <section className="section" id="socials">
          <p className="section-eyebrow">Connect</p>
          <h2 className="section-title">Find me online.</h2>
          <div className="socials-grid">
            <a className="social" href="https://www.tiktok.com/@jack.tradesnq" target="_blank" rel="noopener noreferrer">
              <span className="social-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
              </span>
              TikTok
            </a>
            <a className="social" href="https://www.youtube.com/@jack.tradesnq" target="_blank" rel="noopener noreferrer">
              <span className="social-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
                </svg>
              </span>
              YouTube
            </a>
            <a className="social" href="https://www.instagram.com/jack.tradesnq" target="_blank" rel="noopener noreferrer">
              <span className="social-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </span>
              Instagram
            </a>
            <a className="social" href="https://x.com/jacktradesnq" target="_blank" rel="noopener noreferrer">
              <span className="social-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </span>
              X
            </a>
            <a className="social" href="https://www.tradingview.com/u/darkness2364167717/" target="_blank" rel="noopener noreferrer">
              <span className="social-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </span>
              TradingView
            </a>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="section" id="contact">
          <p className="section-eyebrow">Contact</p>
          <h2 className="section-title">Get in touch.</h2>
          <p className="contact-line">
            Reach out at{' '}
            <a href="mailto:jacktradesnq@outlook.fr">jacktradesnq@outlook.fr</a>
            {' '}or via socials.
          </p>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-row">
          <Link href="/mentions-legales">Mentions légales</Link>
          <span>·</span>
          <Link href="/politique-confidentialite">Politique de confidentialité</Link>
          <span>·</span>
          <span>© 2026 JackTradesNQ</span>
        </div>
        <p className="footer-disclaimer">
          Disclaimer — Conformément à l&apos;article D.321-1 du Code monétaire et financier,
          les contenus publiés sur ce site sont fournis à titre informatif uniquement
          et ne constituent pas des conseils en investissement. JackTradesNQ n&apos;est pas
          enregistré en tant que conseiller en investissements financiers (CIF).
          Les performances passées ne préjugent pas des performances futures.
          Tout investissement comporte un risque de perte en capital.
        </p>
      </footer>
    </>
  );
}
