export interface ScoreResults {
  overall: number;
  lootProtection: number;
  pvpVisibility: number;
  upkeepEfficiency: number;
  multiTC: number;
  multiBed: number;
  details: {
    avgRaidCost: number;
    minRaidCost: number;
    visibilityScore: number;
    upkeepTotal: Record<string, number>;
    tcCount: number;
    bedCount: number;
    lootRoomCount: number;
  };
}

export interface MetricWeights {
  lootProtection: number;
  pvpVisibility: number;
  upkeepEfficiency: number;
  multiTC: number;
  multiBed: number;
}

export const DEFAULT_WEIGHTS: MetricWeights = {
  lootProtection: 0.35,
  pvpVisibility: 0.20,
  upkeepEfficiency: 0.20,
  multiTC: 0.15,
  multiBed: 0.10,
};
