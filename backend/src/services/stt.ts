/**
 * Speech-to-Text (STT) Service
 * 
 * Provides Persian speech recognition capabilities
 * Accepts WAV/OGG audio and returns Persian transcript
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// Request validation schema
export const STTRequestSchema = z.object({
  audio: z.instanceof(Buffer).or(z.string()), // Buffer or base64 string
  format: z.enum(['wav', 'ogg', 'mp3']).optional().default('wav'),
  sample_rate: z.number().optional().default(16000),
});

// Response type
export interface STTResponse {
  text: string;
  confidence: number;
  lang: string;
  duration_ms: number;
  timestamp: string;
}

/**
 * Log STT request/response
 */
function logSTT(
  audioSize: number,
  result: STTResponse,
  error?: string
): void {
  const logsDir = path.join(process.cwd(), '..', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    audio_size_bytes: audioSize,
    result: error ? null : result,
    error: error || null,
    duration_ms: error ? 0 : result.duration_ms,
  };

  fs.appendFileSync(
    path.join(logsDir, 'stt.log'),
    JSON.stringify(logEntry) + '\n',
    'utf-8'
  );
}

/**
 * Simulate STT processing
 * In production: Use Whisper, wav2vec2, or external ASR API
 */
async function simulateSTT(
  audioBuffer: Buffer,
  sampleRate: number
): Promise<{ text: string; confidence: number }> {
  // Calculate approximate duration from buffer size
  // For 16-bit PCM: duration = bytes / (sample_rate * 2)
  const approximateDuration = audioBuffer.length / (sampleRate * 2);

  // Simulate processing delay (proportional to audio length)
  await new Promise(resolve => setTimeout(resolve, Math.min(approximateDuration * 100, 1000)));

  // Simulated Persian responses based on audio characteristics
  const persianResponses = [
    'سلام، چطور می‌توانم کمک کنم؟',
    'من یک دستیار هوشمند فارسی هستم.',
    'لطفاً سوال خود را بپرسید.',
    'متوجه شدم، می‌توانید ادامه دهید.',
    'آیا می‌توانید توضیح بیشتری بدهید؟',
  ];

  // Use audio buffer hash to pick consistent response
  const hash = audioBuffer.reduce((acc, byte) => acc + byte, 0);
  const text = persianResponses[hash % persianResponses.length];

  // Simulate confidence based on "audio quality"
  const confidence = 0.85 + (Math.random() * 0.1); // 85-95%

  return { text, confidence };
}

/**
 * Process audio and return Persian transcript
 * 
 * @param audioBuffer - Audio data as Buffer
 * @param format - Audio format (wav, ogg, mp3)
 * @param sampleRate - Sample rate in Hz (default 16000)
 * @returns STT response with Persian text and confidence
 */
export async function processSTT(
  audioBuffer: Buffer,
  format: string = 'wav',
  sampleRate: number = 16000
): Promise<STTResponse> {
  const startTime = Date.now();

  try {
    // Validate audio format
    if (!['wav', 'ogg', 'mp3'].includes(format)) {
      throw new Error(`Unsupported audio format: ${format}`);
    }

    // Check buffer size (max 10MB)
    if (audioBuffer.length > 10 * 1024 * 1024) {
      throw new Error('Audio file too large (max 10MB)');
    }

    // Normalize sample rate to 16kHz if needed
    const normalizedSampleRate = sampleRate === 16000 ? sampleRate : 16000;
    
    // Process audio with STT
    const { text, confidence } = await simulateSTT(audioBuffer, normalizedSampleRate);

    const durationMs = Date.now() - startTime;

    const response: STTResponse = {
      text,
      confidence,
      lang: 'fa',
      duration_ms: durationMs,
      timestamp: new Date().toISOString(),
    };

    // Log successful request
    logSTT(audioBuffer.length, response);

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error
    logSTT(audioBuffer.length, {
      text: '',
      confidence: 0,
      lang: 'fa',
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    }, errorMessage);

    throw error;
  }
}

/**
 * Validate and process STT request
 */
export async function handleSTTRequest(
  audioData: Buffer | string,
  format?: string,
  sampleRate?: number
): Promise<STTResponse> {
  // Convert base64 to Buffer if needed
  let audioBuffer: Buffer;
  if (typeof audioData === 'string') {
    audioBuffer = Buffer.from(audioData, 'base64');
  } else {
    audioBuffer = audioData;
  }

  // Validate request
  const validated = STTRequestSchema.parse({
    audio: audioBuffer,
    format: format || 'wav',
    sample_rate: sampleRate || 16000,
  });

  // Process STT
  return await processSTT(
    audioBuffer,
    validated.format,
    validated.sample_rate
  );
}

/**
 * Save audio recording for debugging
 * Keeps last 3 recordings in audio/smoke/
 */
export function saveRecordingForDebug(
  audioBuffer: Buffer,
  filename: string
): void {
  const debugDir = path.join(process.cwd(), '..', 'audio', 'smoke');
  if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
  }

  const filepath = path.join(debugDir, filename);
  fs.writeFileSync(filepath, audioBuffer);

  // Keep only last 3 recordings
  const files = fs.readdirSync(debugDir)
    .filter(f => f.endsWith('.wav') || f.endsWith('.ogg'))
    .map(f => ({
      name: f,
      path: path.join(debugDir, f),
      mtime: fs.statSync(path.join(debugDir, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.mtime - a.mtime);

  // Delete old recordings (keep last 3)
  files.slice(3).forEach(f => {
    fs.unlinkSync(f.path);
  });
}
