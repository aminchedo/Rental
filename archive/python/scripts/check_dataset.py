#!/usr/bin/env python3
"""
Dataset validation script for Persian chat dataset.
Validates JSONL schema, Persian normalization, duplicate removal, and SHA256 checksums.
"""

import json
import hashlib
import sys
import os
from pathlib import Path
from typing import Dict, List, Set
import re

def normalize_persian(text: str) -> str:
    """Normalize Persian/Arabic characters to standard Persian."""
    # Arabic to Persian digit conversion
    arabic_to_persian = {
        '٠': '۰', '١': '۱', '٢': '۲', '٣': '۳', '٤': '۴',
        '٥': '۵', '٦': '۶', '٧': '۷', '٨': '۸', '٩': '۹'
    }
    
    # Arabic to Persian character conversion
    char_map = {
        'ك': 'ک',  # Arabic kaf to Persian kaf
        'ي': 'ی',  # Arabic yeh to Persian yeh
        'ى': 'ی',  # Alef maksura to Persian yeh
        'ة': 'ه',  # Teh marbuta to heh
    }
    
    for ar, fa in {**arabic_to_persian, **char_map}.items():
        text = text.replace(ar, fa)
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def validate_message_format(messages: List[Dict]) -> bool:
    """Validate that messages follow the required format."""
    required_roles = {'system', 'user', 'assistant'}
    
    if not isinstance(messages, list) or len(messages) == 0:
        return False
    
    for msg in messages:
        if not isinstance(msg, dict):
            return False
        if 'role' not in msg or 'content' not in msg:
            return False
        if msg['role'] not in required_roles:
            return False
        if not isinstance(msg['content'], str):
            return False
    
    return True

def calculate_sha256(filepath: Path) -> str:
    """Calculate SHA256 checksum of a file."""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def check_dataset(filepath: Path) -> Dict:
    """Validate a JSONL dataset file."""
    stats = {
        'total_lines': 0,
        'valid_lines': 0,
        'invalid_lines': 0,
        'duplicates': 0,
        'normalized_entries': 0,
        'errors': []
    }
    
    seen_contents: Set[str] = set()
    
    if not filepath.exists():
        stats['errors'].append(f"File not found: {filepath}")
        return stats
    
    with open(filepath, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            stats['total_lines'] += 1
            line = line.strip()
            
            if not line:
                continue
            
            try:
                data = json.loads(line)
                
                # Check for required 'messages' field
                if 'messages' not in data:
                    stats['invalid_lines'] += 1
                    stats['errors'].append(f"Line {line_num}: Missing 'messages' field")
                    continue
                
                # Validate message format
                if not validate_message_format(data['messages']):
                    stats['invalid_lines'] += 1
                    stats['errors'].append(f"Line {line_num}: Invalid message format")
                    continue
                
                # Normalize Persian text
                normalized = False
                for msg in data['messages']:
                    original = msg['content']
                    msg['content'] = normalize_persian(msg['content'])
                    if original != msg['content']:
                        normalized = True
                
                if normalized:
                    stats['normalized_entries'] += 1
                
                # Check for duplicates
                content_hash = json.dumps(data, sort_keys=True, ensure_ascii=False)
                if content_hash in seen_contents:
                    stats['duplicates'] += 1
                    continue
                
                seen_contents.add(content_hash)
                stats['valid_lines'] += 1
                
            except json.JSONDecodeError as e:
                stats['invalid_lines'] += 1
                stats['errors'].append(f"Line {line_num}: JSON decode error - {str(e)}")
                continue
    
    return stats

def main():
    """Main validation function."""
    print("=" * 60)
    print("Dataset Validation Script")
    print("=" * 60)
    
    datasets_dir = Path('datasets')
    train_file = datasets_dir / 'train.jsonl'
    test_file = datasets_dir / 'test.jsonl'
    checksums_file = datasets_dir / 'checksums.txt'
    
    # Check if dataset files exist
    missing_files = []
    for filepath in [train_file, test_file]:
        if not filepath.exists():
            missing_files.append(str(filepath))
    
    if missing_files:
        print(f"\n❌ ERROR: Missing dataset files:")
        for f in missing_files:
            print(f"   - {f}")
        print("\n💡 These files should be created by the dataset preparation step.")
        print("   Please run the dataset preparation script first.")
        sys.exit(1)
    
    # Validate train dataset
    print(f"\n📊 Validating {train_file}...")
    train_stats = check_dataset(train_file)
    
    print(f"\nTrain Dataset Statistics:")
    print(f"  Total lines: {train_stats['total_lines']}")
    print(f"  Valid lines: {train_stats['valid_lines']}")
    print(f"  Invalid lines: {train_stats['invalid_lines']}")
    print(f"  Duplicates removed: {train_stats['duplicates']}")
    print(f"  Normalized entries: {train_stats['normalized_entries']}")
    
    if train_stats['errors']:
        print(f"\n  Errors ({len(train_stats['errors'])} total):")
        for error in train_stats['errors'][:5]:  # Show first 5 errors
            print(f"    - {error}")
        if len(train_stats['errors']) > 5:
            print(f"    ... and {len(train_stats['errors']) - 5} more")
    
    # Validate test dataset
    print(f"\n📊 Validating {test_file}...")
    test_stats = check_dataset(test_file)
    
    print(f"\nTest Dataset Statistics:")
    print(f"  Total lines: {test_stats['total_lines']}")
    print(f"  Valid lines: {test_stats['valid_lines']}")
    print(f"  Invalid lines: {test_stats['invalid_lines']}")
    print(f"  Duplicates removed: {test_stats['duplicates']}")
    print(f"  Normalized entries: {test_stats['normalized_entries']}")
    
    if test_stats['errors']:
        print(f"\n  Errors ({len(test_stats['errors'])} total):")
        for error in test_stats['errors'][:5]:
            print(f"    - {error}")
        if len(test_stats['errors']) > 5:
            print(f"    ... and {len(test_stats['errors']) - 5} more")
    
    # Calculate checksums
    print(f"\n🔐 Calculating SHA256 checksums...")
    train_checksum = calculate_sha256(train_file)
    test_checksum = calculate_sha256(test_file)
    
    print(f"\nChecksums:")
    print(f"  train.jsonl: {train_checksum}")
    print(f"  test.jsonl:  {test_checksum}")
    
    # Save checksums to file
    with open(checksums_file, 'w') as f:
        f.write(f"{train_checksum}  datasets/train.jsonl\n")
        f.write(f"{test_checksum}  datasets/test.jsonl\n")
    
    print(f"\n✅ Checksums saved to {checksums_file}")
    
    # Final validation
    print("\n" + "=" * 60)
    
    has_errors = (
        train_stats['invalid_lines'] > 0 or
        test_stats['invalid_lines'] > 0 or
        train_stats['valid_lines'] == 0 or
        test_stats['valid_lines'] == 0
    )
    
    if has_errors:
        print("❌ VALIDATION FAILED")
        print("\nDataset validation completed with errors.")
        print("Please fix the issues before proceeding to training.")
        sys.exit(1)
    else:
        print("✅ VALIDATION PASSED")
        print("\nAll dataset files are valid and ready for training!")
        sys.exit(0)

if __name__ == "__main__":
    main()
