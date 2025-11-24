import { RustBase } from '../base/types.js';
import { evaluateBaseObject } from '../scoring/evaluator.js';
import { setPiece, getPiece } from '../base/grid.js';
import { createPiece } from '../base/components.js';
import { PieceType, Material } from '../base/types.js';

/**
 * Optimize an existing base using genetic algorithm
 */
export function optimizeBase(base: RustBase, generations: number = 50): RustBase {
  let currentBase = base;
  let currentScore = evaluateBaseObject(base).overall;
  
  console.log(`Initial score: ${currentScore.toFixed(2)}`);
  
  for (let gen = 0; gen < generations; gen++) {
    // Create mutated variant
    const mutated = mutateBase(currentBase);
    const mutatedScore = evaluateBaseObject(mutated).overall;
    
    // Accept if better
    if (mutatedScore > currentScore) {
      currentBase = mutated;
      currentScore = mutatedScore;
      console.log(`Generation ${gen + 1}: Score improved to ${currentScore.toFixed(2)}`);
    }
  }
  
  return currentBase;
}

/**
 * Create a mutated version of a base
 */
function mutateBase(base: RustBase): RustBase {
  const mutated = JSON.parse(JSON.stringify(base)) as RustBase;
  
  // Random mutations
  const mutationType = Math.random();
  
  if (mutationType < 0.33) {
    // Upgrade random piece
    const [x, y, z] = base.dimensions;
    const randX = Math.floor(Math.random() * x);
    const randY = Math.floor(Math.random() * y);
    const randZ = Math.floor(Math.random() * z);
    const pos = { x: randX, y: randY, z: randZ };
    
    const piece = getPiece(mutated, pos);
    if (piece && piece.material < Material.Armored) {
      const upgraded = { ...piece, material: piece.material + 1 };
      setPiece(mutated, pos, upgraded);
    }
  } else if (mutationType < 0.66) {
    // Add a random wall
    const [x, y, z] = base.dimensions;
    const randX = Math.floor(Math.random() * x);
    const randY = Math.floor(Math.random() * y);
    const randZ = Math.floor(Math.random() * z);
    const pos = { x: randX, y: randY, z: randZ };
    
    if (!getPiece(mutated, pos)) {
      const wall = createPiece(PieceType.Wall, Material.Stone);
      setPiece(mutated, pos, wall);
    }
  } else {
    // Toggle soft side on random wall
    const [x, y, z] = base.dimensions;
    const randX = Math.floor(Math.random() * x);
    const randY = Math.floor(Math.random() * y);
    const randZ = Math.floor(Math.random() * z);
    const pos = { x: randX, y: randY, z: randZ };
    
    const piece = getPiece(mutated, pos);
    if (piece && piece.type === PieceType.Wall) {
      const toggled = { ...piece, softSide: !piece.softSide };
      setPiece(mutated, pos, toggled);
    }
  }
  
  return mutated;
}
