import { Material, PieceType, BuildingPiece } from './types.js';

/**
 * Game constants for Rust building pieces
 */
export const PIECE_CONSTANTS = {
  health: {
    [Material.Twig]: 10,
    [Material.Wood]: 250,
    [Material.Stone]: 500,
    [Material.Metal]: 1000,
    [Material.Armored]: 2000,
  },
  
  raidCost: {
    // Sulfur cost to destroy (rockets method) - Accurate Rust values
    [Material.Twig]: { wall: 1, door: 1 },         // 1 explosive ammo
    [Material.Wood]: { wall: 175, door: 70 },      // Wood wall: 3 rockets = 2,100 GP = 525 sulfur / Sheet door: 1 rocket = 350 sulfur ÷ 2 (explosives) = 175/70 avg
    [Material.Stone]: { wall: 1400, door: 700 },   // Stone wall: 4 rockets = 5,600 GP = 1,400 sulfur / Garage door: 2 rockets = 700 sulfur
    [Material.Metal]: { wall: 2100, door: 1050 },  // Metal wall: 6 rockets = 8,400 GP = 2,100 sulfur / Armored door: 3 rockets = 1,050 sulfur
    [Material.Armored]: { wall: 4200, door: 2100 },// Armored wall: 12 rockets = 16,800 GP = 4,200 sulfur / Armored door: 6 rockets = 2,100 sulfur
  },
  
  upkeep: {
    [Material.Twig]: { resource: 'none', amount: 0 },
    [Material.Wood]: { resource: 'wood', amount: 10 },
    [Material.Stone]: { resource: 'stone', amount: 10 },
    [Material.Metal]: { resource: 'metal_fragments', amount: 20 },
    [Material.Armored]: { resource: 'high_quality_metal', amount: 10 },
  },
  
  // Tool cupboard range in foundations
  TC_RANGE: 25,
};

/**
 * Create a new building piece
 */
export function createPiece(
  type: PieceType,
  material: Material,
  options?: Partial<BuildingPiece>
): BuildingPiece {
  return {
    type,
    material,
    health: PIECE_CONSTANTS.health[material],
    isExternal: options?.isExternal ?? false,
    softSide: options?.softSide ?? false,
    rotation: options?.rotation ?? 0,
  };
}

/**
 * Calculate raid cost for a piece (in sulfur)
 */
export function calculateRaidCost(piece: BuildingPiece): number {
  const isDoor = piece.type === PieceType.Door || piece.type === PieceType.Gate;
  const costs = PIECE_CONSTANTS.raidCost[piece.material];
  let cost = isDoor ? costs.door : costs.wall;
  
  // Soft side is cheaper (stone/metal only)
  if (piece.softSide && (piece.material === Material.Stone || piece.material === Material.Metal)) {
    cost = Math.floor(cost / 2);
  }
  
  return cost;
}

/**
 * Calculate upkeep cost for a piece
 */
export function calculateUpkeep(piece: BuildingPiece): Record<string, number> {
  const upkeepData = PIECE_CONSTANTS.upkeep[piece.material];
  
  if (upkeepData.resource === 'none') {
    return {};
  }
  
  const multiplier = getPieceUpkeepMultiplier(piece.type);
  const amount = upkeepData.amount * multiplier;
  
  return amount > 0 ? { [upkeepData.resource]: amount } : {};
}

/**
 * Get upkeep multiplier based on piece type
 */
function getPieceUpkeepMultiplier(type: PieceType): number {
  switch (type) {
    case PieceType.Foundation:
      return 2;
    case PieceType.Wall:
    case PieceType.Floor:
    case PieceType.Ceiling:
    case PieceType.Doorway:
    case PieceType.Window:
    case PieceType.Stairs:
    case PieceType.Roof:
      return 1;
    default:
      return 0;
  }
}

/**
 * Check if a piece blocks visibility
 */
export function blocksVisibility(piece: BuildingPiece): boolean {
  return piece.type === PieceType.Wall || 
         piece.type === PieceType.Door ||
         piece.type === PieceType.Gate;
}

/**
 * Check if a piece is a structural piece
 */
export function isStructural(type: PieceType): boolean {
  return [
    PieceType.Foundation,
    PieceType.Wall,
    PieceType.Floor,
    PieceType.Ceiling,
    PieceType.Doorway,
  ].includes(type);
}
