# Fortify Format Support

The Rust Base Generator now supports importing bases from **Fortify** format!

## What is Fortify?

Fortify is the most popular base building tool for Rust. It allows you to:
- Design bases with a 3D interface
- Calculate upkeep and raid costs
- Export/share base designs
- Test base layouts before building

Website: https://www.fortify.gg/

## Using Fortify Bases

### 1. Export from Fortify

In Fortify:
1. Design your base
2. Click **Export** or **Share**
3. Save the JSON file

### 2. Import to Generator

```bash
# Convert Fortify base and evaluate
node dist/cli.js import -i ./path/to/fortify_base.json --fortify

# Convert and save in our format
node dist/cli.js import -i ./fortify_base.json --fortify -o ./converted_base.json

# Then evaluate
node dist/cli.js evaluate -i ./converted_base.json
```

### 3. Simulate Raids

```bash
node dist/cli.js simulate -i ./converted_base.json -m rockets
```

## Fortify Format Structure

```json
{
  "name": "My Base",
  "description": "Base description",
  "version": "1.0",
  "pieces": [
    {
      "id": "unique_id",
      "type": "foundation|wall|floor|roof|door|window",
      "grade": 0-4,
      "x": 0.0,
      "y": 0.0,
      "z": 0.0,
      "rotationIndex": 0,
      "health": 500
    }
  ]
}
```

## Material Grades

| Grade | Material | Health |
|-------|----------|--------|
| 0     | Twig     | 10     |
| 1     | Wood     | 250    |
| 2     | Stone    | 500    |
| 3     | Metal    | 1000   |
| 4     | Armored  | 2000   |

## Supported Piece Types

### Foundations
- `foundation`
- `foundation.triangle`
- `foundation.steps`

### Walls
- `wall`
- `wall.low`
- `wall.doorway`
- `wall.window`
- `wall.frame`

### Floors
- `floor`
- `floor.triangle`
- `floor.frame`

### Other
- `roof` (converted to ceiling)
- `stairs.spiral`
- `door.hinged`
- `door.double.hinged`

## Auto-Detection Features

The converter automatically:
- ✅ Detects tool cupboards
- ✅ Detects beds/sleeping bags
- ✅ Identifies loot rooms (enclosed upper floors)
- ✅ Calculates upkeep costs
- ✅ Determines external walls
- ✅ Normalizes coordinates to grid

## Example Workflow

```bash
# 1. Design base in Fortify and export

# 2. Convert to our format
node dist/cli.js import -i ./my_base.json --fortify -o ./my_base_converted.json

# 3. Evaluate the design
node dist/cli.js evaluate -i ./my_base_converted.json

# Output:
# Overall Score: 78.45
# Loot Protection: 82.30
# PVP Visibility: 75.60
# ...

# 4. Test raid scenarios
node dist/cli.js simulate -i ./my_base_converted.json -m rockets

# Output:
# Optimal raid cost: 5400 sulfur
# Most efficient target: Room at (8, 8, 4)

# 5. Add to training data
node dist/cli.js import -i ./converted_bases_folder

# 6. Train ML model
node dist/cli.js train -e 100
```

## Benefits

### Why Use Fortify Format?

1. **Visual Design**: Use Fortify's 3D interface
2. **Community Bases**: Import popular base designs
3. **Pre-validated**: Fortify ensures structural integrity
4. **Easy Sharing**: Standard format for Rust community
5. **Accurate Costs**: Fortify calculates real upkeep

### Enhanced Workflow

```
Design in Fortify → Export JSON → Import to Generator
                                          ↓
                                    Evaluate Score
                                          ↓
                                   Simulate Raids
                                          ↓
                                   Train ML Model
                                          ↓
                                Generate Variations
```

## Tips

1. **Design in Fortify first** - Use the visual interface
2. **Export multiple versions** - Try different layouts
3. **Batch import** - Convert all your designs at once
4. **Compare scores** - See which designs are optimal
5. **Train the model** - Teach it your building style

## Limitations

- Soft side detection is simplified
- Some decorative pieces may not convert
- Stability calculations differ slightly
- Custom modded pieces not supported

## Example Bases

See `examples/fortify_example.json` for a sample Fortify export.

## Integration with Fortify

This tool complements Fortify by adding:
- ✅ ML-powered optimization
- ✅ Advanced raid simulation
- ✅ Multi-metric evaluation
- ✅ Automated base generation
- ✅ Training data collection

Build in Fortify, optimize with AI! 🚀
