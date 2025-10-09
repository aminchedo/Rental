"use strict";
/**
 * Persian Chat Backend Server (TypeScript Only)
 *
 * CRITICAL: This entire backend is TypeScript-only (*.ts files).
 * No JavaScript (*.js) files are allowed in backend/.
 * CI will fail if any .js files are detected.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chat_1 = __importDefault(require("./routes/chat"));
const stt_1 = __importDefault(require("./routes/stt"));
const tts_1 = __importDefault(require("./routes/tts"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001', 10);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${req.method} ${req.path} - ${req.ip}\n`;
    // Log to file
    const logsDir = path.join(process.cwd(), '..', 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    fs.appendFileSync(path.join(logsDir, 'api.log'), logMessage, 'utf-8');
    console.log(logMessage.trim());
    next();
});
// Routes
app.use('/api/chat', chat_1.default);
app.use('/api/stt', stt_1.default);
app.use('/api/tts', tts_1.default);
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        backend: 'TypeScript-only',
        version: '1.0.0'
    });
});
// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        message: 'Persian Chat API - TypeScript Backend',
        endpoints: {
            chat: '/api/chat',
            stt: '/api/stt',
            tts: '/api/tts',
            health: '/health'
        }
    });
});
// Error handling middleware
app.use((err, _req, res, _next) => {
    const timestamp = new Date().toISOString();
    const errorMessage = `${timestamp} - ERROR: ${err.message}\n${err.stack}\n`;
    // Log errors
    const logsDir = path.join(process.cwd(), '..', 'logs');
    fs.appendFileSync(path.join(logsDir, 'api.log'), errorMessage, 'utf-8');
    console.error(errorMessage);
    res.status(500).json({
        error: err.message || 'Internal server error',
        timestamp: new Date().toISOString()
    });
});
// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`🚀 Persian Chat Backend Server (TypeScript)`);
    console.log('='.repeat(60));
    console.log(`  Port: ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  TypeScript: Strict mode enabled`);
    console.log(`  Time: ${new Date().toISOString()}`);
    console.log('='.repeat(60));
    console.log(`  Health: http://localhost:${PORT}/health`);
    console.log(`  Chat API: http://localhost:${PORT}/api/chat`);
    console.log('='.repeat(60));
});
exports.default = app;
//# sourceMappingURL=server.js.map