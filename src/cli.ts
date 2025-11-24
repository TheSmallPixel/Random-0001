#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { importBases } from './data/importer.js';
import { loadFortifyBase } from './data/fortify.js';
import { parseFortifyCompactFormat } from './data/fortify-parser.js';
import { exportBase } from './data/exporter.js';
import { trainModel } from './ml/trainer.js';
import { generateBase } from './generator/generator.js';
import { evaluateBase, evaluateBaseObject } from './scoring/evaluator.js';
import { simulateRaidOnBase } from './raid/simulator.js';
import { RaidMethod } from './raid/types.js';

const program = new Command();

program
  .name('rust-base-generator')
  .description('ML-powered Rust game base generator and optimizer')
  .version('1.0.0');

program
  .command('import')
  .description('Import base designs from JSON files or Fortify format')
  .option('-i, --input <path>', 'Input directory or file')
  .option('-d, --data <string>', 'Fortify compact format string')
  .option('-f, --fortify', 'Input file is in Fortify JSON format')
  .option('-o, --output <path>', 'Output path for converted base')
  .action(async (options) => {
    if (options.data) {
      // Parse Fortify compact format from string
      console.log(chalk.blue('📥 Parsing Fortify compact format...'));
      const base = parseFortifyCompactFormat(options.data);
      console.log(chalk.green(`✓ Converted: ${base.name}`));
      
      // Evaluate
      const scores = evaluateBaseObject(base);
      console.log(chalk.yellow(`Overall Score: ${scores.overall.toFixed(2)}`));
      
      // Export if output specified
      if (options.output) {
        exportBase(base, options.output);
        console.log(chalk.green(`✓ Saved to: ${options.output}`));
      }
    } else if (options.input) {
      console.log(chalk.blue(`📥 Importing bases from: ${options.input}`));
      
      if (options.fortify) {
        // Convert Fortify JSON format
        const base = loadFortifyBase(options.input);
        console.log(chalk.green(`✓ Converted: ${base.name}`));
        
        // Evaluate
        const scores = evaluateBaseObject(base);
        console.log(chalk.yellow(`Overall Score: ${scores.overall.toFixed(2)}`));
        
        // Export if output specified
        if (options.output) {
          exportBase(base, options.output);
          console.log(chalk.green(`✓ Saved to: ${options.output}`));
        }
      } else {
        // Standard import
        await importBases(options.input);
        console.log(chalk.green('✓ Import complete'));
      }
    } else {
      console.log(chalk.red('Error: Must specify either --input or --data'));
    }
  });

program
  .command('train')
  .description('Train the ML model on imported bases')
  .option('-e, --epochs <number>', 'Number of training epochs', '100')
  .option('-b, --batch <number>', 'Batch size', '32')
  .action(async (options) => {
    console.log(chalk.blue('🧠 Training model...'));
    await trainModel({
      epochs: parseInt(options.epochs),
      batchSize: parseInt(options.batch),
    });
    console.log(chalk.green('✓ Training complete'));
  });

program
  .command('generate')
  .description('Generate a new base layout')
  .requiredOption('-o, --output <path>', 'Output file path')
  .option('-s, --seed <number>', 'Random seed')
  .option('-c, --constraints <json>', 'Generation constraints (JSON)')
  .action(async (options) => {
    console.log(chalk.blue('🏗️  Generating new base...'));
    const constraints = options.constraints ? JSON.parse(options.constraints) : undefined;
    const base = await generateBase({
      seed: options.seed ? parseInt(options.seed) : undefined,
      constraints,
    });
    console.log(chalk.green('✓ Base generated:'), options.output);
  });

program
  .command('evaluate')
  .description('Evaluate a base design')
  .requiredOption('-i, --input <path>', 'Input base file')
  .action(async (options) => {
    console.log(chalk.blue('📊 Evaluating base from:'), options.input);
    const scores = await evaluateBase(options.input);
    
    console.log(chalk.yellow('\n=== EVALUATION RESULTS ==='));
    console.log(`Overall Score: ${chalk.bold(scores.overall.toFixed(2))}`);
    console.log(`Loot Protection: ${scores.lootProtection.toFixed(2)}`);
    console.log(`PVP Visibility: ${scores.pvpVisibility.toFixed(2)}`);
    console.log(`Upkeep Efficiency: ${scores.upkeepEfficiency.toFixed(2)}`);
    console.log(`Multi-TC Score: ${scores.multiTC.toFixed(2)}`);
    console.log(`Multi-Bed Score: ${scores.multiBed.toFixed(2)}`);
  });

program
  .command('simulate')
  .description('Simulate raid on a base')
  .requiredOption('-i, --input <path>', 'Input base file')
  .option('-m, --method <type>', 'Raid method (rockets, c4, explosiveammo)', 'rockets')
  .action(async (options) => {
    console.log(chalk.blue(`💥 Simulating raid on: ${options.input}`));
    const base = JSON.parse(readFileSync(options.input, 'utf-8'));
    console.log(`Base has ${base.lootRooms?.length || 0} loot rooms`);
    console.log(`Base dimensions: ${base.dimensions}`);
    const raidMethod = options.method === 'rockets' ? RaidMethod.Rockets : 
                       options.method === 'c4' ? RaidMethod.C4 : RaidMethod.ExplosiveAmmo;
    const results = simulateRaidOnBase(base, raidMethod);
    
    console.log(chalk.yellow('\n=== RAID SIMULATION ==='));
    console.log(`Optimal raid cost: ${chalk.bold(results.minCost)} sulfur`);
    console.log(`Average raid cost: ${results.avgCost.toFixed(0)} sulfur`);
    console.log(`Loot rooms found: ${results.paths.length}`);
    console.log(`Most efficient target: Room at (${results.bestTarget.x}, ${results.bestTarget.y}, ${results.bestTarget.z})`);
    
    // Show details of best path
    if (results.paths.length > 0) {
      const bestPath = results.paths[0];
      console.log(chalk.cyan('\n=== BEST RAID PATH ==='));
      console.log(`Path length: ${bestPath.path.length} positions`);
      console.log(`Total sulfur cost: ${bestPath.totalCost}`);
      console.log(`Loot value: ${base.lootRooms[0]?.value || 'Unknown'}`);
      console.log(`Efficiency: ${bestPath.efficiency.toFixed(2)} (value/cost ratio)`);
      console.log(`\nPath: Start -> ${bestPath.path.slice(0, 5).map(p => `(${p.x},${p.y},${p.z})`).join(' -> ')}${bestPath.path.length > 5 ? ' -> ...' : ''}`);
    }
  });

program.parse();
