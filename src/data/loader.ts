import { readFileSync, existsSync } from 'fs';
import { TrainingData } from '../ml/types.js';

/**
 * Load training data from disk
 */
export async function loadTrainingData(): Promise<TrainingData> {
  const dataPath = './data/training_data.json';
  
  if (!existsSync(dataPath)) {
    return { bases: [], scores: [] };
  }
  
  const rawData = JSON.parse(readFileSync(dataPath, 'utf-8'));
  
  return {
    bases: rawData.map((item: any) => item.base),
    scores: rawData.map((item: any) => item.score),
  };
}
