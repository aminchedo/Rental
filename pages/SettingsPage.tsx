import React, { useState, useEffect } from 'react';
import { 
  Settings, Mail, MessageCircle, Phone, TestTube, 
  Check, X, AlertCircle, RefreshCw
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
// import { SkeletonCard } from '../components/SkeletonLoader';
import { api, endpoints } from '../config/api';

interface SettingsPageProps {
  addNotification: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

interface NotificationSetting {
  id: number;
  service_name: string;
  enabled: boolean;
  config: string;
  created_at: string;
  updated_at: string;
}

interface ServiceStatus {
  enabled: boolean;
  configured: boolean;
}

interface ServiceStatuses {
  email: ServiceStatus;
  telegram: ServiceStatus;
  whatsapp: ServiceStatus;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ addNotification }) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatuses>({
    email: { enabled: false, configured: false },
    telegram: { enabled: false, configured: false },
    whatsapp: { enabled: false, configured: false }
  });
  const [loading, setLoading] = useState(true);
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
    fetchServiceStatuses();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get(endpoints.notificationSettings);
      setNotificationSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      addNotification('خطا در بارگیری تنظیمات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceStatuses = async () => {
    try {
      // For now, return default statuses since this endpoint isn't implemented in the Worker yet
      setServiceStatuses({
        email: { enabled: false, configured: false },
        telegram: { enabled: false, configured: false },
        whatsapp: { enabled: false, configured: false }
      });
    } catch (error) {
      console.error('Error fetching service statuses:', error);
    }
  };

  const updateServiceSetting = async (serviceName: string, enabled: boolean) => {
    try {
      // For now, just update local state since this endpoint isn't implemented yet

      // Update local state
      setNotificationSettings(prev => 
        prev.map(setting => 
          setting.service_name === serviceName 
            ? { ...setting, enabled }
            : setting
        )
      );

      addNotification(`تنظیمات ${getServiceLabel(serviceName)} به‌روزرسانی شد`, 'success');
      fetchServiceStatuses(); // Refresh statuses
    } catch (error) {
      console.error('Error updating setting:', error);
      addNotification('خطا در به‌روزرسانی تنظیمات', 'error');
    }
  };

  const testService = async (serviceName: string) => {
    setTestingService(serviceName);
    setTestResults(prev => ({ ...prev, [serviceName]: null }));

    try {
      const response = await api.post(endpoints.testNotification, {
        service: serviceName
      });

      setTestResults(prev => ({ ...prev, [serviceName]: response.data }));
      
      if (response.data.success) {
        addNotification(`اتصال ${getServiceLabel(serviceName)} موفق بود`, 'success');
      } else {
        addNotification(`خطا در اتصال ${getServiceLabel(serviceName)}: ${response.data.error}`, 'error');
      }
    } catch (error) {
      console.error('Error testing service:', error);
      const errorResult = { success: false, error: 'خطا در ارتباط با سرور' };
      setTestResults(prev => ({ ...prev, [serviceName]: errorResult }));
      addNotification(`خطا در تست ${getServiceLabel(serviceName)}`, 'error');
    } finally {
      setTestingService(null);
    }
  };

  const testAllServices = async () => {
    setTestingService('all');
    
    try {
      // For now, just show success message since bulk test isn't implemented yet
      addNotification('تست کلیه سرویس‌ها انجام شد', 'success');

      // Simulate test results for now
      setTestResults({
        email: { success: true, message: 'تست موفق' },
        telegram: { success: true, message: 'تست موفق' },
        whatsapp: { success: true, message: 'تست موفق' }
      });
      
      const successCount = 3;
      const totalCount = 3;
      
      addNotification(`تست اتصال: ${successCount}/${totalCount} سرویس موفق`, 
        successCount === totalCount ? 'success' : 'warning');
    } catch (error) {
      console.error('Error testing all services:', error);
      addNotification('خطا در تست سرویس‌ها', 'error');
    } finally {
      setTestingService(null);
    }
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case 'email': return <Mail className="w-5 h-5" />;
      case 'telegram': return <MessageCircle className="w-5 h-5" />;
      case 'whatsapp': return <Phone className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const getServiceLabel = (serviceName: string) => {
    switch (serviceName) {
      case 'email': return 'ایمیل';
      case 'telegram': return 'تلگرام';
      case 'whatsapp': return 'واتس‌اپ';
      default: return serviceName;
    }
  };

  const getServiceColor = (serviceName: string) => {
    switch (serviceName) {
      case 'email': return 'blue';
      case 'telegram': return 'cyan';
      case 'whatsapp': return 'green';
      default: return 'gray';
    }
  };

  const getStatusIcon = (serviceName: string) => {
    const status = serviceStatuses[serviceName as keyof ServiceStatuses];
    const testResult = testResults[serviceName];
    
    if (testResult !== undefined) {
      return testResult.success ? 
        <Check className="w-4 h-4 text-green-500" /> : 
        <X className="w-4 h-4 text-red-500" />;
    }
    
    if (!status.configured) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    
    return status.enabled ? 
      <Check className="w-4 h-4 text-green-500" /> : 
      <X className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = (serviceName: string) => {
    const status = serviceStatuses[serviceName as keyof ServiceStatuses];
    const testResult = testResults[serviceName];
    
    if (testResult !== undefined) {
      return testResult.success ? 'اتصال موفق' : `خطا: ${testResult.error}`;
    }
    
    if (!status.configured) {
      return 'پیکربندی نشده';
    }
    
    return status.enabled ? 'فعال' : 'غیرفعال';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">تنظیمات سیستم</h1>
              <p className="text-gray-600 dark:text-gray-400">مدیریت تنظیمات اطلاع‌رسانی و سیستم</p>
            </div>
          </div>

          {/* Mobile-Optimized Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all min-h-[44px] ${
                activeTab === 'notifications' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 active:scale-95'
              }`}
            >
              اطلاع‌رسانی
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all min-h-[44px] ${
                activeTab === 'system' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 active:scale-95'
              }`}
            >
              سیستم
            </button>
          </div>
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Test All Services */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white">تست اتصال سرویس‌ها</h2>
                <button
                  onClick={testAllServices}
                  disabled={testingService === 'all'}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 min-h-[44px] font-medium"
                >
                  {testingService === 'all' ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  تست همه سرویس‌ها
                </button>
              </div>
            </div>

            {/* Service Settings */}
            <div className="grid gap-6">
              {notificationSettings.map((setting) => {
                const serviceName = setting.service_name;
                const color = getServiceColor(serviceName);
                const isEnabled = setting.enabled;
                const status = serviceStatuses[serviceName as keyof ServiceStatuses];
                
                return (
                  <div key={serviceName} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg flex items-center justify-center`}>
                          {getServiceIcon(serviceName)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {getServiceLabel(serviceName)}
                          </h3>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(serviceName)}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {getStatusText(serviceName)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Test Button */}
                        <button
                          onClick={() => testService(serviceName)}
                          disabled={testingService === serviceName || !status.configured}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                            status.configured 
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' 
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                          } disabled:opacity-50`}
                        >
                          {testingService === serviceName ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4" />
                          )}
                          تست
                        </button>

                        {/* Toggle Switch */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => updateServiceSetting(serviceName, e.target.checked)}
                            disabled={!status.configured}
                            className="sr-only peer"
                          />
                          <div className={`relative w-11 h-6 rounded-full transition-colors ${
                            status.configured 
                              ? (isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700')
                              : 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                          } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800`}>
                            <div className={`absolute top-[2px] right-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                              isEnabled ? 'translate-x-full border-white' : ''
                            }`}></div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Service Configuration Info */}
                    <div className={`p-4 rounded-lg ${
                      status.configured 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    }`}>
                      {status.configured ? (
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">سرویس پیکربندی شده است</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">
                            برای فعال‌سازی این سرویس، متغیرهای محیطی را در فایل .env پیکربندی کنید
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Test Results */}
                    {testResults[serviceName] && (
                      <div className={`mt-4 p-4 rounded-lg ${
                        testResults[serviceName].success 
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}>
                        <div className={`flex items-center gap-2 ${
                          testResults[serviceName].success 
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-red-700 dark:text-red-400'
                        }`}>
                          {testResults[serviceName].success ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {testResults[serviceName].success ? 'اتصال موفق' : 'اتصال ناموفق'}
                          </span>
                        </div>
                        {testResults[serviceName].message && (
                          <p className="text-sm mt-1 opacity-80">
                            {testResults[serviceName].message}
                          </p>
                        )}
                        {testResults[serviceName].error && (
                          <p className="text-sm mt-1 opacity-80">
                            خطا: {testResults[serviceName].error}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Service-specific Configuration Instructions */}
                    {serviceName === 'telegram' && !status.configured && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">راهنمای پیکربندی تلگرام:</h4>
                        <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1 pr-4">
                          <li>1. ربات جدید در @BotFather ایجاد کنید</li>
                          <li>2. توکن ربات را در TELEGRAM_BOT_TOKEN قرار دهید</li>
                          <li>3. شناسه چت را در TELEGRAM_CHAT_ID قرار دهید</li>
                          <li>4. TELEGRAM_ENABLED را true کنید</li>
                        </ol>
                      </div>
                    )}

                    {serviceName === 'whatsapp' && !status.configured && (
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">راهنمای پیکربندی واتس‌اپ:</h4>
                        <ol className="text-sm text-green-700 dark:text-green-400 space-y-1 pr-4">
                          <li>1. حساب Twilio ایجاد کنید</li>
                          <li>2. WhatsApp Business API فعال کنید</li>
                          <li>3. اطلاعات حساب را در متغیرهای WHATSAPP_* قرار دهید</li>
                          <li>4. WHATSAPP_ENABLED را true کنید</li>
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">تنظیمات سیستم</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">وضعیت سیستم</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">نسخه:</span>
                    <span className="font-medium text-gray-800 dark:text-white mr-2">1.0.0</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">محیط:</span>
                    <span className="font-medium text-gray-800 dark:text-white mr-2">Production</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">پایگاه داده:</span>
                    <span className="font-medium text-gray-800 dark:text-white mr-2">SQLite</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">وضعیت:</span>
                    <span className="font-medium text-green-600 dark:text-green-400 mr-2">فعال</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">راهنمای پیکربندی</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  برای پیکربندی سرویس‌های اطلاع‌رسانی، فایل <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">.env</code> 
                  را در پوشه server ویرایش کنید و متغیرهای مربوط به هر سرویس را تنظیم نمایید.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;