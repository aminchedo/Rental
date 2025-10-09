/**
 * Text-to-Speech (TTS) Service
 *
 * Converts Persian text to speech audio (WAV format)
 * Returns WAV stream with metadata
 */
import { z } from 'zod';
export declare const TTSRequestSchema: z.ZodObject<{
    text: z.ZodString;
    lang: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    voice: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    speed: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    lang: string;
    text: string;
    voice: string;
    speed: number;
}, {
    text: string;
    lang?: string | undefined;
    voice?: string | undefined;
    speed?: number | undefined;
}>;
export interface TTSResponse {
    audio: Buffer;
    format: string;
    sample_rate: number;
    duration_seconds: number;
    text_length: number;
    timestamp: string;
}
/**
 * Process text and generate speech audio
 *
 * @param text - Persian text to synthesize
 * @param lang - Language code (default 'fa')
 * @param voice - Voice identifier (default 'default')
 * @param speed - Speech speed multiplier (0.5-2.0, default 1.0)
 * @returns TTS response with WAV audio and metadata
 */
export declare function processTTS(text: string, _lang?: string, _voice?: string, speed?: number): Promise<TTSResponse>;
/**
 * Validate and process TTS request
 */
export declare function handleTTSRequest(text: string, lang?: string, voice?: string, speed?: number): Promise<TTSResponse>;
/**
 * Get TTS latency percentiles from logs
 * Returns p50, p90, p99 latencies in milliseconds
 */
export declare function getTTSLatencyStats(): {
    p50: number;
    p90: number;
    p99: number;
} | null;
//# sourceMappingURL=tts.d.ts.map