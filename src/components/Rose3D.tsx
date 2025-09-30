import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Simple 3D Rose geometry using basic shapes
const RoseGeometry = () => {
  const roseRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (roseRef.current) {
      roseRef.current.rotation.y += delta * 0.5;
    }
  });

  // Create rose petals using cylinders and spheres
  const petalPositions = [
    [0, 0, 0],
    [0.3, 0.1, 0.2], 
    [-0.3, 0.1, 0.2],
    [0.2, 0.2, -0.3],
    [-0.2, 0.2, -0.3],
    [0, 0.3, 0.1]
  ];

  return (
    <group ref={roseRef} scale={[2, 2, 2]}>
      {/* Rose center */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      
      {/* Rose petals */}
      {petalPositions.map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} rotation={[Math.PI / 4, index * 0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.25, 0.3, 8]} />
          <meshStandardMaterial color={index === 0 ? "#DC143C" : "#B22222"} transparent opacity={0.8} />
        </mesh>
      ))}
      
      {/* Stem */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      
      {/* Leaves */}
      <mesh position={[0.2, -0.4, 0]} rotation={[0, 0, Math.PI / 6]}>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial color="#32CD32" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.2, -0.6, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <planeGeometry args={[0.25, 0.12]} />
        <meshStandardMaterial color="#32CD32" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

interface Rose3DProps {
  className?: string;
}

const Rose3D = ({ className }: Rose3DProps) => {
  return (
    <div className={className}>
      <Canvas
        camera={{ 
          position: [2, 2, 4], 
          fov: 50
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        
        <RoseGeometry />
        
        <OrbitControls
          autoRotate={false}
          enableDamping={true}
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
};

export default Rose3D;