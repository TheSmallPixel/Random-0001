// Re-export backend modules for use in API routes
// This avoids path alias issues with Turbopack

export { parseFortifyCompactFormat } from '@backend/data/fortify-parser';
export { simulateRaidOnBase } from '@backend/raid/simulator';
export { RaidMethod } from '@backend/raid/types';
export { evaluateBase } from '@backend/scoring/evaluator';
