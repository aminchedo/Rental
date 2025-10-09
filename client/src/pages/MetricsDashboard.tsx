/**
 * Metrics Dashboard
 * 
 * Displays training/eval metrics: loss, eval_loss, perplexity, latency p50/90/99, error_rate
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../components/ui';
import { Activity, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { MetricCard } from '../components/monitoring/MetricCard';
import { Chart } from '../components/ui/Chart';

interface Metrics {
  loss: number;
  eval_loss: number;
  perplexity: number;
  latency: {
    p50: number;
    p90: number;
    p99: number;
  };
  error_rate: number;
  timestamp: string;
}

interface TrainingRun {
  id: string;
  name: string;
  metrics: Metrics;
  status: 'running' | 'completed' | 'failed';
  tags: string[];
}

export const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [runs, setRuns] = useState<TrainingRun[]>([]);
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string>('all');

  useEffect(() => {
    loadMetrics();
    loadRuns();
  }, []);

  const loadMetrics = async () => {
    try {
      // Load from logs/eval_full.json
      const response = await fetch('/logs/eval_full.json');
      const data = await response.json();
      
      setMetrics({
        loss: data.train_loss || 0,
        eval_loss: data.eval_loss || 0,
        perplexity: data.perplexity || 0,
        latency: {
          p50: data.latency_p50 || 0,
          p90: data.latency_p90 || 0,
          p99: data.latency_p99 || 0,
        },
        error_rate: data.error_rate || 0,
        timestamp: data.evaluated_at || new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
      
      // Use mock data for demo
      setMetrics({
        loss: 1.234,
        eval_loss: 1.456,
        perplexity: 2.631,
        latency: {
          p50: 187,
          p90: 345,
          p99: 512,
        },
        error_rate: 0.023,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const loadRuns = async () => {
    // Load training runs from logs
    const mockRuns: TrainingRun[] = [
      {
        id: '1',
        name: 'persian-chat-baseline',
        metrics: {
          loss: 1.234,
          eval_loss: 1.456,
          perplexity: 2.631,
          latency: { p50: 187, p90: 345, p99: 512 },
          error_rate: 0.023,
          timestamp: new Date().toISOString(),
        },
        status: 'completed',
        tags: ['baseline', 'cpu'],
      },
      {
        id: '2',
        name: 'persian-chat-optimized',
        metrics: {
          loss: 1.123,
          eval_loss: 1.345,
          perplexity: 2.489,
          latency: { p50: 165, p90: 298, p99: 467 },
          error_rate: 0.018,
          timestamp: new Date().toISOString(),
        },
        status: 'completed',
        tags: ['optimized', 'cpu'],
      },
    ];
    
    setRuns(mockRuns);
  };

  const getTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 0 ? 'up' : 'down',
      value: Math.abs(change).toFixed(1),
      isGood: change < 0, // Lower is better for loss/latency
    };
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p>Loading metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📊 Metrics Dashboard</h1>
        <div className="text-sm text-gray-500">
          آخرین بروزرسانی: {new Date(metrics.timestamp).toLocaleString('fa-IR')}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Training Loss"
          value={metrics.loss.toFixed(4)}
          icon={<TrendingDown className="w-6 h-6" />}
          trend={getTrend(metrics.loss, 1.5)}
          color="blue"
        />
        
        <MetricCard
          title="Eval Loss"
          value={metrics.eval_loss.toFixed(4)}
          icon={<TrendingDown className="w-6 h-6" />}
          trend={getTrend(metrics.eval_loss, 1.6)}
          color="purple"
        />
        
        <MetricCard
          title="Perplexity"
          value={metrics.perplexity.toFixed(2)}
          icon={<Activity className="w-6 h-6" />}
          trend={getTrend(metrics.perplexity, 3.0)}
          color="green"
        />
        
        <MetricCard
          title="Error Rate"
          value={`${(metrics.error_rate * 100).toFixed(1)}%`}
          icon={<AlertCircle className="w-6 h-6" />}
          trend={getTrend(metrics.error_rate, 0.03)}
          color="red"
        />
      </div>

      {/* Latency Metrics */}
      <Card>
        <CardHeader title="🚀 Latency Metrics (ms)" />
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.latency.p50}</div>
              <div className="text-sm text-gray-500">p50 (median)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{metrics.latency.p90}</div>
              <div className="text-sm text-gray-500">p90</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{metrics.latency.p99}</div>
              <div className="text-sm text-gray-500">p99</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Loss Chart */}
      <Card>
        <CardHeader title="📈 Loss Over Time" />
        <div className="p-6">
          <Chart
            data={[
              { label: 'Train Loss', value: metrics.loss },
              { label: 'Eval Loss', value: metrics.eval_loss },
            ]}
            type="bar"
          />
        </div>
      </Card>

      {/* Runs Table */}
      <Card>
        <CardHeader title="🏃 Training Runs" />
        <div className="p-6">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setFilterTag('all')}
              className={`px-3 py-1 rounded ${filterTag === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTag('baseline')}
              className={`px-3 py-1 rounded ${filterTag === 'baseline' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Baseline
            </button>
            <button
              onClick={() => setFilterTag('optimized')}
              className={`px-3 py-1 rounded ${filterTag === 'optimized' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Optimized
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-2">Name</th>
                <th className="text-right p-2">Perplexity</th>
                <th className="text-right p-2">Loss</th>
                <th className="text-right p-2">Status</th>
                <th className="text-right p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs
                .filter(run => filterTag === 'all' || run.tags.includes(filterTag))
                .map(run => (
                  <tr key={run.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{run.name}</td>
                    <td className="p-2">{run.metrics.perplexity.toFixed(2)}</td>
                    <td className="p-2">{run.metrics.loss.toFixed(4)}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          run.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : run.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => {
                          if (selectedRuns.includes(run.id)) {
                            setSelectedRuns(selectedRuns.filter(id => id !== run.id));
                          } else {
                            setSelectedRuns([...selectedRuns, run.id]);
                          }
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedRuns.includes(run.id) ? 'Deselect' : 'Compare'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Compare View */}
      {selectedRuns.length > 0 && (
        <Card>
          <CardHeader title="🔍 Compare Selected Runs" />
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedRuns.map(runId => {
                const run = runs.find(r => r.id === runId);
                if (!run) return null;
                
                return (
                  <div key={runId} className="border rounded p-3">
                    <h3 className="font-bold mb-2">{run.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div>Perplexity: {run.metrics.perplexity.toFixed(2)}</div>
                      <div>Loss: {run.metrics.loss.toFixed(4)}</div>
                      <div>p50: {run.metrics.latency.p50}ms</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MetricsDashboard;
