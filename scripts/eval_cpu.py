#!/usr/bin/env python3
"""
Evaluation script for Persian chat agent.
Computes perplexity and other metrics on test set.
"""
import json
import argparse
import sys
import torch
import math
from pathlib import Path
from transformers import GPT2LMHeadModel, GPT2Tokenizer
from datasets import Dataset
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

def load_jsonl_dataset(file_path):
    """Load JSONL dataset."""
    logger.info(f"Loading dataset from {file_path}")
    
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                item = json.loads(line)
                text = f"{item['prompt']}\n{item['completion']}"
                data.append({'text': text, 'prompt': item['prompt']})
    
    logger.info(f"Loaded {len(data)} samples")
    return data

def evaluate_model(args):
    """Main evaluation function."""
    logger.info("=" * 60)
    logger.info("Persian Chat Agent - Evaluation")
    logger.info("=" * 60)
    
    # Force CPU
    device = torch.device('cpu')
    logger.info(f"Using device: {device}")
    
    # Paths
    base_dir = Path(__file__).parent.parent
    data_file = Path(args.data) if args.data else base_dir / 'datasets' / 'test.jsonl'
    model_dir = Path(args.model) if args.model else base_dir / 'models' / 'persian-chat'
    logs_dir = base_dir / 'logs'
    logs_dir.mkdir(exist_ok=True)
    
    # Load model and tokenizer
    logger.info(f"Loading model from {model_dir}")
    try:
        tokenizer = GPT2Tokenizer.from_pretrained(str(model_dir))
        model = GPT2LMHeadModel.from_pretrained(str(model_dir))
        model.to(device)
        model.eval()
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return 1
    
    # Load test dataset
    test_data = load_jsonl_dataset(data_file)
    
    # Evaluate
    total_loss = 0.0
    total_tokens = 0
    errors = []
    
    logger.info("Computing metrics...")
    
    with torch.no_grad():
        for i, item in enumerate(test_data):
            try:
                inputs = tokenizer(
                    item['text'],
                    return_tensors='pt',
                    truncation=True,
                    max_length=512
                ).to(device)
                
                outputs = model(**inputs, labels=inputs['input_ids'])
                loss = outputs.loss.item()
                
                total_loss += loss * inputs['input_ids'].size(1)
                total_tokens += inputs['input_ids'].size(1)
                
                if (i + 1) % 100 == 0:
                    logger.info(f"Processed {i + 1}/{len(test_data)} samples")
                    
            except Exception as e:
                error_msg = f"Error on sample {i}: {str(e)[:100]}"
                logger.warning(error_msg)
                errors.append({
                    'sample_id': i,
                    'prompt': item['prompt'][:100],
                    'error': str(e)
                })
    
    # Calculate metrics
    avg_loss = total_loss / total_tokens if total_tokens > 0 else float('inf')
    perplexity = math.exp(avg_loss) if avg_loss < 100 else float('inf')
    
    metrics = {
        'eval_loss': avg_loss,
        'perplexity': perplexity,
        'num_samples': len(test_data),
        'num_errors': len(errors),
        'total_tokens': total_tokens
    }
    
    # Save metrics
    metrics_file = logs_dir / 'eval.json'
    with open(metrics_file, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    logger.info(f"\n📊 Evaluation Results:")
    logger.info(f"  Eval Loss: {avg_loss:.4f}")
    logger.info(f"  Perplexity: {perplexity:.2f}")
    logger.info(f"  Samples: {len(test_data)}")
    logger.info(f"  Errors: {len(errors)}")
    logger.info(f"  Metrics saved to: {metrics_file}")
    
    # Save errors
    errors_file = logs_dir / 'errors.txt'
    with open(errors_file, 'w', encoding='utf-8') as f:
        f.write("=" * 60 + "\n")
        f.write("Evaluation Errors\n")
        f.write("=" * 60 + "\n\n")
        
        if errors:
            for err in errors:
                f.write(f"Sample {err['sample_id']}:\n")
                f.write(f"  Prompt: {err['prompt']}\n")
                f.write(f"  Error: {err['error']}\n\n")
        else:
            f.write("No errors encountered.\n")
    
    logger.info(f"  Errors saved to: {errors_file}")
    
    # Check for NaN or missing perplexity
    if math.isnan(perplexity) or perplexity == float('inf'):
        logger.error("❌ EVALUATION FAILED: Perplexity is NaN or infinite")
        return 1
    
    logger.info("\n" + "=" * 60)
    logger.info("✅ EVALUATION COMPLETE")
    logger.info("=" * 60)
    
    return 0

def main():
    """Parse arguments and run evaluation."""
    parser = argparse.ArgumentParser(description='Evaluate Persian chat model (CPU-only)')
    parser.add_argument('--data', type=str, help='Path to test data file')
    parser.add_argument('--model', type=str, help='Path to model directory')
    
    args = parser.parse_args()
    
    return evaluate_model(args)

if __name__ == "__main__":
    sys.exit(main())
