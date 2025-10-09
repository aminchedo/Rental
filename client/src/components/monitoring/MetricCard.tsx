/**
 * Metric Card Component
 * 
 * Display key metrics with trends and status indicators
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { Card, Badge } from '../ui';

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
  icon?: React.ReactNode;
  description?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  status,
  icon,
  description,
  onClick,
}) => {
  const trendIcons = {
    up: <TrendingUp size={16} className="text-green-600" />,
    down: <TrendingDown size={16} className="text-red-600" />,
    stable: <Minus size={16} className="text-gray-600" />,
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  };

  return (
    <Card
      variant="elevated"
      hover={!!onClick}
      onClick={onClick}
      className="relative"
    >
      {status && (
        <div className="absolute top-4 left-4">
          <Badge variant={status} dot />
        </div>
      )}

      <div className={`${status ? 'pr-20' : ''}`}>
        {icon && (
          <div className="mb-3 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        )}

        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </h3>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          )}
        </div>

        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm ${trendColors[trend]}`}>
            {trendIcons[trend]}
            <span>{trendValue}</span>
          </div>
        )}

        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
