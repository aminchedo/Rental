#!/usr/bin/env python3
import argparse
import json
import pickle
from pathlib import Path
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score


def load_data(data_path):
    """Load training data from JSON."""
    with open(data_path, 'r') as f:
        data = json.load(f)
    return np.array(data['features']), np.array(data['labels'])


def train_model(X_train, y_train, max_iter=100):
    """Train a simple logistic regression model."""
    model = LogisticRegression(max_iter=max_iter, random_state=42)
    model.fit(X_train, y_train)
    return model


def save_checkpoint(model, output_path, metadata=None):
    """Save model checkpoint."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    checkpoint = {
        'model': model,
        'metadata': metadata or {}
    }
    
    with open(output_path, 'wb') as f:
        pickle.dump(checkpoint, f)
    
    print(f"✓ Model saved → {output_path}")


def main():
    parser = argparse.ArgumentParser(description='Train a model')
    parser.add_argument('--data', type=str, default='data/processed/train.json', 
                        help='Training data path')
    parser.add_argument('--out', type=str, default='models/checkpoints', 
                        help='Output directory')
    parser.add_argument('--epochs', type=int, default=100, 
                        help='Max iterations (for sklearn models)')
    parser.add_argument('--dry-run', action='store_true', 
                        help='Dry run mode (skip training)')
    
    args = parser.parse_args()
    
    if args.dry_run:
        print("✓ Dry run mode - training would execute with these parameters:")
        print(f"  Data: {args.data}")
        print(f"  Output: {args.out}")
        print(f"  Epochs: {args.epochs}")
        return 0
    
    print(f"Loading data from {args.data}...")
    X_train, y_train = load_data(args.data)
    print(f"✓ Loaded {len(X_train)} training samples")
    
    print(f"\nTraining model (max_iter={args.epochs})...")
    model = train_model(X_train, y_train, max_iter=args.epochs)
    
    train_acc = accuracy_score(y_train, model.predict(X_train))
    print(f"✓ Training accuracy: {train_acc:.4f}")
    
    metadata = {
        'n_samples': len(X_train),
        'n_features': X_train.shape[1],
        'train_accuracy': float(train_acc),
        'max_iter': args.epochs
    }
    
    output_path = Path(args.out) / 'latest.pkl'
    save_checkpoint(model, output_path, metadata)
    
    print("\n✓ Training complete!")
    return 0


if __name__ == '__main__':
    exit(main())
