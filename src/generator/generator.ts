import { BaseGeneratorModel } from '../ml/model.js';
import { decodeBase } from '../ml/encoder.js';
import { exportBase } from '../data/exporter.js';
import { RustBase, BaseConstraints } from '../base/types.js';
import { evaluateBaseObject } from '../scoring/evaluator.js';

interface GenerateOptions {
  seed?: number;
  constraints?: BaseConstraints;
  iterations?: number;
}

/**
 * Generate a new base using the trained model
 */
export async function generateBase(options: GenerateOptions): Promise<RustBase> {
  const model = new BaseGeneratorModel();
  
  // Load trained model
  try {
    await model.load('./models/base_generator');
  } catch (error) {
    console.warn('No trained model found. Using random generation.');
  }
  
  let bestBase: RustBase | null = null;
  let bestScore = -Infinity;
  
  const iterations = options.iterations || 10;
  
  console.log(`Generating ${iterations} candidates...`);
  
  for (let i = 0; i < iterations; i++) {
    // Generate tensor
    const tensor = await model.generate(options.seed ? options.seed + i : undefined);
    
    // Decode to base
    const base = decodeBase(tensor, `Generated_Base_${i + 1}`);
    
    // Apply constraints if provided
    if (options.constraints) {
      if (!meetsConstraints(base, options.constraints)) {
        continue;
      }
    }
    
    // Evaluate
    const scores = evaluateBaseObject(base);
    
    console.log(`  Candidate ${i + 1}: Score = ${scores.overall.toFixed(2)}`);
    
    if (scores.overall > bestScore) {
      bestScore = scores.overall;
      bestBase = base;
    }
  }
  
  if (!bestBase) {
    throw new Error('Failed to generate valid base');
  }
  
  console.log(`\nBest base score: ${bestScore.toFixed(2)}`);
  
  return bestBase;
}

/**
 * Check if base meets constraints
 */
function meetsConstraints(base: RustBase, constraints: BaseConstraints): boolean {
  if (constraints.maxDimensions) {
    const [maxX, maxY, maxZ] = constraints.maxDimensions;
    const [x, y, z] = base.dimensions;
    if (x > maxX || y > maxY || z > maxZ) return false;
  }
  
  if (constraints.minLootRooms && base.lootRooms.length < constraints.minLootRooms) {
    return false;
  }
  
  if (constraints.requireMultiTC && base.toolCupboards.length < 2) {
    return false;
  }
  
  if (constraints.requireMultiBed && base.beds.length < 2) {
    return false;
  }
  
  return true;
}
