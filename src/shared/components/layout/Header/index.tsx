import React from 'react';
import { useTheme } from '../../../../core/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="border-b border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
      <div className="container flex items-center justify-between py-3">
        <h1 className="text-lg font-bold">هوش‌یار — AI Chat & Monitoring</h1>
        <button onClick={toggleTheme} className="focus-ring rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-neutral-800" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
        </button>
      </div>
    </header>
  );
};
export default Header;
