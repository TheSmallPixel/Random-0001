# Complete Workflow Example

## Step 1: Prepare Training Data

Create or collect base designs in JSON format. You can:

### Option A: Use provided examples
```bash
# Examples are in ./examples/bases/
ls examples/bases/
```

### Option B: Create custom bases
```bash
node examples/create_base.js
```

### Option C: Convert from game data
If you have base designs from Rust:
1. Export base layout (use mods/plugins if available)
2. Convert to JSON format matching the schema
3. Place in `./bases/` directory

## Step 2: Import and Process

```bash
# Import all bases from examples
npm run import -- -i ./examples/bases

# This creates ./data/training_data.json with:
# - Encoded base tensors
# - Evaluation scores
# - Metric breakdowns
```

Output example:
```
Imported 3 bases
Processing: 2x2 Starter Base
Processing: Bunker Base with Airlocks
Processing: Honeycomb Design
Training data saved to ./data/training_data.json
```

## Step 3: Train the Model

```bash
# Train for 100 epochs
npm run train -- -e 100 -b 32
```

This will:
1. Load training data
2. Build VAE model architecture
3. Train encoder/decoder
4. Save model to `./models/base_generator/`

## Step 4: Generate New Bases

### Basic generation
```bash
npm run generate -- -o ./output/generated_1.json
```

### With constraints
```bash
npm run generate -- -o ./output/pvp_base.json -c '{
  "maxDimensions": [20, 20, 12],
  "minLootRooms": 3,
  "requireMultiTC": true,
  "requireMultiBed": true
}'
```

### With seed (reproducible)
```bash
npm run generate -- -o ./output/seed_base.json -s 12345
```

## Step 5: Evaluate Results

```bash
npm run evaluate -- -i ./output/generated_1.json
```

Output:
```
=== EVALUATION RESULTS ===
Overall Score: 78.45
Loot Protection: 82.30
PVP Visibility: 75.60
Upkeep Efficiency: 81.20
Multi-TC Score: 70.00
Multi-Bed Score: 70.00
```

## Step 6: Simulate Raids

Test how raiders might attack:

```bash
npm run simulate -- -i ./output/generated_1.json -m rockets
```

Output:
```
=== RAID SIMULATION ===
Optimal raid cost: 5400 sulfur
Average raid cost: 6200 sulfur
Loot rooms found: 3
Most efficient target: Room at (8, 8, 4)
```

## Step 7: Iterate and Optimize

### If scores are low:
1. **Add more training data** - Import diverse, high-quality bases
2. **Train longer** - Increase epochs to 200-500
3. **Adjust constraints** - Make them more specific

### If raid costs are low:
- Import bases with better honeycombing
- Check material tiers (stone vs. armored)
- Ensure loot rooms are deep inside

### If upkeep is too high:
- Add constraint: `"maxUpkeepCost": {"stone": 3000}`
- Import more upkeep-efficient examples
- Consider wood/stone over metal

## Advanced: Batch Generation

Create multiple candidates and pick the best:

```bash
# Generate 10 bases
for i in {1..10}; do
  npm run generate -- -o ./output/candidate_$i.json -s $i
done

# Evaluate all
for i in {1..10}; do
  echo "=== Candidate $i ===" 
  npm run evaluate -- -i ./output/candidate_$i.json
done
```

## Advanced: Genetic Optimization

Improve an existing base:

```javascript
import { optimizeBase, loadBase, exportBase } from 'rust-base-generator';

// Load your base
const base = loadBase('./output/generated_1.json');

// Optimize for 100 generations
const optimized = optimizeBase(base, 100);

// Save result
exportBase(optimized, './output/optimized_base.json');
```

## Integration with Game

Once you have generated bases:

1. **Review** the JSON structure
2. **Plan** material requirements from metadata.upkeepCost
3. **Build** in-game following the grid layout
4. **Place** TCs and beds at specified coordinates
5. **Test** with raid simulations

## Continuous Improvement

1. **Collect** bases from successful raids/defenses
2. **Import** new designs regularly
3. **Retrain** model with updated dataset
4. **Compare** old vs. new generations
5. **Iterate** based on server meta

## Tips for Best Results

- **Diversity**: Train on 20+ different base styles
- **Quality**: Only import well-designed, tested bases
- **Balance**: Include starter, mid-tier, and end-game bases
- **Validation**: Always simulate raids before building
- **Adaptation**: Update training data with server changes
