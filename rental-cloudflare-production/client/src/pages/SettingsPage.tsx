import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Mail, 
  MessageCircle, 
  Phone, 
  Save, 
  TestTube2,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationSettings {
  email_enabled: boolean;
  telegram_enabled: boolean;
  whatsapp_enabled: boolean;
  email_from: string;
  email_host: string;
  email_port: number;
  email_username: string;
  email_password: string;
  telegram_chat_id: string;
  whatsapp_number: string;
  notify_on_contract_created: boolean;
  notify_on_contract_signed: boolean;
  notify_on_contract_expired: boolean;
  notify_on_payment_due: boolean;
}

interface SystemSettings {
  app_name: string;
  default_currency: string;
  late_fee_percentage: number;
  contract_renewal_notice_days: number;
  max_file_upload_size: number;
}

interface SettingsPageProps {
  addNotification: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ addNotification }) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingService, setTestingService] = useState<string | null>(null);
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_enabled: false,
    telegram_enabled: false,
    whatsapp_enabled: false,
    email_from: '',
    email_host: 'smtp.gmail.com',
    email_port: 587,
    email_username: '',
    email_password: '',
    telegram_chat_id: '',
    whatsapp_number: '',
    notify_on_contract_created: true,
    notify_on_contract_signed: true,
    notify_on_contract_expired: true,
    notify_on_payment_due: true,
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    app_name: 'سیستم مدیریت املاک',
    default_currency: 'تومان',
    late_fee_percentage: 5.0,
    contract_renewal_notice_days: 30,
    max_file_upload_size: 10485760,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(data.notifications);
        setSystemSettings(data.system);
      } else {
        throw new Error('خطا در دریافت تنظیمات');
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      addNotification('خطا در دریافت تنظیمات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifications: notificationSettings,
          system: systemSettings,
        }),
      });

      if (response.ok) {
        toast.success('تنظیمات با موفقیت ذخیره شد');
        addNotification('تنظیمات با موفقیت ذخیره شد', 'success');
      } else {
        throw new Error('خطا در ذخیره تنظیمات');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('خطا در ذخیره تنظیمات');
      addNotification('خطا در ذخیره تنظیمات', 'error');
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async (service: 'email' | 'telegram' | 'whatsapp') => {
    setTestingService(service);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`تست ${service} با موفقیت انجام شد`);
        addNotification(`تست ${service} با موفقیت انجام شد`, 'success');
      } else {
        throw new Error(data.message || 'خطا در تست');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error(`خطا در تست ${service}`);
      addNotification(`خطا در تست ${service}`, 'error');
    } finally {
      setTestingService(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری تنظیمات...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'notifications', label: 'اعلان‌ها', icon: Bell },
    { id: 'email', label: 'ایمیل', icon: Mail },
    { id: 'telegram', label: 'تلگرام', icon: MessageCircle },
    { id: 'whatsapp', label: 'واتساپ', icon: Phone },
    { id: 'system', label: 'سیستم', icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تنظیمات سیستم</h1>
        <p className="text-gray-600">مدیریت تنظیمات اعلان‌ها و پیکربندی سیستم</p>
      </div>

      <div className="bg-white rounded-lg shadow-soft border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 space-x-reverse transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">تنظیمات اعلان‌ها</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">اعلان ایجاد قرارداد</h4>
                      <p className="text-sm text-gray-600">هنگام ایجاد قرارداد جدید اعلان ارسال شود</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.notify_on_contract_created}
                        onChange={(e) =>
                          setNotificationSettings(prev => ({
                            ...prev,
                            notify_on_contract_created: e.target.checked
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">اعلان امضای قرارداد</h4>
                      <p className="text-sm text-gray-600">هنگام امضای قرارداد اعلان ارسال شود</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.notify_on_contract_signed}
                        onChange={(e) =>
                          setNotificationSettings(prev => ({
                            ...prev,
                            notify_on_contract_signed: e.target.checked
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">اعلان انقضای قرارداد</h4>
                      <p className="text-sm text-gray-600">قبل از انقضای قرارداد اعلان ارسال شود</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.notify_on_contract_expired}
                        onChange={(e) =>
                          setNotificationSettings(prev => ({
                            ...prev,
                            notify_on_contract_expired: e.target.checked
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">اعلان سررسید پرداخت</h4>
                      <p className="text-sm text-gray-600">هنگام سررسید پرداخت اجاره اعلان ارسال شود</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.notify_on_payment_due}
                        onChange={(e) =>
                          setNotificationSettings(prev => ({
                            ...prev,
                            notify_on_payment_due: e.target.checked
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">تنظیمات ایمیل</h3>
                  <p className="text-sm text-gray-600">پیکربندی سرویس ارسال ایمیل</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.email_enabled}
                    onChange={(e) =>
                      setNotificationSettings(prev => ({
                        ...prev,
                        email_enabled: e.target.checked
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {notificationSettings.email_enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">آدرس ایمیل فرستنده</label>
                    <input
                      type="email"
                      value={notificationSettings.email_from}
                      onChange={(e) =>
                        setNotificationSettings(prev => ({
                          ...prev,
                          email_from: e.target.value
                        }))
                      }
                      className="form-input"
                      placeholder="sender@example.com"
                    />
                  </div>

                  <div>
                    <label className="form-label">سرور SMTP</label>
                    <input
                      type="text"
                      value={notificationSettings.email_host}
                      onChange={(e) =>
                        setNotificationSettings(prev => ({
                          ...prev,
                          email_host: e.target.value
                        }))
                      }
                      className="form-input"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <label className="form-label">پورت SMTP</label>
                    <input
                      type="number"
                      value={notificationSettings.email_port}
                      onChange={(e) =>
                        setNotificationSettings(prev => ({
                          ...prev,
                          email_port: parseInt(e.target.value) || 587
                        }))
                      }
                      className="form-input"
                      placeholder="587"
                    />
                  </div>

                  <div>
                    <label className="form-label">نام کاربری</label>
                    <input
                      type="text"
                      value={notificationSettings.email_username}
                      onChange={(e) =>
                        setNotificationSettings(prev => ({
                          ...prev,
                          email_username: e.target.value
                        }))
                      }
                      className="form-input"
                      placeholder="username@example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">رمز عبور</label>
                    <input
                      type="password"
                      value={notificationSettings.email_password}
                      onChange={(e) =>
                        setNotificationSettings(prev => ({
                          ...prev,
                          email_password: e.target.value
                        }))
                      }
                      className="form-input"
                      placeholder="رمز عبور یا کلید API"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      onClick={() => testNotification('email')}
                      disabled={testingService === 'email'}
                      className="btn-outline-primary"
                    >
                      {testingService === 'email' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                          در حال تست...
                        </>
                      ) : (
                        <>
                          <TestTube2 className="w-4 h-4 ml-2" />
                          ارسال ایمیل تست
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Telegram Tab */}
          {activeTab === 'telegram' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">تنظیمات تلگرام</h3>
                  <p className="text-sm text-gray-600">پیکربندی ربات تلگرام برای ارسال اعلان‌ها</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.telegram_enabled}
                    onChange={(e) =>
                      setNotificationSettings(prev => ({
                        ...prev,
                        telegram_enabled: e.target.checked
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {notificationSettings.telegram_enabled && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-500 ml-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">راهنمای تنظیم ربات تلگرام</h4>
                        <div className="text-sm text-blue-700 mt-1">
                          <ol className="list-decimal list-inside space-y-1">
                            <li>در تلگرام @BotFather را پیدا کنید</li>
                            <li>دستور /newbot را ارسال کنید</li>
                            <li>نام و نام کاربری ربات را تعیین کنید</li>
                            <li>توکن دریافتی را در فیلد زیر وارد کنید</li>
                            <li>Chat ID کانال یا گروه خود را وارد کنید</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">شناسه چت (Chat ID)</label>
                    <input
                      type="text"
                      value={notificationSettings.telegram_chat_id}
                      onChange={(e) =>
                        setNotificationSettings(prev => ({
                          ...prev,
                          telegram_chat_id: e.target.value
                        }))
                      }
                      className="form-input"
                      placeholder="@channel_name یا -1001234567890"
                    />
                    <p className="form-help">
                      شناسه کانال، گروه یا کاربر برای ارسال پیام
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={() => testNotification('telegram')}
                      disabled={testingService === 'telegram'}
                      className="btn-outline-primary"
                    >
                      {testingService === 'telegram' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                          در حال تست...
                        </>
                      ) : (
                        <>
                          <TestTube2 className="w-4 h-4 ml-2" />
                          ارسال پیام تست
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">تنظیمات واتساپ</h3>
                  <p className="text-sm text-gray-600">پیکربندی واتساپ از طریق Twilio API</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.whatsapp_enabled}
                    onChange={(e) =>
                      setNotificationSettings(prev => ({
                        ...prev,
                        whatsapp_enabled: e.target.checked
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {notificationSettings.whatsapp_enabled && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-green-500 ml-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">راهنمای تنظیم واتساپ</h4>
                        <div className="text-sm text-green-700 mt-1">
                          <ol className="list-decimal list-inside space-y-1">
                            <li>حساب Twilio ایجاد کنید</li>
                            <li>سرویس WhatsApp را فعال کنید</li>
                            <li>Account SID و Auth Token را از داشبورد کپی کنید</li>
                            <li>شماره تلفن مقصد را وارد کنید</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">شماره تلفن</label>
                    <input
                      type="tel"
                      value={notificationSettings.whatsapp_number}
                      onChange={(e) =>
                        setNotificationSettings(prev => ({
                          ...prev,
                          whatsapp_number: e.target.value
                        }))
                      }
                      className="form-input"
                      placeholder="+989123456789"
                    />
                    <p className="form-help">
                      شماره تلفن برای دریافت پیام‌ها (با کد کشور)
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={() => testNotification('whatsapp')}
                      disabled={testingService === 'whatsapp'}
                      className="btn-outline-primary"
                    >
                      {testingService === 'whatsapp' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                          در حال تست...
                        </>
                      ) : (
                        <>
                          <TestTube2 className="w-4 h-4 ml-2" />
                          ارسال پیام تست
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">تنظیمات سیستم</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">نام سیستم</label>
                    <input
                      type="text"
                      value={systemSettings.app_name}
                      onChange={(e) =>
                        setSystemSettings(prev => ({
                          ...prev,
                          app_name: e.target.value
                        }))
                      }
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">واحد پول</label>
                    <input
                      type="text"
                      value={systemSettings.default_currency}
                      onChange={(e) =>
                        setSystemSettings(prev => ({
                          ...prev,
                          default_currency: e.target.value
                        }))
                      }
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">درصد جریمه تأخیر (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={systemSettings.late_fee_percentage}
                      onChange={(e) =>
                        setSystemSettings(prev => ({
                          ...prev,
                          late_fee_percentage: parseFloat(e.target.value) || 0
                        }))
                      }
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">روز اعلان تمدید قرارداد</label>
                    <input
                      type="number"
                      value={systemSettings.contract_renewal_notice_days}
                      onChange={(e) =>
                        setSystemSettings(prev => ({
                          ...prev,
                          contract_renewal_notice_days: parseInt(e.target.value) || 0
                        }))
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">حداکثر حجم آپلود فایل (مگابایت)</label>
                    <input
                      type="number"
                      value={Math.round(systemSettings.max_file_upload_size / 1024 / 1024)}
                      onChange={(e) =>
                        setSystemSettings(prev => ({
                          ...prev,
                          max_file_upload_size: (parseInt(e.target.value) || 10) * 1024 * 1024
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  ذخیره تنظیمات
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;