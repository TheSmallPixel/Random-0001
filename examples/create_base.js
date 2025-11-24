/**
 * Example script to create a Rust base programmatically
 * Run with: node examples/create_base.js
 */

import { writeFileSync } from 'fs';

// Helper to create building piece
function createPiece(type, material, isExternal = false, softSide = false) {
  const healthMap = { 0: 10, 1: 250, 2: 500, 3: 1000, 4: 2000 };
  return {
    type,
    material,
    health: healthMap[material],
    isExternal,
    softSide,
    rotation: 0,
  };
}

// Create a simple 2x2 base
function create2x2Base() {
  const base = {
    id: `base_${Date.now()}`,
    name: 'Custom 2x2',
    dimensions: [10, 10, 5],
    grid: [],
    toolCupboards: [{ x: 5, y: 5, z: 0 }],
    beds: [{ x: 4, y: 5, z: 0 }],
    lootRooms: [
      {
        position: { x: 5, y: 5, z: 2 },
        value: 8000,
        priority: 9,
        containers: 3,
      },
    ],
    metadata: {
      upkeepCost: {},
      totalPieces: 0,
      footprint: [10, 10, 5],
      author: 'CustomBuilder',
      createdAt: new Date().toISOString(),
    },
  };

  // Initialize 3D grid
  const [x, y, z] = base.dimensions;
  base.grid = Array(x).fill(null).map(() =>
    Array(y).fill(null).map(() =>
      Array(z).fill(null)
    )
  );

  // Add foundations (floor level)
  for (let i = 3; i <= 6; i++) {
    for (let j = 3; j <= 6; j++) {
      base.grid[i][j][0] = createPiece('foundation', 2); // Stone
      base.metadata.totalPieces++;
    }
  }

  // Add walls around perimeter
  for (let i = 3; i <= 6; i++) {
    for (let j = 3; j <= 6; j++) {
      // Perimeter walls at z=1
      if (i === 3 || i === 6 || j === 3 || j === 6) {
        base.grid[i][j][1] = createPiece('wall', 2, true); // Stone, external
        base.metadata.totalPieces++;
      }
    }
  }

  // Add a doorway
  base.grid[5][3][1] = createPiece('doorway', 2, true);

  // Add ceiling
  for (let i = 3; i <= 6; i++) {
    for (let j = 3; j <= 6; j++) {
      base.grid[i][j][2] = createPiece('ceiling', 2);
      base.metadata.totalPieces++;
    }
  }

  // Add 2nd floor walls (honeycomb)
  for (let i = 4; i <= 5; i++) {
    for (let j = 4; j <= 5; j++) {
      if (i === 4 || i === 5 || j === 4 || j === 5) {
        base.grid[i][j][3] = createPiece('wall', 3); // Metal
        base.metadata.totalPieces++;
      }
    }
  }

  // Calculate upkeep (simplified)
  base.metadata.upkeepCost = {
    stone: base.metadata.totalPieces * 10,
    metal_fragments: 200,
  };

  return base;
}

// Create and save
const base = create2x2Base();
writeFileSync(
  './examples/bases/custom_2x2.json',
  JSON.stringify(base, null, 2)
);

console.log('Base created: ./examples/bases/custom_2x2.json');
console.log(`Total pieces: ${base.metadata.totalPieces}`);
console.log(`Upkeep: ${JSON.stringify(base.metadata.upkeepCost)}`);
