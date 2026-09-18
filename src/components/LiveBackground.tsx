import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Generate head-shaped point cloud
function generateHeadPoints(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Use spherical coordinates with deformation for head shape
    const phi = Math.acos(2 * Math.random() - 1); // 0 to PI
    const theta = Math.random() * Math.PI * 2; // 0 to 2PI
    
    // Head shape deformation
    let r = 1.0;
    
    // Flatten top and bottom (skull shape)
    const y = Math.cos(phi);
    if (y > 0.7) r *= 0.85 - (y - 0.7) * 0.3;
    if (y < -0.5) r *= 0.7 + (y + 0.5) * 0.2;
    
    // Narrow the jaw area
    if (y < -0.2 && y > -0.8) {
      const jawFactor = 1 - Math.abs(y + 0.5) * 0.3;
      r *= jawFactor;
    }
    
    // Forehead bulge
    if (y > 0.3 && y < 0.7) {
      r *= 1.05;
    }
    
    // Nose protrusion (front center)
    const x = Math.sin(phi) * Math.cos(theta);
    const z = Math.sin(phi) * Math.sin(theta);
    
    if (z > 0.7 && Math.abs(x) < 0.15 && y > -0.2 && y < 0.2) {
      r *= 1.15;
    }
    
    // Eye socket indentations
    if (z > 0.5 && Math.abs(x) > 0.15 && Math.abs(x) < 0.4 && y > 0 && y < 0.3) {
      r *= 0.92;
    }
    
    // Add some noise for organic feel
    r += (Math.random() - 0.5) * 0.02;
    
    positions[i3] = x * r * 1.2;
    positions[i3 + 1] = y * r * 1.5;
    positions[i3 + 2] = z * r * 1.0;
  }
  
  return positions;
}

// Face Point Cloud Component
function FacePointCloud() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { positions, colors } = useMemo(() => {
    const count = 3000;
    const pos = generateHeadPoints(count);
    const col = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const y = pos[i3 + 1];
      // Gradient from cyan at top to purple at bottom
      const t = (y + 1.5) / 3;
      col[i3] = 0.3 * (1 - t) + 0 * t;      // R
      col[i3 + 1] = 0.95 * t + 0 * (1 - t);  // G
      col[i3 + 2] = 1 * (1 - t) + 1 * t;      // B
    }
    
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Gentle rotation
    pointsRef.current.rotation.y = time * 0.1;
    
    // Breathing effect - subtle scale pulse
    const breathe = 1 + Math.sin(time * 0.5) * 0.02;
    pointsRef.current.scale.set(breathe, breathe, breathe);
    
    // Animate individual particles
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < posArray.length; i += 3) {
      const origX = positions[i];
      const origY = positions[i + 1];
      const origZ = positions[i + 2];
      
      // Subtle wave displacement
      const wave = Math.sin(time * 2 + origY * 3) * 0.01;
      posArray[i] = origX + wave;
      posArray[i + 1] = origY + Math.sin(time * 1.5 + origX * 2) * 0.008;
      posArray[i + 2] = origZ + Math.cos(time * 1.8 + origY * 2) * 0.005;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Animated Wave Lines
function WaveLines() {
  const linesRef = useRef<THREE.Group>(null);
  
  const lineGeometries = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const numLines = 5;
    const pointsPerLine = 200;
    
    for (let l = 0; l < numLines; l++) {
      const positions = new Float32Array(pointsPerLine * 3);
      for (let i = 0; i < pointsPerLine; i++) {
        positions[i * 3] = (i / pointsPerLine - 0.5) * 12;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (l - numLines / 2) * 0.8;
      }
      
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometries.push(geom);
    }
    
    return geometries;
  }, []);

  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.elapsedTime;
    
    linesRef.current.children.forEach((child, lineIndex) => {
      const line = child as THREE.Line;
      const posArray = line.geometry.attributes.position.array as Float32Array;
      const pointsPerLine = posArray.length / 3;
      
      for (let i = 0; i < pointsPerLine; i++) {
        const x = posArray[i * 3];
        const freq1 = 0.5 + lineIndex * 0.1;
        const freq2 = 1.2 + lineIndex * 0.15;
        const amplitude = 0.3 - lineIndex * 0.04;
        
        posArray[i * 3 + 1] = 
          Math.sin(x * freq1 + time * (0.5 + lineIndex * 0.2)) * amplitude +
          Math.sin(x * freq2 + time * 0.8) * amplitude * 0.5;
      }
      line.geometry.attributes.position.needsUpdate = true;
    });
  });

  const colors = ['#00d4ff', '#4FACFE', '#a855f7', '#E100FF', '#00d4ff'];

  return (
    <group ref={linesRef} position={[0, -2, -2]}>
      {lineGeometries.map((geom, i) => (
        <primitive
          key={i}
          object={(() => {
            const mat = new THREE.LineBasicMaterial({
              color: colors[i],
              transparent: true,
              opacity: 0.3 - i * 0.04,
              blending: THREE.AdditiveBlending,
            });
            return new THREE.Line(geom, mat);
          })()}
        />
      ))}
    </group>
  );
}

// Floating Particles
function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { positions, velocities } = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < posArray.length; i += 3) {
      posArray[i] += velocities[i];
      posArray[i + 1] += velocities[i + 1];
      posArray[i + 2] += velocities[i + 2];
      
      // Wrap around
      if (posArray[i] > 7.5) posArray[i] = -7.5;
      if (posArray[i] < -7.5) posArray[i] = 7.5;
      if (posArray[i + 1] > 5) posArray[i + 1] = -5;
      if (posArray[i + 1] < -5) posArray[i + 1] = 5;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#00d4ff"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Scene Component
function Scene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <FacePointCloud />
      <WaveLines />
      <FloatingParticles />
    </>
  );
}

export default function LiveBackground() {
  return (
    <div className="fixed inset-0 z-0" style={{ background: '#050914' }}>
      {/* CSS Glow Effects */}
      <div className="bg-glow-purple" style={{ top: '-10%', right: '-5%' }} />
      <div className="bg-glow-cyan" style={{ bottom: '-10%', left: '-5%' }} />
      <div 
        className="bg-glow-purple" 
        style={{ 
          top: '40%', 
          left: '30%', 
          width: '400px', 
          height: '400px',
          opacity: 0.5 
        }} 
      />
      
      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4], fov: 60 }}
        style={{ position: 'absolute', inset: 0 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
    </div>
  );
}
