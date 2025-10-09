"use strict";
/**
 * Speech-to-Text (STT) Route Handler
 *
 * POST /api/stt - Convert audio to Persian text
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stt_1 = require("../services/stt");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Configure multer for file upload
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (_req, file, cb) => {
        // Accept audio files only
        const allowedMimes = [
            'audio/wav',
            'audio/wave',
            'audio/x-wav',
            'audio/ogg',
            'audio/mpeg',
            'audio/mp3',
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Invalid file type: ${file.mimetype}. Only WAV, OGG, and MP3 are supported.`));
        }
    },
});
/**
 * POST /api/stt
 * Convert audio to text
 *
 * Accepts:
 * - multipart/form-data with 'audio' file field
 * - JSON with base64 encoded audio
 */
router.post('/', upload.single('audio'), async (req, res) => {
    try {
        let audioBuffer;
        let format = 'wav';
        let sampleRate = 16000;
        // Handle file upload
        if (req.file) {
            audioBuffer = req.file.buffer;
            // Determine format from mimetype
            if (req.file.mimetype.includes('ogg')) {
                format = 'ogg';
            }
            else if (req.file.mimetype.includes('mp3') || req.file.mimetype.includes('mpeg')) {
                format = 'mp3';
            }
            else {
                format = 'wav';
            }
            // Get sample rate from query params if provided
            if (req.query.sample_rate) {
                sampleRate = parseInt(req.query.sample_rate, 10);
            }
        }
        // Handle JSON with base64 audio
        else if (req.body && req.body.audio) {
            const base64Audio = req.body.audio;
            audioBuffer = Buffer.from(base64Audio, 'base64');
            format = req.body.format || 'wav';
            sampleRate = req.body.sample_rate || 16000;
        }
        // No audio provided
        else {
            res.status(400).json({
                error: 'No audio data provided',
                details: 'Send audio as multipart/form-data file or JSON with base64 encoded audio',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        // Save recording for debug (last 3 kept)
        const timestamp = Date.now();
        const filename = `recording_${timestamp}.${format}`;
        (0, stt_1.saveRecordingForDebug)(audioBuffer, filename);
        // Process STT
        const result = await (0, stt_1.handleSTTRequest)(audioBuffer, format, sampleRate);
        // Return result
        res.json({
            text: result.text,
            confidence: result.confidence,
            lang: result.lang,
            duration_ms: result.duration_ms,
            timestamp: result.timestamp,
            debug: {
                audio_size_bytes: audioBuffer.length,
                format,
                sample_rate: sampleRate,
                saved_as: filename,
            },
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('STT Error:', errorMessage);
        res.status(500).json({
            error: errorMessage,
            timestamp: new Date().toISOString(),
        });
    }
});
/**
 * GET /api/stt/status
 * Get STT service status
 */
router.get('/status', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'speech-to-text',
        supported_formats: ['wav', 'ogg', 'mp3'],
        max_file_size: '10MB',
        sample_rate: 16000,
        language: 'fa (Persian)',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
//# sourceMappingURL=stt.js.map