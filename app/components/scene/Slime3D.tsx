'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Outlines } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import type { Group } from 'three';

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
  const { scene } = useGLTF('/assets/slime-blue.glb');
  const { mouse } = useThree();
  const reduceMotion = useReducedMotion() ?? false;
  const phase = useRef(Math.random() * Math.PI * 2);

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

  const eyeGeo = useMemo(
    () => new THREE.TorusGeometry(0.06, 0.012, 8, 20, Math.PI),
    [],
  );
  const eyeMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#0a1238' }),
    [],
  );
  const specGeo = useMemo(() => new THREE.SphereGeometry(0.08, 8, 8), []);
  const specMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#ffffff',
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.75,
      }),
    [],
  );

  const jumpT = useRef(0);
  const wanderT = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    if (reduceMotion) {
      g.position.set(basePos[0], basePos[1], basePos[2]);
      g.scale.setScalar(scale);
      return;
    }

    const t = state.clock.elapsedTime;
    jumpT.current += delta;
    wanderT.current += delta * 0.4;

    const jPhase = (jumpT.current % jumpEvery) / jumpEvery;
    const jumpY = jPhase < 0.28 ? Math.sin((jPhase / 0.28) * Math.PI) * 0.45 : 0;

    const wobbleY = 1 + Math.sin(t * 1.2 + phase.current) * 0.03;
    const wobbleX = 1 + Math.sin(t * 1.7 + phase.current) * 0.02;
    const squashY = jumpY > 0.01 ? 1 - jumpY * 0.18 : wobbleY;
    const squashX = jumpY > 0.01 ? 1 + jumpY * 0.08 : wobbleX;

    const wanderX = Math.sin(wanderT.current) * wanderRange;
    const px = mouse.x * parallaxStrength;
    const py = mouse.y * parallaxStrength * 0.5;

    g.position.set(
      basePos[0] + wanderX + px,
      basePos[1] + jumpY + py,
      basePos[2],
    );
    g.scale.set(scale * squashX, scale * squashY, scale);
  });

  return (
    <group ref={groupRef} position={basePos} scale={scale}>
      <primitive object={clonedScene} />
      <Outlines thickness={0.04} color="#0a1238" />
      <group scale={0.92}>
        <primitive object={innerScene} />
      </group>
      {/* Closed-eye smile arcs */}
      <mesh geometry={eyeGeo} material={eyeMat} position={[-0.18, 0.35, 0.85]} rotation={[0, 0, Math.PI]} />
      <mesh geometry={eyeGeo} material={eyeMat} position={[0.18, 0.35, 0.85]} rotation={[0, 0, Math.PI]} />
      {/* Spec highlight */}
      <mesh geometry={specGeo} material={specMat} position={[-0.35, 0.55, 0.65]} scale={[0.15, 0.08, 0.05]} />
    </group>
  );
}
