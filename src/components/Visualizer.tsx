import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { engine } from '../lib/audioEngine';
import { useStore } from '../store/useStore';

const HyperCube = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  
  useFrame((state) => {
    if (!engine.analyzer) return;
    engine.updateData();
    const data = engine.getTimeData();
    
    // Calculate average amplitude
    let sum = 0;
    for(let i=0; i<data.length; i++) sum += Math.abs(data[i] - 128);
    const avg = sum / data.length;
    const scale = 1 + (avg / 128) * 1.5;

    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 + (avg / 1000);
      meshRef.current.rotation.y += 0.015 + (avg / 1000);
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, scale, 0.1));
    }
    if (edgesRef.current) {
      edgesRef.current.rotation.copy(meshRef.current!.rotation);
      edgesRef.current.scale.copy(meshRef.current!.scale);
      
      // Modulate color based on audio
      const mat = edgesRef.current.material as THREE.LineBasicMaterial;
      const r = 1;
      const g = (avg / 128);
      const b = 1;
      mat.color.setRGB(r, g, b);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#111" transparent opacity={0.5} wireframe={false} />
      </mesh>
      <lineSegments ref={edgesRef}>
        <edgesGeometry args={[new THREE.BoxGeometry(2, 2, 2)]} />
        <lineBasicMaterial color="#ff00ff" linewidth={2} />
      </lineSegments>
    </group>
  );
};

const HelixParticles = () => {
  const count = 1000;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 20;
      const radius = 2 + Math.sin(t * Math.PI * 4);
      temp.push({
        x: Math.cos(angle) * radius,
        y: (t - 0.5) * 10,
        z: Math.sin(angle) * radius,
        speed: 0.01 + Math.random() * 0.02
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!engine.analyzer || !meshRef.current) return;
    engine.updateData();
    const freqData = engine.getFreqData();
    
    // Bass energy
    const bass = (freqData[0] + freqData[1] + freqData[2]) / 3;
    const expand = 1 + (bass / 255) * 2;

    particles.forEach((p, i) => {
      p.y += p.speed;
      if (p.y > 5) p.y = -5;
      
      // Modulate radius with frequency bins
      const bin = freqData[i % freqData.length] / 255;
      
      dummy.position.set(p.x * expand * (1 + bin), p.y, p.z * expand * (1 + bin));
      dummy.scale.setScalar(0.05 + bin * 0.1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.rotation.y += 0.005;
  });

  return (
    <instancedMesh ref={meshRef} args={[new THREE.SphereGeometry(1, 8, 8), new THREE.MeshBasicMaterial({ color: '#39ff14' }), count]}>
    </instancedMesh>
  );
};

const SpectralTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (!engine.analyzer || !meshRef.current) return;
    engine.updateData();
    const freqData = engine.getFreqData();
    const geom = meshRef.current.geometry as THREE.PlaneGeometry;
    const posAttribute = geom.attributes.position;
    
    // Shift rows down
    for (let y = 31; y > 0; y--) {
      for (let x = 0; x <= 64; x++) {
        const idx = (y * 65 + x) * 3;
        const prevIdx = ((y - 1) * 65 + x) * 3;
        posAttribute.array[idx + 2] = posAttribute.array[prevIdx + 2];
      }
    }
    
    // Update first row with new freq data
    for (let x = 0; x <= 64; x++) {
      const idx = x * 3;
      const bin = Math.floor((x / 64) * (freqData.length / 4)); // Use lower half of spectrum
      const val = (freqData[bin] / 255) * 4;
      posAttribute.array[idx + 2] = val;
    }
    
    posAttribute.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[10, 10, 64, 32]} />
      <meshBasicMaterial color="#00ffff" wireframe={true} transparent opacity={0.6} />
    </mesh>
  );
};

const OrbitalRings = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (!engine.analyzer || !groupRef.current) return;
    engine.updateData();
    const data = engine.getTimeData();
    
    let sum = 0;
    for(let i=0; i<data.length; i++) sum += Math.abs(data[i] - 128);
    const avg = sum / data.length;

    groupRef.current.children.forEach((child, i) => {
      child.rotation.x += 0.01 * (i + 1);
      child.rotation.y += 0.015 * (i + 1);
      const s = 1 + (avg / 128) * (0.5 * i);
      child.scale.setScalar(THREE.MathUtils.lerp(child.scale.x, s, 0.1));
    });
  });

  return (
    <group ref={groupRef}>
      {[2, 3, 4].map((radius, i) => (
        <mesh key={i}>
          <torusGeometry args={[radius, 0.02, 16, 100]} />
          <meshBasicMaterial color={i === 0 ? '#ff00ff' : i === 1 ? '#39ff14' : '#00ffff'} />
        </mesh>
      ))}
    </group>
  );
}

export function Visualizer() {
  const mode = useStore(state => state.visualizerMode);

  return (
    <div className="w-full h-full bg-black relative rounded-md overflow-hidden border border-spectra-border box-glow-magenta scanline">
      <div className="absolute top-2 left-2 z-10 text-xs text-spectra-magenta font-bold glow-magenta tracking-widest">
        DSP.RENDER // {mode}
      </div>
      <Canvas camera={{ position: [0, 0, 8] }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {mode === 'CUBE' && <HyperCube />}
        {mode === 'HELIX' && <HelixParticles />}
        {mode === 'TERRAIN' && <SpectralTerrain />}
        {mode === 'RINGS' && <OrbitalRings />}
        
        <OrbitControls enablePan={false} enableZoom={true} maxDistance={20} minDistance={2} />
      </Canvas>
    </div>
  );
}
