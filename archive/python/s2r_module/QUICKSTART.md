# Quick Start Guide - S2R Module

Get started with the Speech-to-Retrieval module in 5 minutes!

## 🚀 Installation

```bash
# Navigate to the module directory
cd s2r_module

# Install dependencies
pip install -r requirements.txt
```

## 📝 Basic Usage (3 Steps)

### Step 1: Import the module

```python
from s2r_module import train_s2r, retrieve_info
```

### Step 2: Train the model

```python
# Train with minimal configuration
model, metrics = train_s2r(
    batch_size=16,
    num_epochs=10
)
```

### Step 3: Retrieve information

```python
import numpy as np

# Create or load Farsi audio
audio = np.random.randn(16000 * 3).astype(np.float32)

# Retrieve relevant documents
results = retrieve_info(
    farsi_audio_input=audio,
    model=model,
    top_k=5
)

# Display results
for r in results:
    print(f"{r['rank']}. {r['document']} (score: {r['score']:.3f})")
```

## 🎯 Complete Example

```python
#!/usr/bin/env python3
"""Minimal S2R example"""

from s2r_module import train_s2r, retrieve_info
import numpy as np

# 1. Train model (quick test)
print("Training S2R model...")
model, metrics = train_s2r(
    batch_size=8,
    num_epochs=3,
    max_samples=100,  # Small dataset for quick test
    device='cpu'
)

print(f"✓ Training completed! Best loss: {metrics['best_val_loss']:.4f}")

# 2. Prepare audio input
audio = np.random.randn(16000 * 3).astype(np.float32) * 0.1

# 3. Retrieve information
print("\nRetrieving relevant information...")
results = retrieve_info(
    farsi_audio_input=audio,
    model=model,
    top_k=3
)

# 4. Display results
print("\nTop 3 Results:")
for result in results:
    print(f"  {result['rank']}. [{result['score']:.4f}] {result['document']}")

print("\n✓ Done!")
```

## 🔧 Configuration Options

### Quick Test (CPU, small dataset)
```python
from s2r_module import get_config, train_s2r

config = get_config("quick_test")
model, metrics = train_s2r(
    batch_size=config.batch_size,
    num_epochs=config.num_epochs,
    device=config.device
)
```

### High Performance (GPU, large dataset)
```python
config = get_config("high_performance")
model, metrics = train_s2r(
    batch_size=config.batch_size,
    num_epochs=config.num_epochs,
    device=config.device
)
```

### Lightweight (frozen base models)
```python
config = get_config("lightweight")
model, metrics = train_s2r(
    batch_size=config.batch_size,
    num_epochs=config.num_epochs,
    embedding_dim=config.embedding_dim
)
```

## 📊 What to Expect

### Training Output
```
============================================================
SPEECH-TO-RETRIEVAL (S2R) TRAINING
============================================================
Device: cpu
Embedding dimension: 512
Batch size: 16
Epochs: 10

Loading CVSS Farsi dataset (train split)...
✓ Loaded 1000 samples
Training samples: 800
Validation samples: 200

============================================================
Epoch 1/10
============================================================
Training: 100%|████████████| 50/50 [00:45<00:00]
Train - Loss: 0.3245, Acc: 0.6521
Val   - Loss: 0.2891, Acc: 0.7012
✓ Checkpoint saved to ./checkpoints/best_model.pt
...
```

### Retrieval Output
```
Retrieval Results:
  1. [0.8543] Learning a new language takes time and practice.
  2. [0.7821] Persian is a beautiful language with rich history.
  3. [0.7234] Speech recognition technology has improved significantly.
  4. [0.6912] Machine learning is fascinating.
  5. [0.6543] The weather is beautiful outside.
```

## 🎓 Next Steps

1. **Run Examples**: `python example_usage.py`
2. **Read Full Docs**: See `README.md` for detailed documentation
3. **Customize**: Modify config.py for your use case
4. **Scale Up**: Train on full CVSS dataset with GPU

## ⚡ Tips

- **Start small**: Use `max_samples=100` for initial testing
- **Use GPU**: Training is 10-20x faster on GPU
- **Monitor metrics**: Check both loss and accuracy
- **Save checkpoints**: Models are saved automatically

## 🆘 Troubleshooting

**Out of memory?**
```python
# Reduce batch size
train_s2r(batch_size=4, ...)
```

**Training too slow?**
```python
# Use GPU
train_s2r(device='cuda', ...)

# Or reduce dataset size
train_s2r(max_samples=500, ...)
```

**Import errors?**
```bash
pip install -r requirements.txt --upgrade
```

## 📚 Additional Resources

- Full Documentation: `README.md`
- Example Scripts: `example_usage.py`
- Configuration: `config.py`
- Main Module: `s2r_retrieval_module.py`

---

**Ready to go?** Run: `python example_usage.py`
