@echo off
REM Quick Start Script for Rust Base Generator (Windows)

echo 🎮 Rust Base Generator - Quick Start
echo ======================================
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build TypeScript
echo.
echo 🔨 Building TypeScript...
call npm run build

REM Create directories
if not exist "data" mkdir data
if not exist "models" mkdir models
if not exist "output" mkdir output

REM Import example bases
echo.
echo 📥 Importing example bases...
call npm run import -- -i ./examples/bases

REM Evaluate an example
echo.
echo 📊 Evaluating example base...
call npm run evaluate -- -i ./examples/bases/2x2_starter.json

REM Simulate raid
echo.
echo 💥 Simulating raid...
call npm run simulate -- -i ./examples/bases/2x2_starter.json -m rockets

echo.
echo ✅ Quick start complete!
echo.
echo Next steps:
echo   1. Train the model: npm run train -- -e 100
echo   2. Generate bases: npm run generate -- -o ./output/my_base.json
echo   3. See USAGE.md for full documentation
