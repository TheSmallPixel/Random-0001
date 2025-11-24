# Fortify Integration - Quick Start

✅ **Fortify format is now fully supported!**

## What You Can Do

### 1. Convert Fortify Bases

Export any base from [Fortify.gg](https://www.fortify.gg/) and convert it:

```bash
# Convert and evaluate
node dist/cli.js import -i ./my_fortify_base.json --fortify

# Convert and save in our format
node dist/cli.js import -i ./my_fortify_base.json --fortify -o ./converted_base.json
```

### 2. Evaluate Converted Bases

```bash
node dist/cli.js evaluate -i ./converted_base.json
```

### 3. Simulate Raids

```bash
node dist/cli.js simulate -i ./converted_base.json -m rockets
```

### 4. Train ML Model

```bash
# Import multiple Fortify bases
for file in ./fortify_bases/*.json; do
  node dist/cli.js import -i "$file" --fortify -o "./converted/$(basename $file)"
done

# Train on converted bases
node dist/cli.js import -i ./converted

# Train model
node dist/cli.js train -e 100
```

## Example Output

```bash
$ node dist/cli.js import -i ./examples/fortify_example.json --fortify -o ./output/test.json

📥 Importing bases from: ./examples/fortify_example.json
Loading Fortify base from: ./examples/fortify_example.json
Converting Fortify base: 2x2 Fortify Base
Total pieces: 14
Grid dimensions: 6x6x6
Offset: (-2, -2, -2)
✓ Converted: 2x2 Fortify Base
Overall Score: 12.88
✓ Saved to: ./output/test.json
```

## Fortify JSON Format

Fortify exports bases like this:

```json
{
  "name": "My Base",
  "pieces": [
    {
      "id": "foundation_1",
      "type": "foundation",
      "grade": 2,
      "x": 0,
      "y": 0,
      "z": 0
    }
  ]
}
```

### Grade Mapping

| Grade | Material | 
|-------|----------|
| 0     | Twig     |
| 1     | Wood     | 
| 2     | Stone    |
| 3     | Metal    |
| 4     | Armored  |

## Auto-Detection

The converter automatically:
- ✅ Detects tool cupboards
- ✅ Detects beds/sleeping bags
- ✅ Identifies loot rooms
- ✅ Calculates upkeep
- ✅ Determines external walls
- ✅ Normalizes coordinates

## Workflow

```
Design in Fortify → Export JSON → Convert → Evaluate → Train ML
```

## Benefits

1. **Use Fortify's visual editor** - Much easier than JSON
2. **Import community bases** - Learn from popular designs
3. **Pre-validated** - Fortify ensures building rules
4. **Calculate raid costs** - See weak points
5. **Train better models** - More diverse training data

## Tips

- Export multiple variations of your base
- Try different material upgrades in Fortify
- Compare scores of different designs
- Use Fortify for planning, ML for optimization

## See Also

- `FORTIFY.md` - Full documentation
- `examples/fortify_example.json` - Example format
- `USAGE.md` - Complete usage guide

---

**Build in Fortify, optimize with AI!** 🚀
