#!/usr/bin/env ts-node
/**
 * Dataset validation script for Persian chat dataset.
 * TypeScript version of check_dataset.py
 * Validates JSONL schema, Persian normalization, duplicate removal, and SHA256 checksums.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface Message {
  role: string;
  content: string;
}

interface Conversation {
  messages: Message[];
}

interface ValidationStats {
  total_lines: number;
  valid_lines: number;
  invalid_lines: number;
  duplicates: number;
  normalized_entries: number;
  errors: string[];
}

/**
 * Normalize Persian/Arabic characters to standard Persian.
 */
function normalizePersian(text: string): string {
  // Arabic to Persian digit conversion
  const arabicToPersian: Record<string, string> = {
    '٠': '۰', '١': '۱', '٢': '۲', '٣': '۳', '٤': '۴',
    '٥': '۵', '٦': '۶', '٧': '۷', '٨': '۸', '٩': '۹'
  };
  
  // Arabic to Persian character conversion
  const charMap: Record<string, string> = {
    'ك': 'ک',  // Arabic kaf to Persian kaf
    'ي': 'ی',  // Arabic yeh to Persian yeh
    'ى': 'ی',  // Alef maksura to Persian yeh
    'ة': 'ه',  // Teh marbuta to heh
  };
  
  // Apply all conversions
  const allMaps = { ...arabicToPersian, ...charMap };
  let normalized = text;
  for (const [ar, fa] of Object.entries(allMaps)) {
    normalized = normalized.replace(new RegExp(ar, 'g'), fa);
  }
  
  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Validate that messages follow the required format.
 */
function validateMessageFormat(messages: any): boolean {
  const requiredRoles = new Set(['system', 'user', 'assistant']);
  
  if (!Array.isArray(messages) || messages.length === 0) {
    return false;
  }
  
  for (const msg of messages) {
    if (typeof msg !== 'object' || msg === null) {
      return false;
    }
    if (!('role' in msg) || !('content' in msg)) {
      return false;
    }
    if (!requiredRoles.has(msg.role)) {
      return false;
    }
    if (typeof msg.content !== 'string') {
      return false;
    }
  }
  
  return true;
}

/**
 * Calculate SHA256 checksum of a file.
 */
function calculateSHA256(filepath: string): string {
  const fileBuffer = fs.readFileSync(filepath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Validate a JSONL dataset file.
 */
function checkDataset(filepath: string): ValidationStats {
  const stats: ValidationStats = {
    total_lines: 0,
    valid_lines: 0,
    invalid_lines: 0,
    duplicates: 0,
    normalized_entries: 0,
    errors: []
  };
  
  const seenContents = new Set<string>();
  
  if (!fs.existsSync(filepath)) {
    stats.errors.push(`File not found: ${filepath}`);
    return stats;
  }
  
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum].trim();
    stats.total_lines++;
    
    if (!line) {
      continue;
    }
    
    try {
      const data = JSON.parse(line);
      
      // Check for required 'messages' field
      if (!('messages' in data)) {
        stats.invalid_lines++;
        stats.errors.push(`Line ${lineNum + 1}: Missing 'messages' field`);
        continue;
      }
      
      // Validate message format
      if (!validateMessageFormat(data.messages)) {
        stats.invalid_lines++;
        stats.errors.push(`Line ${lineNum + 1}: Invalid message format`);
        continue;
      }
      
      // Normalize Persian text
      let normalized = false;
      for (const msg of data.messages) {
        const original = msg.content;
        msg.content = normalizePersian(msg.content);
        if (original !== msg.content) {
          normalized = true;
        }
      }
      
      if (normalized) {
        stats.normalized_entries++;
      }
      
      // Check for duplicates
      const contentHash = JSON.stringify(data, Object.keys(data).sort());
      if (seenContents.has(contentHash)) {
        stats.duplicates++;
        continue;
      }
      
      seenContents.add(contentHash);
      stats.valid_lines++;
      
    } catch (e) {
      stats.invalid_lines++;
      stats.errors.push(`Line ${lineNum + 1}: JSON decode error - ${e instanceof Error ? e.message : String(e)}`);
      continue;
    }
  }
  
  return stats;
}

/**
 * Main validation function.
 */
function main(): void {
  console.log('='.repeat(60));
  console.log('Dataset Validation Script (TypeScript)');
  console.log('='.repeat(60));
  
  const datasetsDir = path.join(process.cwd(), 'datasets');
  const trainFile = path.join(datasetsDir, 'train.jsonl');
  const testFile = path.join(datasetsDir, 'test.jsonl');
  const checksumsFile = path.join(datasetsDir, 'checksums.txt');
  
  // Check if dataset files exist
  const missingFiles: string[] = [];
  for (const filepath of [trainFile, testFile]) {
    if (!fs.existsSync(filepath)) {
      missingFiles.push(filepath);
    }
  }
  
  if (missingFiles.length > 0) {
    console.log('\n❌ ERROR: Missing dataset files:');
    for (const f of missingFiles) {
      console.log(`   - ${f}`);
    }
    console.log('\n💡 These files should be created by the dataset preparation step.');
    console.log('   Please run the dataset preparation script first.');
    process.exit(1);
  }
  
  // Validate train dataset
  console.log(`\n📊 Validating ${trainFile}...`);
  const trainStats = checkDataset(trainFile);
  
  console.log('\nTrain Dataset Statistics:');
  console.log(`  Total lines: ${trainStats.total_lines}`);
  console.log(`  Valid lines: ${trainStats.valid_lines}`);
  console.log(`  Invalid lines: ${trainStats.invalid_lines}`);
  console.log(`  Duplicates removed: ${trainStats.duplicates}`);
  console.log(`  Normalized entries: ${trainStats.normalized_entries}`);
  
  if (trainStats.errors.length > 0) {
    console.log(`\n  Errors (${trainStats.errors.length} total):`);
    for (const error of trainStats.errors.slice(0, 5)) {
      console.log(`    - ${error}`);
    }
    if (trainStats.errors.length > 5) {
      console.log(`    ... and ${trainStats.errors.length - 5} more`);
    }
  }
  
  // Validate test dataset
  console.log(`\n📊 Validating ${testFile}...`);
  const testStats = checkDataset(testFile);
  
  console.log('\nTest Dataset Statistics:');
  console.log(`  Total lines: ${testStats.total_lines}`);
  console.log(`  Valid lines: ${testStats.valid_lines}`);
  console.log(`  Invalid lines: ${testStats.invalid_lines}`);
  console.log(`  Duplicates removed: ${testStats.duplicates}`);
  console.log(`  Normalized entries: ${testStats.normalized_entries}`);
  
  if (testStats.errors.length > 0) {
    console.log(`\n  Errors (${testStats.errors.length} total):`);
    for (const error of testStats.errors.slice(0, 5)) {
      console.log(`    - ${error}`);
    }
    if (testStats.errors.length > 5) {
      console.log(`    ... and ${testStats.errors.length - 5} more`);
    }
  }
  
  // Calculate checksums
  console.log('\n🔐 Calculating SHA256 checksums...');
  const trainChecksum = calculateSHA256(trainFile);
  const testChecksum = calculateSHA256(testFile);
  
  console.log('\nChecksums:');
  console.log(`  train.jsonl: ${trainChecksum}`);
  console.log(`  test.jsonl:  ${testChecksum}`);
  
  // Save checksums to file (append mode to preserve existing checksums)
  const existingChecksums = fs.existsSync(checksumsFile) 
    ? fs.readFileSync(checksumsFile, 'utf-8') 
    : '';
  
  const newChecksums = `${trainChecksum}  datasets/train.jsonl\n${testChecksum}  datasets/test.jsonl\n`;
  
  // Only write if checksums are different
  if (!existingChecksums.includes(trainChecksum) || !existingChecksums.includes(testChecksum)) {
    fs.writeFileSync(checksumsFile, newChecksums, 'utf-8');
    console.log(`\n✅ Checksums saved to ${checksumsFile}`);
  } else {
    console.log(`\n✅ Checksums already up to date in ${checksumsFile}`);
  }
  
  // Final validation
  console.log('\n' + '='.repeat(60));
  
  const hasErrors = (
    trainStats.invalid_lines > 0 ||
    testStats.invalid_lines > 0 ||
    trainStats.valid_lines === 0 ||
    testStats.valid_lines === 0
  );
  
  if (hasErrors) {
    console.log('❌ VALIDATION FAILED');
    console.log('\nDataset validation completed with errors.');
    console.log('Please fix the issues before proceeding to training.');
    process.exit(1);
  } else {
    console.log('✅ VALIDATION PASSED');
    console.log('\nAll dataset files are valid and ready for training!');
    process.exit(0);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { normalizePersian, validateMessageFormat, calculateSHA256, checkDataset };
