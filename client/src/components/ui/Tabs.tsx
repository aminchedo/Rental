/**
 * Tabs Component
 * 
 * Accessible tabs with keyboard navigation (Arrow keys, Home, End)
 */

import React, { useState, useRef, useEffect } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft':
        e.preventDefault();
        const direction = e.key === 'ArrowRight' ? 1 : -1;
        newIndex = (currentIndex + direction + tabs.length) % tabs.length;
        
        // Skip disabled tabs
        while (tabs[newIndex]?.disabled && newIndex !== currentIndex) {
          newIndex = (newIndex + direction + tabs.length) % tabs.length;
        }
        break;
      
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        while (tabs[newIndex]?.disabled && newIndex < tabs.length - 1) {
          newIndex++;
        }
        break;
      
      case 'End':
        e.preventDefault();
        newIndex = tabs.length - 1;
        while (tabs[newIndex]?.disabled && newIndex > 0) {
          newIndex--;
        }
        break;
      
      default:
        return;
    }

    if (!tabs[newIndex]?.disabled) {
      handleTabChange(tabs[newIndex].id);
      tabRefs.current[tabs[newIndex].id]?.focus();
    }
  };

  const baseTabStyles = `
    flex items-center gap-2 px-4 py-2 font-medium transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    default: {
      container: 'border-b border-gray-200 dark:border-gray-700',
      tab: (isActive: boolean) => `
        border-b-2 -mb-px
        ${isActive 
          ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }
      `,
    },
    pills: {
      container: 'flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg',
      tab: (isActive: boolean) => `
        rounded-md
        ${isActive 
          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }
      `,
    },
    underline: {
      container: '',
      tab: (isActive: boolean) => `
        border-b-2
        ${isActive 
          ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `,
    },
  };

  const styles = variantStyles[variant];
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab List */}
      <div className={`flex ${styles.container}`} role="tablist">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`${baseTabStyles} ${styles.tab(isActive)}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={tab.id}
            hidden={activeTab !== tab.id}
            className={activeTab === tab.id ? 'animate-fade-in' : ''}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
