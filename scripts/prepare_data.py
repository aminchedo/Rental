#!/usr/bin/env python3
import argparse
import json
import os
from pathlib import Path
import numpy as np


def generate_synthetic_data(n_samples, output_dir):
    """Generate synthetic classification dataset."""
    np.random.seed(42)
    
    X = np.random.randn(n_samples, 10)
    y = (X[:, 0] + X[:, 1] > 0).astype(int)
    
    data = {
        'features': X.tolist(),
        'labels': y.tolist()
    }
    
    output_path = Path(output_dir) / 'synthetic_data.json'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✓ Generated {n_samples} synthetic samples → {output_path}")
    return output_path


def split_data(input_file, output_dir, train_ratio=0.8):
    """Split data into train and test sets."""
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    n_total = len(data['labels'])
    n_train = int(n_total * train_ratio)
    
    indices = np.random.permutation(n_total)
    train_idx = indices[:n_train]
    test_idx = indices[n_train:]
    
    train_data = {
        'features': [data['features'][i] for i in train_idx],
        'labels': [data['labels'][i] for i in train_idx]
    }
    
    test_data = {
        'features': [data['features'][i] for i in test_idx],
        'labels': [data['labels'][i] for i in test_idx]
    }
    
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    train_path = output_dir / 'train.json'
    test_path = output_dir / 'test.json'
    
    with open(train_path, 'w') as f:
        json.dump(train_data, f, indent=2)
    
    with open(test_path, 'w') as f:
        json.dump(test_data, f, indent=2)
    
    print(f"✓ Split into {len(train_idx)} train / {len(test_idx)} test samples")
    print(f"  → {train_path}")
    print(f"  → {test_path}")


def main():
    parser = argparse.ArgumentParser(description='Prepare training data')
    parser.add_argument('--input', type=str, help='Input data directory/file')
    parser.add_argument('--output', type=str, default='data/processed', help='Output directory')
    parser.add_argument('--synthetic', type=int, help='Generate N synthetic samples')
    parser.add_argument('--train-ratio', type=float, default=0.8, help='Train/test split ratio')
    
    args = parser.parse_args()
    
    if args.synthetic:
        input_file = generate_synthetic_data(args.synthetic, 'data/raw')
    elif args.input:
        input_file = args.input
    else:
        print("Error: Specify --input or --synthetic")
        return 1
    
    split_data(input_file, args.output, args.train_ratio)
    print("\n✓ Data preparation complete!")
    return 0


if __name__ == '__main__':
    exit(main())
