import React from 'react';
import { NavLink } from 'react-router-dom';
import Header from '../shared/components/layout/Header';

const link = 'px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-800';
const active = 'bg-gray-200 dark:bg-neutral-700';

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-neutral-50" dir="rtl">
      <Header />
      <nav className="sticky top-0 z-40 border-b border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur">
        <div className="container py-2">
          <ul className="flex flex-wrap gap-2">
            <li><NavLink to="/chat" className={({isActive}) => `${link} ${isActive?active:''}`}>گفتگو</NavLink></li>
            <li><NavLink to="/monitoring" className={({isActive}) => `${link} ${isActive?active:''}`}>مانیتورینگ</NavLink></li>
            <li><NavLink to="/settings" className={({isActive}) => `${link} ${isActive?active:''}`}>تنظیمات</NavLink></li>
          </ul>
        </div>
      </nav>
      <main className="container py-6">{children}</main>
    </div>
  );
};
export default RootLayout;
