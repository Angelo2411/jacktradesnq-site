'use client';
import { useEffect } from 'react';

export default function GhibliBackground() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const petalsContainer = document.getElementById('petals');
    if (petalsContainer && petalsContainer.children.length === 0) {
      const count = window.innerWidth < 480 ? 8 : 16;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'petal';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (15 + Math.random() * 20) + 's';
        p.style.animationDelay = (Math.random() * 15) + 's';
        petalsContainer.appendChild(p);
      }
    }

    const grass = document.getElementById('grass');
    if (grass && grass.children.length === 0) {
      const count = window.innerWidth < 480 ? 40 : 80;
      for (let i = 0; i < count; i++) {
        const b = document.createElement('div');
        b.className = 'grass-blade';
        b.style.left = (i / count * 100) + Math.random() + '%';
        b.style.height = (30 + Math.random() * 40) + 'px';
        b.style.setProperty('--delay', (Math.random() * 2) + 's');
        b.style.animationDuration = (3 + Math.random() * 2) + 's';
        grass.appendChild(b);
      }
    }
  }, []);

  return (
    <>
      <div className="sky" aria-hidden="true">
        <div className="sun"></div>
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
        <div className="petals" id="petals"></div>
      </div>
      <div className="ground" aria-hidden="true">
        <svg className="hill-far" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d="M0,200 L0,140 Q200,80 400,110 T800,100 T1200,130 L1200,200 Z" fill="#b4d4a5"/>
        </svg>
        <svg className="hill-close" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d="M0,200 L0,150 Q300,60 600,100 T1200,120 L1200,200 Z" fill="#7ab55f"/>
        </svg>
      </div>
      <div className="grass-layer" id="grass" aria-hidden="true"></div>
    </>
  );
}
