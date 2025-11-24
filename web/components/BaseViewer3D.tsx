'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useMemo } from 'react';

interface BaseViewer3DProps {
  base: any;
  raidPath?: any[];
}

function BuildingPiece({ position, material, type }: any) {
  const color = useMemo(() => {
    // Material colors
    if (material === 0) return '#8B4513'; // Twig - brown
    if (material === 1) return '#D2691E'; // Wood - orange brown
    if (material === 2) return '#808080'; // Stone - gray
    if (material === 3) return '#C0C0C0'; // Metal - silver
    if (material === 4) return '#FFD700'; // Armored - gold
    return '#FFFFFF';
  }, [material]);

  // Correct orientation: X stays X, Y (depth) becomes Z, Z (height) becomes Y
  return (
    <mesh position={[position.x, position.z, -position.y]}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function RaidPath({ path }: { path: any[] }) {
  return (
    <group>
      {path.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.z + 0.5, -pos.y]}>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={1.0} />
        </mesh>
      ))}
    </group>
  );
}

export default function BaseViewer3D({ base, raidPath }: BaseViewer3DProps) {
  const pieces = useMemo(() => {
    const result: any[] = [];
    if (!base?.grid) {
      console.log('No base grid');
      return result;
    }

    const [width, depth, height] = base.dimensions || [0, 0, 0];
    console.log(`Base dimensions: ${width}x${depth}x${height}`);
    
    // Show all pieces, not just structural - for debugging
    let totalPieces = 0;
    
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < depth; y++) {
        for (let z = 0; z < height; z++) {
          const piece = base.grid[x]?.[y]?.[z];
          if (piece) {
            totalPieces++;
            // Show all pieces regardless of type
            result.push({
              position: { x, y, z },
              material: piece.material,
              type: piece.type,
            });
          }
        }
      }
    }
    
    console.log(`Total pieces found: ${totalPieces}, rendering: ${result.length}`);
    return result;
  }, [base]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [20, 20, 20], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[20, 20, 20]} intensity={0.8} />
        <directionalLight position={[-10, 10, -10]} intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={0.3} />
        
        {pieces.map((piece, i) => (
          <BuildingPiece key={i} {...piece} />
        ))}
        
        {raidPath && raidPath.length > 0 && <RaidPath path={raidPath} />}
        
        <Grid
          args={[100, 100]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={40}
          fadeStrength={1}
          followCamera={false}
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
