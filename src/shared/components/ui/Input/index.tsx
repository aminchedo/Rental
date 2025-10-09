import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<Props> = ({ className = '', ...props }) => (
  <input
    className={`w-full h-10 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 focus-ring ${className}`}
    {...props}
  />
);
