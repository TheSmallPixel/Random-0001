# Rust Base Generator - Usage Guide

ML-powered base generator for the Rust game using TensorFlow.js and JavaScript.

## Installation

```bash
npm install
```

## Quick Start

### 1. Import Base Designs

Create JSON files representing Rust bases and import them:

```bash
npm run import -- -i ./examples/bases
```

This will:
- Load all base JSON files
- Evaluate each base with the scoring system
- Encode them into training data format
- Save to `./data/training_data.json`

### 2. Train the Model

Train the ML model on imported bases:

```bash
npm run train -- -e 100 -b 32
```

Options:
- `-e, --epochs`: Number of training epochs (default: 100)
- `-b, --batch`: Batch size (default: 32)

### 3. Generate New Bases

Generate optimized bases:

```bash
npm run generate -- -o ./output/generated_base.json
```

Options:
- `-o, --output`: Output file path (required)
- `-s, --seed`: Random seed for reproducibility
- `-c, --constraints`: JSON constraints (see below)

Example with constraints:
```bash
npm run generate -- -o ./output/base.json -c '{"maxDimensions":[20,20,10],"minLootRooms":2,"requireMultiTC":true}'
```

### 4. Evaluate Existing Base

Score a base design:

```bash
npm run evaluate -- -i ./examples/bases/2x2.json
```

Output includes:
- Overall score (0-100)
- Loot protection score
- PVP visibility score
- Upkeep efficiency score
- Multi-TC score
- Multi-bed score

### 5. Simulate Raid

Test raid paths and costs:

```bash
npm run simulate -- -i ./examples/bases/2x2.json -m rockets
```

Methods: `rockets`, `c4`, `explosiveammo`

## Base JSON Format

```json
{
  "id": "base_001",
  "name": "2x2 Starter Base",
  "dimensions": [10, 10, 5],
  "grid": [[[null, {...}], [...]], ...],
  "toolCupboards": [{"x": 5, "y": 5, "z": 0}],
  "beds": [{"x": 5, "y": 5, "z": 1}],
  "lootRooms": [
    {
      "position": {"x": 5, "y": 5, "z": 2},
      "value": 10000,
      "priority": 10,
      "containers": 4
    }
  ],
  "metadata": {
    "upkeepCost": {},
    "totalPieces": 0,
    "footprint": [10, 10, 5]
  }
}
```

## Scoring System

The generator optimizes bases using multiple metrics:

### Loot Protection (35% weight)
- Measures average raid cost to reach loot rooms
- Higher sulfur cost = better score
- Based on optimal pathfinding through walls/doors

### PVP Visibility (20% weight)
- Evaluates how visible the base is from outside
- More exterior walls blocking view = higher score
- Considers window/doorway placement

### Upkeep Efficiency (20% weight)
- Ratio of raid cost to daily upkeep
- Better defended bases with lower upkeep = higher score
- Balances defense vs. maintenance cost

### Multi-TC (15% weight)
- Rewards multiple tool cupboard coverage
- 1 TC = 30, 2 TCs = 70, 3+ TCs = 100
- Ensures base has redundant authorization

### Multi-Bed (10% weight)
- Rewards multiple spawn points
- 1 bed = 40, 2 beds = 70, 3+ beds = 100
- Critical for team bases and respawning

## Constraints

When generating, you can specify constraints:

```typescript
{
  "maxDimensions": [30, 30, 15],      // Max X, Y, Z size
  "minLootRooms": 2,                   // Minimum loot rooms required
  "maxUpkeepCost": {                   // Max daily upkeep
    "stone": 5000,
    "metal_fragments": 2000
  },
  "requireMultiTC": true,              // Force multiple TCs
  "requireMultiBed": true,             // Force multiple beds
  "minRaidCost": 5000                  // Minimum sulfur to raid
}
```

## Architecture

### ML Model
- **Type**: Variational Autoencoder (VAE)
- **Input**: 32x32x16x8 voxel tensor
- **Latent Dimension**: 128
- **Architecture**: 3D Conv → Latent → 3D Deconv

### Encoding
Each voxel encodes:
- Channels 0-3: Piece type (foundation, wall, floor, doorway)
- Channels 4-6: Material tier (wood, stone, metal, armored)
- Channel 7: Flags (external, soft side)

### Training
1. Import bases → Evaluate → Encode
2. Train VAE to reconstruct bases
3. Sample latent space → Generate → Decode
4. Genetic optimization for fine-tuning

## Advanced Usage

### Programmatic API

```typescript
import { generateBase, evaluateBaseObject, simulateRaidOnBase } from 'rust-base-generator';
import { RaidMethod } from 'rust-base-generator';

// Generate
const base = await generateBase({
  seed: 42,
  iterations: 20,
  constraints: { requireMultiTC: true }
});

// Evaluate
const scores = evaluateBaseObject(base);
console.log(`Overall: ${scores.overall.toFixed(2)}`);

// Simulate
const results = simulateRaidOnBase(base, RaidMethod.Rockets);
console.log(`Min cost: ${results.minCost} sulfur`);
```

### Custom Optimization

```typescript
import { optimizeBase } from 'rust-base-generator';

// Load existing base
const base = loadBase('./my_base.json');

// Optimize with genetic algorithm
const optimized = optimizeBase(base, 100); // 100 generations

// Export
exportBase(optimized, './optimized_base.json');
```

## Tips

1. **Training Data**: Import 20+ varied bases for best results
2. **Iterations**: Use more iterations (50+) for higher quality
3. **Constraints**: Start loose, then tighten based on server rules
4. **Materials**: The model learns material progression patterns
5. **Honeycombing**: Import honeycomb bases to teach the pattern

## Troubleshooting

**No training data found**
- Run `npm run import` first with base JSON files

**Low quality generations**
- Import more diverse training bases
- Increase training epochs
- Use more generation iterations

**High upkeep costs**
- Add constraint: `"maxUpkeepCost": {...}`
- Import more upkeep-efficient base examples

**Poor raid defense**
- Ensure training bases have good loot room placement
- Check that materials are properly assigned

## File Structure

```
├── src/
│   ├── base/          # Base representation (grid, components)
│   ├── raid/          # Raid simulation (pathfinding, costs)
│   ├── scoring/       # Multi-metric evaluation
│   ├── ml/            # ML model (VAE, training, encoding)
│   ├── data/          # Data import/export
│   └── generator/     # Base generation & optimization
├── examples/          # Example base JSON files
├── data/             # Training data (generated)
├── models/           # Trained models (generated)
└── output/           # Generated bases (generated)
```
