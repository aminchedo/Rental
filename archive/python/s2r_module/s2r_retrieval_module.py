"""
Speech-to-Retrieval (S2R) Module for Farsi Language Learning

This module implements a modular Speech-to-Retrieval system for Persian (Farsi) audio
to English text retrieval using a dual-encoder architecture with contrastive learning.

Author: Auto-generated
Date: 2025-10-09
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from typing import Dict, List, Tuple, Optional, Union
import numpy as np
from pathlib import Path
import json
import librosa
from datasets import load_dataset
from transformers import Wav2Vec2Processor, Wav2Vec2Model, AutoTokenizer, AutoModel
from tqdm import tqdm
import warnings

warnings.filterwarnings('ignore')


# ============================================================================
# 1. CVSS FARSI DATA LOADER
# ============================================================================

class CVSSFarsiDataLoader:
    """
    Data loader specifically for CVSS Farsi dataset.
    Handles Persian (fa) audio to English text pairs for S2R training.
    """
    
    def __init__(
        self,
        cache_dir: Optional[str] = None,
        audio_max_length: int = 16000 * 10,  # 10 seconds at 16kHz
        sample_rate: int = 16000
    ):
        """
        Initialize CVSS Farsi data loader.
        
        Args:
            cache_dir: Directory to cache downloaded datasets
            audio_max_length: Maximum audio length in samples
            sample_rate: Audio sample rate (Hz)
        """
        self.cache_dir = cache_dir
        self.audio_max_length = audio_max_length
        self.sample_rate = sample_rate
        self.dataset = None
        
    def load_data(self, split: str = 'train', max_samples: Optional[int] = None) -> List[Dict]:
        """
        Load CVSS Farsi dataset.
        
        Args:
            split: Dataset split ('train', 'validation', 'test')
            max_samples: Maximum number of samples to load (for testing)
            
        Returns:
            List of dictionaries containing audio and text pairs
        """
        print(f"Loading CVSS Farsi dataset ({split} split)...")
        
        try:
            # Load CVSS dataset with Persian audio
            # Note: CVSS (Common Voice Supported Sentences) contains parallel audio-text data
            self.dataset = load_dataset(
                'google/cvss',
                'fa',  # Persian/Farsi language code
                split=split,
                cache_dir=self.cache_dir,
                trust_remote_code=True
            )
            
            if max_samples:
                self.dataset = self.dataset.select(range(min(max_samples, len(self.dataset))))
                
            print(f"✓ Loaded {len(self.dataset)} samples")
            
            # Process and return data pairs
            data_pairs = []
            for idx, item in enumerate(tqdm(self.dataset, desc="Processing audio-text pairs")):
                try:
                    audio_data = self._process_audio(item['audio'])
                    english_text = item.get('text', '') or item.get('sentence', '')
                    
                    data_pairs.append({
                        'audio': audio_data,
                        'text': english_text,
                        'audio_path': item.get('path', f'sample_{idx}'),
                        'id': idx
                    })
                except Exception as e:
                    print(f"Warning: Skipping sample {idx} due to error: {e}")
                    continue
                    
            return data_pairs
            
        except Exception as e:
            print(f"Error loading CVSS dataset: {e}")
            print("Falling back to synthetic data for demonstration...")
            return self._generate_synthetic_data(max_samples or 100)
    
    def _process_audio(self, audio_dict: Dict) -> np.ndarray:
        """
        Process audio to consistent format.
        
        Args:
            audio_dict: Dictionary containing audio array and sampling rate
            
        Returns:
            Processed audio array
        """
        audio_array = np.array(audio_dict['array'])
        sr = audio_dict['sampling_rate']
        
        # Resample if needed
        if sr != self.sample_rate:
            audio_array = librosa.resample(
                audio_array, 
                orig_sr=sr, 
                target_sr=self.sample_rate
            )
        
        # Pad or truncate to max length
        if len(audio_array) > self.audio_max_length:
            audio_array = audio_array[:self.audio_max_length]
        else:
            audio_array = np.pad(
                audio_array, 
                (0, self.audio_max_length - len(audio_array)), 
                mode='constant'
            )
            
        return audio_array
    
    def _generate_synthetic_data(self, num_samples: int) -> List[Dict]:
        """
        Generate synthetic data for testing when real dataset is unavailable.
        """
        print(f"Generating {num_samples} synthetic samples...")
        synthetic_data = []
        
        sample_texts = [
            "Hello, how are you today?",
            "The weather is beautiful outside.",
            "I am learning a new language.",
            "This is a test sentence for speech retrieval.",
            "Machine learning is fascinating."
        ]
        
        for i in range(num_samples):
            audio = np.random.randn(self.audio_max_length).astype(np.float32) * 0.1
            text = sample_texts[i % len(sample_texts)]
            
            synthetic_data.append({
                'audio': audio,
                'text': text,
                'audio_path': f'synthetic_{i}',
                'id': i
            })
            
        return synthetic_data


class S2RDataset(Dataset):
    """PyTorch Dataset for S2R training."""
    
    def __init__(
        self, 
        data_pairs: List[Dict],
        audio_processor,
        text_tokenizer,
        max_text_length: int = 128
    ):
        self.data_pairs = data_pairs
        self.audio_processor = audio_processor
        self.text_tokenizer = text_tokenizer
        self.max_text_length = max_text_length
        
    def __len__(self):
        return len(self.data_pairs)
    
    def __getitem__(self, idx):
        item = self.data_pairs[idx]
        
        # Process audio
        audio_input = self.audio_processor(
            item['audio'],
            sampling_rate=16000,
            return_tensors="pt",
            padding=True
        )
        
        # Process text
        text_input = self.text_tokenizer(
            item['text'],
            padding='max_length',
            truncation=True,
            max_length=self.max_text_length,
            return_tensors="pt"
        )
        
        return {
            'audio_values': audio_input.input_values.squeeze(0),
            'text_input_ids': text_input.input_ids.squeeze(0),
            'text_attention_mask': text_input.attention_mask.squeeze(0),
            'text': item['text'],
            'id': item['id']
        }


# ============================================================================
# 2. DUAL-ENCODER ARCHITECTURE
# ============================================================================

class AudioEncoder(nn.Module):
    """
    Audio Encoder for processing Persian speech features.
    Uses Wav2Vec2 as the base model for robust audio encoding.
    """
    
    def __init__(
        self, 
        model_name: str = "facebook/wav2vec2-base",
        embedding_dim: int = 512,
        freeze_base: bool = False
    ):
        super().__init__()
        
        self.wav2vec2 = Wav2Vec2Model.from_pretrained(model_name)
        
        if freeze_base:
            for param in self.wav2vec2.parameters():
                param.requires_grad = False
        
        # Get the hidden size from wav2vec2 config
        hidden_size = self.wav2vec2.config.hidden_size
        
        # Projection head to map to shared embedding space
        self.projection = nn.Sequential(
            nn.Linear(hidden_size, embedding_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(embedding_dim, embedding_dim)
        )
        
        self.embedding_dim = embedding_dim
    
    def forward(self, audio_values):
        """
        Forward pass for audio encoding.
        
        Args:
            audio_values: Tensor of shape (batch_size, audio_length)
            
        Returns:
            Audio embeddings of shape (batch_size, embedding_dim)
        """
        # Extract features using Wav2Vec2
        outputs = self.wav2vec2(audio_values)
        
        # Use mean pooling over the sequence
        audio_features = outputs.last_hidden_state.mean(dim=1)
        
        # Project to shared embedding space
        embeddings = self.projection(audio_features)
        
        # L2 normalize for cosine similarity
        embeddings = F.normalize(embeddings, p=2, dim=1)
        
        return embeddings


class TextEncoder(nn.Module):
    """
    Text/Document Encoder for processing English text embeddings.
    Uses BERT-based models for robust text encoding.
    """
    
    def __init__(
        self,
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        embedding_dim: int = 512,
        freeze_base: bool = False
    ):
        super().__init__()
        
        self.bert = AutoModel.from_pretrained(model_name)
        
        if freeze_base:
            for param in self.bert.parameters():
                param.requires_grad = False
        
        # Get the hidden size from BERT config
        hidden_size = self.bert.config.hidden_size
        
        # Projection head to map to shared embedding space
        self.projection = nn.Sequential(
            nn.Linear(hidden_size, embedding_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(embedding_dim, embedding_dim)
        )
        
        self.embedding_dim = embedding_dim
    
    def forward(self, input_ids, attention_mask):
        """
        Forward pass for text encoding.
        
        Args:
            input_ids: Tensor of shape (batch_size, seq_length)
            attention_mask: Tensor of shape (batch_size, seq_length)
            
        Returns:
            Text embeddings of shape (batch_size, embedding_dim)
        """
        # Extract features using BERT
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask
        )
        
        # Use [CLS] token representation or mean pooling
        text_features = outputs.last_hidden_state[:, 0, :]  # CLS token
        
        # Project to shared embedding space
        embeddings = self.projection(text_features)
        
        # L2 normalize for cosine similarity
        embeddings = F.normalize(embeddings, p=2, dim=1)
        
        return embeddings


class DualEncoderS2R(nn.Module):
    """
    Dual-Encoder architecture for Speech-to-Retrieval.
    Combines Audio and Text encoders with contrastive learning.
    """
    
    def __init__(
        self,
        audio_model_name: str = "facebook/wav2vec2-base",
        text_model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        embedding_dim: int = 512,
        temperature: float = 0.07,
        freeze_base_models: bool = False
    ):
        super().__init__()
        
        self.audio_encoder = AudioEncoder(
            model_name=audio_model_name,
            embedding_dim=embedding_dim,
            freeze_base=freeze_base_models
        )
        
        self.text_encoder = TextEncoder(
            model_name=text_model_name,
            embedding_dim=embedding_dim,
            freeze_base=freeze_base_models
        )
        
        self.temperature = temperature
        
    def forward(self, audio_values, text_input_ids, text_attention_mask):
        """
        Forward pass for dual encoder.
        
        Returns:
            Tuple of (audio_embeddings, text_embeddings)
        """
        audio_embeddings = self.audio_encoder(audio_values)
        text_embeddings = self.text_encoder(text_input_ids, text_attention_mask)
        
        return audio_embeddings, text_embeddings


# ============================================================================
# 3. CONTRASTIVE LOSS
# ============================================================================

class ContrastiveLoss(nn.Module):
    """
    Contrastive loss for aligning audio and text embeddings.
    Implements InfoNCE loss (used in CLIP, SimCLR, etc.)
    """
    
    def __init__(self, temperature: float = 0.07):
        super().__init__()
        self.temperature = temperature
        
    def forward(
        self, 
        audio_embeddings: torch.Tensor, 
        text_embeddings: torch.Tensor
    ) -> torch.Tensor:
        """
        Compute contrastive loss.
        
        Args:
            audio_embeddings: (batch_size, embedding_dim)
            text_embeddings: (batch_size, embedding_dim)
            
        Returns:
            Contrastive loss value
        """
        batch_size = audio_embeddings.shape[0]
        
        # Compute similarity matrix
        # Shape: (batch_size, batch_size)
        similarity_matrix = torch.matmul(
            audio_embeddings, text_embeddings.T
        ) / self.temperature
        
        # Create labels (diagonal should be positive pairs)
        labels = torch.arange(batch_size).to(audio_embeddings.device)
        
        # Compute cross-entropy loss in both directions
        loss_audio_to_text = F.cross_entropy(similarity_matrix, labels)
        loss_text_to_audio = F.cross_entropy(similarity_matrix.T, labels)
        
        # Average both directions
        loss = (loss_audio_to_text + loss_text_to_audio) / 2
        
        # Compute accuracy for monitoring
        with torch.no_grad():
            audio_to_text_acc = (similarity_matrix.argmax(dim=1) == labels).float().mean()
            text_to_audio_acc = (similarity_matrix.T.argmax(dim=1) == labels).float().mean()
            accuracy = (audio_to_text_acc + text_to_audio_acc) / 2
        
        return loss, accuracy


# ============================================================================
# 4. TRAINING MODULE
# ============================================================================

class S2RTrainer:
    """Trainer for Speech-to-Retrieval model."""
    
    def __init__(
        self,
        model: DualEncoderS2R,
        device: str = 'cuda' if torch.cuda.is_available() else 'cpu',
        learning_rate: float = 1e-4,
        temperature: float = 0.07
    ):
        self.model = model.to(device)
        self.device = device
        self.criterion = ContrastiveLoss(temperature=temperature)
        self.optimizer = torch.optim.AdamW(
            self.model.parameters(), 
            lr=learning_rate,
            weight_decay=0.01
        )
        self.best_loss = float('inf')
        
    def train_epoch(self, dataloader: DataLoader) -> Dict[str, float]:
        """Train for one epoch."""
        self.model.train()
        total_loss = 0
        total_accuracy = 0
        num_batches = 0
        
        progress_bar = tqdm(dataloader, desc="Training")
        
        for batch in progress_bar:
            # Move to device
            audio_values = batch['audio_values'].to(self.device)
            text_input_ids = batch['text_input_ids'].to(self.device)
            text_attention_mask = batch['text_attention_mask'].to(self.device)
            
            # Forward pass
            audio_emb, text_emb = self.model(
                audio_values, 
                text_input_ids, 
                text_attention_mask
            )
            
            # Compute loss
            loss, accuracy = self.criterion(audio_emb, text_emb)
            
            # Backward pass
            self.optimizer.zero_grad()
            loss.backward()
            self.optimizer.step()
            
            # Track metrics
            total_loss += loss.item()
            total_accuracy += accuracy.item()
            num_batches += 1
            
            # Update progress bar
            progress_bar.set_postfix({
                'loss': f'{loss.item():.4f}',
                'acc': f'{accuracy.item():.4f}'
            })
        
        avg_loss = total_loss / num_batches
        avg_accuracy = total_accuracy / num_batches
        
        return {
            'loss': avg_loss,
            'accuracy': avg_accuracy
        }
    
    def validate(self, dataloader: DataLoader) -> Dict[str, float]:
        """Validate the model."""
        self.model.eval()
        total_loss = 0
        total_accuracy = 0
        num_batches = 0
        
        with torch.no_grad():
            for batch in tqdm(dataloader, desc="Validation"):
                audio_values = batch['audio_values'].to(self.device)
                text_input_ids = batch['text_input_ids'].to(self.device)
                text_attention_mask = batch['text_attention_mask'].to(self.device)
                
                audio_emb, text_emb = self.model(
                    audio_values, 
                    text_input_ids, 
                    text_attention_mask
                )
                
                loss, accuracy = self.criterion(audio_emb, text_emb)
                
                total_loss += loss.item()
                total_accuracy += accuracy.item()
                num_batches += 1
        
        avg_loss = total_loss / num_batches
        avg_accuracy = total_accuracy / num_batches
        
        return {
            'loss': avg_loss,
            'accuracy': avg_accuracy
        }
    
    def save_checkpoint(self, path: str, epoch: int, metrics: Dict):
        """Save model checkpoint."""
        torch.save({
            'epoch': epoch,
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'metrics': metrics
        }, path)
        print(f"✓ Checkpoint saved to {path}")
    
    def load_checkpoint(self, path: str):
        """Load model checkpoint."""
        checkpoint = torch.load(path, map_location=self.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        print(f"✓ Checkpoint loaded from {path}")
        return checkpoint


# ============================================================================
# 5. RETRIEVAL MODULE
# ============================================================================

class S2RRetriever:
    """Retrieval engine for Speech-to-Retrieval."""
    
    def __init__(
        self,
        model: DualEncoderS2R,
        audio_processor,
        text_tokenizer,
        device: str = 'cuda' if torch.cuda.is_available() else 'cpu'
    ):
        self.model = model.to(device)
        self.model.eval()
        self.device = device
        self.audio_processor = audio_processor
        self.text_tokenizer = text_tokenizer
        
        # Storage for document embeddings
        self.document_embeddings = None
        self.documents = []
        
    def index_documents(self, documents: List[str], batch_size: int = 32):
        """
        Index a collection of documents for retrieval.
        
        Args:
            documents: List of text documents to index
            batch_size: Batch size for processing
        """
        self.documents = documents
        embeddings = []
        
        print(f"Indexing {len(documents)} documents...")
        
        with torch.no_grad():
            for i in tqdm(range(0, len(documents), batch_size)):
                batch_docs = documents[i:i+batch_size]
                
                # Tokenize
                inputs = self.text_tokenizer(
                    batch_docs,
                    padding=True,
                    truncation=True,
                    max_length=128,
                    return_tensors="pt"
                ).to(self.device)
                
                # Encode
                emb = self.model.text_encoder(
                    inputs.input_ids, 
                    inputs.attention_mask
                )
                
                embeddings.append(emb.cpu())
        
        self.document_embeddings = torch.cat(embeddings, dim=0)
        print(f"✓ Indexed {len(documents)} documents")
    
    def retrieve(
        self, 
        audio_input: Union[np.ndarray, str],
        top_k: int = 5
    ) -> List[Dict]:
        """
        Retrieve relevant documents for a given audio input.
        
        Args:
            audio_input: Audio array or path to audio file
            top_k: Number of top results to return
            
        Returns:
            List of dictionaries with retrieved documents and scores
        """
        # Load audio if path is provided
        if isinstance(audio_input, str):
            audio_input, _ = librosa.load(audio_input, sr=16000)
        
        # Process audio
        audio_processed = self.audio_processor(
            audio_input,
            sampling_rate=16000,
            return_tensors="pt",
            padding=True
        ).to(self.device)
        
        # Encode audio
        with torch.no_grad():
            audio_emb = self.model.audio_encoder(
                audio_processed.input_values
            ).cpu()
        
        # Compute similarities
        similarities = torch.matmul(
            audio_emb, 
            self.document_embeddings.T
        ).squeeze(0)
        
        # Get top-k
        top_scores, top_indices = torch.topk(similarities, k=min(top_k, len(self.documents)))
        
        results = []
        for score, idx in zip(top_scores, top_indices):
            results.append({
                'document': self.documents[idx],
                'score': score.item(),
                'rank': len(results) + 1
            })
        
        return results


# ============================================================================
# 6. PUBLIC API INTERFACE
# ============================================================================

def train_s2r(
    cvss_farsi_data: Optional[List[Dict]] = None,
    batch_size: int = 16,
    num_epochs: int = 10,
    learning_rate: float = 1e-4,
    embedding_dim: int = 512,
    temperature: float = 0.07,
    checkpoint_dir: str = './checkpoints',
    device: str = 'cuda' if torch.cuda.is_available() else 'cpu',
    max_samples: Optional[int] = None
) -> Tuple[DualEncoderS2R, Dict]:
    """
    Main training function for S2R model.
    
    Args:
        cvss_farsi_data: Optional pre-loaded CVSS data. If None, will load automatically
        batch_size: Training batch size
        num_epochs: Number of training epochs
        learning_rate: Learning rate for optimizer
        embedding_dim: Dimension of shared embedding space
        temperature: Temperature for contrastive loss
        checkpoint_dir: Directory to save checkpoints
        device: Device to train on ('cuda' or 'cpu')
        max_samples: Maximum samples to load (for testing)
        
    Returns:
        Tuple of (trained_model, training_metrics)
    """
    print("="*60)
    print("SPEECH-TO-RETRIEVAL (S2R) TRAINING")
    print("="*60)
    print(f"Device: {device}")
    print(f"Embedding dimension: {embedding_dim}")
    print(f"Batch size: {batch_size}")
    print(f"Epochs: {num_epochs}\n")
    
    # Create checkpoint directory
    Path(checkpoint_dir).mkdir(parents=True, exist_ok=True)
    
    # Load data if not provided
    if cvss_farsi_data is None:
        data_loader = CVSSFarsiDataLoader()
        cvss_farsi_data = data_loader.load_data(split='train', max_samples=max_samples)
    
    # Split into train/val (80/20)
    split_idx = int(0.8 * len(cvss_farsi_data))
    train_data = cvss_farsi_data[:split_idx]
    val_data = cvss_farsi_data[split_idx:]
    
    print(f"Training samples: {len(train_data)}")
    print(f"Validation samples: {len(val_data)}\n")
    
    # Initialize processors
    audio_processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base")
    text_tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
    
    # Create datasets
    train_dataset = S2RDataset(train_data, audio_processor, text_tokenizer)
    val_dataset = S2RDataset(val_data, audio_processor, text_tokenizer)
    
    # Create dataloaders
    train_loader = DataLoader(
        train_dataset, 
        batch_size=batch_size, 
        shuffle=True,
        num_workers=2
    )
    val_loader = DataLoader(
        val_dataset, 
        batch_size=batch_size, 
        shuffle=False,
        num_workers=2
    )
    
    # Initialize model
    model = DualEncoderS2R(
        embedding_dim=embedding_dim,
        temperature=temperature
    )
    
    # Initialize trainer
    trainer = S2RTrainer(
        model=model,
        device=device,
        learning_rate=learning_rate,
        temperature=temperature
    )
    
    # Training loop
    training_history = []
    
    for epoch in range(num_epochs):
        print(f"\n{'='*60}")
        print(f"Epoch {epoch + 1}/{num_epochs}")
        print(f"{'='*60}")
        
        # Train
        train_metrics = trainer.train_epoch(train_loader)
        print(f"Train - Loss: {train_metrics['loss']:.4f}, Acc: {train_metrics['accuracy']:.4f}")
        
        # Validate
        val_metrics = trainer.validate(val_loader)
        print(f"Val   - Loss: {val_metrics['loss']:.4f}, Acc: {val_metrics['accuracy']:.4f}")
        
        # Save checkpoint if best
        if val_metrics['loss'] < trainer.best_loss:
            trainer.best_loss = val_metrics['loss']
            checkpoint_path = f"{checkpoint_dir}/best_model.pt"
            trainer.save_checkpoint(checkpoint_path, epoch, val_metrics)
        
        # Track history
        training_history.append({
            'epoch': epoch + 1,
            'train': train_metrics,
            'val': val_metrics
        })
    
    print(f"\n{'='*60}")
    print("TRAINING COMPLETED!")
    print(f"Best validation loss: {trainer.best_loss:.4f}")
    print(f"{'='*60}\n")
    
    return model, {
        'history': training_history,
        'best_val_loss': trainer.best_loss,
        'config': {
            'embedding_dim': embedding_dim,
            'batch_size': batch_size,
            'num_epochs': num_epochs,
            'learning_rate': learning_rate,
            'temperature': temperature
        }
    }


def retrieve_info(
    farsi_audio_input: Union[np.ndarray, str],
    model: DualEncoderS2R,
    documents: Optional[List[str]] = None,
    top_k: int = 5,
    device: str = 'cuda' if torch.cuda.is_available() else 'cpu'
) -> List[Dict]:
    """
    Retrieve relevant information for Farsi audio input.
    
    Args:
        farsi_audio_input: Audio array or path to Farsi audio file
        model: Trained S2R model
        documents: List of documents to search (if None, uses default demo docs)
        top_k: Number of top results to return
        device: Device to run inference on
        
    Returns:
        List of dictionaries containing retrieved documents and scores
    """
    # Initialize processors
    audio_processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base")
    text_tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
    
    # Create retriever
    retriever = S2RRetriever(
        model=model,
        audio_processor=audio_processor,
        text_tokenizer=text_tokenizer,
        device=device
    )
    
    # Use demo documents if none provided
    if documents is None:
        documents = [
            "Hello, how are you today? I hope you're doing well.",
            "The weather is beautiful outside. It's a perfect day for a walk.",
            "Learning a new language takes time and practice.",
            "Machine learning and artificial intelligence are transforming technology.",
            "Persian is a beautiful language with rich history and literature.",
            "Speech recognition technology has improved significantly in recent years.",
            "I enjoy reading books and learning new things every day.",
            "Traveling to different countries helps you understand diverse cultures.",
            "Cooking traditional dishes is a great way to preserve cultural heritage.",
            "Music is a universal language that connects people across borders."
        ]
    
    # Index documents
    retriever.index_documents(documents)
    
    # Retrieve
    results = retriever.retrieve(farsi_audio_input, top_k=top_k)
    
    return results


# ============================================================================
# MAIN EXECUTION (for testing)
# ============================================================================

if __name__ == "__main__":
    print("S2R Retrieval Module - Standalone Test\n")
    
    # Example usage
    print("Training S2R model with synthetic data...")
    model, metrics = train_s2r(
        batch_size=8,
        num_epochs=3,
        max_samples=50,  # Small sample for quick testing
        device='cpu'  # Use CPU for compatibility
    )
    
    print("\nTesting retrieval...")
    # Generate test audio
    test_audio = np.random.randn(16000 * 3).astype(np.float32) * 0.1
    
    results = retrieve_info(
        farsi_audio_input=test_audio,
        model=model,
        top_k=3,
        device='cpu'
    )
    
    print("\nRetrieval Results:")
    for result in results:
        print(f"  {result['rank']}. [{result['score']:.4f}] {result['document']}")
    
    print("\n✓ Module test completed successfully!")
