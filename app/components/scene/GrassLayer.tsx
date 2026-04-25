'use client';

import { forwardRef, useMemo } from 'react';

const BLADE_COUNT = 40;

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}

type Blade = {
  id: number;
  x: number;
  height: number;
  duration: number;
  delay: number;
  l: number;
  c: number;
};

const GrassLayer = forwardRef<HTMLDivElement>((_, ref) => {
  const blades = useMemo<Blade[]>(
    () =>
      Array.from({ length: BLADE_COUNT }, (_, i) => ({
        id: i,
        x: rnd(0, 100),
        height: rnd(18, 40),
        duration: rnd(2, 5),
        delay: rnd(0, 3),
        l: rnd(0.42, 0.55),
        c: rnd(0.14, 0.16),
      })),
    [],
  );

  return (
    <div className="grass-layer" ref={ref}>
      {blades.map((b) => (
        <div
          key={b.id}
          className="grass-blade"
          style={
            {
              left: `${b.x.toFixed(1)}%`,
              height: `${b.height.toFixed(0)}px`,
              width: '4px',
              '--gs': `${b.duration.toFixed(2)}s`,
              '--gd': `${b.delay.toFixed(2)}s`,
            } as React.CSSProperties
          }
        >
          <svg
            width="4"
            height={b.height}
            viewBox={`0 0 4 ${b.height.toFixed(0)}`}
            style={{ display: 'block' }}
          >
            <path
              d={`M2,${b.height.toFixed(0)} Q3.5,${(b.height * 0.5).toFixed(0)} 2,0`}
              stroke={`oklch(${b.l.toFixed(2)} ${b.c.toFixed(2)} 145)`}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
});

GrassLayer.displayName = 'GrassLayer';

export default GrassLayer;
