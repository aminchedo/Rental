/**
 * AppRouter - Unified routing for all application features
 * 
 * Routes:
 * - /chat - Persian chat interface
 * - /metrics - Metrics dashboard
 * - /monitor - Live monitoring
 * - /monitor/settings - Monitoring settings
 * - /dashboard - Contract management dashboard
 * - /contract/new - Create new contract
 * - /tenant - Tenant view
 * - /financial - Financial reports
 * - /notifications - Notifications page
 * - /app-settings - Application settings
 * - /login - Login page
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';

// Chat & Monitoring Pages
import PersianChatPage from './pages/PersianChatPage';
import MetricsDashboard from './pages/MetricsDashboard';
import LiveMonitorPage from './pages/LiveMonitorPage';
import MonitoringSettingsPage from './pages/MonitoringSettingsPage';
import ExperimentsPage from './pages/ExperimentsPage';
import PlaygroundPage from './pages/PlaygroundPage';
import HomePage from './pages/HomePage';

// Rental Management Pages
import DashboardPage from './pages/DashboardPage';
import ContractFormPage from './pages/ContractFormPage';
import TenantViewPage from './pages/TenantViewPage';
import FinancialReportsPage from './pages/FinancialReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

// 404 Page Component
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8 text-8xl">🔍</div>
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        صفحه یافت نشد
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
      </p>
      <a
        href="/chat"
        className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        بازگشت به صفحه اصلی
      </a>
    </div>
  );
};

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        {/* Default redirect to chat */}
        <Route index element={<Navigate to="/chat" replace />} />
        
        {/* Chat & Monitoring Routes */}
        <Route path="chat" element={<PersianChatPage />} />
        <Route path="metrics" element={<MetricsDashboard />} />
        <Route path="monitor" element={<LiveMonitorPage />} />
        <Route path="monitor/settings" element={<MonitoringSettingsPage />} />
        <Route path="experiments" element={<ExperimentsPage />} />
        <Route path="playground" element={<PlaygroundPage />} />
        <Route path="home" element={<HomePage />} />
        
        {/* Rental Management Routes */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="contract/new" element={<ContractFormPage />} />
        <Route path="tenant" element={<TenantViewPage />} />
        <Route path="financial" element={<FinancialReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="app-settings" element={<SettingsPage />} />
        <Route path="login" element={<LoginPage />} />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
