#!/bin/bash
# Quick Start Script for Rust Base Generator

echo "🎮 Rust Base Generator - Quick Start"
echo "======================================"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build

# Create directories
mkdir -p data models output

# Import example bases
echo ""
echo "📥 Importing example bases..."
npm run import -- -i ./examples/bases

# Evaluate an example
echo ""
echo "📊 Evaluating example base..."
npm run evaluate -- -i ./examples/bases/2x2_starter.json

# Simulate raid
echo ""
echo "💥 Simulating raid..."
npm run simulate -- -i ./examples/bases/2x2_starter.json -m rockets

echo ""
echo "✅ Quick start complete!"
echo ""
echo "Next steps:"
echo "  1. Train the model: npm run train -- -e 100"
echo "  2. Generate bases: npm run generate -- -o ./output/my_base.json"
echo "  3. See USAGE.md for full documentation"
