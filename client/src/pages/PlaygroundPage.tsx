/**
 * Playground Page
 * 
 * Interactive chat interface with token visualization and context inspector
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Eye, Loader, Trash2 } from 'lucide-react';
import { Card, CardHeader, Button, Input, Select, Badge, Tabs, Tab } from '../components/ui';
import { useTranslation } from '../i18n';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens?: string[];
  retrievedContext?: string[];
  timestamp: Date;
}

interface PlaygroundSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  retrievalEnabled: boolean;
}

export const PlaygroundPage: React.FC = () => {
  const { t, locale } = useTranslation('fa');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<PlaygroundSettings>({
    temperature: 0.3,
    maxTokens: 512,
    topP: 0.9,
    retrievalEnabled: true,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API call with token streaming
    setTimeout(() => {
      const mockTokens = ['سلام', '!', ' چطور', ' می', '‌توانم', ' کمک', 'تان', ' کنم', '؟'];
      const mockContext = settings.retrievalEnabled ? [
        'Document 1: معرفی سیستم هوش مصنوعی...',
        'Document 2: راهنمای استفاده از مدل...',
      ] : [];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockTokens.join(''),
        tokens: mockTokens,
        retrievedContext: mockContext,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const tabs: Tab[] = [
    {
      id: 'chat',
      label: 'Chat',
      content: (
        <div className="flex flex-col h-[600px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <p className="text-lg mb-2">Start a conversation</p>
                <p className="text-sm">Type your message below to begin</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`
                      max-w-[70%] rounded-lg p-4 cursor-pointer
                      ${message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }
                      hover:opacity-90 transition-opacity
                    `}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">{message.content}</p>
                      {message.tokens && (
                        <Badge size="sm" variant="info">
                          {message.tokens.length} tokens
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString('fa-IR')}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                  <Loader className="animate-spin" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.playground.userMessage}
                fullWidth
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                icon={<Send size={20} />}
              />
              <Button
                variant="ghost"
                onClick={() => setShowSettings(!showSettings)}
                icon={<Settings size={20} />}
              />
              <Button
                variant="ghost"
                onClick={() => setMessages([])}
                icon={<Trash2 size={20} />}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'inspector',
      label: 'Inspector',
      content: (
        <div className="p-4">
          {selectedMessage ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Message Details</h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm mb-2">
                    <strong>Role:</strong> {selectedMessage.role}
                  </p>
                  <p className="text-sm mb-2">
                    <strong>Timestamp:</strong> {selectedMessage.timestamp.toLocaleString('fa-IR')}
                  </p>
                  <p className="text-sm">
                    <strong>Content:</strong> {selectedMessage.content}
                  </p>
                </div>
              </div>

              {selectedMessage.tokens && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t.playground.tokenStream}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMessage.tokens.map((token, idx) => (
                      <Badge key={idx} variant="default">
                        {token}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedMessage.retrievedContext && selectedMessage.retrievedContext.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t.playground.context}</h3>
                  <div className="space-y-2">
                    {selectedMessage.retrievedContext.map((context, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <p className="text-sm text-blue-900 dark:text-blue-200">
                          {context}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <Eye size={48} className="mx-auto mb-3" />
              <p>Click on a message to inspect its details</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {t.playground.title}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <Tabs tabs={tabs} />
          </Card>
        </div>

        {/* Settings Panel */}
        <div>
          <Card>
            <CardHeader title={t.playground.settings} />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.playground.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 (Deterministic)</span>
                  <span className="font-mono">{settings.temperature}</span>
                  <span>1 (Creative)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.playground.maxTokens}
                </label>
                <Input
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) || 512 })}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.playground.topP}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.topP}
                  onChange={(e) => setSettings({ ...settings, topP: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="text-center text-xs text-gray-500 mt-1 font-mono">
                  {settings.topP}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.playground.retrievalEnabled}
                </label>
                <button
                  onClick={() => setSettings({ ...settings, retrievalEnabled: !settings.retrievalEnabled })}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${settings.retrievalEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.retrievalEnabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Session Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Messages:</span>
                <span className="font-mono">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Tokens:</span>
                <span className="font-mono">
                  {messages.reduce((sum, m) => sum + (m.tokens?.length || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Retrieval:</span>
                <Badge variant={settings.retrievalEnabled ? 'success' : 'default'}>
                  {settings.retrievalEnabled ? 'ON' : 'OFF'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundPage;
