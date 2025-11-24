# Architecture Overview

## System Components

### 1. Base Representation (`src/base/`)
- **3D Voxel Grid**: Stores building pieces in a 3D array
- **Components**: Building piece types, materials, properties
- **Types**: TypeScript interfaces for all base structures

### 2. Raid Simulation (`src/raid/`)
- **Pathfinding**: A* algorithm to find cheapest raid paths
- **Cost Calculation**: Sulfur costs for different materials/methods
- **Simulator**: Full raid scenario testing

### 3. Scoring System (`src/scoring/`)
- **Multi-metric**: 5 weighted evaluation criteria
- **Evaluator**: Combines scores into overall rating
- **Metrics**: Individual scoring functions

### 4. ML Model (`src/ml/`)
- **VAE Architecture**: Variational Autoencoder for generation
- **Encoder/Decoder**: 3D convolutional networks
- **Trainer**: Custom training loop
- **Encoding**: Base ↔ Tensor conversion

### 5. Data Pipeline (`src/data/`)
- **Importer**: Load and process base JSON files
- **Loader**: Retrieve training data
- **Exporter**: Save generated bases

### 6. Generator (`src/generator/`)
- **Generator**: Create new bases from trained model
- **Optimizer**: Genetic algorithm for improvement

## Data Flow

```
Player Bases (JSON)
    ↓
Import & Evaluate
    ↓
Encode to Tensors
    ↓
Train VAE Model
    ↓
Generate Latent Vectors
    ↓
Decode to Bases
    ↓
Evaluate & Optimize
    ↓
Export Best Bases
```

## Tech Stack
- **Language**: TypeScript/JavaScript
- **ML Framework**: TensorFlow.js
- **Runtime**: Node.js
- **CLI**: Commander.js
