/**
 * Internationalization (i18n) Configuration
 * 
 * Default: Persian (fa-IR)
 * Fallback: English (en-US)
 */

export type Locale = 'fa' | 'en';

export interface TranslationKeys {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    search: string;
    filter: string;
    export: string;
    import: string;
  };
  
  // Navigation
  nav: {
    home: string;
    experiments: string;
    liveMonitor: string;
    playground: string;
    datasets: string;
    settings: string;
    reports: string;
  };
  
  // Experiments
  experiments: {
    title: string;
    runId: string;
    dataset: string;
    hyperparams: string;
    status: string;
    metrics: string;
    startTime: string;
    endTime: string;
    notes: string;
    tags: string;
    loss: string;
    perplexity: string;
    latency: string;
  };
  
  // Monitor
  monitor: {
    title: string;
    liveMetrics: string;
    streamingLogs: string;
    gpuMemory: string;
    cpuUsage: string;
    queueDepth: string;
    errorRate: string;
    throughput: string;
  };
  
  // Playground
  playground: {
    title: string;
    userMessage: string;
    modelResponse: string;
    tokenStream: string;
    context: string;
    settings: string;
    temperature: string;
    maxTokens: string;
    topP: string;
    retrievalEnabled: string;
  };
  
  // Settings
  settings: {
    title: string;
    appearance: string;
    language: string;
    theme: string;
    fontSize: string;
    density: string;
    apiEndpoint: string;
    apiKey: string;
    alerts: string;
    thresholds: string;
  };
}

export const translations: Record<Locale, TranslationKeys> = {
  fa: {
    common: {
      loading: 'در حال بارگذاری...',
      error: 'خطا',
      success: 'موفق',
      save: 'ذخیره',
      cancel: 'لغو',
      delete: 'حذف',
      edit: 'ویرایش',
      close: 'بستن',
      search: 'جستجو',
      filter: 'فیلتر',
      export: 'خروجی',
      import: 'ورودی',
    },
    nav: {
      home: 'خانه',
      experiments: 'آزمایش‌ها',
      liveMonitor: 'مانیتور زنده',
      playground: 'محیط تست',
      datasets: 'مجموعه داده‌ها',
      settings: 'تنظیمات',
      reports: 'گزارش‌ها',
    },
    experiments: {
      title: 'آزمایش‌های مدل',
      runId: 'شناسه اجرا',
      dataset: 'مجموعه داده',
      hyperparams: 'پارامترها',
      status: 'وضعیت',
      metrics: 'معیارها',
      startTime: 'زمان شروع',
      endTime: 'زمان پایان',
      notes: 'یادداشت‌ها',
      tags: 'برچسب‌ها',
      loss: 'خطا',
      perplexity: 'پرپلکسیتی',
      latency: 'تاخیر',
    },
    monitor: {
      title: 'مانیتورینگ زنده',
      liveMetrics: 'معیارهای زنده',
      streamingLogs: 'لاگ‌های جاری',
      gpuMemory: 'حافظه GPU',
      cpuUsage: 'استفاده CPU',
      queueDepth: 'عمق صف',
      errorRate: 'نرخ خطا',
      throughput: 'توان عملیاتی',
    },
    playground: {
      title: 'محیط آزمایش',
      userMessage: 'پیام کاربر',
      modelResponse: 'پاسخ مدل',
      tokenStream: 'جریان توکن',
      context: 'متن زمینه',
      settings: 'تنظیمات',
      temperature: 'دما',
      maxTokens: 'حداکثر توکن',
      topP: 'Top-P',
      retrievalEnabled: 'بازیابی فعال',
    },
    settings: {
      title: 'تنظیمات',
      appearance: 'ظاهر',
      language: 'زبان',
      theme: 'تم',
      fontSize: 'اندازه فونت',
      density: 'تراکم',
      apiEndpoint: 'آدرس API',
      apiKey: 'کلید API',
      alerts: 'هشدارها',
      thresholds: 'آستانه‌ها',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
    },
    nav: {
      home: 'Home',
      experiments: 'Experiments',
      liveMonitor: 'Live Monitor',
      playground: 'Playground',
      datasets: 'Datasets',
      settings: 'Settings',
      reports: 'Reports',
    },
    experiments: {
      title: 'Model Experiments',
      runId: 'Run ID',
      dataset: 'Dataset',
      hyperparams: 'Hyperparameters',
      status: 'Status',
      metrics: 'Metrics',
      startTime: 'Start Time',
      endTime: 'End Time',
      notes: 'Notes',
      tags: 'Tags',
      loss: 'Loss',
      perplexity: 'Perplexity',
      latency: 'Latency',
    },
    monitor: {
      title: 'Live Monitor',
      liveMetrics: 'Live Metrics',
      streamingLogs: 'Streaming Logs',
      gpuMemory: 'GPU Memory',
      cpuUsage: 'CPU Usage',
      queueDepth: 'Queue Depth',
      errorRate: 'Error Rate',
      throughput: 'Throughput',
    },
    playground: {
      title: 'Playground',
      userMessage: 'User Message',
      modelResponse: 'Model Response',
      tokenStream: 'Token Stream',
      context: 'Context',
      settings: 'Settings',
      temperature: 'Temperature',
      maxTokens: 'Max Tokens',
      topP: 'Top-P',
      retrievalEnabled: 'Retrieval Enabled',
    },
    settings: {
      title: 'Settings',
      appearance: 'Appearance',
      language: 'Language',
      theme: 'Theme',
      fontSize: 'Font Size',
      density: 'Density',
      apiEndpoint: 'API Endpoint',
      apiKey: 'API Key',
      alerts: 'Alerts',
      thresholds: 'Thresholds',
    },
  },
};

// i18n hook
export function useTranslation(locale: Locale = 'fa') {
  const t = translations[locale];
  return { t, locale };
}

export default translations;
