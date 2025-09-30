import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Subtle floating particles with gentle movement
function SubtleParticles() {
  const count = 400;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 15 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      
      // Gentle floating animation
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i * 0.01) * 0.002;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ff69b4"
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Falling stars effect
function FallingStars() {
  const count = 80;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 50;     // x
      pos[i3 + 1] = Math.random() * 30 + 10;    // y (start high)
      pos[i3 + 2] = (Math.random() - 0.5) * 30; // z
    }
    return pos;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);
  const velocities = useMemo(() => {
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      vel[i3] = (Math.random() - 0.5) * 0.02;     // x velocity
      vel[i3 + 1] = -(Math.random() * 0.1 + 0.05); // y velocity (falling)
      vel[i3 + 2] = (Math.random() - 0.5) * 0.01;  // z velocity
    }
    return vel;
  }, [count]);

  useFrame(() => {
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < pos.length; i += 3) {
        // Apply velocity
        pos[i] += velocities[i];         // x
        pos[i + 1] += velocities[i + 1]; // y
        pos[i + 2] += velocities[i + 2]; // z
        
        // Reset particles that fall below view
        if (pos[i + 1] < -15) {
          pos[i] = (Math.random() - 0.5) * 50;
          pos[i + 1] = Math.random() * 10 + 15;
          pos[i + 2] = (Math.random() - 0.5) * 30;
        }
        
        // Wrap around sides
        if (pos[i] > 25) pos[i] = -25;
        if (pos[i] < -25) pos[i] = 25;
        if (pos[i + 2] > 15) pos[i + 2] = -15;
        if (pos[i + 2] < -15) pos[i + 2] = 15;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ff69b4"
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Cursor-following light effect
function CursorLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const { mouse } = useThree();

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.x = mouse.x * 5;
      lightRef.current.position.y = mouse.y * 5;
      lightRef.current.position.z = 3;
    }
  });

  return (
    <pointLight 
      ref={lightRef}
      intensity={0.8}
      color="#ff69b4"
      distance={8}
    />
  );
}

// Gentle ambient particles in background
function AmbientDust() {
  const count = 150;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 40;
      pos[i3 + 1] = (Math.random() - 0.5) * 30;
      pos[i3 + 2] = (Math.random() - 0.5) * 30 - 10;
    }
    return pos;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i] += Math.sin(state.clock.elapsedTime * 0.1 + i * 0.001) * 0.001;
        pos[i + 2] += Math.cos(state.clock.elapsedTime * 0.15 + i * 0.002) * 0.001;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#9966cc"
        size={0.015}
        sizeAttenuation
        transparent
        opacity={0.3}
      />
    </points>
  );
}

export default function AdvancedBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.5} 
          color="#ff69b4" 
        />
        
        <AmbientDust />
        <SubtleParticles />
        <FallingStars />
        <CursorLight />
      </Canvas>
    </div>
  );
}
