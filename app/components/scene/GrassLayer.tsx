'use client';

import { forwardRef, useRef, useMemo, useEffect } from 'react';

const BLADE_COUNTS = { back: 28, mid: 28, front: 24 };
const WAVE_SPREAD  = 0.8; // seconds for wave to cross screen

function rnd(a: number, b: number) { return a + Math.random() * (b - a); }

type Blade = {
  id: string;
  x: number;
  height: number;
  width: number;
  duration: number;
  delay: number;
  l: number;
  c: number;
};

function makeBlades(
  prefix: string,
  count: number,
  heightRange: [number, number],
  widthRange: [number, number],
  lightnessRange: [number, number],
  durationRange: [number, number],
): Blade[] {
  return Array.from({ length: count }, (_, i) => {
    const x = rnd(0, 100);
    return {
      id: `${prefix}-${i}`,
      x,
      height:   rnd(...heightRange),
      width:    rnd(...widthRange),
      duration: rnd(...durationRange),
      delay:    rnd(0, 1.5) + (x / 100) * WAVE_SPREAD,
      l: rnd(...lightnessRange),
      c: rnd(0.14, 0.16),
    };
  });
}

function BladeRow({ blades, rowClass }: { blades: Blade[]; rowClass: string }) {
  return (
    <div className={`grass-row ${rowClass}`}>
      {blades.map((b) => (
        <div
          key={b.id}
          className="grass-blade"
          style={
            {
              left:   `${b.x.toFixed(1)}%`,
              height: `${b.height.toFixed(0)}px`,
              width:  `${b.width.toFixed(1)}px`,
              '--gs': `${b.duration.toFixed(2)}s`,
              '--gd': `${b.delay.toFixed(2)}s`,
            } as React.CSSProperties
          }
        >
          <svg
            width={b.width}
            height={b.height}
            viewBox={`0 0 ${b.width.toFixed(1)} ${b.height.toFixed(0)}`}
            style={{ display: 'block' }}
          >
            <path
              d={`M${(b.width / 2).toFixed(1)},${b.height.toFixed(0)} Q${(b.width * 0.9).toFixed(1)},${(b.height * 0.5).toFixed(0)} ${(b.width / 2).toFixed(1)},0`}
              stroke={`oklch(${b.l.toFixed(2)} ${b.c.toFixed(2)} 145)`}
              strokeWidth={b.width * 0.65}
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

const GrassLayer = forwardRef<HTMLDivElement>((_, forwardedRef) => {
  const internalRef = useRef<HTMLDivElement | null>(null);

  const setRef = (node: HTMLDivElement | null) => {
    internalRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const { backBlades, midBlades, frontBlades } = useMemo(() => ({
    backBlades:  makeBlades('b', BLADE_COUNTS.back,  [12, 24], [1.5, 2.5], [0.50, 0.58], [2.5, 4.0]),
    midBlades:   makeBlades('m', BLADE_COUNTS.mid,   [18, 38], [2.0, 3.2], [0.42, 0.52], [1.8, 3.2]),
    frontBlades: makeBlades('f', BLADE_COUNTS.front, [24, 44], [2.5, 4.0], [0.36, 0.46], [1.5, 2.8]),
  }), []);

  // Gust every ~8s
  useEffect(() => {
    const el = internalRef.current;
    if (!el) return;
    const gust = () => {
      el.classList.add('gusting');
      window.setTimeout(() => el.classList.remove('gusting'), 1500);
    };
    const id = window.setInterval(gust, 8000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="grass-layer" ref={setRef}>
      <BladeRow blades={backBlades}  rowClass="grass-row-back" />
      <BladeRow blades={midBlades}   rowClass="grass-row-mid"  />
      <BladeRow blades={frontBlades} rowClass="grass-row-front" />
    </div>
  );
});

GrassLayer.displayName = 'GrassLayer';

export default GrassLayer;
