/**
 * Search Toggle Component
 * 
 * Toggle switch to enable/disable retrieval-augmented generation
 * Shows current search status
 */

import React from 'react';

interface SearchToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const SearchToggle: React.FC<SearchToggleProps> = ({ enabled, onChange, disabled = false }) => {
  return (
    <div className="search-toggle flex items-center gap-2" dir="rtl">
      <label htmlFor="search-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">
        جستجوی هوشمند
      </label>
      <button
        id="search-toggle"
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className="sr-only">استفاده از جستجوی هوشمند</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      <span className="text-xs text-gray-500">
        {enabled ? (
          <span className="text-green-600 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            فعال
          </span>
        ) : (
          <span className="text-gray-400">غیرفعال</span>
        )}
      </span>
    </div>
  );
};

export default SearchToggle;
