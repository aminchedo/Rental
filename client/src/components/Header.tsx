import React from 'react';
import { Home, Plus, Bell, LogOut, Sun, Moon, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentView: string;
  onNavigateToView: (view: string) => void;
  onResetForm: () => void;
  notifications: any[];
}

const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onNavigateToView, 
  onResetForm, 
  notifications 
}) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">سیستم اجاره‌نامه</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">مدیریت حرفه‌ای قراردادها</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentUser?.role === 'landlord' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigateToView('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Home className="w-4 h-4 inline ml-2" />
                  داشبورد
                </button>
                <button
                  onClick={() => { onResetForm(); onNavigateToView('form'); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'form' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Plus className="w-4 h-4 inline ml-2" />
                  قرارداد جدید
                </button>
                <button
                  onClick={() => onNavigateToView('notifications')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'notifications' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Bell className="w-4 h-4 inline ml-2" />
                  اعلان‌ها
                  {notifications.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mr-2">
                      {notifications.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onNavigateToView('financial-reports')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'financial-reports' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <BarChart3 className="w-4 h-4 inline ml-2" />
                  گزارش‌های مالی
                </button>
                <button
                  onClick={() => onNavigateToView('settings')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Settings className="w-4 h-4 inline ml-2" />
                  تنظیمات
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 pr-4 border-r border-gray-200 dark:border-gray-600">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group"
                title={theme === 'light' ? 'حالت تاریک' : 'حالت روشن'}
              >
                <div className="relative w-5 h-5">
                  <Sun className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} />
                  <Moon className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
                </div>
              </button>
              
              <div className="text-right">
                <p className="font-semibold text-gray-800 dark:text-white">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentUser?.role === 'landlord' ? 'مدیر سیستم' : 'مستأجر'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="خروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;