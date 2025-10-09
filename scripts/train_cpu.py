#!/usr/bin/env python3
"""
CPU-only training script for Persian chat agent.
Fine-tunes GPT-2 small on Persian datasets.
"""
import json
import argparse
import sys
import torch
from pathlib import Path
from transformers import (
    GPT2LMHeadModel,
    GPT2Tokenizer,
    GPT2Config,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling,
)
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
                # Combine prompt and completion for language modeling
                text = f"{item['prompt']}\n{item['completion']}"
                data.append({'text': text})
    
    logger.info(f"Loaded {len(data)} samples")
    return Dataset.from_list(data)

def tokenize_function(examples, tokenizer, max_length):
    """Tokenize examples."""
    return tokenizer(
        examples['text'],
        truncation=True,
        max_length=max_length,
        padding='max_length',
    )

def train_model(args):
    """Main training function."""
    logger.info("=" * 60)
    logger.info("Persian Chat Agent - CPU Training")
    logger.info("=" * 60)
    
    # Force CPU
    device = torch.device('cpu')
    logger.info(f"Using device: {device}")
    
    # Paths
    base_dir = Path(__file__).parent.parent
    data_file = base_dir / 'datasets' / 'train.jsonl'
    model_dir = base_dir / 'models' / 'persian-chat'
    logs_dir = base_dir / 'logs'
    logs_dir.mkdir(exist_ok=True)
    
    # Check if using combined dataset
    combined_file = base_dir / 'datasets' / 'combined.jsonl'
    if combined_file.exists():
        logger.info("Using combined dataset (HuggingFace + Google)")
        data_file = combined_file
    
    # Initialize tokenizer and model
    logger.info("Initializing tokenizer and model...")
    tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
    
    # Add padding token
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    config = GPT2Config.from_pretrained('gpt2')
    model = GPT2LMHeadModel.from_pretrained('gpt2', config=config)
    model.to(device)
    
    # Load and tokenize dataset
    dataset = load_jsonl_dataset(data_file)
    tokenized_dataset = dataset.map(
        lambda x: tokenize_function(x, tokenizer, args.max_length),
        batched=True,
        remove_columns=['text']
    )
    
    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,
    )
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=str(model_dir),
        overwrite_output_dir=True,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        save_steps=500,
        save_total_limit=2,
        learning_rate=args.lr,
        warmup_steps=100,
        logging_dir=str(logs_dir),
        logging_steps=50,
        seed=args.seed,
        use_cpu=True,
        no_cuda=True,
        fp16=False,
        report_to=[],
    )
    
    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        data_collator=data_collator,
        train_dataset=tokenized_dataset,
    )
    
    # Train
    logger.info(f"Starting training with hyperparameters:")
    logger.info(f"  Epochs: {args.epochs}")
    logger.info(f"  Batch size: {args.batch_size}")
    logger.info(f"  Learning rate: {args.lr}")
    logger.info(f"  Max length: {args.max_length}")
    logger.info(f"  Seed: {args.seed}")
    
    try:
        train_result = trainer.train()
        
        # Save model
        logger.info(f"Saving model to {model_dir}")
        trainer.save_model(str(model_dir))
        tokenizer.save_pretrained(str(model_dir))
        
        # Save training metrics
        metrics = train_result.metrics
        metrics_file = logs_dir / 'train_metrics.json'
        with open(metrics_file, 'w') as f:
            json.dump(metrics, f, indent=2)
        
        logger.info(f"Training metrics saved to {metrics_file}")
        logger.info(f"Training loss: {metrics.get('train_loss', 'N/A')}")
        
        # Write summary to train.log
        log_file = logs_dir / 'train.log'
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write("Training Summary\n")
            f.write("=" * 60 + "\n")
            f.write(f"Epochs: {args.epochs}\n")
            f.write(f"Batch size: {args.batch_size}\n")
            f.write(f"Learning rate: {args.lr}\n")
            f.write(f"Max length: {args.max_length}\n")
            f.write(f"Seed: {args.seed}\n")
            f.write(f"Training loss: {metrics.get('train_loss', 'N/A')}\n")
            f.write(f"Model saved to: {model_dir}\n")
            f.write("=" * 60 + "\n\n")
        
        logger.info("=" * 60)
        logger.info("✅ TRAINING COMPLETE")
        logger.info("=" * 60)
        
        return 0
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        return 1

def main():
    """Parse arguments and run training."""
    parser = argparse.ArgumentParser(description='Train Persian chat model (CPU-only)')
    parser.add_argument('--epochs', type=int, default=3, help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=2, help='Training batch size')
    parser.add_argument('--lr', type=float, default=5e-5, help='Learning rate')
    parser.add_argument('--max_length', type=int, default=512, help='Maximum sequence length')
    parser.add_argument('--seed', type=int, default=42, help='Random seed')
    
    args = parser.parse_args()
    
    return train_model(args)

if __name__ == "__main__":
    sys.exit(main())
