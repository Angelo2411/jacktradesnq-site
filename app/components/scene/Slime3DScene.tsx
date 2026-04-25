'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import Slime3D from './Slime3D';

useGLTF.preload('/assets/slime-blue.glb');

export default function Slime3DScene() {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 80, position: [0, 0, 10], near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 2]} intensity={0.9} />
      <Suspense fallback={null}>
        <Slime3D color="#3580E0" basePos={[-3, -1, 0]}  scale={1.7}  jumpEvery={3.2} wanderRange={0.5} />
        <Slime3D color="#E84A8B" basePos={[0.5, -0.7, 0]} scale={0.95} jumpEvery={2.6} wanderRange={0.6} />
        <Slime3D color="#F5C842" basePos={[2.5, 0.2, -1]}  scale={0.55} jumpEvery={2.2} wanderRange={0.4} />
      </Suspense>
    </Canvas>
  );
}
