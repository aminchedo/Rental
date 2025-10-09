#!/usr/bin/env python3
"""
Test script for S2R Module

Quick verification that all components are working correctly.
"""

import sys
import numpy as np
import torch
from pathlib import Path

def test_imports():
    """Test 1: Verify all imports work."""
    print("Test 1: Checking imports...")
    try:
        from s2r_module import (
            train_s2r,
            retrieve_info,
            CVSSFarsiDataLoader,
            DualEncoderS2R,
            AudioEncoder,
            TextEncoder,
            ContrastiveLoss,
            S2RTrainer,
            S2RRetriever,
            S2RConfig,
            get_config
        )
        print("  ✓ All imports successful")
        return True
    except ImportError as e:
        print(f"  ✗ Import failed: {e}")
        return False


def test_config():
    """Test 2: Verify configuration."""
    print("\nTest 2: Checking configuration...")
    try:
        from s2r_module import get_config
        
        # Test all presets
        configs = ["default", "quick_test", "high_performance", "lightweight"]
        for preset in configs:
            config = get_config(preset)
            assert config.embedding_dim > 0
            assert config.batch_size > 0
            assert config.num_epochs > 0
        
        print(f"  ✓ All {len(configs)} configuration presets valid")
        return True
    except Exception as e:
        print(f"  ✗ Configuration test failed: {e}")
        return False


def test_data_loader():
    """Test 3: Verify data loader."""
    print("\nTest 3: Checking data loader...")
    try:
        from s2r_module import CVSSFarsiDataLoader
        
        loader = CVSSFarsiDataLoader()
        data = loader.load_data(split='train', max_samples=10)
        
        assert len(data) == 10
        assert 'audio' in data[0]
        assert 'text' in data[0]
        assert isinstance(data[0]['audio'], np.ndarray)
        
        print(f"  ✓ Data loader working (loaded {len(data)} samples)")
        return True
    except Exception as e:
        print(f"  ✗ Data loader test failed: {e}")
        return False


def test_model_architecture():
    """Test 4: Verify model architecture."""
    print("\nTest 4: Checking model architecture...")
    try:
        from s2r_module import DualEncoderS2R, AudioEncoder, TextEncoder
        
        # Test individual encoders
        audio_encoder = AudioEncoder(embedding_dim=256)
        text_encoder = TextEncoder(embedding_dim=256)
        
        # Test dual encoder
        model = DualEncoderS2R(embedding_dim=256)
        
        # Forward pass test
        batch_size = 2
        audio = torch.randn(batch_size, 16000 * 3)
        text_ids = torch.randint(0, 1000, (batch_size, 128))
        text_mask = torch.ones(batch_size, 128)
        
        audio_emb, text_emb = model(audio, text_ids, text_mask)
        
        assert audio_emb.shape == (batch_size, 256)
        assert text_emb.shape == (batch_size, 256)
        
        print("  ✓ Model architecture working correctly")
        return True
    except Exception as e:
        print(f"  ✗ Model architecture test failed: {e}")
        return False


def test_contrastive_loss():
    """Test 5: Verify contrastive loss."""
    print("\nTest 5: Checking contrastive loss...")
    try:
        from s2r_module import ContrastiveLoss
        
        criterion = ContrastiveLoss(temperature=0.07)
        
        batch_size = 4
        emb_dim = 256
        
        audio_emb = torch.randn(batch_size, emb_dim)
        text_emb = torch.randn(batch_size, emb_dim)
        
        # Normalize
        audio_emb = torch.nn.functional.normalize(audio_emb, p=2, dim=1)
        text_emb = torch.nn.functional.normalize(text_emb, p=2, dim=1)
        
        loss, accuracy = criterion(audio_emb, text_emb)
        
        assert loss.item() >= 0
        assert 0 <= accuracy.item() <= 1
        
        print(f"  ✓ Contrastive loss working (loss: {loss.item():.4f}, acc: {accuracy.item():.4f})")
        return True
    except Exception as e:
        print(f"  ✗ Contrastive loss test failed: {e}")
        return False


