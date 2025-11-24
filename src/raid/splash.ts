import { RustBase, Position3D, BuildingPiece } from '../base/types.js';
import { getPiece } from '../base/grid.js';
import { calculateRaidCost } from '../base/components.js';

/**
 * Rocket splash damage mechanics for Rust
 * 
 * In Rust, rockets have splash damage that can hit multiple adjacent pieces.
 * This significantly reduces raid costs when pieces are grouped together.
 */

// Splash damage reaches adjacent blocks (6-directional neighbors)
const SPLASH_RADIUS = 1;

// Rockets deal splash damage - each rocket can damage up to ~4-6 adjacent pieces
// Full damage to 1-2 pieces, partial to others
const SPLASH_EFFICIENCY = 0.75; // 75% of normal cost when grouped

interface SplashGroup {
  positions: Position3D[];
  totalHealth: number;
  rocketsNeeded: number;
  actualCost: number;
}

/**
 * Get positions within splash radius
 */
function getSplashNeighbors(pos: Position3D): Position3D[] {
  const neighbors: Position3D[] = [];
  const offsets = [
    { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 },
  ];
  
  for (const offset of offsets) {
    neighbors.push({
      x: pos.x + offset.x,
      y: pos.y + offset.y,
      z: pos.z + offset.z,
    });
  }
  
  return neighbors;
}

/**
 * Calculate actual raid cost for a path considering splash damage optimization
 * 
 * When multiple pieces are adjacent, splash damage allows you to use fewer rockets.
 * This function groups adjacent pieces and calculates the optimized cost.
 */
export function calculateSplashOptimizedCost(
  base: RustBase,
  path: Position3D[]
): { cost: number; groups: SplashGroup[]; savings: number } {
  const piecesInPath = path
    .map(pos => ({ pos, piece: getPiece(base, pos) }))
    .filter(item => item.piece !== null) as { pos: Position3D; piece: BuildingPiece }[];
  
  if (piecesInPath.length === 0) {
    return { cost: path.length, groups: [], savings: 0 };
  }
  
  // Find groups of adjacent pieces
  const visited = new Set<string>();
  const groups: SplashGroup[] = [];
  let totalNormalCost = 0;
  
  for (const { pos, piece } of piecesInPath) {
    const posKey = `${pos.x},${pos.y},${pos.z}`;
    if (visited.has(posKey)) continue;
    
    // Build a group of adjacent pieces
    const group: { pos: Position3D; piece: BuildingPiece }[] = [];
    const queue = [{ pos, piece }];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentKey = `${current.pos.x},${current.pos.y},${current.pos.z}`;
      
      if (visited.has(currentKey)) continue;
      visited.add(currentKey);
      group.push(current);
      
      // Check neighbors in the path
      const neighbors = getSplashNeighbors(current.pos);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y},${neighbor.z}`;
        if (visited.has(neighborKey)) continue;
        
        const neighborItem = piecesInPath.find(
          item => item.pos.x === neighbor.x && 
                  item.pos.y === neighbor.y && 
                  item.pos.z === neighbor.z
        );
        
        if (neighborItem) {
          queue.push(neighborItem);
        }
      }
    }
    
    // Calculate cost for this group with splash optimization
    const positions = group.map(g => g.pos);
    const groupCost = group.reduce((sum, g) => sum + calculateRaidCost(g.piece), 0);
    totalNormalCost += groupCost;
    
    // Apply splash efficiency if group has 2+ pieces
    const actualCost = group.length >= 2 
      ? Math.ceil(groupCost * SPLASH_EFFICIENCY)
      : groupCost;
    
    groups.push({
      positions,
      totalHealth: groupCost,
      rocketsNeeded: Math.ceil(actualCost / 350), // 350 sulfur per rocket
      actualCost,
    });
  }
  
  const totalSplashCost = groups.reduce((sum, g) => sum + g.actualCost, 0);
  const savings = totalNormalCost - totalSplashCost;
  
  // Add movement cost for empty spaces
  const emptySpaces = path.length - piecesInPath.length;
  const finalCost = totalSplashCost + emptySpaces;
  
  return {
    cost: finalCost,
    groups,
    savings,
  };
}

/**
 * Calculate splash-optimized cost for a single move
 * Used during pathfinding to estimate costs
 */
export function estimateSplashCost(
  base: RustBase,
  pos: Position3D,
  previousPositions: Position3D[]
): number {
  const piece = getPiece(base, pos);
  if (!piece) return 1; // Empty space
  
  const baseCost = calculateRaidCost(piece);
  
  // Check if any previous positions in path are adjacent
  const neighbors = getSplashNeighbors(pos);
  const hasAdjacentInPath = previousPositions.some(prev =>
    neighbors.some(n => n.x === prev.x && n.y === prev.y && n.z === prev.z)
  );
  
  // If adjacent to a piece we're already raiding, apply splash discount
  return hasAdjacentInPath ? Math.ceil(baseCost * SPLASH_EFFICIENCY) : baseCost;
}
