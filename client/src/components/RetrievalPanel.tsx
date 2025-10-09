/**
 * Retrieval Panel Component
 * 
 * Displays search/retrieval sources in the chat UI
 * Shows snippet titles and source links when retrieval is enabled
 */

import React from 'react';

interface RetrievalSource {
  title: string;
  url?: string;
}

interface RetrievalPanelProps {
  sources: RetrievalSource[];
  isVisible: boolean;
}

const RetrievalPanel: React.FC<RetrievalPanelProps> = ({ sources, isVisible }) => {
  if (!isVisible || sources.length === 0) {
    return null;
  }

  return (
    <div className="retrieval-panel bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4" dir="rtl">
      <div className="flex items-start gap-2">
        <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-700 mb-2">
            منابع جستجو شده:
          </h4>
          <ul className="space-y-2">
            {sources.map((source, index) => (
              <li key={index} className="text-sm">
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    <span>{source.title}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <span className="text-gray-700">{source.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RetrievalPanel;
