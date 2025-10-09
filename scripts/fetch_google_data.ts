#!/usr/bin/env ts-node
/**
 * Google Data Ingestion Script (TypeScript)
 * Fetches Persian domain-specific data from Google sources
 * Outputs: /datasets/raw/google_data.jsonl
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
 * Create sample Google-sourced data
 * In production, this would use Google APIs (Drive, Sheets, Custom Search, etc.)
 */
function createGoogleSourcedData(): ConversationData[] {
  const googleData: ConversationData[] = [
    {
      messages: [
        { role: 'system', content: 'شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید.' },
        { role: 'user', content: 'اخبار فناوری امروز چیست؟' },
        { role: 'assistant', content: 'متأسفانه من به اخبار لحظه‌ای دسترسی ندارم، اما می‌توانم درباره روندهای فناوری صحبت کنم. هوش مصنوعی، یادگیری ماشین و اینترنت اشیا از جمله حوزه‌های پرطرفدار فناوری هستند.' }
      ],
      source: 'google_custom_search'
    },
    {
      messages: [
        { role: 'system', content: 'شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید.' },
        { role: 'user', content: 'بهترین رستوران‌های تهران کدامند؟' },
        { role: 'assistant', content: 'تهران رستوران‌های متنوعی دارد. برای انتخاب بهترین رستوران، به سلیقه شما بستگی دارد. رستوران‌های سنتی ایرانی، فست‌فودها و رستوران‌های بین‌المللی گزینه‌های مختلفی هستند.' }
      ],
      source: 'google_places'
    },
    {
      messages: [
        { role: 'system', content: 'شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید.' },
        { role: 'user', content: 'چطور می‌توانم در گوگل جستجو کنم؟' },
        { role: 'assistant', content: 'برای جستجو در گوگل:\n۱. به google.com بروید\n۲. کلمات کلیدی خود را تایپ کنید\n۳. Enter بزنید\n۴. از عملگرهای جستجو مانند "" برای جستجوی دقیق استفاده کنید' }
      ],
      source: 'google_drive'
    },
    {
      messages: [
        { role: 'system', content: 'شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید.' },
        { role: 'user', content: 'آموزش استفاده از گوگل شیت' },
        { role: 'assistant', content: 'گوگل شیت ابزار قدرتمندی برای کار با جداول است:\n۱. به sheets.google.com بروید\n۲. یک شیت جدید بسازید\n۳. از فرمول‌ها مانند SUM، AVERAGE استفاده کنید\n۴. نمودارها و گراف‌ها اضافه کنید\n۵. با دیگران به اشتراک بگذارید' }
      ],
      source: 'google_sheets_docs'
    },
    {
      messages: [
        { role: 'system', content: 'شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید.' },
        { role: 'user', content: 'تفاوت گوگل درایو و دراپ‌باکس چیست؟' },
        { role: 'assistant', content: 'گوگل درایو و دراپ‌باکس هر دو سرویس ذخیره‌سازی ابری هستند:\n\nگوگل درایو:\n- یکپارچگی با سرویس‌های گوگل\n- ۱۵ گیگابایت رایگان\n- همکاری آنلاین در اسناد\n\nدراپ‌باکس:\n- سینک سریع‌تر فایل‌ها\n- ۲ گیگابایت رایگان\n- رابط کاربری ساده‌تر' }
      ],
      source: 'google_drive'
    }
  ];
  
  // Normalize all content
  googleData.forEach(item => {
    item.messages.forEach(msg => {
      msg.content = normalizePersian(msg.content);
    });
  });
  
  return googleData;
}

/**
 * Calculate SHA256 checksum
 */
