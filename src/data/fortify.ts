import { readFileSync } from 'fs';
import { RustBase, BuildingPiece, Position3D, PieceType, Material } from '../base/types.js';

/**
 * Fortify format structures
 */
export interface FortifyPiece {
  id: string;
  type: string;
  grade: number;
  x: number;
  y: number;
  z: number;
  rotationIndex?: number;
  health?: number;
}

export interface FortifyBase {
  name?: string;
  description?: string;
  pieces: FortifyPiece[];
  version?: string;
}

/**
 * Mapping from Fortify piece types to our internal types
 */
const FORTIFY_TYPE_MAP: Record<string, PieceType> = {
  'foundation': PieceType.Foundation,
  'foundation.triangle': PieceType.Foundation,
  'foundation.steps': PieceType.Foundation,
  'wall': PieceType.Wall,
  'wall.low': PieceType.Wall,
  'wall.doorway': PieceType.Doorway,
  'wall.window': PieceType.Window,
  'wall.frame': PieceType.Doorway,
  'floor': PieceType.Floor,
  'floor.triangle': PieceType.Floor,
  'floor.frame': PieceType.Floor,
  'roof': PieceType.Ceiling,
  'stairs.spiral': PieceType.Stairs,
  'door.hinged': PieceType.Door,
  'door.double.hinged': PieceType.Door,
};

/**
 * Mapping from Fortify grades to material tiers
 */
const FORTIFY_GRADE_MAP: Record<number, Material> = {
  0: Material.Twig,
  1: Material.Wood,
  2: Material.Stone,
  3: Material.Metal,
  4: Material.Armored,
};

/**
 * Convert Fortify format to our internal RustBase format
 */
export function convertFortifyToBase(fortifyData: FortifyBase): RustBase {
  console.log(`Converting Fortify base: ${fortifyData.name || 'Unnamed'}`);
  console.log(`Total pieces: ${fortifyData.pieces.length}`);
  
  // Calculate bounding box
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  
  for (const piece of fortifyData.pieces) {
    minX = Math.min(minX, piece.x);
    minY = Math.min(minY, piece.y);
    minZ = Math.min(minZ, piece.z);
    maxX = Math.max(maxX, piece.x);
    maxY = Math.max(maxY, piece.y);
    maxZ = Math.max(maxZ, piece.z);
  }
  
  // Add padding and normalize to grid starting at 0
  const padding = 2;
  const offsetX = Math.floor(minX) - padding;
  const offsetY = Math.floor(minY) - padding;
  const offsetZ = Math.floor(minZ) - padding;
  
  const width = Math.ceil(maxX - minX) + padding * 2;
  const depth = Math.ceil(maxY - minY) + padding * 2;
  const height = Math.ceil(maxZ - minZ) + padding * 2;
  
  console.log(`Grid dimensions: ${width}x${depth}x${height}`);
  console.log(`Offset: (${offsetX}, ${offsetY}, ${offsetZ})`);
  
  // Initialize 3D grid
  const grid: (BuildingPiece | null)[][][] = Array(width)
    .fill(null)
    .map(() =>
      Array(depth)
        .fill(null)
        .map(() => Array(height).fill(null))
    );
  
  // Track special pieces
  const toolCupboards: Position3D[] = [];
  const beds: Position3D[] = [];
  let totalPieces = 0;
  const upkeepCost: Record<string, number> = {
    wood: 0,
    stone: 0,
    metal_fragments: 0,
    high_quality_metal: 0,
  };
  
  // Convert pieces
  for (const fortifyPiece of fortifyData.pieces) {
    const pieceType = FORTIFY_TYPE_MAP[fortifyPiece.type.toLowerCase()] || PieceType.Wall;
    const material = FORTIFY_GRADE_MAP[fortifyPiece.grade] || Material.Stone;
    
    // Normalize coordinates
    const x = Math.floor(fortifyPiece.x - offsetX);
    const y = Math.floor(fortifyPiece.y - offsetY);
    const z = Math.floor(fortifyPiece.z - offsetZ);
    
    // Skip if out of bounds
    if (x < 0 || x >= width || y < 0 || y >= depth || z < 0 || z >= height) {
      console.warn(`Piece out of bounds: ${fortifyPiece.type} at (${x}, ${y}, ${z})`);
      continue;
    }
    
    // Check for special pieces
    if (fortifyPiece.type.toLowerCase().includes('cupboard')) {
      toolCupboards.push({ x, y, z });
    }
    if (fortifyPiece.type.toLowerCase().includes('bed') || 
        fortifyPiece.type.toLowerCase().includes('sleeping')) {
      beds.push({ x, y, z });
    }
    
    // Create building piece
    const piece: BuildingPiece = {
      type: pieceType,
      material,
      health: fortifyPiece.health || getDefaultHealth(material),
      isExternal: z === 0 || isExternalWall(fortifyPiece, fortifyData.pieces),
      softSide: false, // TODO: Calculate from rotation
      rotation: fortifyPiece.rotationIndex || 0,
    };
    
    grid[x][y][z] = piece;
    totalPieces++;
    
    // Calculate upkeep
    updateUpkeepCost(upkeepCost, material);
  }
  
  // Auto-detect loot rooms (rooms with foundations at z > 0)
  const lootRooms = detectLootRooms(grid, width, depth, height);
  
  // Ensure at least one TC and bed
  if (toolCupboards.length === 0) {
    console.warn('No tool cupboards found, adding default');
    toolCupboards.push({ 
      x: Math.floor(width / 2), 
      y: Math.floor(depth / 2), 
      z: 1 
    });
  }
  if (beds.length === 0) {
    console.warn('No beds found, adding default');
    beds.push({ 
      x: Math.floor(width / 2), 
      y: Math.floor(depth / 2), 
      z: 1 
    });
  }
  
  const base: RustBase = {
    id: `fortify_${Date.now()}`,
    name: fortifyData.name || 'Fortify Import',
    dimensions: [width, depth, height],
    grid: grid as any, // Cast to allow null values in grid
    toolCupboards,
    beds,
    lootRooms,
    metadata: {
      upkeepCost,
      totalPieces,
      footprint: [width, depth, height],
      author: 'Fortify Import',
      createdAt: new Date().toISOString(),
    },
  };
  
  return base;
}

