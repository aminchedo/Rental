import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, Moon, Sun, Loader, Trash2, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSettings {
  apiEndpoint: string;
  apiKey: string;
  temperature: number;
  useLocalModel: boolean;
}

const PersianChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(() => {
    const saved = localStorage.getItem('chatSettings');
    return saved ? JSON.parse(saved) : {
      apiEndpoint: 'http://localhost:3001/api/chat',
      apiKey: '',
      temperature: 0.3,
      useLocalModel: true
    };
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('chatSettings', JSON.stringify(settings));
  }, [settings]);

  // Save dark mode to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const endpoint = settings.useLocalModel || !settings.apiKey 
        ? 'http://localhost:3001/api/chat'
        : settings.apiEndpoint;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.apiKey && !settings.useLocalModel ? { 'Authorization': `Bearer ${settings.apiKey}` } : {})
        },
        body: JSON.stringify({
          message: userMessage.content,
          temperature: settings.temperature,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'معذرت می‌خواهم، نتوانستم پاسخ مناسبی تولید کنم.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('خطا در ارسال پیام. لطفاً دوباره تلاش کنید.');
      
      // Fallback response
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'متأسفانه در حال حاضر قادر به پاسخگویی نیستم. لطفاً بعداً تلاش کنید.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key === 'Escape') {
      setInput('');
    }
  };

  const clearChat = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید تاریخچه چت را پاک کنید؟')) {
      setMessages([]);
      localStorage.removeItem('chatHistory');
      toast.success('تاریخچه چت پاک شد');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`} dir="rtl">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm sticky top-0 z-10`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            چت فارسی هوشمند
          </h1>
          
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              aria-label="تغییر حالت تاریک/روشن"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Settings button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' : 'bg-gray-100 text-blue-600 hover:bg-gray-200'}`}
              aria-label="تنظیمات"
            >
              <Settings size={20} />
            </button>

            {/* Clear chat */}
            <button
              onClick={clearChat}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-red-400 hover:bg-gray-600' : 'bg-gray-100 text-red-600 hover:bg-gray-200'}`}
              aria-label="پاک کردن چت"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div 
            className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">تنظیمات</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Use local model toggle */}
              <div className="flex items-center justify-between">
                <label className="font-medium">استفاده از مدل محلی</label>
                <input
                  type="checkbox"
                  checked={settings.useLocalModel}
                  onChange={(e) => setSettings({ ...settings, useLocalModel: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </div>

              {!settings.useLocalModel && (
                <>
                  {/* API Endpoint */}
                  <div>
                    <label className="block font-medium mb-2">آدرس API</label>
                    <input
                      type="text"
                      value={settings.apiEndpoint}
                      onChange={(e) => setSettings({ ...settings, apiEndpoint: e.target.value })}
                      placeholder="https://api.example.com/chat"
                      className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      dir="ltr"
                    />
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="block font-medium mb-2">کلید API</label>
                    <input
                      type="password"
                      value={settings.apiKey}
                      onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                      placeholder="sk-..."
                      className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              {/* Temperature */}
              <div>
                <label className="block font-medium mb-2">
                  دما (Temperature): {settings.temperature}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>دقیق</span>
                  <span>خلاق</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSettings(false);
                toast.success('تنظیمات ذخیره شد');
              }}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              ذخیره تنظیمات
            </button>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 pb-32 pt-6">
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>💬</div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              سلام! من دستیار هوشمند فارسی‌زبان شما هستم
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              پیام خود را بنویسید و من به شما پاسخ خواهم داد
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'} animate-fade-in chat-message`}
              >
                {/* Chat bubble component */}
                <div
                  className={`chat-bubble message-bubble max-w-[80%] rounded-2xl px-5 py-3 ${
                    message.role === 'user'
                      ? darkMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-500 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-white text-gray-800 shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-end animate-fade-in">
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${darkMode ? 'bg-gray-700' : 'bg-white shadow-md'}`}>
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>در حال تایپ...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-gray-800 dark:border-gray-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="پیام خود را بنویسید... (Enter برای ارسال، Esc برای پاک کردن)"
              className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isTyping}
              aria-label="پیام چت"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="ارسال پیام"
            >
              <Send size={20} />
            </button>
          </div>
          <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {settings.useLocalModel || !settings.apiKey ? 'استفاده از مدل محلی' : 'استفاده از API خارجی'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PersianChatPage;
