# Rust Base Generator - Project Summary

## ✅ What Has Been Created

A complete **ML-powered base generator** for the Rust game using JavaScript/TypeScript and TensorFlow.js.

## 📁 Project Structure

```
rust-base-generator/
├── src/
│   ├── base/                    # Base representation (3D voxel grid)
│   │   ├── types.ts            # Core types & interfaces
│   │   ├── components.ts       # Building pieces, materials, costs
│   │   ├── grid.ts             # 3D grid operations
│   │   └── index.ts
│   ├── raid/                    # Raid simulation engine
│   │   ├── types.ts            # Raid types
│   │   ├── pathfinding.ts      # A* pathfinding for cheapest raid path
│   │   ├── simulator.ts        # Full raid simulation
│   │   └── index.ts
│   ├── scoring/                 # Multi-metric evaluation system
│   │   ├── types.ts            # Scoring types
│   │   ├── metrics.ts          # 5 scoring metrics
│   │   ├── evaluator.ts        # Overall evaluation
│   │   └── index.ts
│   ├── ml/                      # Machine learning model
│   │   ├── types.ts            # ML types & configs
│   │   ├── model.ts            # VAE architecture (TensorFlow.js)
│   │   ├── trainer.ts          # Training pipeline
│   │   ├── encoder.ts          # Base ↔ Tensor conversion
│   │   └── index.ts
│   ├── data/                    # Data import/export
│   │   ├── importer.ts         # Import & process bases
│   │   ├── loader.ts           # Load training data
│   │   ├── exporter.ts         # Export bases
│   │   └── index.ts
│   ├── generator/               # Base generation
│   │   ├── generator.ts        # Generate new bases
│   │   ├── optimizer.ts        # Genetic optimization
│   │   └── index.ts
│   ├── cli.ts                   # Command-line interface
│   └── index.ts                 # Main entry point
├── examples/
│   ├── bases/                   # Example base JSON files
│   │   ├── 2x2_starter.json
│   │   ├── bunker_base.json
│   │   └── honeycomb.json
│   ├── create_base.js          # Programmatic base creation
│   └── workflow.md             # Complete workflow guide
├── package.json                 # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── USAGE.md                    # Usage documentation
├── ARCHITECTURE.md             # System architecture
├── quickstart.bat/.sh          # Quick start scripts
└── PROJECT_SUMMARY.md          # This file
```

## 🎯 Core Features

### 1. **3D Base Representation**
- Voxel-based 3D grid system
- Support for all Rust building pieces
- Material tiers (Twig → Armored)
- Soft side tracking

### 2. **Raid Cost Simulation**
- A* pathfinding for optimal raid paths
- Calculates sulfur costs (rockets, C4, explosive ammo)
- Finds cheapest path to each loot room
- Multiple entry point analysis

### 3. **Multi-Metric Scoring** (Weighted)
- **Loot Protection** (35%): Raid cost to reach loot
- **PVP Visibility** (20%): How hidden the base is
- **Upkeep Efficiency** (20%): Defense vs. maintenance cost
- **Multi-TC** (15%): Multiple tool cupboard coverage
- **Multi-Bed** (10%): Multiple spawn points

### 4. **ML Model (VAE)**
- Variational Autoencoder with 3D convolutions
- 128-dimensional latent space
- Learns patterns from training bases
- Generates novel base layouts

### 5. **Genetic Optimization**
- Fine-tunes generated bases
- Upgrades materials strategically
- Adds strategic walls/honeycombing
- Optimizes soft side exposure

### 6. **CLI Tools**
```bash
npm run import     # Import base designs
npm run train      # Train ML model
npm run generate   # Generate new bases
npm run evaluate   # Score a base
npm run simulate   # Simulate raid
```

## 🚀 Getting Started

### Quick Start (Windows)
```bash
quickstart.bat
```

### Quick Start (Linux/Mac)
```bash
chmod +x quickstart.sh
./quickstart.sh
```

### Manual Setup
```bash
# 1. Install
npm install

# 2. Import bases
npm run import -- -i ./examples/bases

# 3. Train model
npm run train -- -e 100

# 4. Generate
npm run generate -- -o ./output/my_base.json
```

## 📊 How It Works

1. **Training Phase**
   - Import player-made bases (JSON)
   - Evaluate each with scoring system
   - Encode to 3D tensors (32x32x16x8)
   - Train VAE to learn base patterns

2. **Generation Phase**
   - Sample random latent vector
   - Decode through VAE → 3D tensor
   - Convert tensor → Base structure
   - Apply genetic optimization
   - Evaluate and rank candidates

3. **Evaluation**
   - Simulate raids from all entry points
   - Calculate visibility from exterior
   - Compute upkeep costs
   - Check TC/bed coverage
   - Combine into weighted score

## 🔧 Technologies

- **Language**: TypeScript (ES2022)
- **ML Framework**: TensorFlow.js (Node.js backend)
- **Runtime**: Node.js
- **CLI**: Commander.js
- **Formatting**: Chalk

## 📈 Scoring Metrics Explained

### Loot Protection (0-100)
- Measures average sulfur cost to raid loot rooms
- 100 sulfur = 1 point
- Higher = better defended

### PVP Visibility (0-100)
- Ratio of exterior walls blocking view
- More blocking = higher score = less visible

### Upkeep Efficiency (0-100)
- Raid cost ÷ Daily upkeep
- 10:1 ratio = 100 points
- Rewards cost-effective defense

### Multi-TC Score (0-100)
- 1 TC = 30, 2 TCs = 70, 3+ TCs = 100
- Ensures authorization redundancy

### Multi-Bed Score (0-100)
- 1 bed = 40, 2 beds = 70, 3+ beds = 100
- Critical for team respawning

## 🎮 Base JSON Format

```json
{
  "id": "unique_id",
  "name": "Base Name",
  "dimensions": [width, height, depth],
  "grid": [[[pieces]]], 
  "toolCupboards": [{"x":5,"y":5,"z":0}],
  "beds": [{"x":4,"y":5,"z":0}],
  "lootRooms": [{
    "position": {"x":5,"y":5,"z":2},
    "value": 10000,
    "priority": 10,
    "containers": 4
  }],
  "metadata": {
    "upkeepCost": {"stone": 1000},
    "totalPieces": 50,
    "footprint": [10,10,5]
  }
}
```

## 🔮 Future Enhancements

Potential additions:
- Web UI for visualization
- Integration with Rust+ API
- Real-time raid defense scoring
- Trap placement optimization
- Zerg vs. solo base styles
- Decay simulation
- Multi-floor honeycomb patterns

## 📚 Documentation

- **USAGE.md**: Complete usage guide
- **ARCHITECTURE.md**: System architecture
- **examples/workflow.md**: Step-by-step workflow
- **examples/create_base.js**: Programmatic base creation

## 🐛 Troubleshooting

**TypeScript errors before install**
- Normal! Run `npm install` first

**"No training data found"**
- Run `npm run import` with base files first

**Low generation quality**
- Import more diverse training bases
- Train for more epochs (200-500)
- Increase generation iterations

**Node.js/TensorFlow.js issues**
- Ensure Node.js 18+ is installed
- Check system compatibility for TensorFlow

## 📝 Next Steps

1. **Run quickstart** to test the system
2. **Import real bases** from your gameplay
3. **Train the model** on your dataset
4. **Generate bases** with different constraints
5. **Build in-game** and test effectiveness
6. **Iterate** based on results

---

**Ready to generate optimal Rust bases with ML!** 🎯
