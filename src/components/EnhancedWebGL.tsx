import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Wave Plane Component
const WavePlane = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.1;
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] = Math.sin(x * 2 + state.clock.elapsedTime) * 0.2 + 
                          Math.sin(y * 3 + state.clock.elapsedTime * 1.5) * 0.1;
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]} rotation={[-Math.PI / 4, 0, 0]}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <meshPhongMaterial
        color="#ff69b4"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        wireframe={true}
      />
    </mesh>
  );
};

// Morphing Geometry
const MorphingGeometry = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.y += delta * 0.2;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[3, 2, -1]}>
      <octahedronGeometry args={[0.5, 2]} />
      <meshPhongMaterial
        color="#ff1493"
        transparent
        opacity={0.7}
        wireframe={false}
        emissive="#330033"
      />
    </mesh>
  );
};

// Particle Swirl
const ParticleSwirl = () => {
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 10;
      
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.2;
      
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        const radius = Math.sqrt(x * x + z * z);
        const angle = Math.atan2(z, x) + delta * 0.5;
        
        positions[i] = Math.cos(angle) * radius;
        positions[i + 2] = Math.sin(angle) * radius;
        positions[i + 1] += Math.sin(state.clock.elapsedTime + i * 0.01) * 0.01;
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
        sizeAttenuation={true}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const EnhancedWebGL = () => {
  return (
    <div className="absolute inset-0 -z-10 opacity-60">
      <Canvas
        camera={{ 
          position: [0, 2, 8], 
          fov: 50,
          near: 0.1,
          far: 100
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <fog attach="fog" args={['#330066', 8, 25]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ff69b4" />
        <pointLight position={[-5, 3, 2]} intensity={0.8} color="#9966cc" />
        
        <WavePlane />
        <ParticleSwirl />
        <MorphingGeometry />
      </Canvas>
    </div>
  );
};

export default EnhancedWebGL;