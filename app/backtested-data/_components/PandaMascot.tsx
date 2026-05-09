'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type PandaState =
  | 'idle' | 'walk' | 'pause' | 'eat' | 'sleep' | 'wave' | 'yawn' | 'surprised'
  | 'held' | 'flying' | 'landing' | 'walking-back' | 'petting' | 'berserk';

interface Action {
  type: PandaState;
  weight: number;
  minMs: number;
  maxMs: number;
}

interface Vec2 { x: number; y: number; }

interface PhysicsSample {
  pos: Vec2;
  t: number; // performance.now() ms
}

interface PhysicsState {
  pos: Vec2;        // absolute px from top-left viewport
  vel: Vec2;        // px/s
  rot: number;      // degrees
  rotVel: number;   // deg/s
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WALK_FRAMES = ['walk1', 'walk2', 'walk3', 'walk4'] as const;

const STATE_TO_IMG: Record<PandaState, string> = {
  idle:          'idle',
  walk:          'idle',
  pause:         'idle',
  eat:           'eat',
  sleep:         'sleep',
  wave:          'wave',
  yawn:          'wave',
  surprised:     'surprised',
  held:          'surprised',
  flying:        'surprised',
  landing:       'surprised',
  'walking-back':'idle',
  petting:       'sleep',
  berserk:       'surprised',
};

const FULL_ACTIONS: Action[] = [
  { type: 'idle',  weight: 30, minMs: 3000, maxMs: 8000 },
  { type: 'walk',  weight: 25, minMs: 3000, maxMs: 7000 },
  { type: 'pause', weight: 15, minMs: 1000, maxMs: 3000 },
  { type: 'eat',   weight: 10, minMs: 2000, maxMs: 4000 },
  { type: 'sleep', weight: 10, minMs: 4000, maxMs: 8000 },
  { type: 'wave',  weight:  5, minMs: 1500, maxMs: 2500 },
  { type: 'yawn',  weight:  5, minMs: 1500, maxMs: 2500 },
];

const REDUCED_ACTIONS: Action[] = [
  { type: 'idle',  weight: 40, minMs: 6000, maxMs: 12000 },
  { type: 'eat',   weight: 25, minMs: 2000, maxMs:  4000 },
  { type: 'sleep', weight: 25, minMs: 4000, maxMs:  8000 },
  { type: 'wave',  weight: 10, minMs: 1500, maxMs:  2500 },
];

const BERSERK_STATES: Array<'wave' | 'surprised' | 'eat'> = ['wave', 'surprised', 'eat'];
const BERSERK_PHRASES = ['ok!', 'ok ok!', 'stop!', 'haha!', 'wait!', 'hey!!', 'oof!'];
const PET_PHRASES = ['ahhh', 'ok ok', 'more please', 'purr 🎋', '...zzz', 'mmm yes'];
const LAND_PHRASES = ['oof', 'ouch', 'that hurt', 'whoa', '!!'];
const THROW_PHRASES = ['WHEEE', 'AHHH', 'I can fly??', 'help'];

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

const WANDER_MIN_X = -400;
const WANDER_MAX_X = 0;

const PANDA_SIZE = 128;      // px
const GRAVITY = 1500;        // px/s²
const BOUNCE_ENERGY = 0.7;
const THROW_THRESHOLD = 0.3; // px/ms
const VELOCITY_WINDOW_MS = 100; // only samples within this window count for throw velocity
const SETTLE_SPEED = 80;     // px/s — below this, land
const MAX_FLIGHT_MS = 5000;  // watchdog: force-settle after this duration
const DRAG_CLICK_MAX_DIST = 5;
const DRAG_CLICK_MAX_MS = 200;
const PET_HOLD_MS = 500;
const PET_STILL_PX = 5;
const BERSERK_CLICKS = 5;
const BERSERK_WINDOW_MS = 1000;
const BERSERK_DURATION_MS = 4000;

const HAPPINESS_KEY = 'panda_happiness';
const HAPPINESS_MILESTONES: Array<{ at: number; msg: string }> = [
  { at: 10,  msg: "you're nice" },
  { at: 50,  msg: "best trader ever" },
  { at: 100, msg: "🎋🎋🎋" },
  { at: 500, msg: "i'd die for u" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickWeighted(actions: Action[]): Action {
  const total = actions.reduce((s, a) => s + a.weight, 0);
  let r = Math.random() * total;
  for (const a of actions) {
    r -= a.weight;
    if (r <= 0) return a;
  }
  return actions[actions.length - 1]!;
}

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function pickFrom<T>(arr: T[], exclude?: T): T {
  const pool = exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return pool[Math.floor(Math.random() * pool.length)] as T;
}

function pickPhrase(exclude: string): string {
  return pickFrom(PHRASES, exclude);
}

function getHappiness(): number {
  try {
    return parseInt(localStorage.getItem(HAPPINESS_KEY) ?? '0', 10) || 0;
  } catch { return 0; }
}

function setHappiness(n: number): void {
  try { localStorage.setItem(HAPPINESS_KEY, String(Math.max(0, n))); } catch { /* noop */ }
}

function addHappiness(delta: number): number {
  const next = Math.max(0, getHappiness() + delta);
  setHappiness(next);
  return next;
}

// Anchor position in viewport coordinates (top-left of panda sprite)
// anchor = bottom: 24px, right: 24px
function getAnchorPos(): Vec2 {
  return {
    x: window.innerWidth  - 24 - PANDA_SIZE,
    y: window.innerHeight - 24 - PANDA_SIZE,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PandaMascot() {
  // ── Visual state ──────────────────────────────────────────────────────────
  const [visibleState, setVisibleState]     = useState<PandaState>('idle');
  const [walkFrame, setWalkFrame]           = useState(0);
  const [xOffset, setXOffset]               = useState(0);
  const [facingLeft, setFacingLeft]         = useState(false);
  const [phrase, setPhrase]                 = useState('');
  const [bubbleVisible, setBubbleVisible]   = useState(false);
  const [bouncing, setBouncing]             = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  // Physics / drag / landing squish
  const [isOverridden, setIsOverridden]     = useState(false); // true = not autonomous
  const [physPos, setPhysPos]               = useState<Vec2>({ x: 0, y: 0 }); // absolute
  const [physRot, setPhysRot]               = useState(0);
  const [isSquishing, setIsSquishing]       = useState(false);
  const [zTop, setZTop]                     = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const currentActionRef   = useRef<Action | null>(null);
  const actionTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkFrameTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const bubbleTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bounceTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const squishTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const xOffsetRef         = useRef(0);
  const lastPhraseRef      = useRef('');
  const prefersReducedRef  = useRef(false);
  const pausedRef          = useRef(false);
  const loopRunningRef     = useRef(false);
  const overriddenRef      = useRef(false); // mirrors isOverridden without closure stale

  // Drag
  const btnRef             = useRef<HTMLButtonElement | null>(null);
  const isDraggingRef      = useRef(false);
  const dragStartPosRef    = useRef<Vec2>({ x: 0, y: 0 });
  const dragStartTimeRef   = useRef(0);
  const pointerSamplesRef  = useRef<PhysicsSample[]>([]);
  const grabOffsetRef      = useRef<Vec2>({ x: 0, y: 0 }); // cursor → sprite top-left

  // Physics RAF
  const physStateRef       = useRef<PhysicsState | null>(null);
  const rafRef             = useRef<number | null>(null);
  const lastRafTRef        = useRef<number>(0);

  // Petting
  const petTimerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const petIntervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const petTickRef         = useRef<ReturnType<typeof setInterval> | null>(null);

  // Berserk
  const clickTimesRef      = useRef<number[]>([]);
  const berserkTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const berserkTickRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const berserkStateIdxRef = useRef(0);

  // Happy counter
  const milestonesHitRef   = useRef<Set<number>>(new Set());
  const idleDecayTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastInteractRef    = useRef<number>(Date.now());

  // Cursor tracking
  const cursorPosRef       = useRef<Vec2 | null>(null);
  const cursorOffsetRef    = useRef<Vec2>({ x: 0, y: 0 });

  // Walking-back animation
  const walkBackRafRef     = useRef<number | null>(null);

  // Stuck-state watchdog interval
  const stuckCheckRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  // Walk transition duration (set once per walk action, stable across renders)
  const walkTransitionMsRef = useRef<number>(5000);

  // Last pointer-move timestamp (for held-state watchdog)
  const lastPointerMoveRef  = useRef<number>(0);
  // Last pointer-down active flag (set on down, cleared on up/cancel/lostcapture)
  const pointerActiveRef    = useRef<boolean>(false);
  // Active pointerId (so non-React handlers can release capture)
  const activePointerIdRef  = useRef<number | null>(null);
  // Drop-pending: cursor exited window mid-drag, ignore pending pointer events
  const dropPendingRef      = useRef<boolean>(false);

  // ── Reduced-motion detection ──────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    prefersReducedRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
      prefersReducedRef.current = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Bubble helper ─────────────────────────────────────────────────────────
  const showBubble = useCallback((text: string, durationMs = 3200) => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    setPhrase(text);
    setBubbleVisible(true);
    bubbleTimerRef.current = setTimeout(() => setBubbleVisible(false), durationMs);
  }, []);

  // ── Happy counter helpers ─────────────────────────────────────────────────
  const checkMilestone = useCallback((val: number) => {
    for (const m of HAPPINESS_MILESTONES) {
      if (val >= m.at && !milestonesHitRef.current.has(m.at)) {
        milestonesHitRef.current.add(m.at);
        showBubble(m.msg, 4000);
        break;
      }
    }
  }, [showBubble]);

  const bump = useCallback((delta: number) => {
    lastInteractRef.current = Date.now();
    const next = addHappiness(delta);
    checkMilestone(next);
  }, [checkMilestone]);

  // ── Stop walk frame cycle ─────────────────────────────────────────────────
  function stopWalkFrames() {
    if (walkFrameTimerRef.current) {
      clearInterval(walkFrameTimerRef.current);
      walkFrameTimerRef.current = null;
    }
  }

  // ── Cancel RAF (physics / walk-back) ─────────────────────────────────────
  function cancelRaf() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (walkBackRafRef.current !== null) {
      cancelAnimationFrame(walkBackRafRef.current);
      walkBackRafRef.current = null;
    }
  }

  // ── Enter override mode (interrupts autonomous loop) ─────────────────────
  function enterOverride() {
    overriddenRef.current = true;
    setIsOverridden(true);
    if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    stopWalkFrames();
    cancelRaf();
  }

  // ── Exit override mode → resume autonomous loop ───────────────────────────
  const scheduleNext = useCallback((wasWalking: boolean) => {
    if (pausedRef.current) return;
    const pool = prefersReducedRef.current ? REDUCED_ACTIONS : FULL_ACTIONS;
    const next = pickWeighted(pool);
    runAction(next, wasWalking);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exitOverride() {
    overriddenRef.current = false;
    setIsOverridden(false);
    // Reset to anchor coords so the isOverridden=false branch (xOffset only) takes
    // over cleanly without a 1-frame jump. physPos is ignored when !isOverridden.
    setPhysPos(getAnchorPos());
    setPhysRot(0);
    setZTop(false);
    xOffsetRef.current = 0;
    setXOffset(0);
    setFacingLeft(false);
    cancelRaf();
    scheduleNext(false);
  }

  // ── Walking-back to anchor after landing ──────────────────────────────────
  function startWalkBack(fromAbsPos: Vec2) {
    setVisibleState('walking-back');
    setZTop(false);
    const anchor = getAnchorPos();
    const goingLeft = anchor.x < fromAbsPos.x;
    setFacingLeft(goingLeft);

    // Cycle walk frames
    stopWalkFrames();
    let frameIdx = 0;
    setWalkFrame(0);
    walkFrameTimerRef.current = setInterval(() => {
      frameIdx = (frameIdx + 1) % WALK_FRAMES.length;
      setWalkFrame(frameIdx);
    }, 140);

    const startTime = performance.now();
    const duration = 2200;

    function tick(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      const curX = fromAbsPos.x + (anchor.x - fromAbsPos.x) * ease;
      const baseY = fromAbsPos.y + (anchor.y - fromAbsPos.y) * ease;
      // Y-bobbing: 2 full cycles, amplitude 7px, disabled when prefers-reduced-motion
      const bobAmplitude = 7;
      const bobCycles = 2;
      const bob = prefersReducedRef.current ? 0 : -Math.abs(Math.sin(t * Math.PI * bobCycles * 2)) * bobAmplitude;
      const curY = baseY + bob;
      setPhysPos({ x: curX, y: curY });
      setPhysRot(0);
      if (t < 1) {
        walkBackRafRef.current = requestAnimationFrame(tick);
      } else {
        walkBackRafRef.current = null;
        stopWalkFrames();
        exitOverride();
      }
    }
    walkBackRafRef.current = requestAnimationFrame(tick);
  }

  // ── Physics RAF loop ──────────────────────────────────────────────────────
  function startFlying(initState: PhysicsState) {
    physStateRef.current = { ...initState };
    lastRafTRef.current = performance.now();
    const flyStartT = performance.now();
    setZTop(true);
    setVisibleState('flying');

    const loop = (now: number) => {
      const s = physStateRef.current;
      if (!s) return;
      const dt = Math.min((now - lastRafTRef.current) / 1000, 0.05); // cap at 50ms
      lastRafTRef.current = now;

      // Watchdog: force-settle if flight runs too long
      if (now - flyStartT > MAX_FLIGHT_MS) {
        rafRef.current = null;
        const maxX = window.innerWidth  - PANDA_SIZE;
        const maxY = window.innerHeight - PANDA_SIZE - 24;
        const landPos = { x: Math.max(0, Math.min(s.pos.x, maxX)), y: maxY };
        setPhysPos(landPos);
        setPhysRot(0);
        setVisibleState('landing');
        setIsSquishing(true);
        if (!prefersReducedRef.current) {
          squishTimerRef.current = setTimeout(() => setIsSquishing(false), 220);
        } else {
          setIsSquishing(false);
        }
        bounceTimerRef.current = setTimeout(() => { startWalkBack(landPos); }, 1200);
        return;
      }

      // Apply gravity
      s.vel.y += GRAVITY * dt;

      // Move
      s.pos.x += s.vel.x * dt;
      s.pos.y += s.vel.y * dt;

      // Viewport bounds
      const maxX = window.innerWidth  - PANDA_SIZE;
      const maxY = window.innerHeight - PANDA_SIZE - 24; // floor with padding

      // Horizontal bounce
      if (s.pos.x < 0) {
        s.pos.x = 0;
        s.vel.x = Math.abs(s.vel.x) * BOUNCE_ENERGY;
      } else if (s.pos.x > maxX) {
        s.pos.x = maxX;
        s.vel.x = -Math.abs(s.vel.x) * BOUNCE_ENERGY;
      }

      // Floor bounce or settle
      if (s.pos.y >= maxY) {
        s.pos.y = maxY;
        const speed = Math.sqrt(s.vel.x * s.vel.x + s.vel.y * s.vel.y);
        if (speed < SETTLE_SPEED) {
          // Land
          rafRef.current = null;
          const landPos = { ...s.pos };
          setPhysPos(landPos);
          setPhysRot(0);
          setVisibleState('landing');
          setIsSquishing(true);
          if (!prefersReducedRef.current) {
            squishTimerRef.current = setTimeout(() => setIsSquishing(false), 220);
          } else {
            setIsSquishing(false);
          }
          const landPhrase = pickFrom(LAND_PHRASES);
          showBubble(landPhrase, 2000);
          bump(2); // throw bonus
          // Walk back after 1200ms
          bounceTimerRef.current = setTimeout(() => {
            startWalkBack(landPos);
          }, 1200);
          return; // stop loop
        } else {
          s.vel.y = -Math.abs(s.vel.y) * BOUNCE_ENERGY;
          s.vel.x *= 0.9; // friction on bounce
          s.rotVel *= 0.5;
        }
      }

      // Ceiling bounce
      if (s.pos.y < 0) {
        s.pos.y = 0;
        s.vel.y = Math.abs(s.vel.y) * BOUNCE_ENERGY;
      }

      // Rotation (disabled in reduced motion)
      if (!prefersReducedRef.current) {
        s.rot += s.rotVel * dt;
        s.rotVel *= 0.98;
      }

      setPhysPos({ x: s.pos.x, y: s.pos.y });
      setPhysRot(s.rot);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }

  // ── Berserk mode ──────────────────────────────────────────────────────────
  function startBerserk() {
    enterOverride();
    setVisibleState('berserk');
    berserkStateIdxRef.current = 0;

    const cycleStates = ['wave', 'surprised', 'eat'] as const;
    berserkTickRef.current = setInterval(() => {
      berserkStateIdxRef.current = (berserkStateIdxRef.current + 1) % cycleStates.length;
      setVisibleState(cycleStates[berserkStateIdxRef.current]!);
      const p = pickFrom(BERSERK_PHRASES);
      showBubble(p, 600);
    }, 200);

    berserkTimerRef.current = setTimeout(() => {
      if (berserkTickRef.current) clearInterval(berserkTickRef.current);
      berserkTickRef.current = null;
      exitOverride();
    }, BERSERK_DURATION_MS);
  }

  function stopBerserk() {
    if (berserkTickRef.current)  clearInterval(berserkTickRef.current);
    if (berserkTimerRef.current) clearTimeout(berserkTimerRef.current);
    berserkTickRef.current  = null;
    berserkTimerRef.current = null;
  }

  // ── Petting mode ──────────────────────────────────────────────────────────
  function startPetting() {
    enterOverride();
    setVisibleState('petting');
    showBubble(pickFrom(PET_PHRASES), 2200);

    petIntervalRef.current = setInterval(() => {
      showBubble(pickFrom(PET_PHRASES), 2200);
    }, 2000);

    petTickRef.current = setInterval(() => {
      bump(1);
    }, 1000);
  }

  function stopPetting() {
    if (petTimerRef.current)   clearTimeout(petTimerRef.current);
    if (petIntervalRef.current) clearInterval(petIntervalRef.current);
    if (petTickRef.current)    clearInterval(petTickRef.current);
    petTimerRef.current    = null;
    petIntervalRef.current = null;
    petTickRef.current     = null;
  }

  // ── Pointer event handlers ────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    btnRef.current?.setPointerCapture(e.pointerId);
    activePointerIdRef.current = e.pointerId;
    dropPendingRef.current = false;

    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    dragStartTimeRef.current = performance.now();
    isDraggingRef.current = false;
    pointerSamplesRef.current = [];
    pointerActiveRef.current = true;
    lastPointerMoveRef.current = performance.now();

    // Record grab offset: cursor relative to the panda's current absolute top-left
    const anchor = getAnchorPos();
    let absX: number;
    let absY: number;
    if (overriddenRef.current && physStateRef.current) {
      absX = physStateRef.current.pos.x;
      absY = physStateRef.current.pos.y;
    } else {
      absX = anchor.x + xOffsetRef.current;
      absY = anchor.y;
    }
    grabOffsetRef.current = { x: e.clientX - absX, y: e.clientY - absY };

    // Schedule petting check
    petTimerRef.current = setTimeout(() => {
      if (isDraggingRef.current) return; // moved too much
      if (overriddenRef.current && visibleState === 'berserk') return;
      startPetting();
    }, PET_HOLD_MS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleState]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!btnRef.current?.hasPointerCapture(e.pointerId)) return;
    if (dropPendingRef.current) return; // already triggered drop, ignore re-entry events

    // Out-of-viewport detection: if cursor leaves window during capture, drop immediately
    if (
      isDraggingRef.current &&
      (e.clientX < 0 || e.clientY < 0 ||
        e.clientX > window.innerWidth || e.clientY > window.innerHeight)
    ) {
      dropPendingRef.current = true;
      isDraggingRef.current = false;
      pointerActiveRef.current = false;
      if (petTimerRef.current) { clearTimeout(petTimerRef.current); petTimerRef.current = null; }
      stopPetting();
      const pid = activePointerIdRef.current;
      if (pid !== null && btnRef.current?.hasPointerCapture(pid)) {
        btnRef.current.releasePointerCapture(pid);
      }
      activePointerIdRef.current = null;
      if (physStateRef.current) {
        startWalkBack({ ...physStateRef.current.pos });
      } else {
        exitOverride();
      }
      return;
    }

    lastPointerMoveRef.current = performance.now();

    const dx = e.clientX - dragStartPosRef.current.x;
    const dy = e.clientY - dragStartPosRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Throttled debug log: only every ~10th move event
    if (Math.random() < 0.1) {
    }

    if (!isDraggingRef.current) {
      if (dist > PET_STILL_PX) {
        // Cancel petting — user is dragging
        if (petTimerRef.current) { clearTimeout(petTimerRef.current); petTimerRef.current = null; }
        // Also stop petting if we were in it
        if (visibleState === 'petting') { stopPetting(); }
        isDraggingRef.current = true;
        // Cancel autonomous loop, enter held
        enterOverride();
        setZTop(true);
        setVisibleState('held');
        stopBerserk();
        cancelRaf();
      } else {
        return;
      }
    }

    // Track samples for velocity
    const sample: PhysicsSample = {
      pos: { x: e.clientX, y: e.clientY },
      t: performance.now(),
    };
    pointerSamplesRef.current.push(sample);
    if (pointerSamplesRef.current.length > 5) {
      pointerSamplesRef.current.shift();
    }

    // Move panda to cursor
    const newX = e.clientX - grabOffsetRef.current.x;
    const newY = e.clientY - grabOffsetRef.current.y;
    const clamped: Vec2 = {
      x: clamp(newX, 0, window.innerWidth  - PANDA_SIZE),
      y: clamp(newY, 0, window.innerHeight - PANDA_SIZE),
    };
    physStateRef.current = physStateRef.current
      ? { ...physStateRef.current, pos: clamped }
      : { pos: clamped, vel: { x: 0, y: 0 }, rot: 0, rotVel: 0 };
    setPhysPos(clamped);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleState]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    btnRef.current?.releasePointerCapture(e.pointerId);
    pointerActiveRef.current = false;
    activePointerIdRef.current = null;
    stopPetting();

    if (dropPendingRef.current) {
      // mouseout already handled the drop; just consume this event
      dropPendingRef.current = false;
      isDraggingRef.current = false;
      return;
    }

    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;


    if (!wasDragging) {
      // It's a click
      const elapsed = performance.now() - dragStartTimeRef.current;
      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= DRAG_CLICK_MAX_DIST && elapsed <= DRAG_CLICK_MAX_MS) {
        handleClick();
      } else if (overriddenRef.current) {
        exitOverride();
      }
      return;
    }

    // Compute release velocity from samples within VELOCITY_WINDOW_MS of release
    const allSamples = pointerSamplesRef.current;
    const releaseT = performance.now();
    let recent = allSamples.filter((s) => releaseT - s.t <= VELOCITY_WINDOW_MS);
    if (recent.length < 2 && allSamples.length >= 2) {
      // Fallback: last two samples regardless of age
      recent = allSamples.slice(-2);
    }
    let vx = 0, vy = 0;
    if (recent.length >= 2) {
      const oldest = recent[0]!;
      const newest = recent[recent.length - 1]!;
      const dtMs = newest.t - oldest.t;
      if (dtMs > 0) {
        vx = ((newest.pos.x - oldest.pos.x) / dtMs) * 1000; // px/s
        vy = ((newest.pos.y - oldest.pos.y) / dtMs) * 1000;
      }
    }

    const speed = Math.sqrt(vx * vx + vy * vy); // px/s
    const speedPxPerMs = speed / 1000;

    const currentPos = physStateRef.current?.pos ?? getAnchorPos();


    if (speedPxPerMs > THROW_THRESHOLD && !prefersReducedRef.current) {
      // Throw!
      const rotVel = vx * 0.15;
      showBubble(pickFrom(THROW_PHRASES), 2000);
      startFlying({
        pos: { ...currentPos },
        vel: { x: vx, y: vy },
        rot: 0,
        rotVel,
      });
    } else if (prefersReducedRef.current) {
      // Reduced motion: just snap back
      exitOverride();
    } else {
      // Slow release: snap back
      startWalkBack({ ...currentPos });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBubble, bump]);

  // ── Lost pointer capture — fires when browser silently revokes capture ────
  // This is the primary cause of stuck-in-held: pointerup never arrives, panda freezes.
  const handleLostPointerCapture = useCallback(() => {
    if (!pointerActiveRef.current) return; // already cleaned up by pointerup/mouseout
    pointerActiveRef.current = false;
    activePointerIdRef.current = null;

    // Clear pet timer to unblock stuck watchdog check
    if (petTimerRef.current) { clearTimeout(petTimerRef.current); petTimerRef.current = null; }
    stopPetting();

    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;

    if (!wasDragging) {
      // Lost capture before drag started (just a click-hold) — exit cleanly
      if (overriddenRef.current) exitOverride();
      return;
    }

    // Was mid-drag: attempt throw if velocity exists, else walk back
    const allSamples = pointerSamplesRef.current;
    const releaseT = performance.now();
    let recent = allSamples.filter((s) => releaseT - s.t <= VELOCITY_WINDOW_MS);
    if (recent.length < 2 && allSamples.length >= 2) recent = allSamples.slice(-2);
    let vx = 0, vy = 0;
    if (recent.length >= 2) {
      const oldest = recent[0]!;
      const newest = recent[recent.length - 1]!;
      const dtMs = newest.t - oldest.t;
      if (dtMs > 0) {
        vx = ((newest.pos.x - oldest.pos.x) / dtMs) * 1000;
        vy = ((newest.pos.y - oldest.pos.y) / dtMs) * 1000;
      }
    }
    const speedPxPerMs = Math.sqrt(vx * vx + vy * vy) / 1000;
    const currentPos = physStateRef.current?.pos ?? getAnchorPos();

    if (speedPxPerMs > THROW_THRESHOLD && !prefersReducedRef.current) {
      showBubble(pickFrom(THROW_PHRASES), 2000);
      startFlying({ pos: { ...currentPos }, vel: { x: vx, y: vy }, rot: 0, rotVel: vx * 0.15 });
    } else {
      startWalkBack({ ...currentPos });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleState, showBubble]);

  const handlePointerCancel = useCallback(() => {
    if (!pointerActiveRef.current) return; // already handled by lostpointercapture
    pointerActiveRef.current = false;

    // Clear pet timer to unblock stuck watchdog
    if (petTimerRef.current) { clearTimeout(petTimerRef.current); petTimerRef.current = null; }
    stopPetting();

    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;

    if (!wasDragging) {
      if (overriddenRef.current) exitOverride();
      return;
    }

    // Attempt throw on cancel if velocity is high enough (e.g. fast touch flick)
    const allSamples = pointerSamplesRef.current;
    const releaseT = performance.now();
    let recent = allSamples.filter((s) => releaseT - s.t <= VELOCITY_WINDOW_MS);
    if (recent.length < 2 && allSamples.length >= 2) recent = allSamples.slice(-2);
    let vx = 0, vy = 0;
    if (recent.length >= 2) {
      const oldest = recent[0]!;
      const newest = recent[recent.length - 1]!;
      const dtMs = newest.t - oldest.t;
      if (dtMs > 0) {
        vx = ((newest.pos.x - oldest.pos.x) / dtMs) * 1000;
        vy = ((newest.pos.y - oldest.pos.y) / dtMs) * 1000;
      }
    }
    const speedPxPerMs = Math.sqrt(vx * vx + vy * vy) / 1000;
    const currentPos = physStateRef.current?.pos ?? getAnchorPos();

    if (speedPxPerMs > THROW_THRESHOLD && !prefersReducedRef.current) {
      showBubble(pickFrom(THROW_PHRASES), 2000);
      startFlying({ pos: { ...currentPos }, vel: { x: vx, y: vy }, rot: 0, rotVel: vx * 0.15 });
    } else if (physStateRef.current) {
      startWalkBack({ ...physStateRef.current.pos });
    } else {
      exitOverride();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleState, showBubble]);

  // ── Click handler (not drag) ───────────────────────────────────────────────
  function handleClick() {
    bump(1);

    // Track for berserk
    const now = performance.now();
    clickTimesRef.current = [...clickTimesRef.current, now].filter(
      (t) => now - t <= BERSERK_WINDOW_MS
    );

    if (clickTimesRef.current.length >= BERSERK_CLICKS && !overriddenRef.current) {
      clickTimesRef.current = [];
      startBerserk();
      return;
    }

    // Normal click — if already in berserk, just count
    if (overriddenRef.current) return;

    // Interrupt current action
    if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    stopWalkFrames();

    xOffsetRef.current = 0;
    setXOffset(0);
    setFacingLeft(false);
    setVisibleState('surprised');

    if (!prefersReducedRef.current) {
      setBouncing(true);
      bounceTimerRef.current = setTimeout(() => setBouncing(false), 220);
    }

    actionTimerRef.current = setTimeout(() => scheduleNext(false), 1500);
  }

  // ── Cursor tracking (idle state, within 200px) ────────────────────────────
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      cursorPosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  // Cursor-follow tick (16ms)
  useEffect(() => {
    if (prefersReduced) {
      cursorOffsetRef.current = { x: 0, y: 0 };
      return;
    }
    const interval = setInterval(() => {
      if (overriddenRef.current) return;
      if (visibleState !== 'idle') return;
      const cursor = cursorPosRef.current;
      if (!cursor) return;
      const anchor = getAnchorPos();
      const pandaCenterX = anchor.x + xOffsetRef.current + PANDA_SIZE / 2;
      const pandaCenterY = anchor.y + PANDA_SIZE / 2;
      const dx = cursor.x - pandaCenterX;
      const dy = cursor.y - pandaCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const strength = (200 - dist) / 200;
        cursorOffsetRef.current = {
          x: clamp((dx / dist) * strength * 4, -5, 5),
          y: clamp((dy / dist) * strength * 4, -5, 5),
        };
      } else {
        cursorOffsetRef.current = { x: 0, y: 0 };
      }
    }, 16);
    return () => clearInterval(interval);
  }, [prefersReduced, visibleState]);

  // ── Happiness idle decay ───────────────────────────────────────────────────
  useEffect(() => {
    idleDecayTimerRef.current = setInterval(() => {
      if (Date.now() - lastInteractRef.current > 60000) {
        const next = Math.max(0, getHappiness() - 1);
        setHappiness(next);
      }
    }, 60000);
    return () => {
      if (idleDecayTimerRef.current) clearInterval(idleDecayTimerRef.current);
    };
  }, []);

  // ── Execute a single autonomous action ────────────────────────────────────
  function runAction(action: Action, isWalking: boolean) {
    if (overriddenRef.current) return;
    currentActionRef.current = action;
    stopWalkFrames();

    const duration = randBetween(action.minMs, action.maxMs);


    if (action.type === 'walk') {
      const dir = Math.random() < 0.5 ? 'left' : 'right';
      const dist = randBetween(100, 400);
      const currentX = xOffsetRef.current;
      const rawTarget = dir === 'left' ? currentX - dist : currentX + dist;
      const targetX = clamp(rawTarget, WANDER_MIN_X, WANDER_MAX_X);
      const actualLeft = targetX < currentX;

      walkTransitionMsRef.current = randBetween(3000, 7000);
      setFacingLeft(actualLeft);
      setVisibleState('walk');

      xOffsetRef.current = targetX;
      setXOffset(targetX);

      let frameIdx = 0;
      walkFrameTimerRef.current = setInterval(() => {
        setWalkFrame(frameIdx % WALK_FRAMES.length);
        frameIdx++;
      }, 150);

    } else if (action.type === 'pause') {
      setVisibleState(isWalking ? 'pause' : 'idle');
    } else {
      setVisibleState(action.type as PandaState);
    }

    actionTimerRef.current = setTimeout(() => {
      if (pausedRef.current || overriddenRef.current) return;
      scheduleNext(action.type === 'walk');
    }, duration);
  }

  // ── Main autonomous loop ───────────────────────────────────────────────────
  useEffect(() => {
    if (loopRunningRef.current) return;
    loopRunningRef.current = true;

    actionTimerRef.current = setTimeout(() => scheduleNext(false), 2000);

    // Stuck-state watchdog: fires every 1500ms
    // If override is active but no drag, no RAF, no pending timers → panda is frozen, force-clean.
    // NOTE: petTimerRef check intentionally removed — lostpointercapture handler now clears it,
    // so a leaked petTimerRef no longer blocks this watchdog from firing.
    stuckCheckRef.current = setInterval(() => {
      if (!overriddenRef.current) return;

      // Case A: drag actif + pointer frozen (curseur sorti hors window OS)
      // pointermove/up ne firent plus mais pointerActiveRef reste true → fix dédié
      if (isDraggingRef.current && pointerActiveRef.current) {
        const idleMs = performance.now() - lastPointerMoveRef.current;
        if (idleMs > 800) {
          console.warn('[panda] event=watchdog state=drag-frozen-out-of-window idleMs=' + idleMs.toFixed(0));
          dropPendingRef.current = true;
          isDraggingRef.current = false;
          pointerActiveRef.current = false;
          if (petTimerRef.current) { clearTimeout(petTimerRef.current); petTimerRef.current = null; }
          stopPetting();
          const pid = activePointerIdRef.current;
          if (pid !== null && btnRef.current?.hasPointerCapture(pid)) {
            btnRef.current.releasePointerCapture(pid);
          }
          activePointerIdRef.current = null;
          if (physStateRef.current) {
            startWalkBack({ ...physStateRef.current.pos });
          } else {
            exitOverride();
          }
        }
        return;
      }

      if (isDraggingRef.current) return;
      if (pointerActiveRef.current) return;      // live pointer down — normal held state
      if (rafRef.current !== null) return;
      if (walkBackRafRef.current !== null) return;
      if (bounceTimerRef.current !== null) return;
      if (petIntervalRef.current !== null) return;
      if (berserkTimerRef.current !== null) return;

      // Secondary check: held state with no pointer activity for >500ms → definitely stuck
      const heldIdleMs = performance.now() - lastPointerMoveRef.current;
      if (heldIdleMs < 500) return; // give normal drags some room

      console.warn('[panda] event=watchdog state=stuck heldIdleMs=' + heldIdleMs.toFixed(0) + ' forcing exitOverride');
      // Clear leaked pet timer before exit
      if (petTimerRef.current) { clearTimeout(petTimerRef.current); petTimerRef.current = null; }
      exitOverride();
    }, 1500);

    // Window blur safeguard: catches alt-tab during drag where pointerup never fires
    const handleWindowBlur = () => {
      if (isDraggingRef.current || pointerActiveRef.current) {
        isDraggingRef.current = false;
        pointerActiveRef.current = false;
        if (petTimerRef.current) { clearTimeout(petTimerRef.current); petTimerRef.current = null; }
        stopPetting();
        if (physStateRef.current) {
          startWalkBack({ ...physStateRef.current.pos });
        } else {
          exitOverride();
        }
      }
    };
    window.addEventListener('blur', handleWindowBlur);

    // Mouseout safeguard: catches cursor leaving the OS window mid-drag
    // (Chrome stops firing pointermove/up but keeps capture → panda freezes)
    const handleDocumentMouseOut = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      if (e.relatedTarget !== null) return; // moving between elements, not exiting window
      // Set flags FIRST so lostpointercapture (fired sync by releasePointerCapture) is a no-op
      dropPendingRef.current = true;
      isDraggingRef.current = false;
      pointerActiveRef.current = false;
      if (petTimerRef.current) { clearTimeout(petTimerRef.current); petTimerRef.current = null; }
      stopPetting();
      // Now release capture (will fire lostpointercapture, which sees pointerActive=false → returns early)
      const pid = activePointerIdRef.current;
      if (pid !== null && btnRef.current?.hasPointerCapture(pid)) {
        btnRef.current.releasePointerCapture(pid);
      }
      activePointerIdRef.current = null;
      if (physStateRef.current) {
        startWalkBack({ ...physStateRef.current.pos });
      } else {
        exitOverride();
      }
    };
    document.addEventListener('mouseout', handleDocumentMouseOut);

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        pausedRef.current = false;
        if (!overriddenRef.current) scheduleNext(false);
      } else {
        pausedRef.current = true;
        if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
        stopWalkFrames();
        // Cancel any active flight
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        if (walkBackRafRef.current !== null) {
          cancelAnimationFrame(walkBackRafRef.current);
          walkBackRafRef.current = null;
        }
        // Snap back if overridden
        if (overriddenRef.current) {
          overriddenRef.current = false;
          setIsOverridden(false);
          setPhysPos({ x: 0, y: 0 });
          setPhysRot(0);
          setZTop(false);
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('mouseout', handleDocumentMouseOut);
      if (stuckCheckRef.current)    clearInterval(stuckCheckRef.current);
      if (actionTimerRef.current)   clearTimeout(actionTimerRef.current);
      if (bubbleTimerRef.current)   clearTimeout(bubbleTimerRef.current);
      if (bounceTimerRef.current)   clearTimeout(bounceTimerRef.current);
      if (squishTimerRef.current)   clearTimeout(squishTimerRef.current);
      if (berserkTimerRef.current)  clearTimeout(berserkTimerRef.current);
      if (berserkTickRef.current)   clearInterval(berserkTickRef.current);
      if (petTimerRef.current)      clearTimeout(petTimerRef.current);
      if (petIntervalRef.current)   clearInterval(petIntervalRef.current);
      if (petTickRef.current)       clearInterval(petTickRef.current);
      stopWalkFrames();
      cancelRaf();
      loopRunningRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resolve img src ────────────────────────────────────────────────────────
  function getImgSrc(): string {
    if (visibleState === 'walk' || visibleState === 'walking-back') {
      return `/mascot/${WALK_FRAMES[walkFrame] ?? 'idle'}.png`;
    }
    return `/mascot/${STATE_TO_IMG[visibleState]}.png`;
  }

  function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    if (!img.src.endsWith('idle.png')) {
      img.src = '/mascot/idle.png';
    }
  }

  // ── Derive transform for the mover wrapper ────────────────────────────────
  const walkTransition =
    visibleState === 'walk' && !prefersReduced && !isOverridden
      ? `transform ${walkTransitionMsRef.current}ms linear`
      : 'none';

  // Override position: absolute coords → convert to translate from anchor
  const anchor = typeof window !== 'undefined' ? getAnchorPos() : { x: 0, y: 0 };
  const moverTransform = isOverridden
    ? `translate3d(${physPos.x - anchor.x}px, ${physPos.y - anchor.y}px, 0) rotate(${physRot}deg)`
    : `translate3d(${xOffset + cursorOffsetRef.current.x}px, ${cursorOffsetRef.current.y}px, 0)`;

  // Image transform: grab stretch
  const imgExtraTransform =
    visibleState === 'held' && !prefersReduced
      ? 'scale(0.95, 1.1)'
      : '';

  // Berserk jitter rotation (reduced: none)
  const berserkJitter =
    visibleState === 'berserk' && !prefersReduced
      ? `rotate(${(Math.random() * 20 - 10).toFixed(1)}deg)`
      : '';

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
          pointer-events: none;
        }
        .panda-wrap.z-top {
          z-index: 9999;
        }
        @media (max-width: 479px) {
          .panda-wrap { display: none; }
        }
        .panda-mover {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          will-change: transform;
          pointer-events: auto;
        }
        .panda-btn {
          position: relative;
          width: 128px;
          height: 128px;
          background: none;
          border: none;
          padding: 0;
          cursor: grab;
          display: block;
          touch-action: none;
        }
        .panda-btn:active {
          cursor: grabbing;
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
          transition: transform 80ms ease;
        }
        .panda-img.facing-left {
          transform: scaleX(-1);
        }
        .panda-bounce {
          animation: pandaBounce 220ms ease-out forwards;
        }
        @keyframes pandaBounce {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .panda-squish {
          animation: pandaSquish 220ms ease-out forwards;
        }
        @keyframes pandaSquish {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.15, 0.85); }
          100% { transform: scale(1); }
        }
        .panda-pet {
          animation: pandaPet 1s ease-in-out infinite;
        }
        @keyframes pandaPet {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(0.95, 1.05); }
        }
        .panda-berserk {
          animation: pandaBerserk 0.2s ease-in-out infinite;
        }
        @keyframes pandaBerserk {
          0%,100% { transform: scale(1) rotate(-5deg); }
          50%     { transform: scale(1.06) rotate(5deg); }
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
          white-space: normal;
          max-width: min(220px, 70vw);
          pointer-events: none;
          opacity: 0;
          z-index: 51;
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
        @media (prefers-reduced-motion: reduce) {
          .panda-mover    { transition: none !important; }
          .panda-bounce   { animation: none !important; }
          .panda-squish   { animation: none !important; }
          .panda-pet      { animation: none !important; }
          .panda-berserk  { animation: none !important; }
          .panda-bubble   { transition: none !important; }
          .panda-img      { transition: none !important; }
        }
      `}</style>

      <div className={`panda-wrap${zTop ? ' z-top' : ''}`}>
        <div
          className="panda-mover"
          style={{
            transform: moverTransform,
            transition: walkTransition,
          }}
        >
          <div
            className={`panda-bubble${bubbleVisible ? ' visible' : ''}${prefersReduced ? ' reduced' : ''}`}
            role="status"
            aria-live="polite"
          >
            {phrase}
          </div>

          <button
            ref={btnRef}
            className={`panda-btn${bouncing ? ' panda-bounce' : ''}${isSquishing ? ' panda-squish' : ''}`}
            aria-label="Pet the panda"
            type="button"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onLostPointerCapture={handleLostPointerCapture}
          >
            <img
              src={getImgSrc()}
              alt={`Panda mascot — ${visibleState}`}
              className={[
                'panda-img',
                facingLeft && !isOverridden ? 'facing-left' : '',
                visibleState === 'petting' ? 'panda-pet' : '',
                visibleState === 'berserk' ? 'panda-berserk' : '',
              ].filter(Boolean).join(' ')}
              style={{
                transform: imgExtraTransform || berserkJitter || undefined,
              }}
              width={128}
              height={128}
              loading="lazy"
              draggable={false}
              onError={handleImgError}
            />
          </button>
        </div>
      </div>
    </>
  );
}
