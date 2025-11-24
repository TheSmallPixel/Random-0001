import { Position3D } from '../base/types.js';

export enum RaidMethod {
  Rockets = 'rockets',
  C4 = 'c4',
  ExplosiveAmmo = 'explosiveammo',
  Satchels = 'satchels',
}

export interface RaidPath {
  positions: Position3D[];
  costs: number[];
  totalCost: number;
}

export interface RaidResult {
  target: Position3D;
  path: Position3D[];
  totalCost: number;
  method: RaidMethod;
  efficiency: number;  // Loot value / raid cost
}

export interface RaidSimulationResult {
  paths: RaidResult[];
  minCost: number;
  maxCost: number;
  avgCost: number;
  bestTarget: Position3D;
  bestEfficiency: number;
}
