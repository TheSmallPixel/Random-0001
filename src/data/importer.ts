import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { RustBase } from '../base/types.js';
import { evaluateBaseObject } from '../scoring/evaluator.js';
import { encodeBase } from '../ml/encoder.js';

/**
 * Import bases from JSON files
 */
export async function importBases(inputPath: string): Promise<void> {
  const bases: RustBase[] = [];
  
  // Check if path is file or directory
  const stats = statSync(inputPath);
  
  if (stats.isFile()) {
    const base = JSON.parse(readFileSync(inputPath, 'utf-8'));
    bases.push(base);
  } else if (stats.isDirectory()) {
    const files = readdirSync(inputPath).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const base = JSON.parse(readFileSync(join(inputPath, file), 'utf-8'));
      bases.push(base);
    }
  }
  
  console.log(`Imported ${bases.length} bases`);
  
  // Evaluate and encode each base
  const trainingData = [];
  
  for (const base of bases) {
    console.log(`Processing: ${base.name}`);
    
    // Evaluate
    const scores = evaluateBaseObject(base);
    
    // Encode
    const encoded = encodeBase(base);
    
    trainingData.push({
      base: encoded,
      score: scores.overall,
      metrics: {
        lootProtection: scores.lootProtection,
        pvpVisibility: scores.pvpVisibility,
        upkeepEfficiency: scores.upkeepEfficiency,
        multiTC: scores.multiTC,
        multiBed: scores.multiBed,
      },
    });
  }
  
  // Save training data
  const dataDir = './data';
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  
  writeFileSync(
    join(dataDir, 'training_data.json'),
    JSON.stringify(trainingData, null, 2)
  );
  
  console.log('Training data saved to ./data/training_data.json');
}

/**
 * Load a single base from file
 */
export function loadBase(path: string): RustBase {
  return JSON.parse(readFileSync(path, 'utf-8'));
}
