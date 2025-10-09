/**
 * Settings Page
 * 
 * Application settings with theme, language, and monitoring preferences
 */

import React, { useState } from 'react';
import { Save, Moon, Sun, Globe, Type, Layout, Bell, Download, Upload } from 'lucide-react';
import { Card, CardHeader, Button, Input, Select, Tabs, Tab, Alert } from '../components/ui';
import { useTranslation } from '../i18n';
import { useTheme } from '../context/ThemeContext';

interface AppSettings {
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: 'fa' | 'en';
    fontSize: 'sm' | 'base' | 'lg';
    density: 'compact' | 'comfortable' | 'spacious';
  };
  api: {
    endpoint: string;
    apiKey: string;
  };
  alerts: {
    enabled: boolean;
    thresholds: {
      lossIncrease: number;
      latencyP99: number;
      errorRate: number;
    };
  };
}

export const MonitoringSettingsPage: React.FC = () => {
  const { t, locale } = useTranslation('fa');
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    appearance: {
      theme: theme as 'light' | 'dark' | 'system',
      language: locale,
      fontSize: 'base',
      density: 'comfortable',
    },
    api: {
      endpoint: 'http://localhost:3001',
      apiKey: '••••••••••••••••',
    },
    alerts: {
      enabled: true,
      thresholds: {
        lossIncrease: 0.5,
        latencyP99: 500,
        errorRate: 2.0,
      },
    },
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('app-settings', JSON.stringify(settings));
    
    // Apply theme
    setTheme(settings.appearance.theme);
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'settings.json';
    link.click();
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setSettings(imported);
      } catch (error) {
        console.error('Failed to import settings:', error);
      }
    };
    reader.readAsText(file);
  };

  const tabs: Tab[] = [
    {
      id: 'appearance',
      label: t.settings.appearance,
      icon: <Layout size={18} />,
      content: (
        <div className="space-y-6">
          <Select
            label={t.settings.theme}
            value={settings.appearance.theme}
            onChange={(e) => setSettings({
              ...settings,
              appearance: { ...settings.appearance, theme: e.target.value as any }
            })}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
            fullWidth
            icon={theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          />

          <Select
            label={t.settings.language}
            value={settings.appearance.language}
            onChange={(e) => setSettings({
              ...settings,
              appearance: { ...settings.appearance, language: e.target.value as any }
            })}
            options={[
              { value: 'fa', label: 'فارسی (Persian)' },
              { value: 'en', label: 'English' },
            ]}
            fullWidth
            icon={<Globe size={20} />}
          />

          <Select
            label={t.settings.fontSize}
            value={settings.appearance.fontSize}
            onChange={(e) => setSettings({
              ...settings,
              appearance: { ...settings.appearance, fontSize: e.target.value as any }
            })}
            options={[
              { value: 'sm', label: 'Small (14px)' },
              { value: 'base', label: 'Base (16px)' },
              { value: 'lg', label: 'Large (18px)' },
            ]}
            fullWidth
            icon={<Type size={20} />}
          />

          <Select
            label={t.settings.density}
            value={settings.appearance.density}
            onChange={(e) => setSettings({
              ...settings,
              appearance: { ...settings.appearance, density: e.target.value as any }
            })}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'spacious', label: 'Spacious' },
            ]}
            fullWidth
          />
        </div>
      ),
    },
    {
      id: 'api',
      label: 'API',
      content: (
        <div className="space-y-6">
          <Alert variant="info">
            Configure your API endpoint and authentication credentials.
          </Alert>

          <Input
            label={t.settings.apiEndpoint}
            value={settings.api.endpoint}
            onChange={(e) => setSettings({
              ...settings,
              api: { ...settings.api, endpoint: e.target.value }
            })}
            fullWidth
            helperText="Backend API base URL"
          />

          <Input
            label={t.settings.apiKey}
            type="password"
            value={settings.api.apiKey}
            onChange={(e) => setSettings({
              ...settings,
              api: { ...settings.api, apiKey: e.target.value }
            })}
            fullWidth
            helperText="API key is masked for security"
          />
        </div>
      ),
    },
    {
      id: 'alerts',
      label: t.settings.alerts,
      icon: <Bell size={18} />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Enable Alerts
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive notifications when thresholds are exceeded
              </p>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                alerts: { ...settings.alerts, enabled: !settings.alerts.enabled }
              })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${settings.alerts.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${settings.alerts.enabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {t.settings.thresholds}
            </h4>

            <Input
              label="Loss Increase Threshold"
              type="number"
              step="0.1"
              value={settings.alerts.thresholds.lossIncrease}
              onChange={(e) => setSettings({
                ...settings,
                alerts: {
                  ...settings.alerts,
                  thresholds: {
                    ...settings.alerts.thresholds,
                    lossIncrease: parseFloat(e.target.value) || 0
                  }
                }
              })}
              fullWidth
              helperText="Alert when eval loss increases by this amount"
            />

            <Input
              label="Latency P99 Threshold (ms)"
              type="number"
              value={settings.alerts.thresholds.latencyP99}
              onChange={(e) => setSettings({
                ...settings,
                alerts: {
                  ...settings.alerts,
                  thresholds: {
                    ...settings.alerts.thresholds,
                    latencyP99: parseInt(e.target.value) || 0
                  }
                }
              })}
              fullWidth
              helperText="Alert when P99 latency exceeds this value"
            />

            <Input
              label="Error Rate Threshold (%)"
              type="number"
              step="0.1"
              value={settings.alerts.thresholds.errorRate}
              onChange={(e) => setSettings({
                ...settings,
                alerts: {
                  ...settings.alerts,
                  thresholds: {
                    ...settings.alerts.thresholds,
                    errorRate: parseFloat(e.target.value) || 0
                  }
                }
              })}
              fullWidth
              helperText="Alert when error rate exceeds this percentage"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t.settings.title}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            icon={<Upload size={20} />}
            onClick={() => document.getElementById('import-settings')?.click()}
          >
            {t.common.import}
          </Button>
          <input
            id="import-settings"
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            className="hidden"
          />
          <Button
            variant="ghost"
            icon={<Download size={20} />}
            onClick={handleExportSettings}
          >
            {t.common.export}
          </Button>
          <Button
            icon={<Save size={20} />}
            onClick={handleSave}
          >
            {t.common.save}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <Alert variant="success" dismissible onDismiss={() => setSaveSuccess(false)}>
          Settings saved successfully!
        </Alert>
      )}

      {/* Settings Tabs */}
      <Card padding="none">
        <div className="p-6">
          <Tabs tabs={tabs} variant="pills" />
        </div>
      </Card>
    </div>
  );
};

export default MonitoringSettingsPage;
