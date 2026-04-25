'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

type SlimeHue = 'blue' | 'pink' | 'yellow';

type SlimeCharacterProps = {
  className?: string;
  baseLeft: number; // % horizontal anchor
  bottom: number; // % vertical anchor (0 = ground)
  size: number; // px width
  bd: string; // bounce duration (CSS var --bd) — kept for legacy CSS bounce
  bdl: string; // bounce delay (CSS var --bdl)
  wanderRange: number; // % horizontal sway range
  wanderSpeed: number; // wander frequency factor
  hue: SlimeHue;
  jumpEvery?: number; // average seconds between jumps
  parallaxStrength?: number; // px max offset from mouse parallax
};

const HUES: Record<
  SlimeHue,
  {
    gradient: { hi: string; mid: string; lo: string };
    rim: string;
    inner: string;
    highlight: string;
  }
> = {
  blue: {
    gradient: { hi: 'oklch(0.92 0.08 225)', mid: 'oklch(0.78 0.13 230)', lo: 'oklch(0.55 0.16 235)' },
    rim: 'oklch(0.45 0.18 240)',
    inner: 'oklch(0.96 0.06 220)',
    highlight: 'oklch(0.99 0.01 220)',
  },
  pink: {
    gradient: { hi: 'oklch(0.94 0.08 10)', mid: 'oklch(0.78 0.16 5)', lo: 'oklch(0.58 0.20 10)' },
    rim: 'oklch(0.45 0.20 12)',
    inner: 'oklch(0.96 0.06 20)',
    highlight: 'oklch(0.99 0.01 220)',
  },
  yellow: {
    gradient: { hi: 'oklch(0.98 0.06 95)', mid: 'oklch(0.90 0.16 90)', lo: 'oklch(0.72 0.18 80)' },
    rim: 'oklch(0.50 0.18 75)',
    inner: 'oklch(0.99 0.06 95)',
    highlight: 'oklch(0.99 0.04 95)',
  },
};

export default function SlimeCharacter({
  className = '',
  baseLeft,
  bottom,
  size,
  bd,
  bdl,
  wanderRange,
  wanderSpeed,
  hue,
  jumpEvery = 6,
  parallaxStrength = 14,
}: SlimeCharacterProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const jumpRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Capture mouse position globally (one listener per slime is fine, perf negligible)
  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: MouseEvent) => {
      // normalize to -1..1 from viewport center
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduceMotion]);

  // Wander horizontal (sin layered) + jump (peaks every ~jumpEvery seconds) + mouse parallax
  useEffect(() => {
    if (reduceMotion) return;
    const wrap = wrapperRef.current;
    const jump = jumpRef.current;
    if (!wrap || !jump) return;

    const phase = Math.random() * Math.PI * 2;
    const jumpPhase = Math.random() * jumpEvery;
    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = (now - t0) / 1000;

      // Wander horizontal (% units around baseLeft)
      const offset = Math.sin(t * wanderSpeed * 2 + phase) * wanderRange;
      const offset2 = Math.sin(t * wanderSpeed * 0.7 + phase) * wanderRange * 0.4;
      const wanderX = offset + offset2;

      // Mouse parallax (closer slimes = stronger response, but capped)
      const px = mouseRef.current.x * parallaxStrength;
      const py = mouseRef.current.y * parallaxStrength * 0.4;
      wrap.style.left = `calc(${baseLeft}% + ${wanderX.toFixed(2)}% + ${px.toFixed(1)}px)`;
      wrap.style.transform = `translateY(${py.toFixed(1)}px)`;

      // Periodic jump — sharp arc when phase aligns
      const cycle = (t + jumpPhase) % jumpEvery; // 0..jumpEvery
      const jumpWindow = 0.55; // seconds in air
      if (cycle < jumpWindow) {
        const u = cycle / jumpWindow; // 0..1
        // parabolic arc: peak at u=0.5
        const arc = 4 * u * (1 - u);
        const jumpY = arc * (size * 0.55); // jump height proportional to size
        const squash = 1 - 0.08 * Math.sin(u * Math.PI); // mid-air gentle squash
        jump.style.transform = `translateY(${(-jumpY).toFixed(1)}px) scale(${squash.toFixed(3)})`;
      } else if (cycle < jumpWindow + 0.18) {
        // landing squash
        const u = (cycle - jumpWindow) / 0.18;
        const sx = 1 + 0.18 * (1 - u);
        const sy = 1 - 0.18 * (1 - u);
        jump.style.transform = `translateY(0) scaleX(${sx.toFixed(3)}) scaleY(${sy.toFixed(3)})`;
      } else {
        // resting between jumps — subtle idle breathing
        const breathe = 1 + 0.015 * Math.sin(t * 1.6 + phase);
        jump.style.transform = `translateY(0) scale(${breathe.toFixed(3)})`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [baseLeft, wanderRange, wanderSpeed, reduceMotion, jumpEvery, parallaxStrength, size]);

  const c = HUES[hue];
  const gradId = `g-${hue}-${size}`;
  const shadowRx = size > 100 ? 62 : size > 60 ? 50 : 38;
  const shadowRy = size > 100 ? 6 : size > 60 ? 5 : 4;

  return (
    <div
      ref={wrapperRef}
      className={`slime ${className}`}
      style={{
        left: `${baseLeft}%`,
        bottom: `${bottom}%`,
        width: size,
        ['--bd' as string]: bd,
        ['--bdl' as string]: bdl,
      }}
    >
      {/* Static ground shadow (does not jump with the body) */}
      <svg className="slime-shadow" viewBox="0 0 200 16" width="100%" height={shadowRy * 3}>
        <ellipse cx="100" cy="8" rx={shadowRx} ry={shadowRy} fill="oklch(0.28 0.10 150)" opacity="0.45" />
      </svg>

      {/* Body wrapper — only this jumps */}
      <div ref={jumpRef} className="slime-body">
        <svg viewBox="0 0 200 160" width="100%" height="100%">
          <defs>
            <radialGradient id={gradId} cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor={c.gradient.hi} />
              <stop offset="55%" stopColor={c.gradient.mid} />
              <stop offset="100%" stopColor={c.gradient.lo} />
            </radialGradient>
          </defs>
          {/* Body — slightly taller so it reads as a slime back, not a face */}
          <path
            d="M40,140 C30,90 60,40 100,40 C140,40 170,90 160,140 C155,150 130,150 100,150 C70,150 45,150 40,140 Z"
            fill={`url(#${gradId})`}
            stroke={c.rim}
            strokeWidth="2.5"
          />
          {/* Inner gel highlight (top-left curve) */}
          <path
            d="M58,120 C50,80 75,55 105,55 C90,75 78,100 80,130 Z"
            fill={c.inner}
            opacity="0.55"
          />
          {/* Specular highlight dots — top dome only, no face */}
          <ellipse cx="70" cy="70" rx="9" ry="5" fill={c.highlight} opacity="0.95" />
          <ellipse cx="84" cy="62" rx="4" ry="2.5" fill={c.highlight} opacity="0.9" />
          <ellipse cx="120" cy="78" rx="5" ry="2.5" fill={c.highlight} opacity="0.55" />
        </svg>
      </div>
    </div>
  );
}
