/**
 * Monitoring App
 * 
 * Main application with routing for monitoring features
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import MonitoringLayout from './components/MonitoringLayout';
import HomePage from './pages/HomePage';
import ExperimentsPage from './pages/ExperimentsPage';
import LiveMonitorPage from './pages/LiveMonitorPage';
import PlaygroundPage from './pages/PlaygroundPage';
import MonitoringSettingsPage from './pages/MonitoringSettingsPage';

const MonitoringApp: React.FC = () => {
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
          <Route path="/" element={<HomePage />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/monitor" element={<LiveMonitorPage />} />
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
        </Routes>
      </MonitoringLayout>
    </ThemeProvider>
  );
};

export default MonitoringApp;
