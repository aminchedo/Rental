#!/usr/bin/env python3
"""
Evaluation script for Persian chat model.
Evaluates on test set and reports metrics: eval_loss, perplexity, error analysis.
"""

import argparse
import json
import logging
import sys
import math
from pathlib import Path
from datetime import datetime
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
)
from datasets import Dataset
from torch.utils.data import DataLoader
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

def load_jsonl_dataset(filepath: Path):
    """Load JSONL dataset."""
    logger.info(f"Loading dataset from {filepath}")
    
    conversations = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                data = json.loads(line)
                if 'messages' in data:
                    # Convert messages to text format
                    text = ""
                    for msg in data['messages']:
                        role = msg['role']
                        content = msg['content']
                        if role == 'system':
                            text += f"<|system|>{content}<|endoftext|>"
                        elif role == 'user':
                            text += f"<|user|>{content}<|endoftext|>"
                        elif role == 'assistant':
                            text += f"<|assistant|>{content}<|endoftext|>"
                    conversations.append({"text": text, "original": data['messages']})
    
    logger.info(f"Loaded {len(conversations)} conversations")
    return conversations

def evaluate_model(model, tokenizer, dataset, max_length=512, device='cpu'):
    """Evaluate model on dataset and return metrics."""
    model.eval()
    total_loss = 0
    total_samples = 0
    errors = []
    
    logger.info("Running evaluation...")
    
    with torch.no_grad():
        for idx, example in enumerate(tqdm(dataset, desc="Evaluating")):
            try:
                # Tokenize
                inputs = tokenizer(
                    example['text'],
                    truncation=True,
                    max_length=max_length,
                    padding="max_length",
                    return_tensors="pt"
                )
                
                inputs = {k: v.to(device) for k, v in inputs.items()}
                
                # Forward pass
                outputs = model(**inputs, labels=inputs["input_ids"])
                loss = outputs.loss
                
                total_loss += loss.item()
                total_samples += 1
                
                # Collect high-loss examples as errors
                if loss.item() > 5.0:  # Threshold for "error" examples
                    errors.append({
                        "index": idx,
                        "loss": loss.item(),
                        "text": example['text'][:200],  # First 200 chars
                        "messages": example['original']
                    })
                
            except Exception as e:
                logger.warning(f"Error processing example {idx}: {e}")
                errors.append({
                    "index": idx,
                    "error": str(e),
                    "text": example['text'][:200]
                })
    
    # Calculate metrics
    avg_loss = total_loss / total_samples if total_samples > 0 else float('inf')
    perplexity = math.exp(avg_loss) if avg_loss < 100 else float('inf')
    
    return {
        "eval_loss": avg_loss,
        "perplexity": perplexity,
        "total_samples": total_samples,
        "errors": errors
    }

def main():
    parser = argparse.ArgumentParser(description="Evaluate Persian chat model")
    parser.add_argument("--data", type=str, default="datasets/test.jsonl",
                        help="Path to test dataset")
    parser.add_argument("--model", type=str, default="models/persian-chat",
                        help="Path to trained model")
    parser.add_argument("--max_length", type=int, default=512,
                        help="Maximum sequence length")
    parser.add_argument("--output", type=str, default="logs/eval.json",
                        help="Output file for evaluation metrics")
    parser.add_argument("--errors_output", type=str, default="logs/errors.txt",
                        help="Output file for error examples")
    
    args = parser.parse_args()
    
    logger.info("=" * 60)
    logger.info("Persian Chat Model Evaluation (CPU)")
    logger.info("=" * 60)
    logger.info(f"\nEvaluation Configuration:")
    logger.info(f"  Model: {args.model}")
    logger.info(f"  Dataset: {args.data}")
    logger.info(f"  Max Length: {args.max_length}")
    logger.info(f"  Output: {args.output}")
    
    # Ensure CPU device
    device = torch.device("cpu")
    logger.info(f"\n🖥️  Using device: {device}")
    
    # Check if files exist
    model_path = Path(args.model)
    dataset_path = Path(args.data)
    
    if not model_path.exists():
        logger.error(f"❌ Model not found: {model_path}")
        sys.exit(1)
    
    if not dataset_path.exists():
        logger.error(f"❌ Dataset not found: {dataset_path}")
        sys.exit(1)
    
    # Load model and tokenizer
    logger.info(f"\n📦 Loading model and tokenizer...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(args.model)
        model = AutoModelForCausalLM.from_pretrained(args.model)
        model.to(device)
        
        logger.info(f"✅ Model loaded successfully")
        
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")
        sys.exit(1)
    
    # Load dataset
    try:
        test_dataset = load_jsonl_dataset(dataset_path)
    except Exception as e:
        logger.error(f"❌ Error loading dataset: {e}")
        sys.exit(1)
    
    # Evaluate
    logger.info(f"\n📊 Starting evaluation...")
    try:
        results = evaluate_model(
            model=model,
            tokenizer=tokenizer,
            dataset=test_dataset,
            max_length=args.max_length,
            device=device
        )
        
        logger.info(f"\n✅ Evaluation completed!")
        logger.info(f"\n📈 Evaluation Metrics:")
        logger.info(f"   Eval Loss: {results['eval_loss']:.4f}")
        logger.info(f"   Perplexity: {results['perplexity']:.4f}")
        logger.info(f"   Total Samples: {results['total_samples']}")
        logger.info(f"   Error Examples: {len(results['errors'])}")
        
    except Exception as e:
        logger.error(f"❌ Evaluation failed: {e}")
        sys.exit(1)
    
    # Save results
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    logger.info(f"\n💾 Saving results to {output_path}...")
    
    eval_output = {
        "eval_loss": results['eval_loss'],
        "perplexity": results['perplexity'],
        "total_samples": results['total_samples'],
        "num_errors": len(results['errors']),
        "evaluated_at": datetime.now().isoformat(),
        "model_path": str(model_path),
        "dataset_path": str(dataset_path)
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(eval_output, f, indent=2, ensure_ascii=False)
    
    # Save error examples
    errors_path = Path(args.errors_output)
    errors_path.parent.mkdir(parents=True, exist_ok=True)
    
    logger.info(f"💾 Saving error examples to {errors_path}...")
    
    with open(errors_path, 'w', encoding='utf-8') as f:
        f.write(f"Error Examples - Evaluated at {datetime.now().isoformat()}\n")
        f.write("=" * 80 + "\n\n")
        
        for error in results['errors'][:20]:  # Save top 20 errors
            f.write(f"Example {error.get('index', 'N/A')}:\n")
            if 'loss' in error:
                f.write(f"  Loss: {error['loss']:.4f}\n")
            if 'error' in error:
                f.write(f"  Error: {error['error']}\n")
            f.write(f"  Text: {error['text']}\n")
            f.write("-" * 80 + "\n\n")
    
    logger.info(f"\n" + "=" * 60)
    logger.info("Evaluation completed successfully! 🎉")
    logger.info("=" * 60)

if __name__ == "__main__":
    main()
