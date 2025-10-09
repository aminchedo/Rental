import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../shared/utils/api';

type Metrics = { totalRequests: number; avgResponseTime: number; successRate: number; errorRate: number; };
type LinePoint = { time: string; value: number; };

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [requests, setRequests] = useState<LinePoint[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const m = await api.get('/api/monitoring/metrics').then(r => r.data);
      const r = await api.get('/api/monitoring/requests').then(r => r.data);
      setMetrics(m);
      setRequests(r);
    } catch (e) {
      // swallow for demo
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { metrics, requests, loading, refresh };
}
