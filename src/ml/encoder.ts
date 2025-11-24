import { RustBase, BuildingPiece, PieceType, Material } from '../base/types.js';
import { iterPieces } from '../base/grid.js';

/**
 * Encode a base into a tensor representation
 * Returns 4D array [x][y][z][channels]
 */
export function encodeBase(base: RustBase, targetSize: [number, number, number] = [32, 32, 16]): number[][][][] {
  const [targetX, targetY, targetZ] = targetSize;
  const channels = 8; // piece type (4 bits) + material (3 bits) + flags (1 bit)
  
  // Initialize tensor with zeros
  const tensor: number[][][][] = Array(targetX).fill(null).map(() =>
    Array(targetY).fill(null).map(() =>
      Array(targetZ).fill(null).map(() =>
        Array(channels).fill(0)
      )
    )
  );
  
  // Scale factor to fit base into target size
  const [baseX, baseY, baseZ] = base.dimensions;
  const scaleX = baseX > targetX ? baseX / targetX : 1;
  const scaleY = baseY > targetY ? baseY / targetY : 1;
  const scaleZ = baseZ > targetZ ? baseZ / targetZ : 1;
  
  // Encode each piece
  for (const [pos, piece] of iterPieces(base)) {
    const x = Math.min(Math.floor(pos.x / scaleX), targetX - 1);
    const y = Math.min(Math.floor(pos.y / scaleY), targetY - 1);
    const z = Math.min(Math.floor(pos.z / scaleZ), targetZ - 1);
    
    const encoded = encodePiece(piece);
    tensor[x][y][z] = encoded;
  }
  
  return tensor;
}

/**
 * Encode a single piece into channel values
 */
function encodePiece(piece: BuildingPiece): number[] {
  const channels = new Array(8).fill(0);
  
  // Channel 0-3: Piece type (one-hot encoding of most common types)
  const typeIndex = getPieceTypeIndex(piece.type);
  if (typeIndex < 4) channels[typeIndex] = 1;
  
  // Channel 4-6: Material (normalized 0-1)
  channels[4 + piece.material] = 1;
  
  // Channel 7: Flags (external, soft side)
  channels[7] = (piece.isExternal ? 0.5 : 0) + (piece.softSide ? 0.5 : 0);
  
  return channels;
}

/**
 * Decode a tensor back to a base
 */
export function decodeBase(tensor: number[][][][], baseName: string = 'generated'): RustBase {
  const [x, y, z, channels] = [
    tensor.length,
    tensor[0].length,
    tensor[0][0].length,
    tensor[0][0][0].length,
  ];
  
  const base: RustBase = {
    id: `gen_${Date.now()}`,
    name: baseName,
    grid: Array(x).fill(null).map(() =>
      Array(y).fill(null).map(() =>
        Array(z).fill(null)
      )
    ),
    dimensions: [x, y, z],
    toolCupboards: [],
    beds: [],
    lootRooms: [],
    metadata: {
      upkeepCost: {},
      totalPieces: 0,
      footprint: [x, y, z],
    },
  };
  
  // Decode each cell
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      for (let k = 0; k < z; k++) {
        const values = tensor[i][j][k];
        const piece = decodePiece(values);
        
        if (piece) {
          base.grid[i][j][k] = piece;
          base.metadata.totalPieces++;
          
          // Track special pieces
          if (piece.type === PieceType.ToolCupboard) {
            base.toolCupboards.push({ x: i, y: j, z: k });
          }
          if (piece.type === PieceType.Bed) {
            base.beds.push({ x: i, y: j, z: k });
          }
        }
      }
    }
  }
  
  return base;
}

/**
 * Decode channel values back to a piece
 */
function decodePiece(values: number[]): BuildingPiece | null {
  // Threshold to determine if a piece exists
  const maxValue = Math.max(...values.slice(0, 7));
  if (maxValue < 0.3) return null;
  
  // Decode type (argmax of first 4 channels)
  const typeIndex = values.slice(0, 4).indexOf(Math.max(...values.slice(0, 4)));
  const type = getPieceTypeFromIndex(typeIndex);
  
  // Decode material (argmax of next 3 channels, offset by base material value)
  const materialChannels = values.slice(4, 7);
  const materialIndex = materialChannels.indexOf(Math.max(...materialChannels));
  const material = materialIndex as Material;
  
  // Decode flags
  const isExternal = values[7] >= 0.25;
  const softSide = values[7] >= 0.75;
  
  return {
    type,
    material,
    health: 100,
    isExternal,
    softSide,
    rotation: 0,
  };
}

function getPieceTypeIndex(type: PieceType): number {
  const mapping: Record<string, number> = {
    [PieceType.Foundation]: 0,
    [PieceType.Wall]: 1,
    [PieceType.Floor]: 2,
    [PieceType.Doorway]: 3,
  };
  return mapping[type] ?? 3;
}

function getPieceTypeFromIndex(index: number): PieceType {
  const mapping: PieceType[] = [
    PieceType.Foundation,
    PieceType.Wall,
    PieceType.Floor,
    PieceType.Doorway,
  ];
  return mapping[index] ?? PieceType.Wall;
}
