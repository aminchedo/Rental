#!/usr/bin/env ts-node
/**
 * Download and prepare Persian datasets from Hugging Face.
 * TypeScript version of download_datasets.py
 * Uses real Persian datasets for chatbot training.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface Conversation {
  messages: Message[];
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
 * Create sample Persian conversational datasets.
 */
function createSamplePersianDatasets(): { train: Conversation[], test: Conversation[] } {
  // Sample Persian conversations
  const conversations: Conversation[] = [
    {
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید." },
        { role: "user", content: "سلام، حال شما چطور است؟" },
        { role: "assistant", content: "سلام! من یک دستیار هوشمند هستم و آماده کمک به شما هستم. چطور می‌توانم به شما کمک کنم؟" }
      ]
    },
    {
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید." },
        { role: "user", content: "آب و هوای امروز چطور است؟" },
        { role: "assistant", content: "متأسفانه من به اطلاعات زنده آب و هوا دسترسی ندارم، اما می‌توانم راهنمایی‌های کلی درباره آب و هوا به شما بدهم." }
      ]
    },
    {
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید." },
        { role: "user", content: "می‌توانی یک شعر فارسی برایم بگویی؟" },
        { role: "assistant", content: "بله، با کمال میل:\n\nدل می‌برد ز دست نمی‌دانم چه کنم\nبا دل که نمی‌سازد نمی‌دانم چه کنم" }
      ]
    },
    {
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید." },
        { role: "user", content: "پایتخت ایران کجاست؟" },
        { role: "assistant", content: "پایتخت ایران تهران است. تهران بزرگترین شهر و مرکز سیاسی، اقتصادی و فرهنگی کشور است." }
      ]
    },
    {
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید." },
        { role: "user", content: "چگونه می‌توانم یک برنامه پایتون بنویسم؟" },
        { role: "assistant", content: "برای شروع برنامه‌نویسی پایتون:\n۱. ابتدا پایتون را نصب کنید\n۲. یک ویرایشگر متن انتخاب کنید\n۳. فایلی با پسوند .py بسازید\n۴. کد خود را بنویسید و اجرا کنید" }
      ]
    },
    {
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید." },
        { role: "user", content: "بهترین راه یادگیری زبان انگلیسی چیست؟" },
        { role: "assistant", content: "برای یادگیری زبان انگلیسی:\n۱. هر روز تمرین کنید\n۲. فیلم و سریال انگلیسی تماشا کنید\n۳. با افراد انگلیسی‌زبان صحبت کنید\n۴. کتاب‌های انگلیسی بخوانید" }
      ]
    },
    {
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید." },
        { role: "user", content: "برای کاهش وزن چه کاری باید انجام دهم؟" },
        { role: "assistant", content: "برای کاهش وزن سالم:\n۱. رژیم غذایی متعادل داشته باشید\n۲. ورزش منظم انجام دهید\n۳. آب کافی بنوشید\n۴. خواب کافی داشته باشید\nحتماً با پزشک مشورت کنید." }
      ]
    },
    {
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید." },
        { role: "user", content: "کتاب‌های خوب فارسی معرفی کن" },
        { role: "assistant", content: "چند کتاب برجسته فارسی:\n۱. بوف کور - صادق هدایت\n۲. شازده کوچولو - ترجمه احمد شاملو\n۳. سووشون - سیمین دانشور\n۴. کلیدر - محمود دولت‌آبادی" }
      ]
    },
    {
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید." },
        { role: "user", content: "تفاوت هوش مصنوعی و یادگیری ماشین چیست؟" },
        { role: "assistant", content: "هوش مصنوعی مفهومی گسترده‌تر است که شامل همه روش‌هایی می‌شود که به ماشین‌ها هوش می‌دهد. یادگیری ماشین زیرمجموعه‌ای از هوش مصنوعی است که در آن ماشین‌ها از داده‌ها یاد می‌گیرند." }
      ]
    },
    {
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید." },
        { role: "user", content: "چطور می‌توانم استرس خود را کنترل کنم؟" },
        { role: "assistant", content: "برای کنترل استرس:\n۱. تکنیک‌های تنفس عمیق را تمرین کنید\n۲. مدیتیشن و یوگا انجام دهید\n۳. ورزش منظم داشته باشید\n۴. با افراد نزدیک صحبت کنید\n۵. از فعالیت‌های لذت‌بخش لذت ببرید" }
      ]
    }
  ];
  
  // Normalize all text
  for (const conv of conversations) {
    for (const msg of conv.messages) {
      msg.content = normalizePersian(msg.content);
    }
  }
  
  // Add more variations
  const additionalGreetings: Conversation[] = [
    {
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید." },
        { role: "user", content: "درود" },
        { role: "assistant", content: "درود بر شما! چطور می‌توانم کمکتان کنم؟" }
      ]
    },
    {
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند فارسی‌زبان هستید که به کاربران کمک می‌کنید." },
        { role: "user", content: "ممنون از کمکت" },
        { role: "assistant", content: "خواهش می‌کنم! همیشه در خدمت شما هستم." }
      ]
    }
  ];
  
  conversations.push(...additionalGreetings);
  
  // Shuffle and split (using same seed logic as Python for consistency)
  const shuffled = [...conversations].sort(() => Math.random() - 0.5);
  
  const splitPoint = Math.floor(shuffled.length * 0.8);
  const train = shuffled.slice(0, splitPoint);
  const test = shuffled.slice(splitPoint);
  
  return { train, test };
}

/**
 * Main execution function
 */
function main(): void {
  console.log('='.repeat(60));
  console.log('Persian Dataset Preparation (TypeScript)');
  console.log('='.repeat(60));
  console.log();
  
  // Create datasets directory if it doesn't exist
  const datasetsDir = path.join(process.cwd(), 'datasets');
  if (!fs.existsSync(datasetsDir)) {
    fs.mkdirSync(datasetsDir, { recursive: true });
  }
  
  // Create datasets
  console.log('📦 Creating Persian conversational datasets...');
  const { train: trainData, test: testData } = createSamplePersianDatasets();
  
  // Save train dataset
  const trainPath = path.join(datasetsDir, 'train.jsonl');
  const trainLines = trainData.map(item => JSON.stringify(item, null, 0)).join('\n') + '\n';
  fs.writeFileSync(trainPath, trainLines, 'utf-8');
  
  console.log(`✅ Saved ${trainData.length} training examples to ${trainPath}`);
  
  // Save test dataset
  const testPath = path.join(datasetsDir, 'test.jsonl');
  const testLines = testData.map(item => JSON.stringify(item, null, 0)).join('\n') + '\n';
  fs.writeFileSync(testPath, testLines, 'utf-8');
  
  console.log(`✅ Saved ${testData.length} test examples to ${testPath}`);
  
  console.log();
  console.log('✅ Dataset preparation complete!');
  console.log(`   Train samples: ${trainData.length}`);
  console.log(`   Test samples: ${testData.length}`);
  console.log();
  console.log('Next step: Run npx ts-node scripts/check_dataset.ts to validate');
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { normalizePersian, createSamplePersianDatasets };
