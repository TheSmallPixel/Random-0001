import { RustBase, BuildingPiece, PieceType, Material, Position3D, LootRoom } from '../base/types.js';

/**
 * Parse Fortify compact/share format
 * Format: terrain2d|...|...;category,data|props|;category,data;...
 */
export function parseFortifyCompactFormat(input: string): RustBase {
  console.log('Parsing Fortify compact format...');
  
  // Split into sections by semicolon
  const sections = input.split(';');
  
  const pieces: Array<{
    type: string;
    x: number;
    y: number;
    z: number;
    grade: number;
    rotation: number;
  }> = [];
  
  // Parse terrain header
  const terrainMatch = sections[0].match(/terrain2d\|([-\d.]+)\|([-\d.]+)\|([-\d.]+)\|([-\d.]+)\|([-\d.]+)/);
  if (!terrainMatch) {
    throw new Error('Invalid Fortify format: missing terrain header');
  }
  
  // Process each section
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;
    
    // Split category and items
    const parts = section.split(',');
    if (parts.length < 2) continue;
    
    const category = parts[0].toLowerCase();
    
    // Parse each item in this category
    for (let j = 1; j < parts.length; j++) {
      const item = parts[j].trim();
      if (!item) continue;
      
      // Split by pipe: x|y|z|rotation_props|grade_info
      const itemParts = item.split('|');
      
      if (itemParts.length < 3) continue;
      
      const x = parseFloat(itemParts[0]);
      const y = parseFloat(itemParts[1]);  
      const z = parseFloat(itemParts[2]);
      
      // Parse rotation and material
      let rotation = 0;
      let grade = 2; // Default to stone
      
      // Check for rotation (itemParts[3])
      if (itemParts.length > 3) {
        const rotStr = itemParts[3];
        rotation = parseFloat(rotStr) || 0;
      }
      
      // Check for grade (typically in itemParts[4] like "2_2__")
      if (itemParts.length > 4) {
        const gradeStr = itemParts[4];
        const gradeMatch = gradeStr.match(/^(\d+)/);
        if (gradeMatch) {
          grade = parseInt(gradeMatch[1]) || 2;
        }
      }
      
      pieces.push({
        type: category,
        x,
        y,
        z,
        grade,
        rotation
      });
    }
  }
  
  console.log(`Parsed ${pieces.length} pieces`);
  
  // Calculate bounds
  if (pieces.length === 0) {
    throw new Error('No pieces found in base');
  }
  
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  
  for (const piece of pieces) {
    minX = Math.min(minX, piece.x);
    minY = Math.min(minY, piece.y);
    minZ = Math.min(minZ, piece.z);
    maxX = Math.max(maxX, piece.x);
    maxY = Math.max(maxY, piece.y);
    maxZ = Math.max(maxZ, piece.z);
  }
  
  // Normalize and create grid
  const padding = 3;
  const offsetX = Math.floor(minX) - padding;
  const offsetY = Math.floor(minY) - padding;
  const offsetZ = Math.floor(minZ) - padding;
  
  const width = Math.ceil(maxX - minX) + padding * 2;
  const depth = Math.ceil(maxY - minY) + padding * 2;
  const height = Math.ceil(maxZ - minZ) + padding * 2;
  
  console.log(`Grid: ${width}x${depth}x${height}, Offset: (${offsetX}, ${offsetY}, ${offsetZ})`);
  
  // Initialize grid
  const grid: (BuildingPiece | null)[][][] = Array(width)
    .fill(null)
    .map(() =>
      Array(depth)
        .fill(null)
        .map(() => Array(height).fill(null))
    );
  
  const tcs: Position3D[] = [];
  const beds: Position3D[] = [];
  const lootRooms: LootRoom[] = [];
  let totalPieces = 0;
  
  // Place pieces in grid
  for (const piece of pieces) {
    const x = Math.floor(piece.x - offsetX);
    const y = Math.floor(piece.y - offsetY);
    const z = Math.floor(piece.z - offsetZ);
    
    if (x < 0 || x >= width || y < 0 || y >= depth || z < 0 || z >= height) {
      continue;
    }
    
    const pieceType = mapPieceType(piece.type);
    const material = mapGrade(piece.grade);
    
    // Check for special pieces
    if (piece.type.includes('cupboard') || piece.type.includes('tc')) {
      tcs.push({ x, y, z });
    }
    if (piece.type.includes('bed') || piece.type.includes('sleeping')) {
      beds.push({ x, y, z });
    }
    
    const buildingPiece: BuildingPiece = {
      type: pieceType,
      material,
      health: getHealth(material),
      isExternal: z <= 1,
      softSide: false,
      rotation: Math.floor(piece.rotation / 90) % 4,
    };
    
    grid[x][y][z] = buildingPiece;
    totalPieces++;
  }
  
  // Add default TC and bed if none found
  if (tcs.length === 0) {
    tcs.push({
      x: Math.floor(width / 2),
      y: Math.floor(depth / 2),
      z: 2
    });
  }
  if (beds.length === 0) {
    beds.push({
      x: Math.floor(width / 2),
      y: Math.floor(depth / 2),
      z: 2
    });
  }
  
  // Detect loot rooms - be more lenient and find any floor above ground level
  const seenRooms = new Set<string>();
  
  for (let z = 1; z < height; z++) {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < depth; y++) {
        const piece = grid[x][y][z];
        if (piece && piece.type === PieceType.Floor) {
          const key = `${x},${y},${z}`;
          if (!seenRooms.has(key)) {
            seenRooms.add(key);
            lootRooms.push({
              position: { x, y, z },
              value: (z + 1) * 5000, // Higher floors = more value
              priority: Math.min(z + 5, 10),
              containers: Math.min(Math.floor((z + 1) * 1.5), 8)
            });
          }
        }
      }
    }
  }
  
  // If still no loot rooms, add defaults at key locations
  if (lootRooms.length === 0) {
    console.log('No floors detected, adding default loot rooms');
    // Add loot rooms at TC and bed locations
    for (const tc of tcs) {
      lootRooms.push({
        position: tc,
        value: 10000,
        priority: 7,
        containers: 4
      });
    }
    
    // If still none, add center
    if (lootRooms.length === 0) {
      lootRooms.push({
        position: {
          x: Math.floor(width / 2),
          y: Math.floor(depth / 2),
          z: Math.max(2, Math.floor(height / 2))
        },
        value: 10000,
        priority: 7,
        containers: 4
      });
    }
  }
  
  console.log(`Detected ${lootRooms.length} loot rooms`);
  
  const base: RustBase = {
    id: `fortify_compact_${Date.now()}`,
    name: 'Fortify Import',
    dimensions: [width, depth, height],
    grid: grid as any,
    toolCupboards: tcs,
    beds,
    lootRooms,
    metadata: {
      upkeepCost: {
        wood: 0,
        stone: totalPieces * 10,
        metal_fragments: 0,
        high_quality_metal: 0
      },
      totalPieces,
      footprint: [width, depth, height],
      author: 'Fortify Import',
      createdAt: new Date().toISOString(),
    }
  };
  
  return base;
}

function mapPieceType(type: string): PieceType {
  const t = type.toLowerCase();
  if (t.includes('foundation')) return PieceType.Foundation;
  if (t.includes('wall')) return PieceType.Wall;
  if (t.includes('floor')) return PieceType.Floor;
  if (t.includes('roof') || t.includes('ceiling')) return PieceType.Ceiling;
  if (t.includes('door')) return PieceType.Doorway;
  if (t.includes('window')) return PieceType.Window;
  if (t.includes('stairs') || t.includes('ramp')) return PieceType.Stairs;
  return PieceType.Wall;
}

function mapGrade(grade: number): Material {
  const gradeMap: Record<number, Material> = {
    0: Material.Twig,
    1: Material.Wood,
    2: Material.Stone,
    3: Material.Metal,
    4: Material.Armored,
    5: Material.Armored,
    6: Material.Armored,
  };
  return gradeMap[grade] || Material.Stone;
}

function getHealth(material: Material): number {
  const healthMap: Record<Material, number> = {
    [Material.Twig]: 10,
    [Material.Wood]: 250,
    [Material.Stone]: 500,
    [Material.Metal]: 1000,
    [Material.Armored]: 2000,
  };
  return healthMap[material] || 500;
}
