'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Outlines } from '@react-three/drei';
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

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const gradTex = useMemo(() => buildToonGradient(color), [color]);

  useMemo(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshToonMaterial({
          color: new THREE.Color(color),
          gradientMap: gradTex,
          transparent: true,
          opacity: 0.88,
        });
        mesh.castShadow = false;
      }
    });
  }, [clonedScene, color, gradTex]);

  const jumpT = useRef(0);
  const wanderT = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    jumpT.current += delta;
    wanderT.current += delta * 0.4;

    // Periodic jump arc
    const phase = (jumpT.current % jumpEvery) / jumpEvery;
    const jumpY = phase < 0.28 ? Math.sin((phase / 0.28) * Math.PI) * 0.45 : 0;

    // Idle breathe (squash-stretch)
    const breathe = 1 + Math.sin(jumpT.current * 1.8) * 0.03;
    const squash = jumpY > 0.01 ? 1 - jumpY * 0.18 : breathe;

    // Sin wander X
    const wanderX = Math.sin(wanderT.current) * wanderRange;

    // Mouse parallax
    const px = mouse.x * parallaxStrength;
    const py = mouse.y * parallaxStrength * 0.5;

    g.position.set(
      basePos[0] + wanderX + px,
      basePos[1] + jumpY + py,
      basePos[2],
    );
    g.scale.set(scale * squash, scale * (jumpY > 0.01 ? 1 + jumpY * 0.12 : breathe), scale);
  });

  return (
    <group ref={groupRef} position={basePos} scale={scale}>
      <primitive object={clonedScene} />
      <Outlines thickness={0.04} color="#0a1238" />
    </group>
  );
}
