# Fortify Compact Format Support

✅ **Full support for Fortify's compact/share format!**

## What is the Compact Format?

The compact format is a condensed representation used when sharing bases in Fortify. It's a single-line string that contains all base data.

## Format Structure

```
terrain2d|x1|x2|x3|x4|x5;category1,item1,item2,...;category2,item1,item2,...
```

### Item Format
Each item: `x|y|z|rotation|grade_info`

### Grade Mapping
- `0` = Twig
- `1` = Wood
- `2` = Stone
- `3` = Metal
- `4+` = Armored

## Usage

### Import from Compact Format

```bash
# From string
node dist/cli.js import --data "terrain2d|...;floor,8.768|1.151|-9.204|89.998|2_2__,..." -o ./output/base.json

# From file
$data = Get-Content ./fortify_export.txt -Raw
node dist/cli.js import --data $data -o ./output/base.json
```

### Evaluate

```bash
node dist/cli.js evaluate -i ./output/base.json
```

### Simulate Raids

```bash
node dist/cli.js simulate -i ./output/base.json -m rockets
```

## Example

The tool successfully imported your base with:
- **79 pieces** parsed
- **Grid dimensions**: 15x11x17
- **Overall Score**: 14.50
- **Multi-TC**: 70.00
- **Multi-Bed**: 40.00

## Supported Categories

The parser recognizes these Fortify categories:
- `floor` → Floor
- `foundation` → Foundation
- `wall` → Wall
- `roof`, `ceiling` → Ceiling
- `door` → Doorway
- `window` → Window
- `stairs`, `ramp` → Stairs
- And many more...

## How It Works

1. **Parse** the compact string
2. **Extract** piece type, position, rotation, and grade
3. **Normalize** coordinates to grid
4. **Auto-detect** TCs, beds, and loot rooms
5. **Generate** internal base representation

## Benefits

- ✅ **Quick Sharing**: Copy/paste base strings
- ✅ **Space Efficient**: Compact representation
- ✅ **Standard Format**: Compatible with Fortify.gg
- ✅ **Automatic Conversion**: No manual translation needed
- ✅ **Full Feature Access**: Evaluate, simulate, train ML

## Export to Fortify Format

After optimization:
```bash
# Convert back to JSON (compatible with Fortify)
node dist/cli.js import --data "..." -o ./optimized.json
```

## Tips

1. **Copy from Fortify**: Use the "Share" or "Export" button
2. **Save to file**: Easier than command-line strings
3. **Batch process**: Import multiple bases for training
4. **Compare designs**: Evaluate different layouts
5. **Optimize**: Use ML to improve existing bases

## Complete Workflow

```bash
# 1. Export from Fortify (copy compact string)

# 2. Save to file
echo "terrain2d|...;..." > mybase.txt

# 3. Import and convert
$data = Get-Content ./mybase.txt -Raw
node dist/cli.js import --data $data -o ./mybase.json

# 4. Evaluate
node dist/cli.js evaluate -i ./mybase.json

# 5. Find weak points
node dist/cli.js simulate -i ./mybase.json -m rockets

# 6. Add to training data
node dist/cli.js import -i ./mybase.json

# 7. Train ML model
node dist/cli.js train -e 100

# 8. Generate optimized versions
node dist/cli.js generate -n 5
```

## Example Output

```
📥 Parsing Fortify compact format...
Parsing Fortify compact format...
Parsed 79 pieces
Grid: 15x11x17, Offset: (1, -3, -23)
✓ Converted: Fortify Import
Overall Score: 14.50
✓ Saved to: ./output/fortify_full_base.json
```

---

**Design in Fortify, analyze with AI, dominate in Rust!** 🚀🏠💥
