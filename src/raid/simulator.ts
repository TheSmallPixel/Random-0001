import { RustBase, Position3D } from '../base/types.js';
import { readFileSync } from 'fs';
import { findCheapestPath, PathResult } from './pathfinding.js';
import { RaidMethod, RaidResult, RaidSimulationResult } from './types.js';
import { iterPieces } from '../base/grid.js';

/**
 * Simulate raid on a base from file
 */
export async function simulateRaid(
  inputPath: string,
  method: string = 'rockets'
): Promise<RaidSimulationResult> {
  const base: RustBase = JSON.parse(readFileSync(inputPath, 'utf-8'));
  return simulateRaidOnBase(base, method as RaidMethod);
}

/**
 * Simulate raid on a base object
 */
export function simulateRaidOnBase(
  base: RustBase,
  method: RaidMethod = RaidMethod.Rockets
): RaidSimulationResult {
  const entryPoints = findEntryPoints(base);
  console.log(`Found ${entryPoints.length} entry points`);
  console.log(`Found ${base.lootRooms.length} loot rooms to raid`);
  
  const results: RaidResult[] = [];

  for (const lootRoom of base.lootRooms) {
    let bestPath: PathResult | null = null;
    let minCost = Infinity;
    
    console.log(`Finding path to loot room at (${lootRoom.position.x}, ${lootRoom.position.y}, ${lootRoom.position.z})`);

    for (const entry of entryPoints) {
      const result = findCheapestPath(base, entry, lootRoom.position);
      if (result && result.cost < minCost) {
        minCost = result.cost;
        bestPath = result;
      }
    }

    if (bestPath) {
      console.log(`Found path with cost: ${bestPath.cost} sulfur`);
      console.log(`  - Full path (${bestPath.path.length} steps):`);
      for (let i = 0; i < Math.min(bestPath.path.length, 20); i++) {
        const pos = bestPath.path[i];
        const piece = base.grid[pos.x]?.[pos.y]?.[pos.z];
        const content = piece ? `${piece.type}(${piece.material})` : 'empty';
        console.log(`    ${i}: (${pos.x},${pos.y},${pos.z}) - ${content}`);
      }
      if (bestPath.path.length > 20) console.log(`    ... and ${bestPath.path.length - 20} more steps`);
      
      if (bestPath.details) {
        console.log(`  - Empty spaces: ${bestPath.details.emptySpaces} (${bestPath.details.emptySpaces} sulfur)`);
        console.log(`  - Pieces to destroy: ${bestPath.details.pieces.length} (${bestPath.cost - bestPath.details.emptySpaces} sulfur)`);
        
        // Show splash damage savings
        if (bestPath.details.splashSavings && bestPath.details.splashSavings > 0) {
          console.log(`  - 🎯 Splash damage savings: ${bestPath.details.splashSavings} sulfur (${bestPath.details.splashGroups} group${bestPath.details.splashGroups !== 1 ? 's' : ''})`);
          const normalCost = bestPath.details.totalCost;
          console.log(`  - Normal cost: ${Math.ceil(normalCost)} → With splash: ${bestPath.cost} sulfur`);
        }
        
        // Show what pieces need to be destroyed
        if (bestPath.details.pieces.length > 0) {
          console.log(`  - Pieces breakdown:`);
          for (const piece of bestPath.details.pieces) {
            console.log(`    * ${piece.type} (${piece.material}) at (${piece.position.x},${piece.position.y},${piece.position.z}) - ${piece.cost} sulfur`);
          }
        }
      }
      const efficiency = lootRoom.value / bestPath.cost;
      results.push({
        target: lootRoom.position,
        path: bestPath.path,
        totalCost: bestPath.cost,
        method,
        efficiency,
      });
    } else {
      console.log(`No path found to loot room at (${lootRoom.position.x}, ${lootRoom.position.y}, ${lootRoom.position.z})`);
    }
  }

  // Sort by efficiency (descending)
  results.sort((a, b) => b.efficiency - a.efficiency);

  const costs = results.map(r => r.totalCost);
  const minCost = Math.min(...costs, Infinity);
  const maxCost = Math.max(...costs, 0);
  const avgCost = costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;

  return {
    paths: results,
    minCost,
    maxCost,
    avgCost,
    bestTarget: results[0]?.target || { x: 0, y: 0, z: 0 },
    bestEfficiency: results[0]?.efficiency || 0,
  };
}

/**
 * Find entry points (external pieces and perimeter)
 */
function findEntryPoints(base: RustBase): Position3D[] {
  const entries: Position3D[] = [];
  const [width, depth, height] = base.dimensions;

  let pieceCount = 0;
  for (const [pos, piece] of iterPieces(base)) {
    pieceCount++;
    if (piece.isExternal) {
      entries.push(pos);
    }
    
    // Also consider perimeter positions at ground level
    if (pos.z <= 2 && (
        pos.x === 0 || pos.x === width - 1 ||
        pos.y === 0 || pos.y === depth - 1)) {
      entries.push(pos);
    }
  }
  
  console.log(`Iterated over ${pieceCount} pieces in grid`);

  // If no entry points found, add all ground-level perimeter positions
  if (entries.length === 0) {
    console.log('No external pieces found, using ground-level perimeter as entry points');
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < depth; y++) {
        for (let z = 0; z <= 2; z++) {
          if (x === 0 || x === width - 1 || y === 0 || y === depth - 1) {
            entries.push({ x, y, z });
          }
        }
      }
    }
    console.log(`Added ${entries.length} perimeter positions as fallback entries`);
  }

  return entries;
}
