import React from 'react';
import { Home, Plus, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">سیستم اجاره‌نامه</h1>
              <p className="text-sm text-gray-600">مدیریت حرفه‌ای قراردادها</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentUser?.role === 'landlord' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigateToView('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Home className="w-4 h-4 inline ml-2" />
                  داشبورد
                </button>
                <button
                  onClick={() => { onResetForm(); onNavigateToView('form'); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'form' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Plus className="w-4 h-4 inline ml-2" />
                  قرارداد جدید
                </button>
                <button
                  onClick={() => onNavigateToView('notifications')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'notifications' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Bell className="w-4 h-4 inline ml-2" />
                  اعلان‌ها
                  {notifications.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mr-2">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
              <div className="text-right">
                <p className="font-semibold text-gray-800">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">
                  {currentUser?.role === 'landlord' ? 'مدیر سیستم' : 'مستأجر'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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