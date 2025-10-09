import { api } from '../../../shared/utils/api';
import type { ChatMessage } from '../types/chat.types';

export async function postChat(messages: ChatMessage[], model?: string) {
  // Adjust to your backend route if needed
  const res = await api.post('/api/chat', {
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    model
  });
  return res.data as { content: string; model?: string; usage?: { output_tokens?: number } };
}
