# Complete Model Training Tutorial

## Introduction

This tutorial walks you through the complete process of training a machine learning model, from data preparation to evaluation. By the end, you'll understand how to build reproducible ML pipelines.

## Prerequisites

- Basic Python knowledge
- Understanding of machine learning concepts
- Python 3.8+ installed

## Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd <repo-name>
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify installation**
   ```bash
   python scripts/prepare_data.py --help
   ```

## Step 1: Data Preparation

### Using Synthetic Data

For this tutorial, we'll use synthetic data:

```bash
python scripts/prepare_data.py --synthetic 500 --output data/processed
```

This generates:
- 500 samples with 10 features each
- Binary classification labels
- Automatic 80/20 train/test split
- Saves to `data/processed/train.json` and `data/processed/test.json`

### Using Your Own Data

Your data should be in JSON format:

```json
{
  "features": [
    [0.5, 1.2, -0.3, ...],
    [0.8, -0.5, 0.1, ...],
    ...
  ],
  "labels": [0, 1, 0, ...]
}
```

Prepare it with:
```bash
python scripts/prepare_data.py --input data/raw/yourdata.json --output data/processed
```

### Understanding the Output

The script creates two files:
- `train.json` - Training set (80% of data)
- `test.json` - Test set (20% of data)

## Step 2: Model Training

### Basic Training

Train a logistic regression model:

```bash
python scripts/train.py \
  --data data/processed/train.json \
  --out models/checkpoints \
  --epochs 100
```

### Training Parameters

- `--data`: Path to training data
- `--out`: Output directory for checkpoints
- `--epochs`: Maximum iterations (for sklearn: max_iter)
- `--dry-run`: Test without actual training

### What Happens During Training

1. Loads training data from JSON
2. Initializes a logistic regression model
3. Fits the model to training data
4. Computes training accuracy
5. Saves model checkpoint with metadata

### Output

The script saves:
- `models/checkpoints/latest.pkl` - Model checkpoint
- Training accuracy printed to console
- Metadata (n_samples, n_features, etc.)

## Step 3: Model Evaluation

### Basic Evaluation

Evaluate on test set:

```bash
python scripts/evaluate.py \
  --model models/checkpoints/latest.pkl \
  --data data/processed/test.json \
  --report reports/metrics.json
```

### Evaluation Parameters

- `--model`: Path to model checkpoint
- `--data`: Path to test data
- `--report`: Output path for metrics report
- `--dry-run`: Test without actual evaluation

### Understanding Metrics

The evaluation produces:

```json
{
  "accuracy": 0.95,    // Overall correctness
  "precision": 0.94,   // True positives / (TP + FP)
  "recall": 0.95,      // True positives / (TP + FN)
  "f1_score": 0.94,    // Harmonic mean of precision/recall
  "n_samples": 100     // Number of test samples
}
```

### Interpreting Results

- **Accuracy**: Percentage of correct predictions
- **Precision**: How many predicted positives are actually positive
- **Recall**: How many actual positives were found
- **F1 Score**: Balance between precision and recall

## Step 4: Interactive Exploration

### Using Jupyter Notebooks

Launch Jupyter:
```bash
jupyter notebook
```

Navigate to `notebooks/` and run in order:

1. **01_prepare_data.ipynb**
   - Visualize data distribution
   - Understand features
   - Check for imbalances

2. **02_train_model.ipynb**
   - Interactive training
   - Visualize model coefficients
   - Compare different parameters

3. **03_evaluate_model.ipynb**
   - Detailed metrics
   - Confusion matrix
   - Prediction visualization

## Complete Pipeline Example

Run everything in sequence:

```bash
# Clean previous runs (optional)
rm -rf data/processed/* models/checkpoints/* reports/*

# Full pipeline
python scripts/prepare_data.py --synthetic 1000 --output data/processed
python scripts/train.py --data data/processed/train.json --out models/checkpoints --epochs 200
python scripts/evaluate.py --model models/checkpoints/latest.pkl --data data/processed/test.json --report reports/metrics.json

# View results
cat reports/metrics.json
```

## Best Practices

1. **Version Control**
   - Commit code, not data or models
   - Use `.gitignore` for large files
   - Tag releases

2. **Reproducibility**
   - Set random seeds
   - Document dependencies
   - Save all hyperparameters

3. **Data Management**
   - Keep raw data separate
   - Document preprocessing steps
   - Validate data quality

4. **Model Management**
   - Save checkpoints regularly
   - Include metadata
   - Version your models

5. **Evaluation**
   - Always use held-out test set
   - Report multiple metrics
   - Check for overfitting

## Troubleshooting

### Import Errors
```bash
pip install -r requirements.txt --upgrade
```

### Data Format Issues
Check your JSON structure matches the expected format.

### Low Accuracy
- Increase training epochs
- Check data quality
- Try different models

### Out of Memory
- Reduce dataset size
- Use smaller batch sizes
- Process in chunks

## Next Steps

1. **Experiment with different models**
   - Try different sklearn classifiers
   - Experiment with hyperparameters

2. **Use real datasets**
   - Replace synthetic data
   - Apply domain knowledge

3. **Add features**
   - Feature engineering
   - Feature selection
   - Dimensionality reduction

4. **Improve evaluation**
   - Cross-validation
   - ROC curves
   - Learning curves

## Resources

- [Scikit-learn Documentation](https://scikit-learn.org/stable/)
- [Model Evaluation Metrics](https://scikit-learn.org/stable/modules/model_evaluation.html)
- [Best Practices for ML Projects](https://github.com/chiphuyen/machine-learning-systems-design)

---

Happy Learning! 🚀
