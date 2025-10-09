/**
 * RootLayout - Persistent navigation and theme management
 * 
 * Features:
 * - Responsive top navigation with RTL support
 * - Dark/Light theme toggle
 * - Active route highlighting
 * - Mobile-friendly hamburger menu
 */

import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  MessageSquare, 
  BarChart3, 
  Activity, 
  FileText, 
  Users, 
  DollarSign, 
  Bell, 
  Settings, 
  Moon, 
  Sun, 
  Menu, 
  X,
  Home,
  Beaker,
  PlayCircle
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  group: 'chat' | 'monitoring' | 'rental';
}

const navItems: NavItem[] = [
  // Chat & Monitoring
  { path: '/chat', label: 'چت', icon: <MessageSquare size={20} />, group: 'chat' },
  { path: '/metrics', label: 'معیارها', icon: <BarChart3 size={20} />, group: 'monitoring' },
  { path: '/monitor', label: 'نظارت زنده', icon: <Activity size={20} />, group: 'monitoring' },
  { path: '/home', label: 'خانه', icon: <Home size={20} />, group: 'monitoring' },
  { path: '/experiments', label: 'آزمایش‌ها', icon: <Beaker size={20} />, group: 'monitoring' },
  { path: '/playground', label: 'آزمایشگاه', icon: <PlayCircle size={20} />, group: 'monitoring' },
  
  // Rental Management
  { path: '/dashboard', label: 'داشبورد', icon: <FileText size={20} />, group: 'rental' },
  { path: '/tenant', label: 'مستأجرین', icon: <Users size={20} />, group: 'rental' },
  { path: '/financial', label: 'گزارشات مالی', icon: <DollarSign size={20} />, group: 'rental' },
  { path: '/notifications', label: 'اعلان‌ها', icon: <Bell size={20} />, group: 'rental' },
  { path: '/app-settings', label: 'تنظیمات', icon: <Settings size={20} />, group: 'rental' },
];

const RootLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                🚀
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                سیستم یکپارچه مدیریت
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.slice(0, 8).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="تغییر تم"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="منوی موبایل"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} سیستم یکپارچه مدیریت. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
