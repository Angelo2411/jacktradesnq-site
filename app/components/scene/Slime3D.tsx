'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Outlines } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import type { Group } from 'three';

const K_SPRING  = 55;
const K_DAMP    = 8;
const GRAVITY   = 18;
const JUMP_VEL  = 7.5;
const TOON_STEPS = 4;

function buildToonGradient(hex: string): THREE.DataTexture {
  const base = new THREE.Color(hex);
  const data = new Uint8Array(TOON_STEPS * 4);
  const brightnesses = [0.18, 0.45, 0.75, 1.0];
  for (let i = 0; i < TOON_STEPS; i++) {
    const c = base.clone().multiplyScalar(brightnesses[i]);
    data[i * 4 + 0] = Math.round(c.r * 255);
    data[i * 4 + 1] = Math.round(c.g * 255);
    data[i * 4 + 2] = Math.round(c.b * 255);
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, TOON_STEPS, 1);
  tex.needsUpdate = true;
  return tex;
}

type Props = {
  color: string;
  basePos: [number, number, number];
  scale: number;
  jumpEvery: number;
  wanderRange?: number;
  parallaxStrength?: number;
};

export default function Slime3D({
  color,
  basePos,
  scale,
  jumpEvery,
  wanderRange = 0.4,
  parallaxStrength = 0.08,
}: Props) {
  const groupRef = useRef<Group>(null!);
  const reduceMotion = useReducedMotion() ?? false;

  const { scene } = useGLTF('/assets/slime-blue.glb');
  const gradTex = useMemo(() => buildToonGradient(color), [color]);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshToonMaterial({
          color: new THREE.Color(color),
          gradientMap: gradTex,
          transparent: true,
          opacity: 0.86,
        });
        mesh.castShadow = false;
      }
    });
    return clone;
  }, [scene, color, gradTex]);

  const innerScene = useMemo(() => {
    const bright = new THREE.Color(color).multiplyScalar(1.5);
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: bright,
          emissive: bright,
          emissiveIntensity: 0.4,
          transparent: true,
          opacity: 0.45,
        });
        mesh.castShadow = false;
      }
    });
    return clone;
  }, [scene, color]);

  const eyeGeo  = useMemo(() => new THREE.TorusGeometry(0.06, 0.012, 8, 20, Math.PI), []);
  const eyeMat  = useMemo(() => new THREE.MeshBasicMaterial({ color: '#0a1238' }), []);
  const specGeo = useMemo(() => new THREE.SphereGeometry(0.08, 8, 8), []);
  const specMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.9,
    transparent: true, opacity: 0.75,
  }), []);

  // Physics refs
  const phaseRef      = useRef(Math.random() * jumpEvery);
  const prevCycleTRef = useRef(0);
  const hasJumpedRef  = useRef(false);
  const jumpYRef      = useRef(0);
  const jumpVelYRef   = useRef(0);
  const jigScaleY     = useRef(1);
  const jigVelY       = useRef(0);
  const jigScaleX     = useRef(1);
  const jigVelX       = useRef(0);
  const wanderTRef    = useRef(Math.random() * Math.PI * 2);
  const curMouseX     = useRef(0);
  const curMouseY     = useRef(0);
  const prevMouse     = useRef({ x: 0, y: 0 });
  const lastMovedT    = useRef(0);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    if (reduceMotion) {
      g.position.set(...basePos);
      g.scale.setScalar(scale);
      return;
    }

    const t = state.clock.elapsedTime;
    const mx = state.mouse.x;
    const my = state.mouse.y;

    // ── MOUSE TRACKING ──
    if (Math.abs(mx - prevMouse.current.x) > 0.001 || Math.abs(my - prevMouse.current.y) > 0.001) {
      lastMovedT.current = t;
      prevMouse.current.x = mx;
      prevMouse.current.y = my;
    }
    const mouseWeight = Math.max(0, 1 - (t - lastMovedT.current) / 6);
    const tgtX = mx * parallaxStrength * 1.2 * mouseWeight;
    const tgtY = my * parallaxStrength * 0.6 * mouseWeight;
    curMouseX.current += (tgtX - curMouseX.current) * 0.025;
    curMouseY.current += (tgtY - curMouseY.current) * 0.025;

    // ── WANDER ──
    wanderTRef.current += delta * 0.4;
    const wanderX = Math.sin(wanderTRef.current) * wanderRange;

    // ── CYCLE ──
    const cycleT = (t + phaseRef.current) % jumpEvery;
    const didWrap = cycleT < prevCycleTRef.current;
    if (didWrap) hasJumpedRef.current = false;
    prevCycleTRef.current = cycleT;

    const onGround = jumpYRef.current <= 0.01;

    let antStretchY = 1;
    let antStretchX = 1;
    if (cycleT < 0.20 && onGround) {
      const p = cycleT / 0.20;
      antStretchY = 1 - 0.22 * p;   // squat
      antStretchX = 1 + 0.18 * p;
    } else if (cycleT >= 0.20 && cycleT < 0.30 && !hasJumpedRef.current && onGround) {
      jumpVelYRef.current = JUMP_VEL;
      hasJumpedRef.current = true;
      antStretchY = 1.15;
      antStretchX = 0.92;
    } else if (cycleT >= 0.20 && cycleT < 0.30 && hasJumpedRef.current) {
      antStretchY = 1.15;
      antStretchX = 0.92;
    }

    // ── GRAVITY ──
    if (jumpYRef.current > 0 || jumpVelYRef.current > 0) {
      jumpVelYRef.current -= GRAVITY * delta;
      jumpYRef.current = Math.max(0, jumpYRef.current + jumpVelYRef.current * delta);
      if (jumpYRef.current === 0 && jumpVelYRef.current < 0) {
        jumpVelYRef.current = 0;
        jigVelY.current = -3.5;
        jigVelX.current = 2.5;
      }
    }

    // ── JELLY SPRING ──
    const fY = -K_SPRING * (jigScaleY.current - 1) - K_DAMP * jigVelY.current;
    jigVelY.current  += fY * delta;
    jigScaleY.current = Math.max(0.15, jigScaleY.current + jigVelY.current * delta);

    const fX = -K_SPRING * (jigScaleX.current - 1) - K_DAMP * jigVelX.current;
    jigVelX.current  += fX * delta;
    jigScaleX.current = Math.max(0.15, jigScaleX.current + jigVelX.current * delta);

    // ── BREATHE ──
    const breathe = 1 + Math.sin(t * 1.8 + phaseRef.current) * 0.02;

    // ── FINAL ──
    g.position.set(
      basePos[0] + wanderX + curMouseX.current,
      basePos[1] + jumpYRef.current + curMouseY.current,
      basePos[2],
    );
    g.scale.set(
      scale * antStretchX * jigScaleX.current * breathe,
      scale * antStretchY * jigScaleY.current * breathe,
      scale,
    );
  });

  return (
    <group ref={groupRef} position={basePos} scale={scale}>
      <primitive object={clonedScene} />
      <Outlines thickness={0.04} color="#0a1238" />
      <group scale={0.92}>
        <primitive object={innerScene} />
      </group>
      <mesh geometry={eyeGeo} material={eyeMat} position={[-0.18, 0.35, 0.85]} rotation={[0, 0, Math.PI]} />
      <mesh geometry={eyeGeo} material={eyeMat} position={[ 0.18, 0.35, 0.85]} rotation={[0, 0, Math.PI]} />
      <mesh geometry={specGeo} material={specMat} position={[-0.35, 0.55, 0.65]} scale={[0.15, 0.08, 0.05]} />
    </group>
  );
}
