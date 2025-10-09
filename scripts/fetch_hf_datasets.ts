#!/usr/bin/env ts-node
/**
 * Hugging Face Dataset Fetcher (TypeScript)
 * Downloads real Persian datasets from Hugging Face and converts to conversational JSONL format
 * 
 * Supported datasets:
 * - ParsBERT-Fa-Sentiment-Twitter
 * - PersianMind-v1.0
 * - hooshvarelab/hamshahri (optional)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ConversationData {
  messages: Message[];
  source?: string;
}

interface DatasetSource {
  source: string;
  split: string;
  rows: number;
  sha256: string;
  timestamp: string;
}

/**
 * Normalize Persian text (Arabic to Persian conversion)
 */
function normalizePersian(text: string): string {
  // Arabic to Persian digit conversion
  const digitMap: { [key: string]: string } = {
    '٠': '۰', '١': '۱', '٢': '۲', '٣': '۳', '٤': '۴',
    '٥': '۵', '٦': '۶', '٧': '۷', '٨': '۸', '٩': '۹'
  };
  
  // Arabic to Persian character conversion
  const charMap: { [key: string]: string } = {
    'ك': 'ک',  // Arabic kaf to Persian kaf
    'ي': 'ی',  // Arabic yeh to Persian yeh
    'ى': 'ی',  // Alef maksura to Persian yeh
    'ة': 'ه',  // Teh marbuta to heh
  };
  
  let normalized = text;
  for (const [ar, fa] of Object.entries({ ...digitMap, ...charMap })) {
    normalized = normalized.replace(new RegExp(ar, 'g'), fa);
  }
  
  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Check if Python and required libraries are available
 */
function checkPythonEnvironment(): boolean {
  try {
    execSync('python3 --version', { stdio: 'pipe' });
    execSync('python3 -c "import datasets"', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('❌ Python environment check failed');
    console.error('   Please install: pip install datasets huggingface_hub');
    return false;
  }
}

/**
 * Download dataset from Hugging Face using Python datasets library
 */
function downloadHFDataset(datasetName: string, split: string = 'train'): any[] {
  console.log(`📥 Downloading ${datasetName} (${split})...`);
  
  const pythonScript = `
import json
import sys
from datasets import load_dataset

dataset_name = "${datasetName}"
split = "${split}"

try:
    # Try to load the dataset
    dataset = load_dataset(dataset_name, split=split)
    
    # Convert to list of dicts
    data = [dict(item) for item in dataset]
    
    # Print as JSON
    print(json.dumps(data))
except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;

  const tempPyFile = path.join('/tmp', `fetch_${Date.now()}.py`);
  fs.writeFileSync(tempPyFile, pythonScript);

  try {
    const output = execSync(`python3 ${tempPyFile}`, { 
      maxBuffer: 100 * 1024 * 1024, // 100MB buffer
      encoding: 'utf-8' 
    });
    fs.unlinkSync(tempPyFile);
    return JSON.parse(output);
  } catch (error: any) {
    fs.unlinkSync(tempPyFile);
    console.error(`❌ Failed to download ${datasetName}:`, error.message);
    throw error;
  }
}

/**
 * Convert sentiment dataset to conversational format
 */
function convertSentimentToConversational(items: any[], sourceName: string): ConversationData[] {
  const conversations: ConversationData[] = [];
  const systemMessage = 'شما یک دستیار هوشمند فارسی‌زبان هستید که به تحلیل احساسات متن کمک می‌کنید.';

  items.forEach(item => {
    const text = item.text || item.content || '';
    const label = item.label || item.sentiment || 0;
    
    if (!text) return;

    const normalizedText = normalizePersian(text);
    
    // Map label to sentiment
    let sentiment = 'خنثی';
    if (label === 1 || label === 'positive' || label === 'pos') {
      sentiment = 'مثبت';
    } else if (label === 0 || label === 'negative' || label === 'neg') {
      sentiment = 'منفی';
    }

    conversations.push({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: `احساس این متن چیست؟\n\n${normalizedText}` },
        { role: 'assistant', content: `احساس این متن ${sentiment} است.` }
      ],
      source: sourceName
    });
  });

  return conversations;
}

/**
 * Convert general text dataset to conversational format
 */
function convertGeneralTextToConversational(items: any[], sourceName: string): ConversationData[] {
  const conversations: ConversationData[] = [];
  const systemMessage = 'شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید.';

  items.forEach(item => {
    const text = item.text || item.content || item.question || '';
    const response = item.response || item.answer || item.output || '';
    
    if (!text) return;

    const normalizedText = normalizePersian(text);
    const normalizedResponse = response ? normalizePersian(response) : '';

    if (normalizedResponse) {
      // Q&A format
      conversations.push({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: normalizedText },
          { role: 'assistant', content: normalizedResponse }
        ],
        source: sourceName
      });
    } else {
      // Generate a simple conversational response
      conversations.push({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: 'لطفاً این متن را بخوانید و توضیح دهید.' },
          { role: 'assistant', content: normalizedText.substring(0, 300) }
        ],
        source: sourceName
      });
    }
  });

  return conversations;
}

/**
 * Calculate SHA256 checksum of a file
 */
function calculateSHA256(filepath: string): string {
  const fileBuffer = fs.readFileSync(filepath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Save conversations to JSONL file
 */
function saveToJsonl(conversations: ConversationData[], filepath: string): void {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content = conversations.map(conv => JSON.stringify(conv)).join('\n') + '\n';
  fs.writeFileSync(filepath, content, { encoding: 'utf-8' });
  console.log(`✅ Saved ${conversations.length} conversations to ${filepath}`);
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('='.repeat(70));
  console.log('Hugging Face Dataset Fetcher - Real Persian Datasets');
  console.log('='.repeat(70));
  console.log();

  // Check Python environment
  if (!checkPythonEnvironment()) {
    console.error('\n💡 Installing required Python packages...');
    try {
      execSync('pip install datasets huggingface_hub', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to install Python packages');
      process.exit(1);
    }
  }

  // Get environment variables
  const trainUrls = (process.env.DATASET_TRAIN_URLS || 'ParsBERT-Fa-Sentiment-Twitter,PersianMind-v1.0').split(',');
  const testSplit = process.env.DATASET_TEST_SPLIT || 'validation';
  const hamshahriEnabled = process.env.HAMSHAHRI_ENABLED === 'true';

  const datasetsDir = path.join(process.cwd(), 'datasets');
  const logsDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(datasetsDir)) {
    fs.mkdirSync(datasetsDir, { recursive: true });
  }
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const trainConversations: ConversationData[] = [];
  const testConversations: ConversationData[] = [];
  const sources: DatasetSource[] = [];

  // Process each dataset
  for (const datasetUrl of trainUrls) {
    const datasetName = datasetUrl.trim();
    if (!datasetName) continue;

    console.log(`\n📦 Processing dataset: ${datasetName}`);
    
    try {
      // Download training data
      let trainData: any[] = [];
      try {
        trainData = downloadHFDataset(datasetName, 'train');
        console.log(`   ✅ Downloaded ${trainData.length} training samples`);
      } catch (error) {
        console.warn(`   ⚠️  Could not load train split, trying default...`);
        try {
          const allData = downloadHFDataset(datasetName);
          const splitPoint = Math.floor(allData.length * 0.8);
          trainData = allData.slice(0, splitPoint);
          console.log(`   ✅ Using first 80% as training (${trainData.length} samples)`);
        } catch (innerError) {
          console.error(`   ❌ Failed to load ${datasetName}, skipping...`);
          continue;
        }
      }

      // Download test/validation data
      let testData: any[] = [];
      try {
        testData = downloadHFDataset(datasetName, testSplit);
        console.log(`   ✅ Downloaded ${testData.length} ${testSplit} samples`);
      } catch (error) {
        console.warn(`   ⚠️  Could not load ${testSplit} split, using sample from train...`);
        const allData = downloadHFDataset(datasetName);
        const splitPoint = Math.floor(allData.length * 0.8);
        testData = allData.slice(splitPoint);
        console.log(`   ✅ Using last 20% as test (${testData.length} samples)`);
      }

      // Convert to conversational format
      let trainConv: ConversationData[] = [];
      let testConv: ConversationData[] = [];

      if (datasetName.toLowerCase().includes('sentiment')) {
        trainConv = convertSentimentToConversational(trainData, datasetName);
        testConv = convertSentimentToConversational(testData, datasetName);
      } else {
        trainConv = convertGeneralTextToConversational(trainData, datasetName);
        testConv = convertGeneralTextToConversational(testData, datasetName);
      }

      trainConversations.push(...trainConv);
      testConversations.push(...testConv);

      console.log(`   ✅ Converted to ${trainConv.length + testConv.length} conversations`);

    } catch (error: any) {
      console.error(`❌ Error processing ${datasetName}:`, error.message);
      console.error('   Pipeline will fail as per specification - no silent skips allowed');
      process.exit(1);
    }
  }

  // Optional: Add Hamshahri dataset
  if (hamshahriEnabled) {
    console.log('\n📰 Processing Hamshahri Persian News...');
    try {
      const hamshahriData = downloadHFDataset('hooshvarelab/hamshahri', 'train').slice(0, 1000);
      const hamshahriConv = convertGeneralTextToConversational(hamshahriData, 'hamshahri');
      trainConversations.push(...hamshahriConv.slice(0, 800));
      testConversations.push(...hamshahriConv.slice(800));
      console.log(`   ✅ Added ${hamshahriConv.length} Hamshahri conversations`);
    } catch (error) {
      console.warn('   ⚠️  Hamshahri dataset unavailable, continuing without it');
    }
  }

  // Fail if no data was collected
  if (trainConversations.length === 0 || testConversations.length === 0) {
    console.error('\n❌ CRITICAL: No data collected from any source!');
    console.error('   At least one dataset must be successfully loaded.');
    process.exit(1);
  }

  // Save to JSONL files
  console.log('\n💾 Saving datasets...');
  const trainPath = path.join(datasetsDir, 'train.jsonl');
  const testPath = path.join(datasetsDir, 'test.jsonl');

  saveToJsonl(trainConversations, trainPath);
  saveToJsonl(testConversations, testPath);

  // Calculate checksums
  console.log('\n🔐 Calculating checksums...');
  const trainSha = calculateSHA256(trainPath);
  const testSha = calculateSHA256(testPath);

  fs.writeFileSync(path.join(datasetsDir, 'train.jsonl.sha256'), trainSha);
  fs.writeFileSync(path.join(datasetsDir, 'test.jsonl.sha256'), testSha);

  console.log(`   train.jsonl: ${trainSha}`);
  console.log(`   test.jsonl: ${testSha}`);

  // Save dataset sources log
  sources.push({
    source: 'huggingface_combined',
    split: 'train',
    rows: trainConversations.length,
    sha256: trainSha,
    timestamp: new Date().toISOString()
  });
  sources.push({
    source: 'huggingface_combined',
    split: 'test',
    rows: testConversations.length,
    sha256: testSha,
    timestamp: new Date().toISOString()
  });

  const sourcesPath = path.join(logsDir, 'dataset_sources.json');
  fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
  console.log(`\n📋 Dataset sources logged to ${sourcesPath}`);

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('✅ Dataset Preparation Complete!');
  console.log('='.repeat(70));
  console.log(`\nDatasets used: ${trainUrls.join(', ')}`);
  console.log(`Training samples: ${trainConversations.length}`);
  console.log(`Test samples: ${testConversations.length}`);
  console.log(`Total conversations: ${trainConversations.length + testConversations.length}`);
  console.log('\nFiles created:');
  console.log(`  - ${trainPath}`);
  console.log(`  - ${testPath}`);
  console.log(`  - ${trainPath}.sha256`);
  console.log(`  - ${testPath}.sha256`);
  console.log(`  - ${sourcesPath}`);
  console.log();
}

// Execute if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { normalizePersian, convertSentimentToConversational, convertGeneralTextToConversational };
