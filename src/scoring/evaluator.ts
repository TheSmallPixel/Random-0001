import { RustBase } from '../base/types.js';
import { readFileSync } from 'fs';
import { ScoreResults, DEFAULT_WEIGHTS, MetricWeights } from './types.js';
import {
  calculateLootProtection,
  calculatePVPVisibility,
  calculateUpkeepEfficiency,
  calculateMultiTCScore,
  calculateMultiBedScore,
} from './metrics.js';
import { simulateRaidOnBase } from '../raid/simulator.js';
import { RaidMethod } from '../raid/types.js';
import { calculateBaseUpkeep } from '../base/grid.js';

/**
 * Evaluate a base from file
 */
export async function evaluateBase(inputPath: string): Promise<ScoreResults> {
  const base: RustBase = JSON.parse(readFileSync(inputPath, 'utf-8'));
  return evaluateBaseObject(base);
}

/**
 * Evaluate a base object with all metrics
 */
export function evaluateBaseObject(
  base: RustBase,
  weights: MetricWeights = DEFAULT_WEIGHTS
): ScoreResults {
  // Calculate individual scores
  const lootProtection = calculateLootProtection(base);
  const pvpVisibility = calculatePVPVisibility(base);
  const upkeepEfficiency = calculateUpkeepEfficiency(base);
  const multiTC = calculateMultiTCScore(base);
  const multiBed = calculateMultiBedScore(base);

  // Calculate weighted overall score
  const overall = 
    lootProtection * weights.lootProtection +
    pvpVisibility * weights.pvpVisibility +
    upkeepEfficiency * weights.upkeepEfficiency +
    multiTC * weights.multiTC +
    multiBed * weights.multiBed;

  // Gather details
  const raidResults = simulateRaidOnBase(base, RaidMethod.Rockets);
  const upkeep = calculateBaseUpkeep(base);

  return {
    overall,
    lootProtection,
    pvpVisibility,
    upkeepEfficiency,
    multiTC,
    multiBed,
    details: {
      avgRaidCost: raidResults.avgCost,
      minRaidCost: raidResults.minCost,
      visibilityScore: pvpVisibility,
      upkeepTotal: upkeep,
      tcCount: base.toolCupboards.length,
      bedCount: base.beds.length,
      lootRoomCount: base.lootRooms.length,
    },
  };
}
