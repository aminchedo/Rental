#!/usr/bin/env python3
"""
Dataset validation script for Persian chat agent.
Validates JSONL format, checks for duplicates, and computes SHA256 checksums.
"""
import json
import hashlib
import sys
from pathlib import Path
from collections import defaultdict

def normalize_persian_text(text):
    """Normalize Persian text: remove Arabic forms, standardize digits."""
    # Arabic to Persian digit mapping
    arabic_to_persian = str.maketrans('٠١٢٣٤٥٦٧٨٩', '۰۱۲۳۴۵۶۷۸۹')
    # Arabic characters to Persian
    text = text.replace('ي', 'ی').replace('ك', 'ک')
    # Normalize digits
    text = text.translate(arabic_to_persian)
    return text.strip()

def compute_sha256(file_path):
    """Compute SHA256 checksum of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def validate_dataset(file_path):
    """Validate a JSONL dataset file."""
    print(f"\n🔍 Validating: {file_path}")
    
    if not Path(file_path).exists():
        print(f"❌ ERROR: File not found: {file_path}")
        return False
    
    prompts = set()
    duplicates = []
    line_count = 0
    error_count = 0
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            
            line_count += 1
            try:
                data = json.loads(line)
                
                # Validate schema
                if 'prompt' not in data or 'completion' not in data:
                    print(f"❌ Line {line_num}: Missing 'prompt' or 'completion' field")
                    error_count += 1
                    continue
                
                # Normalize text
                prompt = normalize_persian_text(data['prompt'])
                completion = normalize_persian_text(data['completion'])
                
                # Check for duplicates
                if prompt in prompts:
                    duplicates.append((line_num, prompt[:50]))
                else:
                    prompts.add(prompt)
                
                # Validate non-empty
                if not prompt or not completion:
                    print(f"❌ Line {line_num}: Empty prompt or completion")
                    error_count += 1
                    
            except json.JSONDecodeError as e:
                print(f"❌ Line {line_num}: Invalid JSON - {e}")
                error_count += 1
    
    # Report results
    print(f"\n📊 Statistics for {Path(file_path).name}:")
    print(f"  Total lines: {line_count}")
    print(f"  Unique prompts: {len(prompts)}")
    print(f"  Duplicates: {len(duplicates)}")
    print(f"  Errors: {error_count}")
    
    if duplicates:
        print(f"\n⚠️  Found {len(duplicates)} duplicate prompts:")
        for line_num, prompt_preview in duplicates[:5]:
            print(f"    Line {line_num}: {prompt_preview}...")
    
    # Compute SHA256
    sha256 = compute_sha256(file_path)
    print(f"\n🔐 SHA256: {sha256}")
    
    # Save checksum
    checksum_file = Path(file_path).with_suffix('.sha256')
    with open(checksum_file, 'w') as f:
        f.write(f"{sha256}  {Path(file_path).name}\n")
    print(f"✅ Checksum saved to: {checksum_file}")
    
    if error_count > 0:
        print(f"\n❌ VALIDATION FAILED: {error_count} errors found")
        return False
    
    print(f"\n✅ VALIDATION PASSED")
    return True

def main():
    """Main validation routine."""
    print("=" * 60)
    print("Persian Chat Agent - Dataset Validation")
    print("=" * 60)
    
    datasets_dir = Path(__file__).parent.parent / 'datasets'
    required_files = ['train.jsonl', 'test.jsonl']
    
    all_valid = True
    for filename in required_files:
        file_path = datasets_dir / filename
        if not validate_dataset(file_path):
            all_valid = False
    
    # Check for combined dataset if it exists
    combined_path = datasets_dir / 'combined.jsonl'
    if combined_path.exists():
        print("\n📦 Found combined dataset, validating...")
        if not validate_dataset(combined_path):
            all_valid = False
    
    print("\n" + "=" * 60)
    if all_valid:
        print("✅ ALL DATASETS VALID")
        print("=" * 60)
        return 0
    else:
        print("❌ VALIDATION FAILED")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
