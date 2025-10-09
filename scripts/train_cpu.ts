#!/usr/bin/env ts-node
/**
 * CPU-based fine-tuning script for Persian chat model.
 * TypeScript wrapper for Python-based training (PyTorch/Transformers)
 * 
 * NOTE: Deep learning model training requires Python/PyTorch.
 * This TypeScript script provides a typed interface and delegates to Python.
 * For a pure TypeScript ML solution, consider TensorFlow.js or ONNX Runtime.
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

interface TrainingArgs {
  epochs?: number;
  batch_size?: number;
  lr?: number;
  max_length?: number;
  seed?: number;
  model_name?: string;
  dataset?: string;
  data?: string;  // Alias for dataset
  output_dir?: string;
  log_file?: string;
}

/**
 * Execute Python training script with TypeScript argument handling
 */
async function trainModel(args: TrainingArgs): Promise<void> {
  const pythonScript = path.join(__dirname, 'train_cpu.py');
  
  // Verify Python script exists
  if (!fs.existsSync(pythonScript)) {
    console.error(`❌ Python training script not found: ${pythonScript}`);
    console.error('   Model training requires PyTorch (Python).');
    console.error('   For TypeScript-only ML, consider TensorFlow.js or ONNX Runtime.');
    process.exit(1);
  }
  
  // Build command arguments
  const commandArgs: string[] = [pythonScript];
  
  if (args.epochs !== undefined) {
    commandArgs.push('--epochs', String(args.epochs));
  }
  if (args.batch_size !== undefined) {
    commandArgs.push('--batch_size', String(args.batch_size));
  }
  if (args.lr !== undefined) {
    commandArgs.push('--lr', String(args.lr));
  }
  if (args.max_length !== undefined) {
    commandArgs.push('--max_length', String(args.max_length));
  }
  if (args.seed !== undefined) {
    commandArgs.push('--seed', String(args.seed));
  }
  if (args.model_name) {
    commandArgs.push('--model_name', args.model_name);
  }
  if (args.dataset || args.data) {
    commandArgs.push('--dataset', args.dataset || args.data || '');
  }
  if (args.output_dir) {
    commandArgs.push('--output_dir', args.output_dir);
  }
  if (args.log_file) {
    commandArgs.push('--log_file', args.log_file);
  }
  
  console.log('🚀 Starting Python training process...');
  console.log(`   Command: python3 ${commandArgs.join(' ')}`);
  console.log();
  
  // Spawn Python process
  const pythonProcess = spawn('python3', commandArgs, {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  return new Promise((resolve, reject) => {
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Training completed successfully!');
        resolve();
      } else {
        console.error(`\n❌ Training failed with exit code ${code}`);
        reject(new Error(`Training process exited with code ${code}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('❌ Failed to start training process:', error);
      reject(error);
    });
  });
}

/**
 * Parse command line arguments
 */
function parseArgs(): TrainingArgs {
  const args: TrainingArgs = {};
  
  for (let i = 2; i < process.argv.length; i += 2) {
    const key = process.argv[i];
    const value = process.argv[i + 1];
    
    switch (key) {
      case '--epochs':
        args.epochs = parseInt(value, 10);
        break;
      case '--batch_size':
        args.batch_size = parseInt(value, 10);
        break;
      case '--lr':
        args.lr = parseFloat(value);
        break;
      case '--max_length':
        args.max_length = parseInt(value, 10);
        break;
      case '--seed':
        args.seed = parseInt(value, 10);
        break;
      case '--model_name':
        args.model_name = value;
        break;
      case '--dataset':
        args.dataset = value;
        break;
      case '--data':
        args.data = value;
        break;
      case '--output_dir':
        args.output_dir = value;
        break;
      case '--log_file':
        args.log_file = value;
        break;
      default:
        console.warn(`Unknown argument: ${key}`);
    }
  }
  
  return args;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Persian Chat Model Training (TypeScript → Python)');
  console.log('='.repeat(60));
  console.log();
  console.log('ℹ️  Note: This TypeScript script delegates to Python for PyTorch training.');
  console.log('   Backend API remains TypeScript-only.');
  console.log();
  
  const args = parseArgs();
  
  try {
    await trainModel(args);
  } catch (error) {
    console.error('Training failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { trainModel, TrainingArgs };
