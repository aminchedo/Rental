# Dataset Guidelines

Best practices for preparing and managing datasets in this tutorial.

## Data Format

### Required JSON Structure

```json
{
  "features": [
    [feature1, feature2, ..., featureN],
    [feature1, feature2, ..., featureN],
    ...
  ],
  "labels": [0, 1, 0, ...]
}
```

### Example

```json
{
  "features": [
    [0.5, 1.2, -0.3, 2.1, 0.8],
    [0.8, -0.5, 0.1, 1.5, -0.2],
    [0.3, 0.9, -0.7, 1.8, 0.5]
  ],
  "labels": [0, 1, 0]
}
```

## Data Quality

### Feature Requirements

1. **Numeric values only**
   - All features must be numbers (int or float)
   - No missing values (NaN)
   - No infinite values

2. **Consistent dimensions**
   - All samples must have same number of features
   - Example: If first sample has 10 features, all must have 10

3. **Proper scaling** (recommended)
   - Normalize features to similar ranges
   - Consider standardization (mean=0, std=1)
   - Or min-max scaling to [0, 1]

### Label Requirements

1. **Binary classification** (current setup)
   - Labels must be 0 or 1
   - Balanced classes recommended
   - At least 100 samples per class

2. **Sample size**
   - Minimum: 100 samples
   - Recommended: 500+ samples
   - More data = better generalization

## Data Splitting

### Train/Test Split

Default ratio: 80/20 (configurable with `--train-ratio`)

```bash
# 70/30 split
python scripts/prepare_data.py --input data.json --output data/processed --train-ratio 0.7

# 90/10 split
python scripts/prepare_data.py --input data.json --output data/processed --train-ratio 0.9
```

### Best Practices

1. **Stratified splitting** (automatic)
   - Maintains class balance in both sets
   - Ensures representative samples

2. **Test set isolation**
   - Never use test set during training
   - Only evaluate once on test set
   - Consider validation set for hyperparameter tuning

3. **Data leakage prevention**
   - Split before any preprocessing
   - Don't fit scalers on full dataset
   - Keep temporal order for time series

## Storage Conventions

### Directory Structure

```
data/
├── raw/              # Original, unprocessed data
│   └── yourdata.json
└── processed/        # Cleaned, split data
    ├── train.json
    └── test.json
```

### File Naming

- Use descriptive names: `customer_churn.json`, not `data1.json`
- Include version or date: `sales_2024_v2.json`
- Keep naming consistent

## Privacy and Security

### Sensitive Data

⚠️ **Never commit:**
- Personal information (PII)
- Private business data
- API keys or credentials
- Raw unfiltered datasets

✅ **Safe to include:**
- Synthetic/generated data
- Public datasets with attribution
- Anonymized/aggregated data

### Data Anonymization

If using real data:
1. Remove identifiers (names, IDs, addresses)
2. Aggregate if possible
3. Add noise to protect individuals
4. Document anonymization process

## Common Data Formats

### Converting from CSV

```python
import pandas as pd
import json

df = pd.read_csv('data.csv')
data = {
    'features': df.drop('label', axis=1).values.tolist(),
    'labels': df['label'].tolist()
}
with open('data.json', 'w') as f:
    json.dump(data, f)
```

### Converting from NumPy

```python
import numpy as np
import json

X = np.random.randn(100, 5)
y = np.random.randint(0, 2, 100)

data = {
    'features': X.tolist(),
    'labels': y.tolist()
}
with open('data.json', 'w') as f:
    json.dump(data, f)
```

## Validation Checklist

Before training, verify:

- [ ] Data in correct JSON format
- [ ] All features are numeric
- [ ] No missing values (NaN/null)
- [ ] Labels are binary (0 or 1)
- [ ] Sufficient samples (100+ recommended)
- [ ] Classes reasonably balanced
- [ ] Train/test split complete
- [ ] No data leakage
- [ ] Privacy requirements met

## Troubleshooting

### "Invalid JSON format"
- Check JSON syntax with a validator
- Ensure proper quotes and commas
- Verify file encoding (UTF-8)

### "Inconsistent feature dimensions"
- All samples must have same number of features
- Check for missing values in rows

### "Insufficient samples"
- Need at least 100 samples
- Consider data augmentation
- Or use simpler models

### "Class imbalance warning"
- One class has much more samples
- Consider resampling techniques
- Or use class weights

## Example Datasets

### Synthetic Classification

```bash
python scripts/prepare_data.py --synthetic 1000 --output data/processed
```

### Real-world Sources

- [UCI ML Repository](https://archive.ics.uci.edu/ml/index.php)
- [Kaggle Datasets](https://www.kaggle.com/datasets)
- [scikit-learn built-in datasets](https://scikit-learn.org/stable/datasets.html)

Remember to cite sources and respect licenses!

---

For more help, see the [tutorial](tutorial.md) or [evaluation guide](evaluation-guide.md).
