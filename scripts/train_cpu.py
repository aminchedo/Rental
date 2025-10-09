#!/usr/bin/env python3
"""
CPU-based fine-tuning script for Persian chat model.
Trains a GPT-2 model on Persian conversational data using CPU only.
"""

import argparse
import json
import logging
import os
import sys
from pathlib import Path
from datetime import datetime
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling,
)
from datasets import Dataset

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/train.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def load_jsonl_dataset(filepath: Path):
    """Load JSONL dataset and convert to Hugging Face Dataset format."""
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
                    conversations.append({"text": text})
    
    logger.info(f"Loaded {len(conversations)} conversations")
    return Dataset.from_list(conversations)

def tokenize_function(examples, tokenizer, max_length):
    """Tokenize the dataset."""
    return tokenizer(
        examples["text"],
        truncation=True,
        max_length=max_length,
        padding="max_length",
    )

def main():
    parser = argparse.ArgumentParser(description="Train Persian chat model on CPU")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=4, help="Training batch size")
    parser.add_argument("--lr", type=float, default=5e-5, help="Learning rate")
    parser.add_argument("--max_length", type=int, default=512, help="Maximum sequence length")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--model_name", type=str, default="gpt2", 
                        help="Base model name (e.g., gpt2, HooshvareLab/gpt2-fa)")
    parser.add_argument("--dataset", type=str, default="datasets/train.jsonl",
                        help="Path to training dataset")
    parser.add_argument("--output_dir", type=str, default="models/persian-chat",
                        help="Output directory for trained model")
    
    args = parser.parse_args()
    
    logger.info("=" * 60)
    logger.info("Persian Chat Model Training (CPU)")
    logger.info("=" * 60)
    logger.info(f"\nTraining Configuration:")
    logger.info(f"  Model: {args.model_name}")
    logger.info(f"  Epochs: {args.epochs}")
    logger.info(f"  Batch Size: {args.batch_size}")
    logger.info(f"  Learning Rate: {args.lr}")
    logger.info(f"  Max Length: {args.max_length}")
    logger.info(f"  Seed: {args.seed}")
    logger.info(f"  Dataset: {args.dataset}")
    logger.info(f"  Output: {args.output_dir}")
    logger.info(f"  Device: CPU")
    
    # Set seed for reproducibility
    torch.manual_seed(args.seed)
    
    # Ensure CPU device
    device = torch.device("cpu")
    logger.info(f"\n🖥️  Using device: {device}")
    
    # Check if dataset exists
    dataset_path = Path(args.dataset)
    if not dataset_path.exists():
        logger.error(f"❌ Dataset not found: {dataset_path}")
        logger.error("Please run dataset preparation first.")
        sys.exit(1)
    
    # Load tokenizer and model
    logger.info(f"\n📦 Loading tokenizer and model: {args.model_name}")
    try:
        tokenizer = AutoTokenizer.from_pretrained(args.model_name)
        
        # Add special tokens for chat format
        special_tokens = {
            'additional_special_tokens': ['<|system|>', '<|user|>', '<|assistant|>']
        }
        tokenizer.add_special_tokens(special_tokens)
        
        # Set pad token if not present
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        model = AutoModelForCausalLM.from_pretrained(args.model_name)
        model.resize_token_embeddings(len(tokenizer))
        model.to(device)
        
        logger.info(f"✅ Model loaded successfully")
        logger.info(f"   Vocab size: {len(tokenizer)}")
        logger.info(f"   Model parameters: {sum(p.numel() for p in model.parameters()):,}")
        
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")
        sys.exit(1)
    
    # Load and tokenize dataset
    logger.info(f"\n📊 Loading and tokenizing dataset...")
    try:
        train_dataset = load_jsonl_dataset(dataset_path)
        
        tokenized_dataset = train_dataset.map(
            lambda x: tokenize_function(x, tokenizer, args.max_length),
            batched=True,
            remove_columns=train_dataset.column_names
        )
        
        logger.info(f"✅ Dataset tokenized: {len(tokenized_dataset)} examples")
        
    except Exception as e:
        logger.error(f"❌ Error processing dataset: {e}")
        sys.exit(1)
    
    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False  # Causal LM (GPT-style)
    )
    
    # Training arguments
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    training_args = TrainingArguments(
        output_dir=str(output_dir),
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        learning_rate=args.lr,
        logging_steps=10,
        save_strategy="epoch",
        save_total_limit=2,
        seed=args.seed,
        use_cpu=True,
        fp16=False,  # CPU doesn't support fp16
        report_to="none",  # Disable wandb/tensorboard
        disable_tqdm=False,
    )
    
    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=data_collator,
    )
    
    # Train
    logger.info(f"\n🚀 Starting training...")
    logger.info(f"   Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        train_result = trainer.train()
        
        logger.info(f"\n✅ Training completed!")
        logger.info(f"   End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"\n📈 Training Metrics:")
        logger.info(f"   Training Loss: {train_result.training_loss:.4f}")
        logger.info(f"   Total Steps: {train_result.global_step}")
        
    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
        sys.exit(1)
    
    # Save model and tokenizer
    logger.info(f"\n💾 Saving model to {output_dir}...")
    try:
        model.save_pretrained(output_dir)
        tokenizer.save_pretrained(output_dir)
        
        # Save training metadata
        metadata = {
            "model_name": args.model_name,
            "epochs": args.epochs,
            "batch_size": args.batch_size,
            "learning_rate": args.lr,
            "max_length": args.max_length,
            "seed": args.seed,
            "training_loss": train_result.training_loss,
            "total_steps": train_result.global_step,
            "trained_at": datetime.now().isoformat()
        }
        
        with open(output_dir / "training_metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"✅ Model saved successfully!")
        logger.info(f"\n" + "=" * 60)
        logger.info("Training completed successfully! 🎉")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"❌ Error saving model: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