/**
 * Load and convert Fortify JSON file
 */
export function loadFortifyBase(filePath: string): RustBase {
  console.log(`Loading Fortify base from: ${filePath}`);
  const content = readFileSync(filePath, 'utf-8');
  const fortifyData: FortifyBase = JSON.parse(content);
  return convertFortifyToBase(fortifyData);
}

/**
 * Get default health for material tier
 */
function getDefaultHealth(material: Material): number {
  const healthMap: Record<Material, number> = {
    [Material.Twig]: 10,
    [Material.Wood]: 250,
    [Material.Stone]: 500,
    [Material.Metal]: 1000,
    [Material.Armored]: 2000,
  };
  return healthMap[material] || 500;
}

/**
 * Check if a wall is external (on the perimeter)
 */
function isExternalWall(piece: FortifyPiece, allPieces: FortifyPiece[]): boolean {
  if (!piece.type.toLowerCase().includes('wall')) return false;
  
  // Check if there are pieces on both sides
  const neighbors = allPieces.filter(p => 
    Math.abs(p.x - piece.x) <= 1 &&
    Math.abs(p.y - piece.y) <= 1 &&
    Math.abs(p.z - piece.z) <= 1 &&
    p.id !== piece.id
  );
  
  return neighbors.length < 6; // Less than 6 neighbors = external
}

/**
 * Update upkeep cost based on material
 */
function updateUpkeepCost(upkeep: Record<string, number>, material: Material): void {
  const baseCost = 10;
  switch (material) {
    case Material.Wood:
      upkeep.wood = (upkeep.wood || 0) + baseCost;
      break;
    case Material.Stone:
      upkeep.stone = (upkeep.stone || 0) + baseCost;
      break;
    case Material.Metal:
      upkeep.metal_fragments = (upkeep.metal_fragments || 0) + baseCost;
      break;
    case Material.Armored:
      upkeep.metal_fragments = (upkeep.metal_fragments || 0) + baseCost;
      upkeep.high_quality_metal = (upkeep.high_quality_metal || 0) + 2;
      break;
  }
}

/**
 * Auto-detect potential loot rooms
 */
function detectLootRooms(
  grid: (BuildingPiece | null)[][][],
  width: number,
  depth: number,
  height: number
) {
  const lootRooms: Array<{
    position: Position3D;
    value: number;
    priority: number;
    containers: number;
  }> = [];
  
  // Look for enclosed spaces above z=0
  for (let z = 1; z < height; z++) {
    for (let x = 1; x < width - 1; x++) {
      for (let y = 1; y < depth - 1; y++) {
        const piece = grid[x][y][z];
        if (piece && piece.type === PieceType.Floor) {
          // Check if it's enclosed by walls
          const hasWalls = 
            grid[x - 1]?.[y]?.[z]?.type === PieceType.Wall ||
            grid[x + 1]?.[y]?.[z]?.type === PieceType.Wall ||
            grid[x]?.[y - 1]?.[z]?.type === PieceType.Wall ||
            grid[x]?.[y + 1]?.[z]?.type === PieceType.Wall;
          
          if (hasWalls) {
            lootRooms.push({
              position: { x, y, z },
              value: z * 5000, // Higher floors = more value
              priority: z + 5,
              containers: Math.min(z * 2, 8),
            });
          }
        }
      }
    }
  }
  
  // If no loot rooms found, create a default one
  if (lootRooms.length === 0) {
    lootRooms.push({
      position: { 
        x: Math.floor(width / 2), 
        y: Math.floor(depth / 2), 
        z: Math.floor(height / 2) 
      },
      value: 10000,
      priority: 7,
      containers: 4,
    });
  }
  
  return lootRooms;
}
