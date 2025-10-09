#!/usr/bin/env python3
"""
Download and prepare Persian language datasets from Hugging Face.
Downloads and converts datasets to the required JSONL format.
"""
import json
import sys
from pathlib import Path
from datasets import load_dataset
import random

def prepare_persian_wikipedia(output_path, split='train', max_samples=5000):
    """Download and prepare Persian Wikipedia dataset."""
    print(f"\n📥 Downloading Persian Wikipedia 2021...")
    try:
        dataset = load_dataset("persiandataset/persian_wikipedia_2021", split=split, trust_remote_code=True)
        
        with open(output_path, 'a', encoding='utf-8') as f:
            count = 0
            for item in dataset:
                if count >= max_samples:
                    break
                
                text = item.get('text', '')
                if len(text) > 100:  # Minimum length filter
                    # Create Q&A style prompts from Wikipedia content
                    lines = text.split('\n')
                    for i in range(0, len(lines) - 1, 2):
                        if lines[i].strip() and lines[i+1].strip():
                            prompt = lines[i].strip()
                            completion = lines[i+1].strip()
                            
                            if len(prompt) > 20 and len(completion) > 20:
                                entry = {
                                    "prompt": f"در مورد {prompt[:100]} توضیح بده",
                                    "completion": completion[:500]
                                }
                                f.write(json.dumps(entry, ensure_ascii=False) + '\n')
                                count += 1
                                if count >= max_samples:
                                    break
        
        print(f"✅ Added {count} samples from Persian Wikipedia")
        return count
    except Exception as e:
        print(f"⚠️  Wikipedia dataset error: {e}")
        return 0

def prepare_hamshahri_news(output_path, split='train', max_samples=3000):
    """Download and prepare Hamshahri Persian news dataset."""
    print(f"\n📥 Downloading Hamshahri News Dataset...")
    try:
        dataset = load_dataset("hooshvarelab/hamshahri", split=split, trust_remote_code=True)
        
        with open(output_path, 'a', encoding='utf-8') as f:
            count = 0
            for item in dataset:
                if count >= max_samples:
                    break
                
                title = item.get('title', '')
                text = item.get('text', '')
                
                if title and text and len(text) > 50:
                    entry = {
                        "prompt": f"خبر در مورد: {title}",
                        "completion": text[:600]
                    }
                    f.write(json.dumps(entry, ensure_ascii=False) + '\n')
                    count += 1
        
        print(f"✅ Added {count} samples from Hamshahri News")
        return count
    except Exception as e:
        print(f"⚠️  Hamshahri dataset error: {e}")
        return 0

def prepare_sentiment_corpus(output_path, split='train', max_samples=2000):
    """Download and prepare Persian sentiment corpus."""
    print(f"\n📥 Downloading Persian Sentiment Corpus...")
    try:
        dataset = load_dataset("hooshvarelab/pn_sentiment", split=split, trust_remote_code=True)
        
        with open(output_path, 'a', encoding='utf-8') as f:
            count = 0
            for item in dataset:
                if count >= max_samples:
                    break
                
                text = item.get('text', '')
                label = item.get('label', 0)
                
                if text and len(text) > 20:
                    sentiment = "مثبت" if label == 1 else "منفی"
                    entry = {
                        "prompt": f"این متن چه احساسی داره؟ {text[:200]}",
                        "completion": f"احساس این متن {sentiment} است."
                    }
                    f.write(json.dumps(entry, ensure_ascii=False) + '\n')
                    count += 1
        
        print(f"✅ Added {count} samples from Sentiment Corpus")
        return count
    except Exception as e:
        print(f"⚠️  Sentiment corpus error: {e}")
        return 0

def create_synthetic_qa_pairs(output_path, count=1000):
    """Create synthetic Persian Q&A pairs for chat training."""
    print(f"\n🔧 Creating synthetic Q&A pairs...")
    
    templates = [
        ("سلام", "سلام! چطور می‌تونم کمکتون کنم؟"),
        ("حالت چطوره؟", "من یک دستیار هوش مصنوعی هستم و همیشه آماده کمک به شما هستم!"),
        ("اسمت چیه؟", "من یک دستیار گفتگوی فارسی زبان هستم."),
        ("چی کار می‌کنی؟", "من می‌تونم به سوالات شما به زبان فارسی پاسخ بدم و در مورد موضوعات مختلف صحبت کنم."),
        ("می‌تونی کمکم کنی؟", "البته! چطور می‌تونم کمکتون کنم؟"),
        ("ممنون", "خواهش می‌کنم! خوشحالم که تونستم کمک کنم."),
        ("خداحافظ", "خداحافظ! امیدوارم دوباره ببینمتون."),
    ]
    
    with open(output_path, 'a', encoding='utf-8') as f:
        for i in range(count):
            prompt, completion = random.choice(templates)
            entry = {
                "prompt": prompt,
                "completion": completion
            }
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    
    print(f"✅ Added {count} synthetic Q&A pairs")
    return count

def split_train_test(input_file, train_ratio=0.85):
    """Split dataset into train and test sets."""
    print(f"\n✂️  Splitting into train/test sets...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    random.shuffle(lines)
    split_idx = int(len(lines) * train_ratio)
    
    train_file = input_file.parent / 'train.jsonl'
    test_file = input_file.parent / 'test.jsonl'
    
    with open(train_file, 'w', encoding='utf-8') as f:
        f.writelines(lines[:split_idx])
    
    with open(test_file, 'w', encoding='utf-8') as f:
        f.writelines(lines[split_idx:])
    
    print(f"✅ Train set: {split_idx} samples → {train_file}")
    print(f"✅ Test set: {len(lines) - split_idx} samples → {test_file}")

def main():
    """Main download and preparation routine."""
    print("=" * 60)
    print("Persian Chat Agent - Dataset Download & Preparation")
    print("=" * 60)
    
    datasets_dir = Path(__file__).parent.parent / 'datasets'
    datasets_dir.mkdir(exist_ok=True)
    
    temp_file = datasets_dir / 'all_data.jsonl'
    
    # Remove temp file if exists
    if temp_file.exists():
        temp_file.unlink()
    
    total_samples = 0
    
    # Download and prepare datasets
    total_samples += prepare_persian_wikipedia(temp_file, split='train', max_samples=3000)
    total_samples += prepare_hamshahri_news(temp_file, split='train', max_samples=2000)
    total_samples += prepare_sentiment_corpus(temp_file, split='train', max_samples=1500)
    total_samples += create_synthetic_qa_pairs(temp_file, count=500)
    
    print(f"\n📊 Total samples collected: {total_samples}")
    
    # Split into train/test
    split_train_test(temp_file, train_ratio=0.85)
    
    # Clean up temp file
    temp_file.unlink()
    
    print("\n" + "=" * 60)
    print("✅ DATASET PREPARATION COMPLETE")
    print("=" * 60)
    
    return 0

if __name__ == "__main__":
    random.seed(42)  # For reproducibility
    sys.exit(main())
