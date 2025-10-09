import React from 'react';
import { useMetrics } from '../features/monitoring/hooks/useMetrics';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../shared/components/ui/Card';
import { Button } from '../shared/components/ui/Button';

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string; hint?: string; loading?: boolean; }> =
({ icon, label, value, hint, loading }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm opacity-70 mb-1">{label}</p>
        <p className="text-2xl font-bold">{loading ? '…' : value}</p>
        {hint && <p className="text-xs opacity-70 mt-1">{hint}</p>}
      </div>
      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
        {icon}
      </div>
    </div>
  </Card>
);

const MonitoringPage: React.FC = () => {
  const { metrics, requests, loading, refresh } = useMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">مانیتورینگ</h2>
        <Button variant="secondary" onClick={refresh}>به‌روزرسانی</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Activity className="text-indigo-600" size={18}/>} label="تعداد درخواست‌ها" value={`${metrics?.totalRequests ?? 0}`} loading={loading}/>
        <Stat icon={<Clock className="text-purple-600" size={18}/>} label="میانگین زمان پاسخ" value={`${metrics?.avgResponseTime ?? 0} ms`} loading={loading}/>
        <Stat icon={<CheckCircle className="text-green-600" size={18}/>} label="نرخ موفقیت" value={`${metrics?.successRate ?? 0}%`} loading={loading}/>
        <Stat icon={<AlertTriangle className="text-red-600" size={18}/>} label="نرخ خطا" value={`${metrics?.errorRate ?? 0}%`} loading={loading}/>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-3">روند درخواست‌ها</h3>
        <div className="h-48 grid grid-cols-12 items-end gap-2">
          {(requests ?? []).slice(-24).map((p, i) => (
            <div key={i} title={p.time} className="bg-indigo-500/80 dark:bg-indigo-400/70 rounded" style={{ height: `${Math.max(4, p.value)}%` }} />
          ))}
        </div>
        <p className="text-xs opacity-70 mt-2">نمودار مینی‌مال (بدون کتابخانه) — می‌تونی بعداً Recharts اضافه کنی.</p>
      </Card>
    </div>
  );
};

export default MonitoringPage;
