'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type PandaState = 'idle' | 'wave' | 'eat' | 'sleep' | 'surprised';

const PHRASES = [
  "Long bamboo? 🎋",
  "Risk off, je dors",
  "PnL bullish today",
  "Liquidity grab spotted",
  "Where's my SL?",
  "FOMC incoming, hide",
  "PDH just got swept",
  "Coucou trader",
  "OB respected ✓",
  "Sweep then reverse",
  "I only eat green candles",
  "Bullish on bamboo futures",
];

function pickDifferent<T>(arr: T[], current: T): T {
  const pool = arr.filter((x) => x !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}

const STATES: PandaState[] = ['idle', 'wave', 'eat', 'sleep', 'surprised'];

export default function PandaMascot() {
  const [state, setState] = useState<PandaState>('idle');
  const [phrase, setPhrase] = useState<string>('');
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const lastPhraseRef = useRef<string>('');
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const showBubble = useCallback((text: string) => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    setPhrase(text);
    setBubbleVisible(true);
    bubbleTimerRef.current = setTimeout(() => {
      setBubbleVisible(false);
    }, 3200);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    function scheduleIdleLoop() {
      const delay = 10000 + Math.random() * 5000;
      idleLoopRef.current = setTimeout(() => {
        if (document.visibilityState !== 'visible') {
          scheduleIdleLoop();
          return;
        }
        setState((cur) => {
          if (cur !== 'idle') {
            scheduleIdleLoop();
            return cur;
          }
          const next: PandaState = Math.random() < 0.5 ? 'wave' : 'eat';
          const holdMs = next === 'eat' ? 3000 : 2000;
          idleLoopRef.current = setTimeout(() => {
            setState('idle');
            scheduleIdleLoop();
          }, holdMs);
          return next;
        });
      }, delay);
    }

    scheduleIdleLoop();
    return () => {
      if (idleLoopRef.current) clearTimeout(idleLoopRef.current);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      if (idleLoopRef.current) clearTimeout(idleLoopRef.current);
    };
  }, []);

  function handleClick() {
    const nextState = pickDifferent(STATES, state);
    setState(nextState);

    const nextPhrase = pickDifferent(PHRASES, lastPhraseRef.current);
    lastPhraseRef.current = nextPhrase;
    showBubble(nextPhrase);

    if (!prefersReducedMotion) {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 220);
    }
  }

  return (
    <>
      <style>{`
        .panda-wrap {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @media (max-width: 479px) {
          .panda-wrap { display: none; }
        }
        .panda-btn {
          position: relative;
          width: 128px;
          height: 128px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: block;
        }
        @media (max-width: 639px) {
          .panda-btn { width: 96px; height: 96px; }
        }
        .panda-btn:focus-visible {
          outline: 2px solid var(--accent-deep, oklch(0.72 0.18 90));
          outline-offset: 3px;
          border-radius: var(--r-md, 12px);
        }
        .panda-btn::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 12px;
          background: oklch(0.20 0.02 270 / 0.18);
          border-radius: 50%;
          filter: blur(6px);
          pointer-events: none;
        }
        .panda-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          user-select: none;
          -webkit-user-drag: none;
          display: block;
        }
        .panda-bounce {
          animation: pandaBounce 220ms ease-out forwards;
        }
        @keyframes pandaBounce {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .panda-bubble {
          position: absolute;
          bottom: calc(100% + 14px);
          left: 50%;
          transform: translateX(-50%);
          background: var(--c-paper, oklch(0.975 0.015 85));
          border: 1px solid var(--border-strong, oklch(0.20 0.02 270 / 0.18));
          border-radius: var(--r-md, 12px);
          padding: var(--s-3, 0.75rem) var(--s-4, 1rem);
          font-family: var(--font-body, 'Satoshi', sans-serif);
          font-size: var(--fs-sm, 0.875rem);
          color: var(--fg, oklch(0.20 0.02 270));
          box-shadow: var(--shadow-md, 0 4px 16px oklch(0.20 0.02 270 / 0.12));
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 200ms ease, transform 200ms ease;
          transform: translateX(-50%) translateY(4px);
        }
        .panda-bubble.visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .panda-bubble.reduced {
          transition: none;
        }
        .panda-bubble::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: var(--border-strong, oklch(0.20 0.02 270 / 0.18));
        }
        .panda-bubble::before {
          content: '';
          position: absolute;
          top: calc(100% - 1px);
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: var(--c-paper, oklch(0.975 0.015 85));
          z-index: 1;
        }
      `}</style>

      <div className="panda-wrap">
        <div
          className={`panda-bubble${bubbleVisible ? ' visible' : ''}${prefersReducedMotion ? ' reduced' : ''}`}
          role="status"
          aria-live="polite"
        >
          {phrase}
        </div>

        <button
          className={`panda-btn${bouncing ? ' panda-bounce' : ''}`}
          onClick={handleClick}
          aria-label="Pet the panda"
          type="button"
        >
          <img
            src={`/mascot/${state}.png`}
            alt={`Panda mascot ${state}`}
            className="panda-img"
            width={128}
            height={128}
            loading="lazy"
            draggable={false}
          />
        </button>
      </div>
    </>
  );
}
