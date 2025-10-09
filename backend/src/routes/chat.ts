/**
 * Chat Route Handler (TypeScript)
 * 
 * Features:
 * - Streaming token-by-token responses
 * - Temperature control (0.2-0.4 default)
 * - Zod input validation
 * - Structured JSON errors
 * - Request/error logging
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { handleSearchRequest, buildContextWindow } from '../services/search';

const router = Router();

// Zod schema for request validation
const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })).optional(),
  temperature: z.number().min(0.1).max(1.0).optional().default(0.3),
  stream: z.boolean().optional().default(true),
  max_tokens: z.number().optional().default(512),
  use_retrieval: z.boolean().optional().default(false)
});

// Type for validated chat request
// type ChatRequest = z.infer<typeof ChatRequestSchema>;

/**
 * System prompt - Persian-only enforcement
 * (Used in production model inference)
 */
const SYSTEM_PROMPT = `شما یک دستیار هوشمند فارسی‌زبان هستید.

قوانین مهم:
- به طور پیش‌فرض به زبان فارسی (fa-IR) پاسخ دهید.
- از اصطلاحات فنی دقیق فارسی استفاده کنید.
- اگر کاربر به زبان دیگری صحبت کرد، از همان زبان استفاده کنید.
- پاسخ‌های خود را دقیق، مفید و مختصر ارائه دهید.`;

// Prevent unused variable error in simulation mode
console.log('System prompt loaded:', SYSTEM_PROMPT.substring(0, 50) + '...');

/**
 * Simulate streaming response
 * In production: Use actual model inference
 */
async function generateStreamingResponse(
  _prompt: string,
  _temperature: number,
  onChunk: (chunk: string) => void
): Promise<void> {
  // Simulated Persian response
  const responses = [
    'سلام! چطور می‌توانم به شما کمک کنم؟',
    'از پرسش شما متشکرم. اجازه دهید پاسخ دهم.',
    'این یک پاسخ نمونه است. در محیط واقعی، از مدل آموزش‌دیده استفاده می‌شود.',
    'امیدوارم این پاسخ مفید باشد.'
  ];
  
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  // Stream word by word
  const words = response.split(' ');
  for (const word of words) {
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
    onChunk(word + ' ');
  }
}

/**
 * Generate complete response (non-streaming)
 */
async function generateCompleteResponse(
  _prompt: string,
  _temperature: number
): Promise<string> {
  const responses = [
    'سلام! چطور می‌توانم به شما کمک کنم؟',
    'از پرسش شما متشکرم. در محیط واقعی، از مدل آموزش‌دیده فارسی استفاده می‌شود.',
    'این یک پاسخ نمونه است. سیستم آماده پاسخگویی به سوالات شماست.',
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * POST /api/chat
 * Main chat endpoint with streaming support
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body with Zod
    const validatedData = ChatRequestSchema.parse(req.body);
    const { message, temperature, stream, use_retrieval } = validatedData;
    
    // Build conversation context (for production model)
    // const conversationMessages = messages || [
    //   { role: 'system' as const, content: SYSTEM_PROMPT },
    //   { role: 'user' as const, content: message }
    // ];
    
    // Perform search/retrieval if enabled
    let retrievalSources: Array<{ title: string; url?: string }> = [];
    
    if (use_retrieval) {
      const searchResult = await handleSearchRequest(message, 3, 'fa');
      if (searchResult.results.length > 0) {
        // Build context for future model integration
        buildContextWindow(searchResult.results, 500);
        retrievalSources = searchResult.results.map(r => ({
          title: r.title,
          url: r.url,
        }));
      }
    }
    
    // Log request
    const logsDir = path.join(process.cwd(), '..', 'logs');
    const requestLog = {
      timestamp: new Date().toISOString(),
      message: message.substring(0, 100),
      temperature,
      stream,
      use_retrieval,
      retrieval_sources: retrievalSources.length,
      ip: req.ip
    };
    
    fs.appendFileSync(
      path.join(logsDir, 'api.log'),
      JSON.stringify(requestLog) + '\n',
      'utf-8'
    );
    
    // Handle streaming response
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Temperature', temperature.toString());
      res.setHeader('X-Retrieval-Enabled', use_retrieval.toString());
      res.setHeader('X-Retrieval-Sources', retrievalSources.length.toString());
      
      // Send retrieval metadata first
      if (use_retrieval && retrievalSources.length > 0) {
        res.write(`data: ${JSON.stringify({ 
          type: 'retrieval', 
          sources: retrievalSources 
        })}\n\n`);
      }
      
      await generateStreamingResponse(
        message,
        temperature,
        (chunk: string) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      );
      
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // Handle non-streaming response
      const response = await generateCompleteResponse(message, temperature);
      
      res.json({
        response,
        temperature,
        use_retrieval,
        retrieval_sources: use_retrieval ? retrievalSources : undefined,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const logsDir = path.join(process.cwd(), '..', 'logs');
      fs.appendFileSync(
        path.join(logsDir, 'api.log'),
        `VALIDATION_ERROR: ${JSON.stringify(error.errors)}\n`,
        'utf-8'
      );
      
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const logsDir = path.join(process.cwd(), '..', 'logs');
    fs.appendFileSync(
      path.join(logsDir, 'api.log'),
      `ERROR: ${errorMessage}\n`,
      'utf-8'
    );
    
    res.status(500).json({
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
