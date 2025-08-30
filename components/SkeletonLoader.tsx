import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'chart' | 'table' | 'button' | 'avatar';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'text',
  width,
  height,
  className = '',
  count = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  const variantClasses = {
    text: 'h-4',
    card: 'h-32',
    chart: 'h-64',
    table: 'h-6',
    button: 'h-10',
    avatar: 'h-10 w-10 rounded-full'
  };

  const skeletonElement = (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ 
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || undefined 
      }}
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {skeletonElement}
        </div>
      ))}
    </div>
  );
};

// Specialized skeleton components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
    </div>
  </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="flex gap-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className = '' 
}) => (
  <div className={`animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
    {/* Header */}
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
    
    {/* Table Header */}
    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
        ))}
      </div>
    </div>
    
    {/* Table Rows */}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="px-6 py-4">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }, (_, j) => (
              <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonLoader;