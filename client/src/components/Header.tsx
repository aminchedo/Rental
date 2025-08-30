import React, { useState } from 'react';
import { Home, Plus, Bell, LogOut, Sun, Moon, Settings, BarChart3, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (view: string) => {
    if (view === 'form') {
      onResetForm();
    }
    onNavigateToView(view);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">سیستم اجاره‌نامه</h1>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">مدیریت حرفه‌ای قراردادها</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">اجاره‌نامه</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          {currentUser?.role === 'landlord' && (
            <div className="hidden lg:flex gap-2">
              <button
                onClick={() => handleNavigate('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Home className="w-4 h-4 inline ml-2" />
                داشبورد
              </button>
              <button
                onClick={() => handleNavigate('form')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'form' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Plus className="w-4 h-4 inline ml-2" />
                قرارداد جدید
              </button>
              <button
                onClick={() => handleNavigate('notifications')}
                className={`px-4 py-2 rounded-lg font-medium transition-all relative ${currentView === 'notifications' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Bell className="w-4 h-4 inline ml-2" />
                اعلان‌ها
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleNavigate('financial-reports')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'financial-reports' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <BarChart3 className="w-4 h-4 inline ml-2" />
                گزارش‌های مالی
              </button>
              <button
                onClick={() => handleNavigate('settings')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Settings className="w-4 h-4 inline ml-2" />
                تنظیمات
              </button>
            </div>
          )}

          {/* Mobile & Desktop Right Side */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 lg:p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={theme === 'light' ? 'حالت تاریک' : 'حالت روشن'}
            >
              <div className="relative w-5 h-5">
                <Sun className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} />
                <Moon className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
              </div>
            </button>

            {/* Mobile Menu Button */}
            {currentUser?.role === 'landlord' && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            )}
            
            {/* User Info & Logout */}
            <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-gray-200 dark:border-gray-600">
              <div className="text-right">
                <p className="font-semibold text-gray-800 dark:text-white">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentUser?.role === 'landlord' ? 'مدیر سیستم' : 'مستأجر'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="خروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Info */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{currentUser?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="خروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {currentUser?.role === 'landlord' && (
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2">
              <button
                onClick={() => handleNavigate('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-right min-h-[44px] ${
                  currentView === 'dashboard' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 active:scale-95'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>داشبورد</span>
                {notifications.length > 0 && currentView === 'dashboard' && (
                  <span className="mr-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => handleNavigate('form')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-right min-h-[44px] ${
                  currentView === 'form' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 active:scale-95'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span>قرارداد جدید</span>
              </button>
              
              <button
                onClick={() => handleNavigate('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-right min-h-[44px] ${
                  currentView === 'notifications' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 active:scale-95'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span>اعلان‌ها</span>
                {notifications.length > 0 && (
                  <span className="mr-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => handleNavigate('financial-reports')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-right min-h-[44px] ${
                  currentView === 'financial-reports' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 active:scale-95'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>گزارش‌های مالی</span>
              </button>
              
              <button
                onClick={() => handleNavigate('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-right min-h-[44px] ${
                  currentView === 'settings' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 active:scale-95'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>تنظیمات</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;