import React from 'react';
import { Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
}

interface NotificationsPageProps {
  notifications: Notification[];
  onClearNotifications: () => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ 
  notifications, 
  onClearNotifications 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">اعلان‌ها و فعالیت‌ها</h2>
        <button
          onClick={onClearNotifications}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          پاک کردن همه
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">اعلانی وجود ندارد</h3>
            <p className="text-gray-400 dark:text-gray-500">فعالیت‌های جدید در اینجا نمایش داده می‌شود</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                    notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                    notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                     notification.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                     notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-white font-medium">{notification.message}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(notification.timestamp).toLocaleDateString('fa-IR')} - {new Date(notification.timestamp).toLocaleTimeString('fa-IR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;