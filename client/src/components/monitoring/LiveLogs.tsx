/**
 * Live Logs Component
 * 
 * Streaming log viewer with auto-scroll and filtering
 */

import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Play, Pause, Trash2, Download } from 'lucide-react';
import { Card, CardHeader, Badge, Button } from '../ui';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

export interface LiveLogsProps {
  logs: LogEntry[];
  maxLogs?: number;
  autoScroll?: boolean;
  onClear?: () => void;
  onExport?: () => void;
}

export const LiveLogs: React.FC<LiveLogsProps> = ({
  logs,
  maxLogs = 1000,
  autoScroll: initialAutoScroll = true,
  onClear,
  onExport,
}) => {
  const [autoScroll, setAutoScroll] = useState(initialAutoScroll);
  const [filter, setFilter] = useState<string>('all');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    if (!isAtBottom && autoScroll) {
      setAutoScroll(false);
    }
  };

  const levelColors = {
    info: 'text-blue-600 dark:text-blue-400',
    warn: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    debug: 'text-gray-600 dark:text-gray-400',
  };

  const levelBadgeVariants = {
    info: 'info' as const,
    warn: 'warning' as const,
    error: 'danger' as const,
    debug: 'default' as const,
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter);

  const displayLogs = filteredLogs.slice(-maxLogs);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <Terminal size={20} />
            <span>Streaming Logs</span>
            <Badge variant="info">{displayLogs.length}</Badge>
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            {/* Level Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="
                h-9 px-3 text-sm rounded-lg
                bg-white dark:bg-gray-800
                border border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500
              "
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>

            {/* Controls */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAutoScroll(!autoScroll)}
              icon={autoScroll ? <Pause size={16} /> : <Play size={16} />}
              title={autoScroll ? 'Pause auto-scroll' : 'Resume auto-scroll'}
            />
            
            {onExport && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onExport}
                icon={<Download size={16} />}
                title="Export logs"
              />
            )}
            
            {onClear && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onClear}
                icon={<Trash2 size={16} />}
                title="Clear logs"
              />
            )}
          </div>
        }
      />

      {/* Logs Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="
          flex-1 overflow-y-auto
          bg-gray-900 dark:bg-black
          font-mono text-sm
          p-4 rounded-lg
          min-h-[400px] max-h-[600px]
        "
      >
        {displayLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No logs to display
          </div>
        ) : (
          displayLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 py-1 hover:bg-gray-800 dark:hover:bg-gray-900 px-2 -mx-2 rounded"
            >
              <Badge variant={levelBadgeVariants[log.level]} size="sm">
                {log.level.toUpperCase()}
              </Badge>
              
              <span className="text-gray-500 text-xs whitespace-nowrap">
                {log.timestamp.toLocaleTimeString('fa-IR')}
              </span>
              
              <span className={`flex-1 ${levelColors[log.level]}`}>
                {log.message}
              </span>
              
              {log.metadata && (
                <span className="text-gray-600 dark:text-gray-500 text-xs">
                  {JSON.stringify(log.metadata)}
                </span>
              )}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
        <span>
          {displayLogs.length} / {maxLogs} logs
        </span>
        <span>
          {autoScroll ? 'Auto-scroll: ON' : 'Auto-scroll: OFF'}
        </span>
      </div>
    </Card>
  );
};

export default LiveLogs;
