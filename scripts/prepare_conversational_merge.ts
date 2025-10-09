#!/usr/bin/env ts-node
/**
 * Conversational Dataset Merger (TypeScript)
 * Merges Google data with HuggingFace datasets into combined.jsonl
 * 
 * If google_data.jsonl exists, merge it with HF JSONL
 * Otherwise, use HF JSONL as combined
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

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
 * Calculate SHA256 checksum of a file
 */
function calculateSHA256(filepath: string): string {
  const fileBuffer = fs.readFileSync(filepath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Load JSONL file
 */
function loadJsonl(filepath: string): ConversationData[] {
  if (!fs.existsSync(filepath)) {
    return [];
  }

  const conversations: ConversationData[] = [];
  const lines = fs.readFileSync(filepath, 'utf-8').split('\n').filter(l => l.trim());
  
  lines.forEach((line, idx) => {
    try {
      const data = JSON.parse(line) as ConversationData;
      if (data.messages && Array.isArray(data.messages)) {
        conversations.push(data);
      }
    } catch (e) {
      console.error(`Error parsing line ${idx + 1} in ${filepath}: ${e}`);
    }
  });

  return conversations;
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
}

/**
 * Deduplicate conversations based on message content
 */
function deduplicateConversations(conversations: ConversationData[]): ConversationData[] {
  const seen = new Set<string>();
  const deduplicated: ConversationData[] = [];

  conversations.forEach(conv => {
    const key = JSON.stringify(conv.messages);
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(conv);
    }
  });

  return deduplicated;
}

/**
 * Main execution
 */
function main(): void {
  console.log('='.repeat(70));
  console.log('Conversational Dataset Merger (TypeScript)');
  console.log('='.repeat(70));
  console.log();

  const datasetsDir = path.join(process.cwd(), 'datasets');
  const rawDir = path.join(datasetsDir, 'raw');
  const logsDir = path.join(process.cwd(), 'logs');

  const googleDataPath = path.join(rawDir, 'google_data.jsonl');
  const trainPath = path.join(datasetsDir, 'train.jsonl');
  const combinedPath = path.join(datasetsDir, 'combined.jsonl');
  const sourcesPath = path.join(logsDir, 'dataset_sources.json');

  // Ensure directories exist
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Check if train.jsonl exists
  if (!fs.existsSync(trainPath)) {
    console.error('❌ CRITICAL: train.jsonl not found!');
    console.error(`   Expected at: ${trainPath}`);
    console.error('   Run fetch_hf_datasets.ts first');
    process.exit(1);
  }

  // Load HuggingFace training data
  console.log(`📥 Loading HuggingFace data from ${trainPath}...`);
  const hfConversations = loadJsonl(trainPath);
  console.log(`   ✅ Loaded ${hfConversations.length} HF conversations`);

  let allConversations = [...hfConversations];
  const sources: DatasetSource[] = [];

  // Load existing sources if available
  if (fs.existsSync(sourcesPath)) {
    const existingSources = JSON.parse(fs.readFileSync(sourcesPath, 'utf-8'));
    if (Array.isArray(existingSources)) {
      sources.push(...existingSources);
    }
  }

  // Check if Google data exists
  if (fs.existsSync(googleDataPath)) {
    console.log(`\n📥 Loading Google data from ${googleDataPath}...`);
    const googleConversations = loadJsonl(googleDataPath);
    console.log(`   ✅ Loaded ${googleConversations.length} Google conversations`);

    // Merge
    allConversations.push(...googleConversations);
    console.log(`\n🔗 Merging datasets...`);
    console.log(`   HF conversations: ${hfConversations.length}`);
    console.log(`   Google conversations: ${googleConversations.length}`);
    console.log(`   Total before dedup: ${allConversations.length}`);

    // Add Google source to log
    sources.push({
      source: 'google_data',
      split: 'combined',
      rows: googleConversations.length,
      sha256: calculateSHA256(googleDataPath),
      timestamp: new Date().toISOString()
    });
  } else {
    console.log('\n⚠️  Google data not found, using HF data only');
    console.log(`   (${googleDataPath} does not exist)`);
  }

  // Deduplicate
  console.log('\n🔄 Deduplicating conversations...');
  const deduplicatedConversations = deduplicateConversations(allConversations);
  console.log(`   ✅ Removed ${allConversations.length - deduplicatedConversations.length} duplicates`);
  console.log(`   Final count: ${deduplicatedConversations.length} unique conversations`);

  // Fail if no conversations
  if (deduplicatedConversations.length === 0) {
    console.error('\n❌ CRITICAL: No conversations to save!');
    console.error('   Combined dataset cannot be empty');
    process.exit(1);
  }

  // Save combined dataset
  console.log(`\n💾 Saving combined dataset to ${combinedPath}...`);
  saveToJsonl(deduplicatedConversations, combinedPath);
  console.log(`   ✅ Saved ${deduplicatedConversations.length} conversations`);

  // Calculate checksum
  const combinedSha = calculateSHA256(combinedPath);
  const checksumPath = path.join(datasetsDir, 'combined.jsonl.sha256');
  fs.writeFileSync(checksumPath, combinedSha);
  console.log(`\n🔐 SHA256 checksum: ${combinedSha}`);
  console.log(`   Saved to: ${checksumPath}`);

  // Update sources log
  const combinedSourceEntry: DatasetSource = {
    source: 'combined_dataset',
    split: 'all',
    rows: deduplicatedConversations.length,
    sha256: combinedSha,
    timestamp: new Date().toISOString()
  };

  // Check if this entry already exists and update, or add new
  const existingCombinedIdx = sources.findIndex(s => s.source === 'combined_dataset');
  if (existingCombinedIdx >= 0) {
    sources[existingCombinedIdx] = combinedSourceEntry;
  } else {
    sources.push(combinedSourceEntry);
  }

  fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
  console.log(`\n📋 Updated dataset sources log: ${sourcesPath}`);

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('✅ Merge Complete!');
  console.log('='.repeat(70));
  console.log('\nDataset Summary:');
  sources.forEach(src => {
    console.log(`  - ${src.source} (${src.split}): ${src.rows} rows`);
  });
  console.log(`\nCombined dataset: ${deduplicatedConversations.length} conversations`);
  console.log(`Checksum: ${combinedSha}`);
  console.log();
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { loadJsonl, deduplicateConversations, calculateSHA256 };