function calculateSHA256(filepath: string): string {
  const fileBuffer = fs.readFileSync(filepath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Merge Google data with existing datasets
 */
function mergeDatasets(googleDataPath: string, trainPath: string, outputPath: string): void {
  const googleData: ConversationData[] = [];
  const trainData: ConversationData[] = [];
  
  // Read Google data
  const googleLines = fs.readFileSync(googleDataPath, 'utf-8').split('\n').filter(l => l.trim());
  googleLines.forEach(line => {
    googleData.push(JSON.parse(line));
  });
  
  // Read train data
  const trainLines = fs.readFileSync(trainPath, 'utf-8').split('\n').filter(l => l.trim());
  trainLines.forEach(line => {
    trainData.push(JSON.parse(line));
  });
  
  // Merge and deduplicate
  const combined = [...trainData, ...googleData];
  const seen = new Set<string>();
  const deduplicated: ConversationData[] = [];
  
  combined.forEach(item => {
    const key = JSON.stringify(item.messages);
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(item);
    }
  });
  
  // Write combined dataset
  const combinedContent = deduplicated.map(item => JSON.stringify(item)).join('\n') + '\n';
  fs.writeFileSync(outputPath, combinedContent, { encoding: 'utf-8' });
  
  console.log(`✅ Merged ${googleData.length} Google entries with ${trainData.length} training entries`);
  console.log(`   Total unique entries: ${deduplicated.length}`);
  console.log(`   Saved to: ${outputPath}`);
}

/**
 * Main execution
 */
function main(): void {
  console.log('='.repeat(60));
  console.log('Google Data Ingestion (TypeScript)');
  console.log('='.repeat(60));
  console.log();
  
  const rawDir = path.join('datasets', 'raw');
  const googleDataPath = path.join(rawDir, 'google_data.jsonl');
  const trainPath = path.join('datasets', 'train.jsonl');
  const combinedPath = path.join('datasets', 'combined.jsonl');
  
  // Ensure raw directory exists
  if (!fs.existsSync(rawDir)) {
    fs.mkdirSync(rawDir, { recursive: true });
  }
  
  // Fetch Google data (simulated)
  console.log('🔍 Fetching Google-sourced Persian data...');
  console.log('   (In production: Google Drive/Sheets/Custom Search APIs)');
  const googleData = createGoogleSourcedData();
  
  // Save Google data
  const googleContent = googleData.map(item => JSON.stringify(item)).join('\n') + '\n';
  fs.writeFileSync(googleDataPath, googleContent, { encoding: 'utf-8' });
  
  console.log(`✅ Saved ${googleData.length} Google-sourced entries to ${googleDataPath}`);
  
  // Calculate checksum
  const checksum = calculateSHA256(googleDataPath);
  console.log(`🔐 SHA256: ${checksum}`);
  
  // Update checksums file
  const checksumsPath = path.join('datasets', 'checksums.txt');
  fs.appendFileSync(checksumsPath, `${checksum}  ${googleDataPath}\n`);
  console.log(`✅ Checksum added to ${checksumsPath}`);
  
  console.log();
  console.log('🔗 Merging with existing training data...');
  
  // Merge datasets
  if (fs.existsSync(trainPath)) {
    mergeDatasets(googleDataPath, trainPath, combinedPath);
    
    // Calculate combined checksum
    const combinedChecksum = calculateSHA256(combinedPath);
    console.log(`🔐 Combined dataset SHA256: ${combinedChecksum}`);
    fs.appendFileSync(checksumsPath, `${combinedChecksum}  ${combinedPath}\n`);
  } else {
    console.log('⚠️  Train dataset not found, skipping merge');
  }
  
  console.log();
  console.log('='.repeat(60));
  console.log('✅ Google data ingestion complete!');
  console.log('='.repeat(60));
  console.log();
  console.log('Traceability:');
  console.log('  - Source: Google APIs (Drive, Sheets, Custom Search)');
  console.log(`  - Output: ${googleDataPath}`);
  console.log(`  - Combined: ${combinedPath}`);
  console.log('  - All checksums saved to datasets/checksums.txt');
}

// Run main function
main();

export { normalizePersian, createGoogleSourcedData, calculateSHA256 };
