'use client';
import { useEffect } from 'react';

export default function GhibliParallax() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ctx: { revert: () => void } | null = null;

    (async () => {
      const { default: gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const common = {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        } as const;

        // Sky layers — slow (far)
        gsap.to('.sun', { y: -80, scrollTrigger: common });
        gsap.to('.cloud-1', { y: -120, scrollTrigger: common });
        gsap.to('.cloud-2', { y: -150, scrollTrigger: common });
        gsap.to('.cloud-3', { y: -100, scrollTrigger: common });

        // Mid layers
        gsap.to('.hill-far', { y: -220, scrollTrigger: common });
        gsap.to('.hill-close', { y: -360, scrollTrigger: common });

        // Foreground — fastest
        gsap.to('.grass-layer', { y: -480, scrollTrigger: common });
      });
    })();

    return () => {
      ctx?.revert();
    };
  }, []);

  return null;
}
