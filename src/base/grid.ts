import { RustBase, Position3D, BuildingPiece, BaseMetadata } from './types.js';
import { calculateUpkeep, PIECE_CONSTANTS } from './components.js';

/**
 * Create a new empty base
 */
export function createBase(
  id: string,
  name: string,
  dimensions: [number, number, number]
): RustBase {
  const [width, height, depth] = dimensions;
  const grid: BuildingPiece[][][] = Array(width)
    .fill(null)
    .map(() =>
      Array(height)
        .fill(null)
        .map(() => Array(depth).fill(null))
    );

  return {
    id,
    name,
    grid,
    dimensions,
    toolCupboards: [],
    beds: [],
    lootRooms: [],
    metadata: {
      upkeepCost: {},
      totalPieces: 0,
      footprint: dimensions,
    },
  };
}

/**
 * Get a piece at a position
 */
export function getPiece(base: RustBase, pos: Position3D): BuildingPiece | null {
  const { x, y, z } = pos;
  if (!isValidPosition(base, pos)) return null;
  return base.grid[x][y][z];
}

/**
 * Set a piece at a position
 */
export function setPiece(
  base: RustBase,
  pos: Position3D,
  piece: BuildingPiece | null
): boolean {
  if (!isValidPosition(base, pos)) return false;
  
  const { x, y, z } = pos;
  const oldPiece = base.grid[x][y][z];
  
  // Cast to maintain type compatibility
  base.grid[x][y][z] = piece as any;
  
  // Update piece count
  if (oldPiece && !piece) base.metadata.totalPieces--;
  if (!oldPiece && piece) base.metadata.totalPieces++;
  
  return true;
}

/**
 * Check if position is valid
 */
export function isValidPosition(base: RustBase, pos: Position3D): boolean {
  const [width, height, depth] = base.dimensions;
  return (
    pos.x >= 0 && pos.x < width &&
    pos.y >= 0 && pos.y < height &&
    pos.z >= 0 && pos.z < depth
  );
}

/**
 * Get neighboring positions (6-connectivity)
 */
export function getNeighbors(base: RustBase, pos: Position3D): Position3D[] {
  const neighbors: Position3D[] = [];
  const deltas = [
    { x: -1, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: -1, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: -1 },
    { x: 0, y: 0, z: 1 },
  ];

  for (const delta of deltas) {
    const neighbor = {
      x: pos.x + delta.x,
      y: pos.y + delta.y,
      z: pos.z + delta.z,
    };
    if (isValidPosition(base, neighbor)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

/**
 * Calculate distance between two positions
 */
export function distance(a: Position3D, b: Position3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Check if position is within TC range
 */
export function hasTCCoverage(base: RustBase, pos: Position3D): boolean {
  return base.toolCupboards.some(
    (tc) => distance(pos, tc) <= PIECE_CONSTANTS.TC_RANGE
  );
}

/**
 * Calculate total upkeep for the base
 */
export function calculateBaseUpkeep(base: RustBase): Record<string, number> {
  const totalUpkeep: Record<string, number> = {};

  for (let x = 0; x < base.dimensions[0]; x++) {
    for (let y = 0; y < base.dimensions[1]; y++) {
      for (let z = 0; z < base.dimensions[2]; z++) {
        const piece = base.grid[x][y][z];
        if (piece) {
          const upkeep = calculateUpkeep(piece);
          for (const [resource, amount] of Object.entries(upkeep)) {
            totalUpkeep[resource] = (totalUpkeep[resource] || 0) + amount;
          }
        }
      }
    }
  }

  return totalUpkeep;
}

/**
 * Iterate over all pieces in the base
 */
export function* iterPieces(base: RustBase): Generator<[Position3D, BuildingPiece]> {
  for (let x = 0; x < base.dimensions[0]; x++) {
    for (let y = 0; y < base.dimensions[1]; y++) {
      for (let z = 0; z < base.dimensions[2]; z++) {
        const piece = base.grid[x][y][z];
        if (piece) {
          yield [{ x, y, z }, piece];
        }
      }
    }
  }
}
