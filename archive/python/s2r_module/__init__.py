"""
S2R Module - Speech-to-Retrieval for Farsi Language Learning

A modular implementation of Speech-to-Retrieval (S2R) for Persian (Farsi) 
audio to English text retrieval using dual-encoder architecture.

Main Components:
- CVSSFarsiDataLoader: Load and process CVSS Farsi dataset
- DualEncoderS2R: Dual-encoder architecture with audio and text encoders
- ContrastiveLoss: Contrastive learning objective
- S2RTrainer: Training utilities
- S2RRetriever: Retrieval engine

Public API:
- train_s2r(): Train the S2R model
- retrieve_info(): Retrieve information from Farsi audio

Example Usage:
    >>> from s2r_module import train_s2r, retrieve_info
    >>> 
    >>> # Train model
    >>> model, metrics = train_s2r(
    ...     batch_size=16,
    ...     num_epochs=10
    ... )
    >>> 
    >>> # Retrieve information
    >>> results = retrieve_info(
    ...     farsi_audio_input="path/to/audio.wav",
    ...     model=model,
    ...     top_k=5
    ... )
"""

__version__ = "1.0.0"
__author__ = "S2R Module Development Team"

from .s2r_retrieval_module import (
    # Data Loading
    CVSSFarsiDataLoader,
    S2RDataset,
    
    # Model Components
    AudioEncoder,
    TextEncoder,
    DualEncoderS2R,
    
    # Training
    ContrastiveLoss,
    S2RTrainer,
    
    # Retrieval
    S2RRetriever,
    
    # Public API
    train_s2r,
    retrieve_info
)

from .config import (
    S2RConfig,
    DEFAULT_CONFIG,
    QUICK_TEST_CONFIG,
    HIGH_PERFORMANCE_CONFIG,
    LIGHTWEIGHT_CONFIG,
    get_config
)

__all__ = [
    # Data
    'CVSSFarsiDataLoader',
    'S2RDataset',
    
    # Models
    'AudioEncoder',
    'TextEncoder',
    'DualEncoderS2R',
    
    # Training
    'ContrastiveLoss',
    'S2RTrainer',
    
    # Retrieval
    'S2RRetriever',
    
    # API
    'train_s2r',
    'retrieve_info',
    
    # Config
    'S2RConfig',
    'DEFAULT_CONFIG',
    'QUICK_TEST_CONFIG',
    'HIGH_PERFORMANCE_CONFIG',
    'LIGHTWEIGHT_CONFIG',
    'get_config'
]
