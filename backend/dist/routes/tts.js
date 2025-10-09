"use strict";
/**
 * Text-to-Speech (TTS) Route Handler
 *
 * POST /api/tts - Convert Persian text to speech audio
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tts_1 = require("../services/tts");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Request validation schema
const TTSBodySchema = zod_1.z.object({
    text: zod_1.z.string().min(1, 'Text cannot be empty'),
    lang: zod_1.z.string().optional().default('fa'),
    voice: zod_1.z.string().optional().default('default'),
    speed: zod_1.z.number().min(0.5).max(2.0).optional().default(1.0),
});
/**
 * POST /api/tts
 * Convert text to speech
 *
 * Request body:
 * {
 *   "text": "متن فارسی",
 *   "lang": "fa",      // optional
 *   "voice": "default", // optional
 *   "speed": 1.0       // optional (0.5-2.0)
 * }
 *
 * Returns: WAV audio stream
 */
router.post('/', async (req, res) => {
    try {
        // Validate request body
        const validated = TTSBodySchema.parse(req.body);
        // Process TTS
        const result = await (0, tts_1.handleTTSRequest)(validated.text, validated.lang, validated.voice, validated.speed);
        // Set headers for audio streaming
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Length', result.audio.length.toString());
        res.setHeader('X-Sample-Rate', result.sample_rate.toString());
        res.setHeader('X-Duration', result.duration_seconds.toString());
        res.setHeader('X-Text-Length', result.text_length.toString());
        res.setHeader('X-Timestamp', result.timestamp);
        // Stream audio
        res.send(result.audio);
    }
    catch (error) {
        // Handle validation errors
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                error: 'Validation error',
                details: error.errors,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        // Handle other errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('TTS Error:', errorMessage);
        res.status(500).json({
            error: errorMessage,
            timestamp: new Date().toISOString(),
        });
    }
});
/**
 * GET /api/tts/status
 * Get TTS service status with latency stats
 */
router.get('/status', (_req, res) => {
    const latencyStats = (0, tts_1.getTTSLatencyStats)();
    res.json({
        status: 'ok',
        service: 'text-to-speech',
        supported_languages: ['fa'],
        output_format: 'wav',
        sample_rate: 16000,
        max_text_length: 1000,
        speed_range: [0.5, 2.0],
        latency_stats: latencyStats || {
            p50: null,
            p90: null,
            p99: null,
            note: 'No requests logged yet',
        },
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
//# sourceMappingURL=tts.js.map