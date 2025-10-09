import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../types/chat.types';
import { postChat } from '../services/chat.service';
import { storage } from '../../../shared/utils/storage';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => storage.get<ChatMessage[]>('chat_history') ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { storage.set('chat_history', messages.slice(-50)); }, [messages]);

  const scrollBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  const send = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    const user: ChatMessage = { id: `u_${Date.now()}`, role: 'user', content: content.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, user]);
    setIsLoading(true); setError(null);

    try {
      const data = await postChat([...messages, user]);
      const assistant: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: data.content ?? '…',
        timestamp: new Date().toISOString(),
        metadata: { tokens: data.usage?.output_tokens, model: data.model }
      };
      setMessages(prev => [...prev, assistant]);
    } catch (e:any) {
      setError(e);
    } finally {
      setIsLoading(false);
      setTimeout(scrollBottom, 50);
    }
  }, [isLoading, messages]);

  const clear = () => setMessages([]);
  const del = (id: string) => setMessages(prev => prev.filter(m => m.id !== id));

  return { messages, isLoading, error, send, clear, del, endRef };
}
