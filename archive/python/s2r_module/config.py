"""
Configuration file for S2R Module
Contains default hyperparameters and paths
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class S2RConfig:
    """Configuration for Speech-to-Retrieval training and inference."""
    
    # Model Architecture
    audio_model_name: str = "facebook/wav2vec2-base"
    text_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dim: int = 512
    freeze_base_models: bool = False
    
    # Training Hyperparameters
    batch_size: int = 16
    num_epochs: int = 10
    learning_rate: float = 1e-4
    weight_decay: float = 0.01
    temperature: float = 0.07
    
    # Data Processing
    audio_max_length: int = 16000 * 10  # 10 seconds at 16kHz
    sample_rate: int = 16000
    max_text_length: int = 128
    
    # Dataset
    dataset_name: str = "google/cvss"
    language_code: str = "fa"  # Persian/Farsi
    cache_dir: Optional[str] = None
    max_samples: Optional[int] = None  # None = use all data
    train_val_split: float = 0.8
    
    # Paths
    checkpoint_dir: str = "./checkpoints"
    output_dir: str = "./outputs"
    log_dir: str = "./logs"
    
    # Training Settings
    device: str = "cuda"  # or "cpu"
    num_workers: int = 2
    save_best_only: bool = True
    
    # Retrieval
    default_top_k: int = 5
    
    def __post_init__(self):
        """Validate configuration after initialization."""
        assert self.embedding_dim > 0, "embedding_dim must be positive"
        assert 0 < self.train_val_split < 1, "train_val_split must be between 0 and 1"
        assert self.batch_size > 0, "batch_size must be positive"
        assert self.num_epochs > 0, "num_epochs must be positive"
        assert self.learning_rate > 0, "learning_rate must be positive"
        assert self.temperature > 0, "temperature must be positive"


# Default configuration instance
DEFAULT_CONFIG = S2RConfig()


# Configuration presets for different use cases

QUICK_TEST_CONFIG = S2RConfig(
    batch_size=4,
    num_epochs=2,
    max_samples=100,
    embedding_dim=256,
    device="cpu"
)

HIGH_PERFORMANCE_CONFIG = S2RConfig(
    batch_size=32,
    num_epochs=20,
    embedding_dim=768,
    learning_rate=5e-5,
    freeze_base_models=False,
    device="cuda"
)

LIGHTWEIGHT_CONFIG = S2RConfig(
    audio_model_name="facebook/wav2vec2-base",
    text_model_name="sentence-transformers/all-MiniLM-L6-v2",
    embedding_dim=384,
    batch_size=24,
    freeze_base_models=True  # Fine-tune only projection layers
)


def get_config(preset: str = "default") -> S2RConfig:
    """
    Get configuration preset.
    
    Args:
        preset: One of ["default", "quick_test", "high_performance", "lightweight"]
        
    Returns:
        S2RConfig instance
    """
    configs = {
        "default": DEFAULT_CONFIG,
        "quick_test": QUICK_TEST_CONFIG,
        "high_performance": HIGH_PERFORMANCE_CONFIG,
        "lightweight": LIGHTWEIGHT_CONFIG
    }
    
    if preset not in configs:
        raise ValueError(f"Unknown preset: {preset}. Choose from {list(configs.keys())}")
    
    return configs[preset]
