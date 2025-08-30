import React from 'react';
import { Bell, CheckCircle, AlertCircle, Info, XCircle, Trash2 } from 'lucide-react';

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
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">اعلان‌ها</h1>
          <p className="text-gray-600">مشاهده تمام اعلان‌های سیستم</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={onClearNotifications}
            className="btn-outline-primary"
          >
            <Trash2 className="w-4 h-4 ml-2" />
            پاک کردن همه
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">اعلانی وجود ندارد</h3>
            <p className="text-gray-600">هنگامی که اعلان جدیدی دریافت کنید، اینجا نمایش داده خواهد شد.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card p-4 border-2 ${getTypeColor(notification.type)}`}
            >
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.timestamp.toLocaleDateString('fa-IR')} - {' '}
                    {notification.timestamp.toLocaleTimeString('fa-IR')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;