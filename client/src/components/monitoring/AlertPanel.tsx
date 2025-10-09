/**
 * Alert Panel Component
 * 
 * Display system alerts with thresholds and actions
 */

import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, Bell } from 'lucide-react';
import { Card, CardHeader, Badge, Alert } from '../ui';

export interface AlertRule {
  id: string;
  metric: string;
  threshold: number;
  condition: '>' | '<' | '=' | '>=' | '<=';
  severity: 'success' | 'warning' | 'danger' | 'info';
  message: string;
}

export interface AlertItem {
  id: string;
  ruleId: string;
  triggered: boolean;
  currentValue: number;
  timestamp: Date;
  acknowledged?: boolean;
}

export interface AlertPanelProps {
  alerts: AlertItem[];
  rules: AlertRule[];
  onAcknowledge?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  rules,
  onAcknowledge,
  onDismiss,
}) => {
  const activeAlerts = alerts.filter(a => a.triggered && !a.acknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.triggered && a.acknowledged);

  const getRuleById = (ruleId: string) => rules.find(r => r.id === ruleId);

  const severityIcons = {
    success: <CheckCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    danger: <XCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <Bell size={20} />
            <span>Active Alerts</span>
            {activeAlerts.length > 0 && (
              <Badge variant="danger" dot>
                {activeAlerts.length}
              </Badge>
            )}
          </div>
        }
      />

      <div className="space-y-3">
        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Needs Attention
            </h4>
            {activeAlerts.map(alert => {
              const rule = getRuleById(alert.ruleId);
              if (!rule) return null;

              return (
                <Alert
                  key={alert.id}
                  variant={rule.severity}
                  title={rule.metric}
                  dismissible={!!onDismiss}
                  onDismiss={() => onDismiss?.(alert.id)}
                >
                  <div className="space-y-2">
                    <p>{rule.message}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span>
                        Current: <strong>{alert.currentValue}</strong>
                      </span>
                      <span>
                        Threshold: <strong>{rule.condition} {rule.threshold}</strong>
                      </span>
                      <span className="text-gray-500">
                        {alert.timestamp.toLocaleTimeString('fa-IR')}
                      </span>
                    </div>
                    {onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="
                          text-sm text-blue-600 dark:text-blue-400
                          hover:underline focus:outline-none
                        "
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </Alert>
              );
            })}
          </div>
        )}

        {/* Acknowledged Alerts */}
        {acknowledgedAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Acknowledged
            </h4>
            {acknowledgedAlerts.map(alert => {
              const rule = getRuleById(alert.ruleId);
              if (!rule) return null;

              return (
                <div
                  key={alert.id}
                  className="
                    p-3 rounded-lg
                    bg-gray-50 dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    opacity-60
                  "
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {rule.metric}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {rule.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Alerts */}
        {activeAlerts.length === 0 && acknowledgedAlerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              All systems operational
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AlertPanel;
