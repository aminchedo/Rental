/**
 * AI Chat & Monitoring Application
 * 
 * Unified app combining Persian AI Chat and Monitoring features
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import MonitoringLayout from './components/MonitoringLayout';

// AI Chat Pages
import PersianChatPage from './pages/PersianChatPage';

// Monitoring Pages
import HomePage from './pages/HomePage';
import ExperimentsPage from './pages/ExperimentsPage';
import LiveMonitorPage from './pages/LiveMonitorPage';
import PlaygroundPage from './pages/PlaygroundPage';
import MonitoringSettingsPage from './pages/MonitoringSettingsPage';
import { MetricsDashboard } from './pages/MetricsDashboard';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontFamily: 'Vazirmatn, -apple-system, sans-serif',
            direction: 'rtl',
            textAlign: 'right'
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      
      <MonitoringLayout>
        <Routes>
          {/* Default redirect to chat */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
          
          {/* AI Chat */}
          <Route path="/chat" element={<PersianChatPage />} />
          
          {/* Monitoring & Analytics */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/monitor" element={<LiveMonitorPage />} />
          <Route path="/metrics" element={<MetricsDashboard />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/settings" element={<MonitoringSettingsPage />} />
          
          {/* Placeholder routes */}
          <Route path="/datasets" element={
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Datasets</h1>
              <p className="text-gray-600 dark:text-gray-400">Datasets catalog coming soon...</p>
            </div>
          } />
          <Route path="/reports" element={
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Reports</h1>
              <p className="text-gray-600 dark:text-gray-400">Reports dashboard coming soon...</p>
            </div>
          } />
          
          {/* 404 - Not Found */}
          <Route path="*" element={
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">صفحه مورد نظر یافت نشد</p>
              <a href="/chat" className="text-blue-600 hover:underline">بازگشت به چت</a>
            </div>
          } />
        </Routes>
      </MonitoringLayout>
    </ThemeProvider>
  );
};

export default App;
