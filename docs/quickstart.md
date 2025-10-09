# Quick Start Guide

Get up and running with the model training tutorial in 5 minutes.

## Installation

```bash
# Clone repository
git clone <repo-url>
cd <repo-name>

# Install dependencies
pip install -r requirements.txt
```

## Run the Pipeline

### 1. Prepare Data (30 seconds)

```bash
python scripts/prepare_data.py --synthetic 500 --output data/processed
```

**Output:**
```
✓ Generated 500 synthetic samples → data/raw/synthetic_data.json
✓ Split into 400 train / 100 test samples
  → data/processed/train.json
  → data/processed/test.json

✓ Data preparation complete!
```

### 2. Train Model (10 seconds)

```bash
python scripts/train.py --data data/processed/train.json --out models/checkpoints --epochs 100
```

**Output:**
```
Loading data from data/processed/train.json...
✓ Loaded 400 training samples

Training model (max_iter=100)...
✓ Training accuracy: 0.9550
✓ Model saved → models/checkpoints/latest.pkl

✓ Training complete!
```

### 3. Evaluate Model (5 seconds)

```bash
python scripts/evaluate.py --model models/checkpoints/latest.pkl --data data/processed/test.json --report reports/metrics.json
```

**Output:**
```
Loading model from models/checkpoints/latest.pkl...
✓ Model loaded (metadata: {...})

Loading test data from data/processed/test.json...
✓ Loaded 100 test samples

Evaluating model...

=== Evaluation Results ===
Accuracy:  0.9500
Precision: 0.9487
Recall:    0.9500
F1 Score:  0.9491

✓ Report saved → reports/metrics.json

✓ Evaluation complete!
```

### 4. View Results

```bash
cat reports/metrics.json
```

**Output:**
```json
{
  "accuracy": 0.95,
  "precision": 0.9487179487179487,
  "recall": 0.95,
  "f1_score": 0.9491525423728814,
  "n_samples": 100
}
```

## One-Line Pipeline

Run everything at once:

```bash
python scripts/prepare_data.py --synthetic 500 --output data/processed && \
python scripts/train.py --data data/processed/train.json --out models/checkpoints --epochs 100 && \
python scripts/evaluate.py --model models/checkpoints/latest.pkl --data data/processed/test.json --report reports/metrics.json
```

## Interactive Mode

Prefer notebooks? Launch Jupyter:

```bash
jupyter notebook
```

Then run:
1. `notebooks/01_prepare_data.ipynb`
2. `notebooks/02_train_model.ipynb`
3. `notebooks/03_evaluate_model.ipynb`

## Command Reference

### Data Preparation

```bash
# Synthetic data
python scripts/prepare_data.py --synthetic <N> --output <DIR>

# Your own data
python scripts/prepare_data.py --input <FILE> --output <DIR>

# Custom split ratio
python scripts/prepare_data.py --input <FILE> --output <DIR> --train-ratio 0.7
```

### Training

```bash
# Basic
python scripts/train.py --data <FILE> --out <DIR> --epochs <N>

# Dry run (test without training)
python scripts/train.py --dry-run
```

### Evaluation

```bash
# Basic
python scripts/evaluate.py --model <FILE> --data <FILE> --report <FILE>

# Dry run (test without evaluation)
python scripts/evaluate.py --dry-run
```

## Help

Get help for any script:

```bash
python scripts/prepare_data.py --help
python scripts/train.py --help
python scripts/evaluate.py --help
```

## Next Steps

- 📖 Read the [full tutorial](tutorial.md)
- 📊 Check [dataset guidelines](dataset-guidelines.md)
- 📈 Learn about [evaluation metrics](evaluation-guide.md)

---

**That's it! You're ready to train ML models.** 🎉
