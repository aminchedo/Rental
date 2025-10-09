/**
 * Monitoring Layout Component
 * 
 * Main layout with navigation for monitoring pages
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FlaskConical, 
  Activity, 
  MessageSquare, 
  Database, 
  Settings, 
  FileText,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Badge } from './ui';

export const MonitoringLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation('fa');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: t.nav.home, href: '/', icon: Home },
    { name: t.nav.experiments, href: '/experiments', icon: FlaskConical, badge: 2 },
    { name: t.nav.liveMonitor, href: '/monitor', icon: Activity },
    { name: t.nav.playground, href: '/playground', icon: MessageSquare },
    { name: t.nav.datasets, href: '/datasets', icon: Database },
    { name: t.nav.reports, href: '/reports', icon: FileText },
    { name: t.nav.settings, href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 z-40 h-screen transition-transform
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700
          w-64
        `}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  LLM Monitor
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  v2.0.0
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-colors duration-200
                    ${active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="flex-1 font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge variant="danger" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="absolute bottom-4 left-3 right-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="
                flex items-center gap-3 w-full px-3 py-2 rounded-lg
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors duration-200
              "
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              <span className="font-medium">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={`
          fixed top-4 right-4 z-30 lg:hidden
          p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg
          text-gray-700 dark:text-gray-300
          ${sidebarOpen ? 'hidden' : 'block'}
        `}
      >
        <Menu size={24} />
      </button>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'mr-64' : 'mr-0'}`}>
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MonitoringLayout;
