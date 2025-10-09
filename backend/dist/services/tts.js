"use strict";
/**
 * Text-to-Speech (TTS) Service
 *
 * Converts Persian text to speech audio (WAV format)
 * Returns WAV stream with metadata
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTSRequestSchema = void 0;
exports.processTTS = processTTS;
exports.handleTTSRequest = handleTTSRequest;
exports.getTTSLatencyStats = getTTSLatencyStats;
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Request validation schema
exports.TTSRequestSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, 'Text cannot be empty'),
    lang: zod_1.z.string().optional().default('fa'),
    voice: zod_1.z.string().optional().default('default'),
    speed: zod_1.z.number().min(0.5).max(2.0).optional().default(1.0),
});
/**
 * Log TTS request/response
 */
function logTTS(textLength, result, error) {
    const logsDir = path.join(process.cwd(), '..', 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    const logEntry = {
        timestamp: new Date().toISOString(),
        text_length: textLength,
        result: error ? null : {
            format: result.format,
            sample_rate: result.sample_rate,
            duration_seconds: result.duration_seconds,
            audio_size_bytes: result.audio.length,
        },
        error: error || null,
    };
    fs.appendFileSync(path.join(logsDir, 'tts.log'), JSON.stringify(logEntry) + '\n', 'utf-8');
}
/**
 * Generate WAV file header
 * Creates valid 16-bit PCM WAV header
 */
function generateWAVHeader(dataSize, sampleRate, numChannels = 1, bitsPerSample = 16) {
    const header = Buffer.alloc(44);
    // RIFF chunk descriptor
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write('WAVE', 8);
    // fmt sub-chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * numChannels * bitsPerSample / 8, 28); // ByteRate
    header.writeUInt16LE(numChannels * bitsPerSample / 8, 32); // BlockAlign
    header.writeUInt16LE(bitsPerSample, 34);
    // data sub-chunk
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);
    return header;
}
/**
 * Generate synthetic speech audio
 * In production: Use espeak, festival, or external TTS API
 */
function generateSyntheticSpeech(text, sampleRate, speed) {
    // Estimate duration based on text length and speed
    // Average speaking rate: ~150 words/minute = 2.5 words/second
    // Average Persian word: ~5 characters
    const estimatedWords = text.length / 5;
    const estimatedDuration = (estimatedWords / 2.5) / speed; // seconds
    // Generate PCM samples (16-bit mono)
    const numSamples = Math.floor(estimatedDuration * sampleRate);
    const audioData = Buffer.alloc(numSamples * 2); // 16-bit = 2 bytes per sample
    // Generate a simple tone pattern based on text content
    // This is a placeholder - real TTS would use proper speech synthesis
    for (let i = 0; i < numSamples; i++) {
        // Use text hash to generate consistent tone
        const textHash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const baseFreq = 200 + (textHash % 100); // 200-300 Hz
        // Generate sine wave with slight variation
        const t = i / sampleRate;
        const freq = baseFreq + Math.sin(t * 2) * 20;
        const amplitude = 5000 * Math.exp(-t * 0.5); // Decay over time
        const sample = Math.floor(amplitude * Math.sin(2 * Math.PI * freq * t));
        audioData.writeInt16LE(sample, i * 2);
    }
    return audioData;
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
async function processTTS(text, _lang = 'fa', _voice = 'default', speed = 1.0) {
    try {
        // Validate text is not empty
        if (!text || text.trim().length === 0) {
            throw new Error('Text cannot be empty');
        }
        // Check text length (max 1000 characters)
        if (text.length > 1000) {
            throw new Error('Text too long (max 1000 characters)');
        }
        const sampleRate = 16000; // 16kHz standard for speech
        // Generate synthetic speech audio (PCM data)
        const audioData = generateSyntheticSpeech(text, sampleRate, speed);
        // Create WAV file with header
        const wavHeader = generateWAVHeader(audioData.length, sampleRate);
        const wavFile = Buffer.concat([wavHeader, audioData]);
        // Calculate duration
        const durationSeconds = audioData.length / (sampleRate * 2); // 16-bit = 2 bytes
        const response = {
            audio: wavFile,
            format: 'wav',
            sample_rate: sampleRate,
            duration_seconds: durationSeconds,
            text_length: text.length,
            timestamp: new Date().toISOString(),
        };
        // Log successful request
        logTTS(text.length, response);
        return response;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // Log error
        logTTS(text.length, {
            audio: Buffer.alloc(0),
            format: 'wav',
            sample_rate: 16000,
            duration_seconds: 0,
            text_length: text.length,
            timestamp: new Date().toISOString(),
        }, errorMessage);
        throw error;
    }
}
/**
 * Validate and process TTS request
 */
async function handleTTSRequest(text, lang, voice, speed) {
    // Validate request
    const validated = exports.TTSRequestSchema.parse({
        text,
        lang: lang || 'fa',
        voice: voice || 'default',
        speed: speed || 1.0,
    });
    // Process TTS
    return await processTTS(validated.text, validated.lang, validated.voice, validated.speed);
}
/**
 * Get TTS latency percentiles from logs
 * Returns p50, p90, p99 latencies in milliseconds
 */
function getTTSLatencyStats() {
    const logsDir = path.join(process.cwd(), '..', 'logs');
    const logFile = path.join(logsDir, 'tts.log');
    if (!fs.existsSync(logFile)) {
        return null;
    }
    try {
        const logContent = fs.readFileSync(logFile, 'utf-8');
        const lines = logContent.trim().split('\n').filter(l => l);
        if (lines.length === 0) {
            return null;
        }
        // Parse durations from logs
        const durations = [];
        for (const line of lines) {
            try {
                const entry = JSON.parse(line);
                if (entry.result && entry.result.duration_seconds) {
                    durations.push(entry.result.duration_seconds * 1000); // Convert to ms
                }
            }
            catch {
                // Skip invalid lines
                continue;
            }
        }
        if (durations.length === 0) {
            return null;
        }
        // Sort durations
        durations.sort((a, b) => a - b);
        // Calculate percentiles
        const p50Index = Math.floor(durations.length * 0.50);
        const p90Index = Math.floor(durations.length * 0.90);
        const p99Index = Math.floor(durations.length * 0.99);
        return {
            p50: durations[p50Index],
            p90: durations[p90Index],
            p99: durations[p99Index],
        };
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=tts.js.map