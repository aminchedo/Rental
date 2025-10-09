"""
Example Usage of S2R Module

This script demonstrates various use cases of the Speech-to-Retrieval module
for Farsi language learning.
"""

import numpy as np
import torch
from s2r_module import (
    train_s2r, 
    retrieve_info, 
    get_config,
    CVSSFarsiDataLoader,
    S2RRetriever,
    DualEncoderS2R
)
from transformers import Wav2Vec2Processor, AutoTokenizer


def example_1_basic_training():
    """Example 1: Basic training with default settings."""
    print("="*60)
    print("EXAMPLE 1: Basic Training")
    print("="*60)
    
    model, metrics = train_s2r(
        batch_size=8,
        num_epochs=3,
        max_samples=50,  # Small dataset for quick demo
        device='cpu'  # Use CPU for compatibility
    )
    
    print(f"\n✓ Training completed!")
    print(f"  Best validation loss: {metrics['best_val_loss']:.4f}")
    print(f"  Total epochs: {len(metrics['history'])}")
    
    return model


def example_2_custom_config():
    """Example 2: Training with custom configuration."""
    print("\n" + "="*60)
    print("EXAMPLE 2: Custom Configuration")
    print("="*60)
    
    # Use quick test configuration
    config = get_config("quick_test")
    
    model, metrics = train_s2r(
        batch_size=config.batch_size,
        num_epochs=config.num_epochs,
        embedding_dim=config.embedding_dim,
        learning_rate=config.learning_rate,
        device=config.device,
        max_samples=100
    )
    
    print(f"\n✓ Training with quick_test config completed!")
    
    return model


def example_3_basic_retrieval(model):
    """Example 3: Basic retrieval from audio."""
    print("\n" + "="*60)
    print("EXAMPLE 3: Basic Retrieval")
    print("="*60)
    
    # Generate synthetic audio (in practice, load real audio)
    audio = np.random.randn(16000 * 3).astype(np.float32) * 0.1
    
    # Retrieve
    results = retrieve_info(
        farsi_audio_input=audio,
        model=model,
        top_k=5,
        device='cpu'
    )
    
    print("\nRetrieval Results:")
    for result in results:
        print(f"  {result['rank']}. [Score: {result['score']:.4f}] {result['document']}")


def example_4_custom_documents(model):
    """Example 4: Retrieval with custom document collection."""
    print("\n" + "="*60)
    print("EXAMPLE 4: Custom Document Retrieval")
    print("="*60)
    
    # Define custom documents (e.g., language learning content)
    documents = [
        "Welcome to Persian language course. Let's start learning!",
        "Today we will learn common Persian greetings and phrases.",
        "Persian alphabet has 32 letters and is written right to left.",
        "Practice makes perfect when learning a new language.",
        "Persian poetry is renowned worldwide for its beauty.",
        "Modern Persian is the official language of Iran.",
        "Learning pronunciation is crucial for Persian language.",
        "Persian cuisine is diverse and delicious.",
        "Persian culture has influenced many civilizations.",
        "Technology helps us learn languages more effectively."
    ]
    
    # Generate test audio
    audio = np.random.randn(16000 * 2).astype(np.float32) * 0.1
    
    # Retrieve from custom documents
    results = retrieve_info(
        farsi_audio_input=audio,
        model=model,
        documents=documents,
        top_k=3,
        device='cpu'
    )
    
    print("\nTop 3 Retrieved Documents:")
    for result in results:
        print(f"  {result['rank']}. [Score: {result['score']:.4f}]")
        print(f"     {result['document']}\n")


def example_5_advanced_retrieval(model):
    """Example 5: Advanced retrieval with custom retriever."""
    print("\n" + "="*60)
    print("EXAMPLE 5: Advanced Retrieval with Custom Retriever")
    print("="*60)
    
    # Initialize processors
    audio_processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base")
    text_tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
    
    # Create retriever
    retriever = S2RRetriever(
        model=model,
        audio_processor=audio_processor,
        text_tokenizer=text_tokenizer,
        device='cpu'
    )
    
    # Large document collection
    documents = [
        f"Document {i}: This is a sample document about topic {i % 5}."
        for i in range(50)
    ]
    
    # Index documents
    print("Indexing documents...")
    retriever.index_documents(documents, batch_size=16)
    
    # Retrieve
    audio = np.random.randn(16000 * 3).astype(np.float32) * 0.1
    results = retriever.retrieve(audio, top_k=5)
    
    print("\nTop 5 Retrieved Documents:")
    for result in results:
        print(f"  {result['rank']}. [Score: {result['score']:.4f}] {result['document']}")


