import React, { useEffect, useRef, useState } from 'react';
import { Download, MessageSquare, Mic, MicOff, RefreshCw, Send, Trash2, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../features/chat/hooks/useChat';
import { Button } from '../shared/components/ui/Button';

const ChatPage: React.FC = () => {
  const { messages, isLoading, error, send, clear, del, endRef } = useChat();
  const [value, setValue] = useState('');
  const [recording, setRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const onSend = async () => {
    if (!value.trim()) return;
    await send(value);
    setValue('');
  };

  const copyText = async (t: string) => { try { await navigator.clipboard.writeText(t); } catch {} };

  const exportChat = () => {
    const blob = new Blob([JSON.stringify({ messages }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `chat-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[70vh]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">گفتگو</h2>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportChat} title="خروجی گفتگو"><Download size={16}/> خروجی</Button>
          <Button variant="ghost" onClick={clear} title="پاکسازی"><Trash2 size={16}/> پاکسازی</Button>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="text-white" size={28}/>
            </div>
            <p className="text-sm opacity-80">سوال خود را بپرسید…</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl rounded-2xl px-5 py-3 shadow-sm border ${m.role === 'user'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800'
            }`}>
              <div className="prose dark:prose-invert max-w-none">
                {m.role === 'assistant'
                  ? <ReactMarkdown>{m.content}</ReactMarkdown>
                  : <p className="whitespace-pre-wrap">{m.content}</p>}
              </div>
              <div className="mt-2 flex items-center gap-2 opacity-70 text-xs">
                <button className="hover:opacity-100" onClick={() => copyText(m.content)} title="کپی"><Copy size={14}/></button>
                <button className="hover:opacity-100" onClick={() => del(m.id)} title="حذف"><Trash2 size={14}/></button>
                {m.metadata?.model && <span>• مدل: {m.metadata.model}</span>}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        )}
        {error && <div className="card p-4 border-red-300 text-red-700 dark:text-red-300 dark:border-red-900">خطا: {error.message}</div>}
        <div ref={endRef} />
      </div>

      <div className="card p-3 sticky bottom-4">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
            placeholder="پیام خود را بنویسید… (Enter برای ارسال، Shift+Enter برای خط جدید)"
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 focus-ring max-h-40"
          />
          <button
            onClick={() => setRecording(r => !r)}
            className={`rounded-lg p-3 focus-ring ${recording ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
            title={recording ? 'توقف ضبط' : 'شروع ضبط'}>
            {recording ? <MicOff size={18}/> : <Mic size={18}/>}
          </button>
          {isLoading ? (
            <Button onClick={() => { /* no-op cancel hook stub */ }} className="bg-red-600 hover:bg-red-700"><RefreshCw className="animate-spin" size={16}/> لغو</Button>
          ) : (
            <Button onClick={onSend} disabled={!value.trim()}><Send size={16}/> ارسال</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
