# Evaluation Guide

Understanding model performance metrics and how to interpret results.

## Overview

Evaluation helps you understand:
- How well your model performs
- Whether it's ready for production
- What improvements are needed
- How it compares to baselines

## Running Evaluation

### Basic Usage

```bash
python scripts/evaluate.py \
  --model models/checkpoints/latest.pkl \
  --data data/processed/test.json \
  --report reports/metrics.json
```

### Output

Console output shows key metrics:
```
=== Evaluation Results ===
Accuracy:  0.9500
Precision: 0.9487
Recall:    0.9500
F1 Score:  0.9491
```

Detailed report saved to `reports/metrics.json`:
```json
{
  "accuracy": 0.95,
  "precision": 0.9487,
  "recall": 0.95,
  "f1_score": 0.9491,
  "n_samples": 100
}
```

## Understanding Metrics

### Accuracy

**Definition:** Proportion of correct predictions

```
Accuracy = (TP + TN) / (TP + TN + FP + FN)
```

**When to use:**
- Balanced datasets
- Equal cost for all errors
- General performance indicator

**Limitations:**
- Misleading on imbalanced data
- Doesn't distinguish error types

**Example:**
- Accuracy = 0.95 means 95% of predictions are correct

### Precision

**Definition:** Proportion of positive predictions that are actually positive

```
Precision = TP / (TP + FP)
```

**When to use:**
- Cost of false positives is high
- Need to minimize false alarms
- Example: Spam detection

**Interpretation:**
- Precision = 0.94 means 94% of predicted positives are correct
- 6% of predicted positives are false alarms

### Recall (Sensitivity)

**Definition:** Proportion of actual positives that are correctly identified

```
Recall = TP / (TP + FN)
```

**When to use:**
- Cost of false negatives is high
- Need to find all positives
- Example: Disease detection

**Interpretation:**
- Recall = 0.95 means 95% of actual positives are found
- 5% of actual positives are missed

### F1 Score

**Definition:** Harmonic mean of precision and recall

```
F1 = 2 * (Precision * Recall) / (Precision + Recall)
```

**When to use:**
- Need balance between precision and recall
- Imbalanced datasets
- General performance metric

**Interpretation:**
- F1 = 0.94 indicates strong overall performance
- Balances finding positives and avoiding false alarms

## Confusion Matrix

### Understanding the Matrix

|                | Predicted Negative | Predicted Positive |
|----------------|-------------------|--------------------|
| **Actual Negative** | True Negative (TN) | False Positive (FP) |
| **Actual Positive** | False Negative (FN) | True Positive (TP) |

### Visualization

See `notebooks/03_evaluate_model.ipynb` for visual confusion matrix:

```python
from sklearn.metrics import confusion_matrix
import seaborn as sns

cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
```

## Interpreting Results

### Good Performance

✅ **Signs of good model:**
- Accuracy > 0.90 (for balanced data)
- F1 Score > 0.85
- Small gap between precision and recall
- Similar train/test performance

### Poor Performance

⚠️ **Warning signs:**
- Accuracy < 0.70
- Large precision-recall gap
- F1 Score < 0.60
- Much better on train than test (overfitting)

### Overfitting Detection

Compare training and test metrics:

| Metric | Training | Test | Gap |
|--------|----------|------|-----|
| Accuracy | 0.98 | 0.75 | 0.23 ⚠️ |

**Large gap (>0.1) indicates overfitting**

Solutions:
- Reduce model complexity
- Get more training data
- Add regularization
- Use cross-validation

### Underfitting Detection

Both train and test performance are poor:

| Metric | Training | Test |
|--------|----------|------|
| Accuracy | 0.65 | 0.63 |

**Low scores on both indicate underfitting**

Solutions:
- Increase model complexity
- Add more features
- Train longer
- Try different algorithms

## Metric Selection Guide

### Choose based on your use case:

#### Balanced Classes
- **Primary:** Accuracy, F1 Score
- **Secondary:** Precision, Recall

#### Imbalanced Classes
- **Primary:** F1 Score, AUC-ROC
- **Secondary:** Precision-Recall curves
- **Avoid:** Accuracy alone

#### False Positives are Costly
- **Primary:** Precision
- **Example:** Email spam (false alarm annoys users)

#### False Negatives are Costly
- **Primary:** Recall
- **Example:** Disease screening (missing sick patient is dangerous)

#### Both Errors are Costly
- **Primary:** F1 Score
- **Balance:** Optimize both precision and recall

## Advanced Evaluation

### Cross-Validation

For more robust evaluation:

```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(model, X, y, cv=5, scoring='f1')
print(f"CV F1: {scores.mean():.4f} (+/- {scores.std():.4f})")
```

### Learning Curves

Diagnose overfitting/underfitting:

```python
from sklearn.model_selection import learning_curve

train_sizes, train_scores, test_scores = learning_curve(
    model, X, y, cv=5, train_sizes=np.linspace(0.1, 1.0, 10)
)
```

### ROC Curve

For binary classification:

```python
from sklearn.metrics import roc_curve, auc

fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
roc_auc = auc(fpr, tpr)
```

## Reporting Best Practices

### What to Include

1. **All key metrics**
   - Accuracy, Precision, Recall, F1
   - Sample sizes
   - Confusion matrix

2. **Context**
   - Model type and parameters
   - Data description
   - Training setup

3. **Comparison**
   - Baseline performance
   - Previous model versions
   - Train vs test scores

### Example Report

```markdown
## Model Evaluation Report

**Model:** Logistic Regression (max_iter=100)
**Data:** Synthetic binary classification (500 samples)
**Date:** 2024-01-15

### Results

| Metric | Score |
|--------|-------|
| Accuracy | 0.95 |
| Precision | 0.95 |
| Recall | 0.95 |
| F1 Score | 0.95 |

### Confusion Matrix

|     | Pred 0 | Pred 1 |
|-----|--------|--------|
| Act 0 | 47 | 3 |
| Act 1 | 2 | 48 |

### Analysis

- Excellent balanced performance
- No signs of overfitting (train: 0.96, test: 0.95)
- Ready for deployment
```

## Troubleshooting

### Low Accuracy
- Check data quality
- Verify labels are correct
- Try feature engineering
- Consider different algorithms

### High Training, Low Test Accuracy
- **Overfitting detected**
- Reduce model complexity
- Add more data
- Use regularization

### Imbalanced Precision/Recall
- Adjust classification threshold
- Use class weights
- Resample data
- Consider different metric

### All Metrics Low
- **Underfitting detected**
- Increase model capacity
- Add features
- Check for data issues

## Checklist

Before declaring model ready:

- [ ] Evaluated on held-out test set
- [ ] All metrics computed (Accuracy, Precision, Recall, F1)
- [ ] No overfitting (train ≈ test performance)
- [ ] Meets minimum accuracy threshold
- [ ] Confusion matrix reviewed
- [ ] Results documented
- [ ] Compared to baseline
- [ ] Edge cases considered

## Resources

- [Scikit-learn Metrics](https://scikit-learn.org/stable/modules/model_evaluation.html)
- [ROC and AUC Explained](https://towardsdatascience.com/understanding-auc-roc-curve-68b2303cc9c5)
- [Precision vs Recall](https://en.wikipedia.org/wiki/Precision_and_recall)

---

For more details, see the [tutorial](tutorial.md) or [dataset guidelines](dataset-guidelines.md).
