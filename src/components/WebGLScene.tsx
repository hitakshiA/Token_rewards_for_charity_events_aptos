import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Points, 
  PointMaterial, 
  Float, 
  OrbitControls,
  Sphere,
  MeshDistortMaterial,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';

// Floating Hearts Component
const FloatingHearts = () => {
  const count = 50;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 20;
      pos[i + 1] = (Math.random() - 0.5) * 20;
      pos[i + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x += delta * 0.1;
      pointsRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        transparent
        color="#ff69b4"
        size={0.1}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

// Interactive Sphere
const InteractiveSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
      
      // Follow mouse
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        mouse.x * 2,
        0.02
      );
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        mouse.y * 2,
        0.02
      );
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={1}
      floatIntensity={2}
    >
      <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, -3]}>
        <MeshDistortMaterial
          color="#ff69b4"
          transparent
          opacity={0.3}
          distort={0.3}
          speed={2}
        />
      </Sphere>
    </Float>
  );
};

// Particle Field
const ParticleField = () => {
  const count = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 50;
      pos[i + 1] = (Math.random() - 0.5) * 50;
      pos[i + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [count]);

  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.1;
      
      // Animate particles
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(state.clock.elapsedTime + positions[i] * 0.01) * 0.01;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={particlesRef} positions={positions}>
      <PointMaterial
        transparent
        color="#ffc0cb"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

// Background Gradient Sphere
const BackgroundSphere = () => {
  return (
    <Sphere args={[50, 32, 32]} position={[0, 0, -25]}>
      <meshBasicMaterial
        color="#330066"
        side={THREE.BackSide}
        transparent
        opacity={0.3}
      />
    </Sphere>
  );
};

const WebGLScene = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: 60,
          near: 0.1,
          far: 100
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff69b4" />
        
        <BackgroundSphere />
        <ParticleField />
        <FloatingHearts />
        <InteractiveSphere />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default WebGLScene;