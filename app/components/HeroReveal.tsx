'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = { children: ReactNode; delay?: number };

export function HeroItem({ children, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
