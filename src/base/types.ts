/**
 * 3D position in the base grid
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Building piece types in Rust
 */
export enum PieceType {
  Foundation = 'foundation',
  Wall = 'wall',
  Floor = 'floor',
  Ceiling = 'ceiling',
  Doorway = 'doorway',
  Window = 'window',
  Stairs = 'stairs',
  Roof = 'roof',
  Door = 'door',
  Gate = 'gate',
  ToolCupboard = 'toolcupboard',
  Bed = 'bed',
  Chest = 'chest',
  Turret = 'turret',
  Trap = 'trap',
}

/**
 * Material tiers for building pieces
 */
export enum Material {
  Twig = 0,
  Wood = 1,
  Stone = 2,
  Metal = 3,
  Armored = 4,
}

/**
 * A single building piece in the base
 */
export interface BuildingPiece {
  type: PieceType;
  material: Material;
  health: number;
  isExternal: boolean;  // Visible from outside
  softSide: boolean;    // Soft side exposed
  rotation: number;     // 0-3 (90 degree rotations)
}

/**
 * Loot room definition
 */
export interface LootRoom {
  position: Position3D;
  value: number;        // Estimated loot value
  priority: number;     // 1-10, higher = more important
  containers: number;   // Number of storage containers
}

/**
 * Base metadata
 */
export interface BaseMetadata {
  upkeepCost: Record<string, number>;  // Resource -> Amount
  totalPieces: number;
  footprint: [number, number, number];  // X, Y, Z dimensions
  author?: string;
  createdAt?: string;
  version?: string;
}

/**
 * Complete Rust base structure
 */
export interface RustBase {
  id: string;
  name: string;
  grid: BuildingPiece[][][];  // 3D array [x][y][z]
  dimensions: [number, number, number];
  toolCupboards: Position3D[];
  beds: Position3D[];
  lootRooms: LootRoom[];
  metadata: BaseMetadata;
}

/**
 * Base generation constraints
 */
export interface BaseConstraints {
  maxDimensions?: [number, number, number];
  minLootRooms?: number;
  maxUpkeepCost?: Record<string, number>;
  requireMultiTC?: boolean;
  requireMultiBed?: boolean;
  minRaidCost?: number;
}
