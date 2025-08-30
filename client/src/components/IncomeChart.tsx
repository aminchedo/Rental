import React from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface IncomeData {
  month: string;
  income: number;
  contracts: number;
}

interface IncomeChartProps {
  data: IncomeData[];
  isLoading?: boolean;
}

const IncomeChart: React.FC<IncomeChartProps> = ({ data, isLoading = false }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value) + ' تومان';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <p className="font-semibold text-gray-800 dark:text-white mb-2">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            درآمد: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-purple-600 dark:text-purple-400">
            تعداد قراردادها: {payload[1]?.value || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-5 lg:h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-48 lg:h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 lg:mb-6">
        <h3 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-white">
          نمودار درآمد ماهانه
        </h3>
        <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">درآمد</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">تعداد قراردادها</span>
          </div>
        </div>
      </div>
      
      <div className="h-64 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-gray-600 dark:text-gray-400"
              tickFormatter={(value) => new Intl.NumberFormat('fa-IR').format(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#incomeGradient)"
            />
            <Line
              type="monotone"
              dataKey="contracts"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            هنوز داده‌ای برای نمایش وجود ندارد
          </p>
        </div>
      )}
    </div>
  );
};

export default IncomeChart;