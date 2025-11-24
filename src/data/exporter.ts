import { writeFileSync } from 'fs';
import { RustBase } from '../base/types.js';

/**
 * Export a base to JSON file
 */
export function exportBase(base: RustBase, outputPath: string): void {
  writeFileSync(outputPath, JSON.stringify(base, null, 2));
  console.log(`Base exported to: ${outputPath}`);
}
