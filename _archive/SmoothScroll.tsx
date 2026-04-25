'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Bridge Lenis → GSAP ScrollTrigger
    let scrollTriggerUpdate: (() => void) | null = null;
    (async () => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      scrollTriggerUpdate = () => ScrollTrigger.update();
      lenis.on('scroll', scrollTriggerUpdate);
    })();

    return () => {
      cancelAnimationFrame(rafId);
      if (scrollTriggerUpdate) lenis.off('scroll', scrollTriggerUpdate);
      lenis.destroy();
    };
  }, []);

  return null;
}
