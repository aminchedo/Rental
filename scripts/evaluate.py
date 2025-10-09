#!/usr/bin/env python3
import argparse
import json
import pickle
from pathlib import Path
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score


def load_checkpoint(checkpoint_path):
    """Load model checkpoint."""
    with open(checkpoint_path, 'rb') as f:
        checkpoint = pickle.load(f)
    return checkpoint['model'], checkpoint.get('metadata', {})


def load_data(data_path):
    """Load evaluation data from JSON."""
    with open(data_path, 'r') as f:
        data = json.load(f)
    return np.array(data['features']), np.array(data['labels'])


def evaluate_model(model, X, y):
    """Evaluate model and compute metrics."""
    y_pred = model.predict(X)
    
    metrics = {
        'accuracy': float(accuracy_score(y, y_pred)),
        'precision': float(precision_score(y, y_pred, average='weighted', zero_division=0)),
        'recall': float(recall_score(y, y_pred, average='weighted', zero_division=0)),
        'f1_score': float(f1_score(y, y_pred, average='weighted', zero_division=0)),
        'n_samples': len(y)
    }
    
    return metrics


def save_report(metrics, report_path):
    """Save evaluation report as JSON."""
    report_path = Path(report_path)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print(f"✓ Report saved → {report_path}")


def main():
    parser = argparse.ArgumentParser(description='Evaluate a trained model')
    parser.add_argument('--model', type=str, default='models/checkpoints/latest.pkl',
                        help='Model checkpoint path')
    parser.add_argument('--data', type=str, default='data/processed/test.json',
                        help='Test data path')
    parser.add_argument('--report', type=str, default='reports/metrics.json',
                        help='Output report path')
    parser.add_argument('--dry-run', action='store_true',
                        help='Dry run mode (skip evaluation)')
    
    args = parser.parse_args()
    
    if args.dry_run:
        print("✓ Dry run mode - evaluation would execute with these parameters:")
        print(f"  Model: {args.model}")
        print(f"  Data: {args.data}")
        print(f"  Report: {args.report}")
        return 0
    
    print(f"Loading model from {args.model}...")
    model, metadata = load_checkpoint(args.model)
    print(f"✓ Model loaded (metadata: {metadata})")
    
    print(f"\nLoading test data from {args.data}...")
    X_test, y_test = load_data(args.data)
    print(f"✓ Loaded {len(X_test)} test samples")
    
    print("\nEvaluating model...")
    metrics = evaluate_model(model, X_test, y_test)
    
    print("\n=== Evaluation Results ===")
    print(f"Accuracy:  {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall:    {metrics['recall']:.4f}")
    print(f"F1 Score:  {metrics['f1_score']:.4f}")
    
    save_report(metrics, args.report)
    
    print("\n✓ Evaluation complete!")
    return 0


if __name__ == '__main__':
    exit(main())
