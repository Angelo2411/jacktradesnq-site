'use client';

import { useEffect, useRef } from 'react';

const SOCIAL_URL = '#socials';
const INDICATORS_URL = 'https://www.tradingview.com/u/jack.tradesnq/';
const GITHUB_URL = 'https://github.com/Angelo2411';
const AFFILIATES_URL = '#affiliates';
const ABOUT_URL = '#about';
const CONTACT_URL = '#contact';

const STAR_COUNT = 90;

type Star = {
  left: number;
  top: number;
  big: boolean;
  twinkleDuration: number;
  twinkleDelay: number;
  baseOpacity: number;
};

function generateStars(): Star[] {
  // deterministic seed-free generation; runs only once in client effect
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      left: Math.random() * 100,
      top: Math.random() * 60,
      big: Math.random() < 0.18,
      twinkleDuration: 2 + Math.random() * 4,
      twinkleDelay: Math.random() * 4,
      baseOpacity: 0.4 + Math.random() * 0.6,
    });
  }
  return stars;
}

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export default function SceneScroller() {
  const skyDayRef = useRef<HTMLDivElement | null>(null);
  const groundRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const cometWrapRef = useRef<HTMLDivElement | null>(null);
  const cometRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  // 1. Inject stars (client-only, avoids SSR mismatch)
  useEffect(() => {
    const el = starsRef.current;
    if (!el) return;
    el.innerHTML = '';
    const stars = generateStars();
    for (const s of stars) {
      const star = document.createElement('div');
      star.className = 'star' + (s.big ? ' big' : '');
      star.style.left = `${s.left}%`;
      star.style.top = `${s.top}%`;
      star.style.setProperty('--tw', `${s.twinkleDuration}s`);
      star.style.setProperty('--td', `${s.twinkleDelay}s`);
      star.style.opacity = s.baseOpacity.toFixed(2);
      el.appendChild(star);
    }
  }, []);

  // 2. RAF scroll orchestration
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const skyDay = skyDayRef.current;
    const ground = groundRef.current;
    const center = centerRef.current;
    const cometWrap = cometWrapRef.current;
    const comet = cometRef.current;
    const stars = starsRef.current;
    const nav = navRef.current;

    if (!skyDay || !ground || !center || !cometWrap || !comet || !stars || !nav) return;

    let target = 0;
    let current = 0;
    let raf = 0;

    const onScroll = () => {
      target = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = () => {
      current = reduceMotion ? target : lerp(current, target, 0.12);
      const vh = window.innerHeight;
      const totalH = document.documentElement.scrollHeight - vh;
      const p = clamp(current / Math.max(1, totalH), 0, 1);

      const tScene = clamp((p - 0.10) / 0.65, 0, 1);
      skyDay.style.opacity = tScene.toFixed(3);

      const starsT = clamp((p - 0.05) / 0.35, 0, 1);
      stars.style.opacity = (1 - starsT).toFixed(3);

      const cometT = clamp((p - 0.20) / 0.20, 0, 1);
      cometWrap.style.opacity = (1 - cometT).toFixed(3);

      if (!reduceMotion) {
        const drift = current * 0.04;
        stars.style.transform = `translateY(${(-drift * 0.3).toFixed(1)}px)`;
        comet.style.transform = `rotate(28deg) translateX(${(cometT * 240).toFixed(1)}px) translateY(${(-cometT * 60).toFixed(1)}px)`;
      }

      const centerT = clamp((p - 0.05) / 0.30, 0, 1);
      center.style.opacity = (1 - centerT).toFixed(3);
      center.style.transform = `translate(-50%, calc(-50% + ${(centerT * -40).toFixed(1)}px))`;
      center.style.pointerEvents = centerT > 0.85 ? 'none' : 'auto';

      const groundT = clamp((p - 0.25) / 0.55, 0, 1);
      const ge = 1 - Math.pow(1 - groundT, 2.2);
      ground.style.transform = `translateY(${((1 - ge) * 100).toFixed(1)}%)`;

      nav.style.color = tScene > 0.6 ? 'oklch(0.20 0.04 240)' : 'oklch(0.96 0.025 80)';

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // 3. Mobile menu toggle
  useEffect(() => {
    const ham = hamburgerRef.current;
    const menu = mobileMenuRef.current;
    const logo = logoRef.current;
    if (!ham || !menu || !logo) return;

    const toggleMenu = () => {
      const open = menu.classList.toggle('open');
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    const onLogoClick = (e: MouseEvent) => {
      if (window.innerWidth <= 760) {
        e.preventDefault();
        toggleMenu();
      }
    };

    const onMenuClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') menu.classList.remove('open');
    };

    ham.addEventListener('click', toggleMenu);
    logo.addEventListener('click', onLogoClick);
    menu.addEventListener('click', onMenuClick);

    return () => {
      ham.removeEventListener('click', toggleMenu);
      logo.removeEventListener('click', onLogoClick);
      menu.removeEventListener('click', onMenuClick);
    };
  }, []);

  return (
    <>
      {/* Sky layers — fixed, crossfade on scroll */}
      <div className="sky-night" aria-hidden="true" />
      <div className="sky-day" ref={skyDayRef} aria-hidden="true" />

      {/* Stars — fade out by 35% scroll */}
      <div className="stars" ref={starsRef} aria-hidden="true" />

      {/* Comet + secondary streaks */}
      <div className="comet-wrap" ref={cometWrapRef} aria-hidden="true">
        <div className="comet" ref={cometRef}>
          <div className="trail" />
          <div className="head" />
        </div>
        <div className="streak" style={{ top: '18%', right: '22%', width: 90, transform: 'rotate(28deg)' }} />
        <div className="streak" style={{ top: '32%', right: '55%', width: 60, transform: 'rotate(28deg)', opacity: 0.4 }} />
        <div className="streak" style={{ top: '14%', right: '70%', width: 120, transform: 'rotate(28deg)', opacity: 0.5 }} />
        <div className="streak" style={{ top: '42%', right: '12%', width: 50, transform: 'rotate(28deg)', opacity: 0.35 }} />
      </div>

      {/* Sticky nav */}
      <nav className="scene-nav" ref={navRef} aria-label="Primary">
        <a className="wordmark" ref={logoRef} href="#top">JTNQ</a>
        <ul>
          <li><a href={ABOUT_URL}>About me</a></li>
          <li><a href={SOCIAL_URL}>Socials</a></li>
          <li><a href={INDICATORS_URL} target="_blank" rel="noopener noreferrer">Indicators</a></li>
          <li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a href={AFFILIATES_URL}>Affiliates</a></li>
          <li><a href={CONTACT_URL}>Contact</a></li>
        </ul>
        <button
          type="button"
          className="hamburger"
          ref={hamburgerRef}
          aria-label="Open menu"
          aria-expanded="false"
        >
          <span />
        </button>
      </nav>
      <div className="mobile-menu" ref={mobileMenuRef}>
        <a href={ABOUT_URL}>About me</a>
        <a href={SOCIAL_URL}>Socials</a>
        <a href={INDICATORS_URL} target="_blank" rel="noopener noreferrer">Indicators</a>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href={AFFILIATES_URL}>Affiliates</a>
        <a href={CONTACT_URL}>Contact</a>
      </div>

      {/* Center stack — fades on scroll */}
      <div className="center" ref={centerRef}>
        <a className="scene-btn" href={SOCIAL_URL}>
          <span>Socials</span>
          <span className="arrow" />
        </a>
        <a className="scene-btn" href={INDICATORS_URL} target="_blank" rel="noopener noreferrer">
          <span>Indicators</span>
          <span className="arrow" />
        </a>
        <a className="scene-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          <span>GitHub repo</span>
          <span className="arrow" />
        </a>
        <a className="scene-btn" href={AFFILIATES_URL}>
          <span>Affiliates</span>
          <span className="arrow" />
        </a>
        <div className="subline">Trader. Builder. Sharing what works.</div>
      </div>

      {/* Ground — rises from bottom, contains slimes */}
      <div className="scene-ground" ref={groundRef} aria-hidden="true">
        {/* Blue slime, front-left */}
        <div
          className="slime"
          style={{ left: '9%', bottom: '14%', width: 170, ['--bd' as string]: '3.2s', ['--bdl' as string]: '0s' }}
        >
          <svg viewBox="0 0 200 160" width="100%" height="100%">
            <ellipse cx="100" cy="148" rx="62" ry="6" fill="oklch(0.28 0.10 150)" opacity="0.45" />
            <defs>
              <radialGradient id="blueG" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor="oklch(0.92 0.08 225)" />
                <stop offset="50%" stopColor="oklch(0.78 0.13 230)" />
                <stop offset="100%" stopColor="oklch(0.55 0.16 235)" />
              </radialGradient>
            </defs>
            <path
              d="M40,140 C30,90 60,40 100,40 C140,40 170,90 160,140 C155,150 130,150 100,150 C70,150 45,150 40,140 Z"
              fill="url(#blueG)"
              stroke="oklch(0.45 0.18 240)"
              strokeWidth="2.5"
            />
            <path
              d="M58,120 C50,80 75,55 105,55 C90,75 78,100 80,130 Z"
              fill="oklch(0.96 0.06 220)"
              opacity="0.55"
            />
            <path d="M75,90 q6,-6 12,0" stroke="oklch(0.20 0.08 240)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M115,90 q6,-6 12,0" stroke="oklch(0.20 0.08 240)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M92,108 q8,6 16,0" stroke="oklch(0.20 0.08 240)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <ellipse cx="70" cy="70" rx="9" ry="5" fill="oklch(0.99 0.01 220)" opacity="0.95" />
            <ellipse cx="84" cy="62" rx="4" ry="2.5" fill="oklch(0.99 0.01 220)" opacity="0.9" />
          </svg>
        </div>

        {/* Pink slime — mid-distance */}
        <div
          className="slime"
          style={{ left: '42%', bottom: '22%', width: 90, ['--bd' as string]: '2.6s', ['--bdl' as string]: '0.4s' }}
        >
          <svg viewBox="0 0 200 160" width="100%" height="100%">
            <ellipse cx="100" cy="148" rx="50" ry="5" fill="oklch(0.28 0.10 150)" opacity="0.45" />
            <defs>
              <radialGradient id="pinkG" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor="oklch(0.94 0.08 10)" />
                <stop offset="55%" stopColor="oklch(0.78 0.16 5)" />
                <stop offset="100%" stopColor="oklch(0.58 0.20 10)" />
              </radialGradient>
            </defs>
            <path
              d="M45,140 C35,95 65,50 100,50 C135,50 165,95 155,140 C150,150 125,150 100,150 C75,150 50,150 45,140 Z"
              fill="url(#pinkG)"
              stroke="oklch(0.45 0.20 12)"
              strokeWidth="2.5"
            />
            <path
              d="M62,120 C56,82 78,62 105,62 C92,80 80,102 82,130 Z"
              fill="oklch(0.96 0.06 20)"
              opacity="0.55"
            />
            <path d="M78,92 q6,-6 12,0" stroke="oklch(0.25 0.10 15)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M110,92 q6,-6 12,0" stroke="oklch(0.25 0.10 15)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M92,108 q8,5 16,0" stroke="oklch(0.25 0.10 15)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <g transform="translate(100, 48)">
              <g fill="oklch(0.97 0.02 90)">
                <circle cx="0" cy="0" r="4" />
                <circle cx="4" cy="-3" r="3.5" />
                <circle cx="-4" cy="-3" r="3.5" />
                <circle cx="3" cy="3" r="3.5" />
                <circle cx="-3" cy="3" r="3.5" />
              </g>
              <circle cx="0" cy="0" r="2" fill="oklch(0.88 0.16 95)" />
            </g>
          </svg>
        </div>

        {/* Yellow slime — near horizon */}
        <div
          className="slime"
          style={{ left: '62%', bottom: '34%', width: 48, ['--bd' as string]: '2.2s', ['--bdl' as string]: '0.9s' }}
        >
          <svg viewBox="0 0 200 160" width="100%" height="100%">
            <ellipse cx="100" cy="148" rx="38" ry="4" fill="oklch(0.28 0.10 150)" opacity="0.4" />
            <defs>
              <radialGradient id="yellG" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor="oklch(0.98 0.06 95)" />
                <stop offset="55%" stopColor="oklch(0.90 0.16 90)" />
                <stop offset="100%" stopColor="oklch(0.72 0.18 80)" />
              </radialGradient>
            </defs>
            <path
              d="M50,140 C40,100 70,60 100,60 C130,60 160,100 150,140 C145,150 125,150 100,150 C75,150 55,150 50,140 Z"
              fill="url(#yellG)"
              stroke="oklch(0.50 0.18 75)"
              strokeWidth="2.2"
            />
            <path
              d="M65,120 C60,90 80,72 105,72 C92,90 82,105 84,130 Z"
              fill="oklch(0.99 0.06 95)"
              opacity="0.55"
            />
            <path d="M80,98 q6,-5 12,0" stroke="oklch(0.30 0.10 75)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M108,98 q6,-5 12,0" stroke="oklch(0.30 0.10 75)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Scroll-length spacer (200vh total) */}
      <div className="scene-spacer" aria-hidden="true" />
    </>
  );
}
