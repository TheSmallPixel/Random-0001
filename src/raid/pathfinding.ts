import { RustBase, Position3D } from '../base/types.js';
import { getPiece, getNeighbors } from '../base/grid.js';
import { calculateRaidCost } from '../base/components.js';
import { calculateSplashOptimizedCost } from './splash.js';

interface PathNode {
  position: Position3D;
  cost: number;
  estimatedTotal: number;
  parent?: PathNode;
}

export interface PathResult {
  path: Position3D[];
  cost: number;
  details?: {
    emptySpaces: number;
    pieces: Array<{ position: Position3D; type: string; material: number; cost: number }>;
    totalCost: number;
    splashOptimizedCost?: number;
    splashSavings?: number;
    splashGroups?: number;
  };
}

/**
 * A* pathfinding to find cheapest raid path
 */
export function findCheapestPath(
  base: RustBase,
  start: Position3D,
  target: Position3D
): PathResult | null {
  const openSet: PathNode[] = [];
  const closedSet = new Set<string>();
  const gScore = new Map<string, number>();

  // Start position cost includes breaking through the entry point
  const startPiece = getPiece(base, start);
  const startCost = startPiece ? calculateRaidCost(startPiece) : 0;
  
  const startKey = posKey(start);
  gScore.set(startKey, startCost);
  
  openSet.push({
    position: start,
    cost: startCost,
    estimatedTotal: startCost + heuristic(start, target),
  });

  while (openSet.length > 0) {
    // Get node with lowest estimatedTotal
    openSet.sort((a, b) => a.estimatedTotal - b.estimatedTotal);
    const current = openSet.shift()!;
    const currentKey = posKey(current.position);

    if (posEqual(current.position, target)) {
      return reconstructPath(current, base);
    }

    closedSet.add(currentKey);

    for (const neighbor of getNeighbors(base, current.position)) {
      const neighborKey = posKey(neighbor);
      if (closedSet.has(neighborKey)) continue;

      const piece = getPiece(base, neighbor);
      const moveCost = piece ? calculateRaidCost(piece) : 1;
      const tentativeGScore = (gScore.get(currentKey) || 0) + moveCost;

      const existingGScore = gScore.get(neighborKey) || Infinity;
      if (tentativeGScore < existingGScore) {
        gScore.set(neighborKey, tentativeGScore);
        
        const neighborNode: PathNode = {
          position: neighbor,
          cost: tentativeGScore,
          estimatedTotal: tentativeGScore + heuristic(neighbor, target),
          parent: current,
        };

        const existing = openSet.findIndex(n => posEqual(n.position, neighbor));
        if (existing >= 0) {
          openSet[existing] = neighborNode;
        } else {
          openSet.push(neighborNode);
        }
      }
    }
  }

  return null; // No path found
}

function heuristic(from: Position3D, to: Position3D): number {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y) + Math.abs(from.z - to.z);
}

function reconstructPath(node: PathNode, base?: RustBase): PathResult {
  const path: Position3D[] = [];
  let current: PathNode | undefined = node;
  
  while (current) {
    path.unshift(current.position);
    current = current.parent;
  }
  
  // Calculate breakdown if base provided
  let details;
  if (base) {
    // Calculate splash-optimized cost
    const splashResult = calculateSplashOptimizedCost(base, path);
    
    const breakdown: any = {
      emptySpaces: 0,
      pieces: [],
      totalCost: node.cost,
      splashOptimizedCost: splashResult.cost,
      splashSavings: splashResult.savings,
      splashGroups: splashResult.groups.length
    };
    
    for (const pos of path) {
      const piece = getPiece(base, pos);
      if (piece) {
        const cost = calculateRaidCost(piece);
        breakdown.pieces.push({
          position: pos,
          type: piece.type,
          material: piece.material,
          cost
        });
      } else {
        breakdown.emptySpaces++;
      }
    }
    details = breakdown;
  }
  
  return {
    path,
    cost: base ? calculateSplashOptimizedCost(base, path).cost : node.cost,
    details
  };
}

function posKey(pos: Position3D): string {
  return `${pos.x},${pos.y},${pos.z}`;
}

function posEqual(a: Position3D, b: Position3D): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}
