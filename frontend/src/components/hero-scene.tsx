"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Orb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.22;
  });

  return (
    <Float
      speed={2}
      rotationIntensity={1.2}
      floatIntensity={2}
    >
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 8]} />

        <MeshDistortMaterial
          distort={0.35}
          speed={2}
          roughness={0.12}
          metalness={0.15}
          color="#7c5cff"
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
        }}
      >
        <ambientLight intensity={1.8} />

        <pointLight
          position={[4, 4, 4]}
          intensity={35}
          color="#00d4ff"
        />

        <pointLight
          position={[-4, -2, 3]}
          intensity={25}
          color="#ff4fd8"
        />

        <Sparkles
          count={90}
          scale={8}
          size={2}
          speed={0.4}
        />

        <Orb />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.35}
        />
      </Canvas>
    </div>
  );
}