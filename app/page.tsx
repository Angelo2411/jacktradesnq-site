import Link from 'next/link';

export default function Home() {
  return (
    <main className="page">
      <h1 className="heading">
        Jacktradesnq<span className="dot">.</span>
      </h1>

      {/* Group 1 — 4 socials */}
      <div className="group">
        <div className="group-grid-2">
          <a className="card" href="https://www.tiktok.com/@jack.tradesnq" target="_blank" rel="noopener noreferrer">
            <svg className="card-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3.2a8.6 8.6 0 0 1-4.6-1.4v6.6a6.7 6.7 0 1 1-6.7-6.7c.3 0 .6 0 .9.1v3.4a3.3 3.3 0 1 0 2.5 3.2V3z"/>
            </svg>
            <span className="card-label">TikTok</span>
            <span className="card-arrow">↗</span>
          </a>

          <a className="card" href="https://www.youtube.com/@jack.tradesnq" target="_blank" rel="noopener noreferrer">
            <svg className="card-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
              <polygon fill="var(--bg)" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
            </svg>
            <span className="card-label">YouTube</span>
            <span className="card-arrow">↗</span>
          </a>

          <a className="card" href="https://www.instagram.com/jack.tradesnq" target="_blank" rel="noopener noreferrer">
            <svg className="card-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
            </svg>
            <span className="card-label">Instagram</span>
            <span className="card-arrow">↗</span>
          </a>

          <a className="card" href="https://x.com/jacktradesnq" target="_blank" rel="noopener noreferrer">
            <svg className="card-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="card-label">X</span>
            <span className="card-arrow">↗</span>
          </a>
        </div>
      </div>

      {/* Group 2 — TradingView featured (animated gradient border) */}
      <div className="group">
        <div className="card-frame">
          <a className="card card-featured" href="https://www.tradingview.com/u/jacktradesnq/" target="_blank" rel="noopener noreferrer">
            <svg className="card-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
            <span className="card-label">TradingView</span>
            <span className="card-arrow">↗</span>
          </a>
        </div>
      </div>

      {/* Group 3 — GitHub featured (animated gradient border) */}
      <div className="group">
        <div className="card-frame">
          <a className="card card-featured" href="https://github.com/jacktradesnq" target="_blank" rel="noopener noreferrer">
            <svg className="card-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.4-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11 11 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.4 5.8.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/>
            </svg>
            <span className="card-label">GitHub</span>
            <span className="card-arrow">↗</span>
          </a>
        </div>
      </div>

      {/* Footer FR legal */}
      <footer className="footer">
        <div className="footer-row">
          <Link href="/mentions-legales">Mentions légales</Link>
          <span className="sep">·</span>
          <Link href="/politique-confidentialite">Politique de confidentialité</Link>
          <span className="sep">·</span>
          <span>© 2026 JackTradesNQ. All rights reserved.</span>
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
    </main>
  );
}
