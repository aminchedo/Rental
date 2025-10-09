/**
 * Live Monitor Page
 * 
 * Real-time monitoring dashboard with streaming logs and metrics
 */

import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react';
import { MetricCard } from '../components/monitoring/MetricCard';
import { LiveLogs, LogEntry } from '../components/monitoring/LiveLogs';
import { AlertPanel, AlertRule, AlertItem } from '../components/monitoring/AlertPanel';
import { Chart } from '../components/ui';
import { useTranslation } from '../i18n';

export const LiveMonitorPage: React.FC = () => {
  const { t, locale } = useTranslation('fa');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState({
    throughput: 145,
    queueDepth: 23,
    errorRate: 0.2,
    cpuUsage: 67,
    memoryUsage: 4.2,
  });

  // Simulate live metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        throughput: prev.throughput + Math.floor(Math.random() * 20 - 10),
        queueDepth: Math.max(0, prev.queueDepth + Math.floor(Math.random() * 6 - 3)),
        errorRate: Math.max(0, prev.errorRate + (Math.random() * 0.4 - 0.2)),
        cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + Math.floor(Math.random() * 10 - 5))),
        memoryUsage: Math.max(0, prev.memoryUsage + (Math.random() * 0.4 - 0.2)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Simulate streaming logs
  useEffect(() => {
    const logMessages = [
      'Processing batch 145 with 32 samples',
      'Model inference completed in 125ms',
      'Cache hit rate: 87%',
      'Token generation: 1250 tokens/sec',
      'GPU memory allocated: 3.2GB',
      'Request queued for processing',
    ];

    const interval = setInterval(() => {
      const randomLevel: LogEntry['level'] = 
        Math.random() > 0.9 ? 'error' :
        Math.random() > 0.7 ? 'warn' :
        Math.random() > 0.3 ? 'info' : 'debug';

      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        level: randomLevel,
        message: logMessages[Math.floor(Math.random() * logMessages.length)],
        metadata: randomLevel === 'error' ? { code: 'E500' } : undefined,
      };

      setLogs(prev => [...prev, newLog]);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Mock alert rules and alerts
  const alertRules: AlertRule[] = [
    {
      id: '1',
      metric: 'Error Rate',
      threshold: 1.0,
      condition: '>',
      severity: 'danger',
      message: 'Error rate exceeded threshold',
    },
    {
      id: '2',
      metric: 'Queue Depth',
      threshold: 50,
      condition: '>',
      severity: 'warning',
      message: 'Request queue is growing',
    },
  ];

  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Check alerts
  useEffect(() => {
    const newAlerts: AlertItem[] = [];

    if (metrics.errorRate > 1.0) {
      newAlerts.push({
        id: 'alert-1',
        ruleId: '1',
        triggered: true,
        currentValue: metrics.errorRate,
        timestamp: new Date(),
      });
    }

    if (metrics.queueDepth > 50) {
      newAlerts.push({
        id: 'alert-2',
        ruleId: '2',
        triggered: true,
        currentValue: metrics.queueDepth,
        timestamp: new Date(),
      });
    }

    setAlerts(newAlerts);
  }, [metrics]);

  // Mock time-series data
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);

  useEffect(() => {
    setMetricsHistory(prev => {
      const newHistory = [
        ...prev,
        {
          time: new Date().toLocaleTimeString('fa-IR'),
          throughput: metrics.throughput,
          errorRate: metrics.errorRate,
          cpu: metrics.cpuUsage,
        },
      ].slice(-20); // Keep last 20 data points

      return newHistory;
    });
  }, [metrics]);

  return (
    <div className="space-y-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {t.monitor.title}
      </h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title={t.monitor.throughput}
          value={metrics.throughput}
          unit="req/s"
          trend="up"
          trendValue="+12%"
          icon={<Zap size={24} />}
          status="success"
        />
        <MetricCard
          title={t.monitor.queueDepth}
          value={metrics.queueDepth}
          trend={metrics.queueDepth > 50 ? 'up' : 'down'}
          trendValue={metrics.queueDepth > 50 ? 'High' : 'Normal'}
          icon={<Activity size={24} />}
          status={metrics.queueDepth > 50 ? 'warning' : 'info'}
        />
        <MetricCard
          title={t.monitor.errorRate}
          value={metrics.errorRate.toFixed(2)}
          unit="%"
          trend={metrics.errorRate > 1 ? 'up' : 'down'}
          trendValue={metrics.errorRate > 1 ? 'Critical' : 'Good'}
          status={metrics.errorRate > 1 ? 'danger' : 'success'}
        />
        <MetricCard
          title={t.monitor.cpuUsage}
          value={metrics.cpuUsage}
          unit="%"
          icon={<Cpu size={24} />}
          status={metrics.cpuUsage > 80 ? 'warning' : 'info'}
        />
        <MetricCard
          title="Memory Usage"
          value={metrics.memoryUsage.toFixed(1)}
          unit="GB"
          icon={<HardDrive size={24} />}
          status="info"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          type="line"
          data={metricsHistory}
          dataKeys={[
            { key: 'throughput', color: '#3b82f6', name: 'Throughput (req/s)' },
          ]}
          xAxisKey="time"
          height={300}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg"
        />
        <Chart
          type="area"
          data={metricsHistory}
          dataKeys={[
            { key: 'cpu', color: '#10b981', name: 'CPU Usage (%)' },
          ]}
          xAxisKey="time"
          height={300}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg"
        />
      </div>

      {/* Alerts and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AlertPanel
            alerts={alerts}
            rules={alertRules}
            onAcknowledge={(id) => {
              setAlerts(prev =>
                prev.map(alert =>
                  alert.id === id ? { ...alert, acknowledged: true } : alert
                )
              );
            }}
            onDismiss={(id) => {
              setAlerts(prev => prev.filter(alert => alert.id !== id));
            }}
          />
        </div>
        <div className="lg:col-span-2">
          <LiveLogs
            logs={logs}
            onClear={() => setLogs([])}
            onExport={() => {
              const dataStr = JSON.stringify(logs, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `logs-${Date.now()}.json`;
              link.click();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveMonitorPage;
