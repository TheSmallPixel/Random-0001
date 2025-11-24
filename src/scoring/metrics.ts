import { RustBase, Position3D } from '../base/types.js';
import { simulateRaidOnBase } from '../raid/simulator.js';
import { RaidMethod } from '../raid/types.js';
import { calculateBaseUpkeep, iterPieces } from '../base/grid.js';
import { blocksVisibility } from '../base/components.js';

/**
 * Calculate loot protection score (0-100)
 * Higher raid cost = better protection
 */
export function calculateLootProtection(base: RustBase): number {
  const raidResults = simulateRaidOnBase(base, RaidMethod.Rockets);
  
  if (raidResults.paths.length === 0) return 0;
  
  // Average raid cost (normalize to 0-100)
  // Assume 10k sulfur is excellent, 1k is poor
  const avgCost = raidResults.avgCost;
  const score = Math.min(100, (avgCost / 100)); // Scale: 100 sulfur = 1 point
  
  return score;
}

/**
 * Calculate PVP visibility score (0-100)
 * Lower visibility from outside = better
 */
export function calculatePVPVisibility(base: RustBase): number {
  const [width, height, depth] = base.dimensions;
  let visiblePieces = 0;
  let totalExternalPieces = 0;

  for (const [pos, piece] of iterPieces(base)) {
    // Check if piece is on the perimeter
    const isPerimeter = 
      pos.x === 0 || pos.x === width - 1 ||
      pos.y === 0 || pos.y === height - 1 ||
      pos.z === 0;

    if (isPerimeter) {
      totalExternalPieces++;
      if (blocksVisibility(piece)) {
        visiblePieces++;
      }
    }
  }

  // More blocking pieces = lower visibility = higher score
  const visibilityRatio = totalExternalPieces > 0 
    ? visiblePieces / totalExternalPieces 
    : 0;
  
  // Invert: high block ratio = high score
  return visibilityRatio * 100;
}

/**
 * Calculate upkeep efficiency score (0-100)
 * Lower upkeep relative to protection = better
 */
export function calculateUpkeepEfficiency(base: RustBase): number {
  const upkeep = calculateBaseUpkeep(base);
  const totalUpkeep = Object.values(upkeep).reduce((a, b) => a + b, 0);
  
  const raidResults = simulateRaidOnBase(base, RaidMethod.Rockets);
  const avgRaidCost = raidResults.avgCost || 1;
  
  // Efficiency = raid cost / upkeep (higher is better)
  // Normalize: 10:1 ratio is excellent
  const efficiency = avgRaidCost / (totalUpkeep || 1);
  const score = Math.min(100, efficiency * 10);
  
  return score;
}

/**
 * Calculate multi-TC score (0-100)
 * More TCs with good coverage = better
 */
export function calculateMultiTCScore(base: RustBase): number {
  const tcCount = base.toolCupboards.length;
  
  if (tcCount === 0) return 0;
  if (tcCount === 1) return 30; // Single TC is okay
  if (tcCount === 2) return 70; // Dual TC is good
  
  // 3+ TCs is excellent
  return Math.min(100, 70 + (tcCount - 2) * 10);
}

/**
 * Calculate multi-bed score (0-100)
 * More beds = better respawn options
 */
export function calculateMultiBedScore(base: RustBase): number {
  const bedCount = base.beds.length;
  
  if (bedCount === 0) return 0;
  if (bedCount === 1) return 40; // Single bed is minimal
  if (bedCount === 2) return 70; // Dual beds is good
  
  // 3+ beds is excellent
  return Math.min(100, 70 + (bedCount - 2) * 10);
}

/**
 * Calculate visibility from a position
 */
function calculateVisibilityFrom(base: RustBase, from: Position3D): number {
  // Simple raycasting to count visible interior pieces
  // This is a simplified version - full implementation would do proper raycasting
  let visibleCount = 0;
  
  for (const [pos, piece] of iterPieces(base)) {
    // Check if there's a clear line of sight (simplified)
    const dx = pos.x - from.x;
    const dy = pos.y - from.y;
    const dz = pos.z - from.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance < 10 && !piece.isExternal) {
      visibleCount++;
    }
  }
  
  return visibleCount;
}
