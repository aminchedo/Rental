/**
 * Home / Overview Page
 * 
 * Dashboard with model status, KPIs, and quick actions
 */

import React from 'react';
import { Play, Settings, FlaskConical, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardHeader, Button, Badge, Chart } from '../components/ui';
import { MetricCard } from '../components/monitoring/MetricCard';
import { useTranslation } from '../i18n';

export const HomePage: React.FC = () => {
  const { t, locale } = useTranslation('fa');

  // Mock data
  const recentRuns = [
    { id: 'run-003', status: 'completed', perplexity: 8.3, time: '2 hours ago' },
    { id: 'run-002', status: 'running', perplexity: 12.1, time: '5 hours ago' },
    { id: 'run-001', status: 'completed', perplexity: 15.4, time: '1 day ago' },
  ];

  const performanceData = [
    { time: '00:00', loss: 3.2, perplexity: 24.5 },
    { time: '04:00', loss: 2.8, perplexity: 16.4 },
    { time: '08:00', loss: 2.4, perplexity: 11.0 },
    { time: '12:00', loss: 2.1, perplexity: 8.2 },
    { time: '16:00', loss: 1.9, perplexity: 6.7 },
    { time: '20:00', loss: 1.8, perplexity: 6.0 },
  ];

  return (
    <div className="space-y-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t.nav.home}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your models.
          </p>
        </div>
        <div className="flex gap-2">
          <Button icon={<Settings size={20} />} variant="secondary">
            Quick Settings
          </Button>
          <Button icon={<Play size={20} />}>
            New Training Run
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Runs"
          value={1}
          icon={<FlaskConical size={24} />}
          status="info"
          description="Training in progress"
        />
        <MetricCard
          title="Best Perplexity"
          value={6.0}
          trend="down"
          trendValue="-25%"
          icon={<TrendingUp size={24} />}
          status="success"
          description="Across all experiments"
        />
        <MetricCard
          title="Total Experiments"
          value={127}
          trend="up"
          trendValue="+3 this week"
          status="info"
        />
        <MetricCard
          title="Alerts"
          value={0}
          icon={<AlertCircle size={24} />}
          status="success"
          description="All systems operational"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Training Performance" subtitle="Last 24 hours" />
          <Chart
            type="line"
            data={performanceData}
            dataKeys={[
              { key: 'loss', color: '#ef4444', name: 'Loss' },
              { key: 'perplexity', color: '#3b82f6', name: 'Perplexity' },
            ]}
            xAxisKey="time"
            height={300}
          />
        </Card>

        <Card>
          <CardHeader title="Recent Runs" />
          <div className="space-y-3">
            {recentRuns.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={run.status === 'completed' ? 'success' : 'info'}
                    dot
                  >
                    {run.status}
                  </Badge>
                  <div>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                      {run.id}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {run.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Perplexity
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {run.perplexity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors group">
            <FlaskConical className="mx-auto mb-2 text-gray-400 group-hover:text-blue-500" size={32} />
            <p className="font-medium text-gray-900 dark:text-gray-100">Start New Experiment</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure and launch a training run
            </p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors group">
            <Settings className="mx-auto mb-2 text-gray-400 group-hover:text-blue-500" size={32} />
            <p className="font-medium text-gray-900 dark:text-gray-100">Configure Model</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Adjust hyperparameters and settings
            </p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors group">
            <TrendingUp className="mx-auto mb-2 text-gray-400 group-hover:text-blue-500" size={32} />
            <p className="font-medium text-gray-900 dark:text-gray-100">View Analytics</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Explore detailed performance metrics
            </p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default HomePage;
