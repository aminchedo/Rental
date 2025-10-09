/**
 * Speech-to-Text (STT) Service
 *
 * Provides Persian speech recognition capabilities
 * Accepts WAV/OGG audio and returns Persian transcript
 */
import { z } from 'zod';
export declare const STTRequestSchema: z.ZodObject<{
    audio: z.ZodUnion<[z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>, z.ZodString]>;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<["wav", "ogg", "mp3"]>>>;
    sample_rate: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    audio: string | Buffer<ArrayBufferLike>;
    format: "wav" | "ogg" | "mp3";
    sample_rate: number;
}, {
    audio: string | Buffer<ArrayBufferLike>;
    format?: "wav" | "ogg" | "mp3" | undefined;
    sample_rate?: number | undefined;
}>;
export interface STTResponse {
    text: string;
    confidence: number;
    lang: string;
    duration_ms: number;
    timestamp: string;
}
/**
 * Process audio and return Persian transcript
 *
 * @param audioBuffer - Audio data as Buffer
 * @param format - Audio format (wav, ogg, mp3)
 * @param sampleRate - Sample rate in Hz (default 16000)
 * @returns STT response with Persian text and confidence
 */
export declare function processSTT(audioBuffer: Buffer, format?: string, sampleRate?: number): Promise<STTResponse>;
/**
 * Validate and process STT request
 */
export declare function handleSTTRequest(audioData: Buffer | string, format?: string, sampleRate?: number): Promise<STTResponse>;
/**
 * Save audio recording for debugging
 * Keeps last 3 recordings in audio/smoke/
 */
export declare function saveRecordingForDebug(audioBuffer: Buffer, filename: string): void;
//# sourceMappingURL=stt.d.ts.map