def example_6_data_loading():
    """Example 6: Custom data loading."""
    print("\n" + "="*60)
    print("EXAMPLE 6: Custom Data Loading")
    print("="*60)
    
    # Initialize data loader
    data_loader = CVSSFarsiDataLoader(
        cache_dir="./data_cache",
        audio_max_length=16000 * 10
    )
    
    # Load data (will use synthetic data if CVSS not available)
    print("Loading CVSS Farsi dataset...")
    data = data_loader.load_data(
        split='train',
        max_samples=100
    )
    
    print(f"\n✓ Loaded {len(data)} samples")
    print(f"  First sample text: {data[0]['text']}")
    print(f"  Audio shape: {data[0]['audio'].shape}")
    
    # Train with custom data
    print("\nTraining with loaded data...")
    model, metrics = train_s2r(
        cvss_farsi_data=data,
        batch_size=8,
        num_epochs=2,
        device='cpu'
    )
    
    print(f"\n✓ Training completed!")
    
    return model


def example_7_save_load_model():
    """Example 7: Save and load model."""
    print("\n" + "="*60)
    print("EXAMPLE 7: Save and Load Model")
    print("="*60)
    
    # Train a model
    model, metrics = train_s2r(
        batch_size=4,
        num_epochs=2,
        max_samples=50,
        checkpoint_dir='./my_checkpoints',
        device='cpu'
    )
    
    print("\n✓ Model saved to ./my_checkpoints/best_model.pt")
    
    # Load the model
    print("\nLoading saved model...")
    loaded_model = DualEncoderS2R(embedding_dim=512)
    checkpoint = torch.load('./my_checkpoints/best_model.pt', map_location='cpu')
    loaded_model.load_state_dict(checkpoint['model_state_dict'])
    loaded_model.eval()
    
    print(f"✓ Model loaded from epoch {checkpoint['epoch']}")
    print(f"  Validation loss: {checkpoint['metrics']['loss']:.4f}")
    
    # Use loaded model for retrieval
    audio = np.random.randn(16000 * 2).astype(np.float32) * 0.1
    results = retrieve_info(
        farsi_audio_input=audio,
        model=loaded_model,
        top_k=3,
        device='cpu'
    )
    
    print("\nRetrieval with loaded model:")
    for result in results:
        print(f"  {result['rank']}. [{result['score']:.4f}] {result['document']}")


def example_8_training_monitoring():
    """Example 8: Monitor training progress."""
    print("\n" + "="*60)
    print("EXAMPLE 8: Training Monitoring")
    print("="*60)
    
    model, metrics = train_s2r(
        batch_size=8,
        num_epochs=5,
        max_samples=100,
        device='cpu'
    )
    
    # Analyze training history
    print("\nTraining History:")
    print("-" * 60)
    print(f"{'Epoch':<10}{'Train Loss':<15}{'Train Acc':<15}{'Val Loss':<15}{'Val Acc':<15}")
    print("-" * 60)
    
    for epoch_metrics in metrics['history']:
        epoch = epoch_metrics['epoch']
        train_loss = epoch_metrics['train']['loss']
        train_acc = epoch_metrics['train']['accuracy']
        val_loss = epoch_metrics['val']['loss']
        val_acc = epoch_metrics['val']['accuracy']
        
        print(f"{epoch:<10}{train_loss:<15.4f}{train_acc:<15.4f}{val_loss:<15.4f}{val_acc:<15.4f}")
    
    print("-" * 60)
    print(f"\nBest Validation Loss: {metrics['best_val_loss']:.4f}")
    
    # Configuration used
    print("\nConfiguration Used:")
    for key, value in metrics['config'].items():
        print(f"  {key}: {value}")


def main():
    """Run all examples."""
    print("\n" + "="*80)
    print(" "*25 + "S2R MODULE EXAMPLES")
    print("="*80)
    
    # Run examples
    print("\nRunning examples (this may take a few minutes)...\n")
    
    # Example 1: Basic training
    model = example_1_basic_training()
    
    # Example 2: Custom config
    model = example_2_custom_config()
    
    # Example 3: Basic retrieval
    example_3_basic_retrieval(model)
    
    # Example 4: Custom documents
    example_4_custom_documents(model)
    
    # Example 5: Advanced retrieval
    example_5_advanced_retrieval(model)
    
    # Example 6: Data loading
    model = example_6_data_loading()
    
    # Example 7: Save/load
    example_7_save_load_model()
    
    # Example 8: Training monitoring
    example_8_training_monitoring()
    
    print("\n" + "="*80)
    print(" "*30 + "ALL EXAMPLES COMPLETED!")
    print("="*80)
    print("\n✓ S2R Module is working correctly!")
    print("\nNext Steps:")
    print("  1. Integrate S2R module into your application")
    print("  2. Train on real CVSS Farsi dataset (remove max_samples limit)")
    print("  3. Fine-tune hyperparameters for your use case")
    print("  4. Scale up with GPU for faster training")
    print("\n")


if __name__ == "__main__":
    # Set random seed for reproducibility
    torch.manual_seed(42)
    np.random.seed(42)
    
    # Run all examples
    main()
