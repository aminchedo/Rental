/**
 * Experiments Page
 * 
 * Table view of training runs with detail drawer
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Download } from 'lucide-react';
import { Table, TableColumn, Drawer, Button, Input, Select, Badge, Card, Chart } from '../components/ui';
import { RunTimeline, TimelinePhase } from '../components/monitoring/RunTimeline';
import { useTranslation } from '../i18n';

export interface Experiment {
  id: string;
  runId: string;
  dataset: string;
  datasetVersion: string;
  hyperparams: {
    epochs: number;
    batchSize: number;
    learningRate: number;
    temperature?: number;
  };
  status: 'pending' | 'running' | 'completed' | 'failed';
  metrics: {
    loss: number;
    evalLoss: number;
    perplexity: number;
    latencyP50: number;
    latencyP90: number;
    latencyP99: number;
  };
  startTime: Date;
  endTime?: Date;
  notes?: string;
  tags: string[];
}

export const ExperimentsPage: React.FC = () => {
  const { t, locale } = useTranslation('fa');
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Mock data - replace with actual API calls
  const experiments: Experiment[] = [
    {
      id: '1',
      runId: 'run-001',
      dataset: 'ParsBERT-Fa',
      datasetVersion: 'v1.0',
      hyperparams: {
        epochs: 3,
        batchSize: 4,
        learningRate: 5e-5,
        temperature: 0.3,
      },
      status: 'completed',
      metrics: {
        loss: 2.34,
        evalLoss: 2.56,
        perplexity: 12.8,
        latencyP50: 120,
        latencyP90: 180,
        latencyP99: 250,
      },
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 1800000),
      notes: 'Initial baseline run',
      tags: ['baseline', 'persian'],
    },
    {
      id: '2',
      runId: 'run-002',
      dataset: 'PersianMind',
      datasetVersion: 'v1.0',
      hyperparams: {
        epochs: 5,
        batchSize: 8,
        learningRate: 3e-5,
        temperature: 0.4,
      },
      status: 'running',
      metrics: {
        loss: 1.89,
        evalLoss: 2.12,
        perplexity: 8.3,
        latencyP50: 95,
        latencyP90: 145,
        latencyP99: 210,
      },
      startTime: new Date(Date.now() - 1800000),
      tags: ['optimization'],
    },
  ];

  // Filtering and sorting
  const filteredExperiments = useMemo(() => {
    let result = experiments;

    // Search filter
    if (searchQuery) {
      result = result.filter(exp =>
        exp.runId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.dataset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(exp => exp.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = (a as any)[sortBy];
      let bVal = (b as any)[sortBy];

      if (sortBy.startsWith('metrics.')) {
        const metricKey = sortBy.split('.')[1];
        aVal = a.metrics[metricKey as keyof typeof a.metrics];
        bVal = b.metrics[metricKey as keyof typeof b.metrics];
      }

      if (aVal instanceof Date) {
        return sortDirection === 'asc' 
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      if (typeof aVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return result;
  }, [experiments, searchQuery, statusFilter, sortBy, sortDirection]);

  const columns: TableColumn<Experiment>[] = [
    {
      key: 'runId',
      label: t.experiments.runId,
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'dataset',
      label: t.experiments.dataset,
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.datasetVersion}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: t.experiments.status,
      sortable: true,
      render: (value) => (
        <Badge
          variant={
            value === 'completed' ? 'success' :
            value === 'running' ? 'info' :
            value === 'failed' ? 'danger' : 'default'
          }
          dot
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'metrics.perplexity',
      label: t.experiments.perplexity,
      sortable: true,
      render: (_, row) => (
        <span className="font-mono">{row.metrics.perplexity.toFixed(1)}</span>
      ),
    },
    {
      key: 'metrics.loss',
      label: t.experiments.loss,
      sortable: true,
      render: (_, row) => (
        <span className="font-mono">{row.metrics.loss.toFixed(2)}</span>
      ),
    },
    {
      key: 'metrics.latencyP50',
      label: `${t.experiments.latency} (p50)`,
      sortable: true,
      render: (_, row) => (
        <span className="font-mono">{row.metrics.latencyP50}ms</span>
      ),
    },
    {
      key: 'startTime',
      label: t.experiments.startTime,
      sortable: true,
      render: (value) => (
        <span className="text-sm">{value.toLocaleString('fa-IR')}</span>
      ),
    },
  ];

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  // Mock timeline data
  const timelinePhases: TimelinePhase[] = selectedExperiment ? [
    {
      id: '1',
      name: 'Data Loading',
      status: 'completed',
      startTime: selectedExperiment.startTime,
      duration: 30000,
    },
    {
      id: '2',
      name: 'Training',
      status: selectedExperiment.status === 'completed' ? 'completed' : 'running',
      startTime: new Date(selectedExperiment.startTime.getTime() + 30000),
      duration: 1200000,
    },
    {
      id: '3',
      name: 'Evaluation',
      status: selectedExperiment.status === 'completed' ? 'completed' : 'pending',
      startTime: selectedExperiment.endTime ? new Date(selectedExperiment.endTime.getTime() - 300000) : undefined,
      duration: 300000,
    },
  ] : [];

  return (
    <div className="space-y-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t.experiments.title}
        </h1>
        <div className="flex gap-2">
          <Button icon={<Download size={20} />} variant="secondary">
            {t.common.export}
          </Button>
          <Button icon={<Plus size={20} />}>
            New Run
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder={t.common.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={20} />}
              fullWidth
            />
          </div>
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'running', label: 'Running' },
              { value: 'completed', label: 'Completed' },
              { value: 'failed', label: 'Failed' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            icon={<Filter size={20} />}
          />
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredExperiments}
        keyExtractor={(row) => row.id}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No experiments found"
        className="cursor-pointer"
      />

      {/* Detail Drawer */}
      <Drawer
        isOpen={!!selectedExperiment}
        onClose={() => setSelectedExperiment(null)}
        title={selectedExperiment?.runId}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedExperiment(null)}>
              {t.common.close}
            </Button>
            <Button>
              Clone Run
            </Button>
          </>
        }
      >
        {selectedExperiment && (
          <div className="space-y-6">
            {/* Metrics Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card variant="outlined">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {t.experiments.loss}
                </h4>
                <p className="text-2xl font-bold">{selectedExperiment.metrics.loss.toFixed(3)}</p>
              </Card>
              <Card variant="outlined">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {t.experiments.perplexity}
                </h4>
                <p className="text-2xl font-bold">{selectedExperiment.metrics.perplexity.toFixed(1)}</p>
              </Card>
            </div>

            {/* Latency Chart */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Latency Percentiles</h3>
              <Chart
                type="bar"
                data={[
                  { name: 'p50', value: selectedExperiment.metrics.latencyP50 },
                  { name: 'p90', value: selectedExperiment.metrics.latencyP90 },
                  { name: 'p99', value: selectedExperiment.metrics.latencyP99 },
                ]}
                dataKeys={[{ key: 'value', color: '#3b82f6', name: 'Latency (ms)' }]}
                xAxisKey="name"
                height={250}
              />
            </Card>

            {/* Timeline */}
            <RunTimeline
              runId={selectedExperiment.runId}
              phases={timelinePhases}
            />

            {/* Hyperparameters */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">{t.experiments.hyperparams}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Epochs:</span>
                  <span className="ml-2 font-mono">{selectedExperiment.hyperparams.epochs}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Batch Size:</span>
                  <span className="ml-2 font-mono">{selectedExperiment.hyperparams.batchSize}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Learning Rate:</span>
                  <span className="ml-2 font-mono">{selectedExperiment.hyperparams.learningRate}</span>
                </div>
                {selectedExperiment.hyperparams.temperature && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Temperature:</span>
                    <span className="ml-2 font-mono">{selectedExperiment.hyperparams.temperature}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Notes and Tags */}
            {(selectedExperiment.notes || selectedExperiment.tags.length > 0) && (
              <Card>
                {selectedExperiment.notes && (
                  <>
                    <h3 className="text-lg font-semibold mb-2">{t.experiments.notes}</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {selectedExperiment.notes}
                    </p>
                  </>
                )}
                {selectedExperiment.tags.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-2">{t.experiments.tags}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExperiment.tags.map(tag => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ExperimentsPage;
