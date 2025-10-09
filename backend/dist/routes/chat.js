"use strict";
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
const express_1 = require("express");
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const search_1 = require("../services/search");
const router = (0, express_1.Router)();
// Zod schema for request validation
const ChatRequestSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, 'Message cannot be empty'),
    messages: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(['system', 'user', 'assistant']),
        content: zod_1.z.string()
    })).optional(),
    temperature: zod_1.z.number().min(0.1).max(1.0).optional().default(0.3),
    stream: zod_1.z.boolean().optional().default(true),
    max_tokens: zod_1.z.number().optional().default(512),
    use_retrieval: zod_1.z.boolean().optional().default(false)
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
async function generateStreamingResponse(_prompt, _temperature, onChunk) {
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
async function generateCompleteResponse(_prompt, _temperature) {
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
router.post('/', async (req, res) => {
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
        let retrievalSources = [];
        if (use_retrieval) {
            const searchResult = await (0, search_1.handleSearchRequest)(message, 3, 'fa');
            if (searchResult.results.length > 0) {
                // Build context for future model integration
                (0, search_1.buildContextWindow)(searchResult.results, 500);
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
        fs.appendFileSync(path.join(logsDir, 'api.log'), JSON.stringify(requestLog) + '\n', 'utf-8');
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
            await generateStreamingResponse(message, temperature, (chunk) => {
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            });
            res.write('data: [DONE]\n\n');
            res.end();
        }
        else {
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
    }
    catch (error) {
        // Handle validation errors
        if (error instanceof zod_1.z.ZodError) {
            const logsDir = path.join(process.cwd(), '..', 'logs');
            fs.appendFileSync(path.join(logsDir, 'api.log'), `VALIDATION_ERROR: ${JSON.stringify(error.errors)}\n`, 'utf-8');
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
        fs.appendFileSync(path.join(logsDir, 'api.log'), `ERROR: ${errorMessage}\n`, 'utf-8');
        res.status(500).json({
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=chat.js.map