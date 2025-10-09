import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import ChatPage from '../pages/ChatPage';
import MonitoringPage from '../pages/MonitoringPage';
import SettingsPage from '../pages/SettingsPage';

const NotFound = () => (
  <div className="card p-8 text-center">
    <h2 className="text-xl font-bold mb-2">صفحه پیدا نشد</h2>
    <p className="opacity-70">لطفاً از منوی بالا صفحهٔ موردنظر را انتخاب کنید.</p>
  </div>
);

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <RootLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/monitoring" element={<MonitoringPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </RootLayout>
  </BrowserRouter>
);

export default AppRouter;
