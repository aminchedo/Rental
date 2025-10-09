import React from 'react';
export const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className='', children }) => (
  <div className={`card p-4 ${className}`}>{children}</div>
);
