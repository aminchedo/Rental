/**
 * Alert Component
 * 
 * Alert messages with variants, icons, and dismissible option
 */

import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  icon,
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      title: 'text-green-900 dark:text-green-200',
      text: 'text-green-800 dark:text-green-300',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-900 dark:text-yellow-200',
      text: 'text-yellow-800 dark:text-yellow-300',
    },
    danger: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-900 dark:text-red-200',
      text: 'text-red-800 dark:text-red-300',
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-200',
      text: 'text-blue-800 dark:text-blue-300',
    },
  };

  const icons = {
    success: <CheckCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    danger: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  const styles = variantStyles[variant];

  return (
    <div
      role="alert"
      className={`
        flex gap-3 p-4 rounded-lg border
        ${styles.container} ${className}
      `}
      {...props}
    >
      <div className={`flex-shrink-0 ${styles.icon}`}>
        {icon || icons[variant]}
      </div>
      
      <div className="flex-1">
        {title && (
          <h5 className={`font-medium mb-1 ${styles.title}`}>
            {title}
          </h5>
        )}
        <div className={`text-sm ${styles.text}`}>
          {children}
        </div>
      </div>

      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${styles.icon} hover:opacity-70 transition-opacity`}
          aria-label="Dismiss alert"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default Alert;
