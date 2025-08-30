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
        <h2 className="text-3xl font-bold text-gray-800">اعلان‌ها و فعالیت‌ها</h2>
        <button
          onClick={onClearNotifications}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          پاک کردن همه
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">اعلانی وجود ندارد</h3>
            <p className="text-gray-400">فعالیت‌های جدید در اینجا نمایش داده می‌شود</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.type === 'success' ? 'bg-green-100 text-green-600' :
                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    notification.type === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                     notification.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                     notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
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