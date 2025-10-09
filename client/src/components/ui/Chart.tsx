/**
 * Chart Component
 * 
 * Wrapper for Recharts with consistent styling and SSR-safe loading
 */

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { tokens } from '../../config/tokens';

export interface ChartData {
  [key: string]: string | number;
}

export interface ChartProps {
  data: ChartData[];
  type?: 'line' | 'bar' | 'area';
  dataKeys: Array<{
    key: string;
    color?: string;
    name?: string;
  }>;
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
}

// Custom tooltip with dark mode support
const CustomTooltip: React.FC<TooltipProps<any, any>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const Chart: React.FC<ChartProps> = ({
  data,
  type = 'line',
  dataKeys,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  className = '',
}) => {
  const ChartComponent = {
    line: LineChart,
    bar: BarChart,
    area: AreaChart,
  }[type];

  const DataComponent = {
    line: Line,
    bar: Bar,
    area: Area,
  }[type];

  // Default colors from tokens
  const defaultColors = [
    tokens.colors.primary[500],
    tokens.colors.success.DEFAULT,
    tokens.colors.warning.DEFAULT,
    tokens.colors.danger.DEFAULT,
    tokens.colors.info.DEFAULT,
  ];

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend />}
          {dataKeys.map((dataKey, index) => (
            <DataComponent
              key={dataKey.key}
              type="monotone"
              dataKey={dataKey.key}
              stroke={dataKey.color || defaultColors[index % defaultColors.length]}
              fill={dataKey.color || defaultColors[index % defaultColors.length]}
              name={dataKey.name || dataKey.key}
              strokeWidth={type === 'line' ? 2 : undefined}
              fillOpacity={type === 'area' ? 0.6 : undefined}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
