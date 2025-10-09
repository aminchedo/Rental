/**
 * Run Timeline Component
 * 
 * Visual timeline of training/evaluation runs with phases
 */

import React from 'react';
import { CheckCircle, Clock, XCircle, Loader } from 'lucide-react';
import { Card, CardHeader, Badge } from '../ui';

export interface TimelinePhase {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
}

export interface RunTimelineProps {
  runId: string;
  phases: TimelinePhase[];
  className?: string;
}

export const RunTimeline: React.FC<RunTimelineProps> = ({
  runId,
  phases,
  className = '',
}) => {
  const statusIcons = {
    pending: <Clock size={20} className="text-gray-400" />,
    running: <Loader size={20} className="text-blue-600 animate-spin" />,
    completed: <CheckCircle size={20} className="text-green-600" />,
    failed: <XCircle size={20} className="text-red-600" />,
  };

  const statusColors = {
    pending: 'bg-gray-200 dark:bg-gray-700',
    running: 'bg-blue-600',
    completed: 'bg-green-600',
    failed: 'bg-red-600',
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <Card className={className}>
      <CardHeader
        title="Run Timeline"
        subtitle={`Run ID: ${runId}`}
      />

      <div className="space-y-4">
        {phases.map((phase, index) => {
          const isLast = index === phases.length - 1;

          return (
            <div key={phase.id} className="flex gap-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${phase.status === 'pending' 
                    ? 'bg-gray-100 dark:bg-gray-800' 
                    : 'bg-white dark:bg-gray-900 border-2'
                  }
                  ${phase.status === 'running' ? 'border-blue-600' : ''}
                  ${phase.status === 'completed' ? 'border-green-600' : ''}
                  ${phase.status === 'failed' ? 'border-red-600' : ''}
                `}>
                  {statusIcons[phase.status]}
                </div>
                {!isLast && (
                  <div className={`
                    w-0.5 h-12 mt-1
                    ${phase.status === 'completed' ? statusColors.completed : statusColors.pending}
                  `} />
                )}
              </div>

              {/* Phase Details */}
              <div className="flex-1 pb-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {phase.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          phase.status === 'completed' ? 'success' :
                          phase.status === 'failed' ? 'danger' :
                          phase.status === 'running' ? 'info' : 'default'
                        }
                        size="sm"
                      >
                        {phase.status}
                      </Badge>
                      {phase.duration && (
                        <span className="text-xs text-gray-500">
                          {formatDuration(phase.duration)}
                        </span>
                      )}
                    </div>
                  </div>

                  {phase.startTime && (
                    <div className="text-xs text-gray-500 text-left">
                      {phase.startTime.toLocaleString('fa-IR')}
                    </div>
                  )}
                </div>

                {phase.error && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                    {phase.error}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RunTimeline;