def test_training():
    """Test 6: Verify training pipeline."""
    print("\nTest 6: Checking training pipeline...")
    try:
        from s2r_module import train_s2r
        
        model, metrics = train_s2r(
            batch_size=4,
            num_epochs=2,
            max_samples=20,
            device='cpu',
            checkpoint_dir='./test_checkpoints'
        )
        
        assert model is not None
        assert 'best_val_loss' in metrics
        assert 'history' in metrics
        assert len(metrics['history']) == 2
        
        print(f"  ✓ Training pipeline working (best loss: {metrics['best_val_loss']:.4f})")
        
        # Cleanup
        import shutil
        if Path('./test_checkpoints').exists():
            shutil.rmtree('./test_checkpoints')
        
        return True
    except Exception as e:
        print(f"  ✗ Training pipeline test failed: {e}")
        return False


def test_retrieval():
    """Test 7: Verify retrieval functionality."""
    print("\nTest 7: Checking retrieval...")
    try:
        from s2r_module import train_s2r, retrieve_info
        
        # Train small model
        model, _ = train_s2r(
            batch_size=4,
            num_epochs=1,
            max_samples=10,
            device='cpu',
            checkpoint_dir='./test_checkpoints'
        )
        
        # Test retrieval
        audio = np.random.randn(16000 * 2).astype(np.float32) * 0.1
        
        results = retrieve_info(
            farsi_audio_input=audio,
            model=model,
            top_k=3,
            device='cpu'
        )
        
        assert len(results) == 3
        assert 'document' in results[0]
        assert 'score' in results[0]
        assert 'rank' in results[0]
        
        print(f"  ✓ Retrieval working (top score: {results[0]['score']:.4f})")
        
        # Cleanup
        import shutil
        if Path('./test_checkpoints').exists():
            shutil.rmtree('./test_checkpoints')
        
        return True
    except Exception as e:
        print(f"  ✗ Retrieval test failed: {e}")
        return False


def test_checkpoint_save_load():
    """Test 8: Verify checkpoint save/load."""
    print("\nTest 8: Checking checkpoint save/load...")
    try:
        from s2r_module import DualEncoderS2R, S2RTrainer
        
        model = DualEncoderS2R(embedding_dim=256)
        trainer = S2RTrainer(model, device='cpu')
        
        # Save checkpoint
        Path('./test_checkpoints').mkdir(exist_ok=True)
        trainer.save_checkpoint(
            './test_checkpoints/test.pt',
            epoch=1,
            metrics={'loss': 0.5, 'accuracy': 0.7}
        )
        
        # Load checkpoint
        checkpoint = trainer.load_checkpoint('./test_checkpoints/test.pt')
        
        assert checkpoint['epoch'] == 1
        assert checkpoint['metrics']['loss'] == 0.5
        
        print("  ✓ Checkpoint save/load working")
        
        # Cleanup
        import shutil
        if Path('./test_checkpoints').exists():
            shutil.rmtree('./test_checkpoints')
        
        return True
    except Exception as e:
        print(f"  ✗ Checkpoint test failed: {e}")
        return False


def run_all_tests():
    """Run all tests."""
    print("="*60)
    print(" "*15 + "S2R MODULE TEST SUITE")
    print("="*60)
    
    tests = [
        test_imports,
        test_config,
        test_data_loader,
        test_model_architecture,
        test_contrastive_loss,
        test_training,
        test_retrieval,
        test_checkpoint_save_load
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"  ✗ Test crashed: {e}")
            results.append(False)
    
    print("\n" + "="*60)
    print(" "*20 + "TEST SUMMARY")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\nTests Passed: {passed}/{total}")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Module is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please check errors above.")
        return 1


if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)
