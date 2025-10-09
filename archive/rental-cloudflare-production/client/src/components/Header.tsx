import React, { useState } from 'react';
import {
  Home,
  FileText,
  Settings,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  TrendingUp,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
}

interface HeaderProps {
  currentView: string;
  onNavigateToView: (view: string) => void;
  onResetForm: () => void;
  notifications: Notification[];
}

const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateToView,
  onResetForm,
  notifications
}) => {
  const { currentUser, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const adminNavItems = [
    { id: 'dashboard', label: 'داشبورد', icon: Home },
    { id: 'form', label: 'قرارداد جدید', icon: Plus },
    { id: 'financials', label: 'گزارش‌های مالی', icon: TrendingUp },
    { id: 'settings', label: 'تنظیمات', icon: Settings },
    { id: 'notifications', label: 'اعلان‌ها', icon: Bell, badge: notifications.length }
  ];

  const tenantNavItems = [
    { id: 'tenant-view', label: 'قرارداد من', icon: FileText }
  ];

  const navItems = currentUser?.role === 'admin' ? adminNavItems : tenantNavItems;

  const handleNavigation = (viewId: string) => {
    if (viewId === 'form') {
      onResetForm();
    }
    onNavigateToView(viewId);
    setShowMobileMenu(false);
  };

  const handleLogout = () => {
    logout();
    setShowMobileMenu(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <header className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🏠</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">سیستم مدیریت املاک</h1>
                <p className="text-xs text-gray-500">
                  {currentUser?.role === 'admin' ? 'پنل مدیریت' : 'پنل مستأجر'}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 space-x-reverse">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`relative flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 ml-2" />
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Notifications */}
            {currentUser?.role === 'admin' && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length > 99 ? '99+' : notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">اعلان‌ها</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          اعلانی وجود ندارد
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b border-gray-100 last:border-b-0 ${getTypeColor(notification.type)}`}
                          >
                            <p className="text-sm font-medium">{notification.message}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {notification.timestamp.toLocaleTimeString('fa-IR')}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 5 && (
                      <div className="p-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            onNavigateToView('notifications');
                            setShowNotifications(false);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          مشاهده همه اعلان‌ها
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* User Profile */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">
                  {currentUser?.role === 'admin' ? 'مدیر سیستم' : 'مستأجر'}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 ml-2" />
              خروج
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 ml-3" />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <span className="mr-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              
              <hr className="my-4 border-gray-200" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 ml-3" />
                خروج از سیستم
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </header>
  );
};

export default Header;