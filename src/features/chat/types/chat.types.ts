import type { ChatRole } from '../../../core/types/global.types';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  metadata?: { tokens?: number; model?: string };
}
