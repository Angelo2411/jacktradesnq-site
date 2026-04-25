'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import SlimeCharacter from './SlimeCharacter';

const SOCIAL_URL = '#socials';
const INDICATORS_URL = 'https://www.tradingview.com/u/jack.tradesnq/';
const GITHUB_URL = 'https://github.com/Angelo2411';
const AFFILIATES_URL = '#affiliates';
const ABOUT_URL = '#about';
const CONTACT_URL = '#contact';

const STAR_COUNT = 110;
const SHOOTING_STAR_INTERVAL = 4500; // ms between random shooting stars
const SHOOTING_STAR_LIFETIME = 1500; // ms a streak lives

type Star = {
  left: number;
  top: number;
  big: boolean;
  twinkleDuration: number;
  twinkleDelay: number;
  baseOpacity: number;
};

function generateStars(): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      left: Math.random() * 100,
      top: Math.random() * 70,
      big: Math.random() < 0.18,
      twinkleDuration: 2 + Math.random() * 4,
      twinkleDelay: Math.random() * 4,
      baseOpacity: 0.45 + Math.random() * 0.55,
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

const easeOut = [0.16, 1, 0.3, 1] as const;
const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.9, delay, ease: easeOut },
});

export default function SceneScroller() {
  const skyDayRef = useRef<HTMLDivElement | null>(null);
  const groundRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const cometWrapRef = useRef<HTMLDivElement | null>(null);
  const cometRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<HTMLDivElement | null>(null);
  const shootingHostRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  const reduceMotion = useReducedMotion() ?? false;

  // 1. Inject ambient stars (client-only, avoids SSR mismatch)
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

  // 2. RAF scroll orchestration + ambient drift
  useEffect(() => {
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
    let t0 = performance.now();

    const onScroll = () => {
      target = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = (now: number) => {
      const elapsed = (now - t0) / 1000; // seconds since mount
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
        // Ambient idle drift on stars (slow continuous parallax even at scroll 0)
        const idleDriftY = Math.sin(elapsed * 0.18) * 6;
        const scrollDriftY = current * 0.04 * 0.3;
        stars.style.transform = `translateY(${(-scrollDriftY + idleDriftY).toFixed(1)}px)`;

        // Comet idle bob + scroll-based exit
        const cometBobX = Math.sin(elapsed * 0.5) * 4;
        const cometBobY = Math.cos(elapsed * 0.5) * 3;
        comet.style.transform = `rotate(28deg) translateX(${(cometT * 240 + cometBobX).toFixed(1)}px) translateY(${(-cometT * 60 + cometBobY).toFixed(1)}px)`;
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
  }, [reduceMotion]);

  // 3. Shooting stars (random recurring streaks across the night sky)
  useEffect(() => {
    if (reduceMotion) return;
    const host = shootingHostRef.current;
    if (!host) return;

    let alive = true;
    const spawn = () => {
      if (!alive) return;
      const el = document.createElement('div');
      el.className = 'shooting-star';
      // Random start position: top-right 30% of screen
      const startTop = Math.random() * 35; // 0..35% from top
      const startRight = Math.random() * 25; // 0..25% from right
      const length = 120 + Math.random() * 220; // 120..340px
      const angle = 22 + Math.random() * 12; // 22..34deg
      const drift = 280 + Math.random() * 320; // total travel
      el.style.top = `${startTop}%`;
      el.style.right = `${startRight}%`;
      el.style.width = `${length}px`;
      el.style.transform = `rotate(${angle}deg) translateX(0)`;
      el.style.setProperty('--shoot-drift', `${drift}px`);
      el.style.setProperty('--shoot-angle', `${angle}deg`);
      el.style.setProperty('--shoot-life', `${SHOOTING_STAR_LIFETIME}ms`);
      host.appendChild(el);
      // Remove after lifetime
      window.setTimeout(() => {
        el.remove();
      }, SHOOTING_STAR_LIFETIME + 200);
    };

    // First streak slightly delayed to let entry animation play
    const initial = window.setTimeout(spawn, 1800);
    const interval = window.setInterval(() => {
      // 60% chance to spawn each tick to vary cadence
      if (Math.random() < 0.6) spawn();
    }, SHOOTING_STAR_INTERVAL);

    return () => {
      alive = false;
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [reduceMotion]);

  // 4. Mobile menu toggle + logo click → scroll top
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
      e.preventDefault();
      if (window.innerWidth <= 760) {
        toggleMenu();
        return;
      }
      // Desktop: smooth scroll back to top
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
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
  }, [reduceMotion]);

  return (
    <>
      {/* Sky layers — fixed, crossfade on scroll */}
      <div className="sky-night" aria-hidden="true" />
      <div className="sky-day" ref={skyDayRef} aria-hidden="true" />

      {/* Stars — fade out by 35% scroll */}
      <div className="stars" ref={starsRef} aria-hidden="true" />

      {/* Shooting stars host — random streaks */}
      <div className="shooting-host" ref={shootingHostRef} aria-hidden="true" />

      {/* Hero comet — entry sweep then idle bob */}
      <div className="comet-wrap" ref={cometWrapRef} aria-hidden="true">
        <motion.div
          className="comet"
          ref={cometRef}
          initial={reduceMotion ? false : { x: 600, y: -260, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ duration: 1.6, ease: easeOut, delay: 0.2 }}
        >
          <div className="trail" />
          <div className="head" />
        </motion.div>
        <div className="streak" style={{ top: '18%', right: '22%', width: 90, transform: 'rotate(28deg)' }} />
        <div className="streak" style={{ top: '32%', right: '55%', width: 60, transform: 'rotate(28deg)', opacity: 0.4 }} />
        <div className="streak" style={{ top: '14%', right: '70%', width: 120, transform: 'rotate(28deg)', opacity: 0.5 }} />
        <div className="streak" style={{ top: '42%', right: '12%', width: 50, transform: 'rotate(28deg)', opacity: 0.35 }} />
      </div>

      {/* Sticky nav with entry stagger */}
      <nav className="scene-nav" ref={navRef} aria-label="Primary">
        <motion.a className="wordmark" ref={logoRef} href="#top" {...stagger(0.1)}>
          JTNQ
        </motion.a>
        <motion.ul {...stagger(0.35)}>
          <li><a href={ABOUT_URL}>About me</a></li>
          <li><a href={SOCIAL_URL}>Socials</a></li>
          <li><a href={INDICATORS_URL} target="_blank" rel="noopener noreferrer">Indicators</a></li>
          <li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a href={AFFILIATES_URL}>Affiliates</a></li>
          <li><a href={CONTACT_URL}>Contact</a></li>
        </motion.ul>
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

      {/* Center stack — entry stagger + glow pulse + scroll fade */}
      <div className="center" ref={centerRef}>
        <motion.a className="scene-btn" href={SOCIAL_URL} {...stagger(0.55)}>
          <span>Socials</span>
          <span className="arrow" />
        </motion.a>
        <motion.a
          className="scene-btn"
          href={INDICATORS_URL}
          target="_blank"
          rel="noopener noreferrer"
          {...stagger(0.7)}
        >
          <span>Indicators</span>
          <span className="arrow" />
        </motion.a>
        <motion.a
          className="scene-btn"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          {...stagger(0.85)}
        >
          <span>GitHub repo</span>
          <span className="arrow" />
        </motion.a>
        <motion.a className="scene-btn" href={AFFILIATES_URL} {...stagger(1.0)}>
          <span>Affiliates</span>
          <span className="arrow" />
        </motion.a>
        <motion.div className="subline" {...stagger(1.2)}>
          Trader. Builder. Sharing what works.
        </motion.div>
      </div>

      {/* Ground — rises from bottom, contains wandering slimes */}
      <div className="scene-ground" ref={groundRef} aria-hidden="true">
        <SlimeCharacter className="slime-blue"   baseLeft={9}  bottom={14} size={170} bd="3.2s" bdl="0s"   wanderRange={5} wanderSpeed={0.18} hue="blue"   />
        <SlimeCharacter className="slime-pink"   baseLeft={42} bottom={22} size={90}  bd="2.6s" bdl="0.4s" wanderRange={6} wanderSpeed={0.22} hue="pink"   />
        <SlimeCharacter className="slime-yellow" baseLeft={62} bottom={34} size={48}  bd="2.2s" bdl="0.9s" wanderRange={4} wanderSpeed={0.28} hue="yellow" />
      </div>

      {/* Scroll-length spacer (200vh total) */}
      <div className="scene-spacer" aria-hidden="true" />
    </>
  );
}
