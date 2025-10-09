#!/usr/bin/env node
/**
 * Express.js backend for Persian chat agent.
 * Provides /api/chat endpoint with streaming support.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API request logging
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const apiLogStream = fs.createWriteStream(
    path.join(logsDir, 'api.log'),
    { flags: 'a' }
);

// Custom morgan format
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :body',
    { stream: apiLogStream }
));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'persian-chat-backend'
    });
});

// Chat endpoint with streaming support
app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { message, temperature = 0.3, max_length = 512, stream = true } = req.body;
        
        // Validate input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: true,
                message: 'Invalid request: message field is required and must be a string'
            });
        }
        
        // Validate temperature
        if (temperature < 0.2 || temperature > 0.4) {
            return res.status(400).json({
                error: true,
                message: 'Invalid temperature: must be between 0.2 and 0.4'
            });
        }
        
        // Log request
        console.log(`[${new Date().toISOString()}] Chat request: ${message.substring(0, 50)}...`);
        
        // Set headers for streaming
        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
        }
        
        // For now, return a mock response (in production, this would call the model)
        const response = await generateResponse(message, temperature, max_length);
        
        if (stream) {
            // Send streaming response
            const words = response.split(' ');
            for (let i = 0; i < words.length; i++) {
                const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
                res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
                
                // Simulate streaming delay
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Send completion event
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
        } else {
            // Send complete response
            res.json({
                response: response,
                metadata: {
                    temperature: temperature,
                    max_length: max_length,
                    processing_time_ms: Date.now() - startTime
                }
            });
        }
        
    } catch (error) {
        console.error('Error processing chat request:', error);
        
        // Log error
        apiLogStream.write(
            `[ERROR] ${new Date().toISOString()} - ${error.message}\n`
        );
        
        res.status(500).json({
            error: true,
            message: 'Internal server error while processing request'
        });
    }
});

/**
 * Generate response using the model (mock implementation)
 * In production, this would call the actual fine-tuned model
 */
async function generateResponse(message, temperature, max_length) {
    // Mock responses for common Persian greetings and questions
    const responses = {
        'سلام': 'سلام! چطور می‌تونم کمکتون کنم؟',
        'حالت چطوره': 'من یک دستیار هوش مصنوعی هستم و همیشه آماده کمک به شما هستم!',
        'چی کار می‌کنی': 'من می‌تونم به سوالات شما به زبان فارسی پاسخ بدم و در مورد موضوعات مختلف صحبت کنم.',
        'ممنون': 'خواهش می‌کنم! خوشحالم که تونستم کمک کنم.',
        'default': 'این یک پاسخ نمونه است. در محیط واقعی، مدل آموزش‌دیده پاسخ مناسب را تولید خواهد کرد.'
    };
    
    // Simple matching
    const messageLower = message.toLowerCase().trim();
    for (const [key, value] of Object.entries(responses)) {
        if (messageLower.includes(key)) {
            return value;
        }
    }
    
    return responses.default + ` (دما: ${temperature})`;
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    apiLogStream.write(
        `[UNHANDLED ERROR] ${new Date().toISOString()} - ${err.message}\n${err.stack}\n`
    );
    
    res.status(500).json({
        error: true,
        message: 'An unexpected error occurred'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Persian Chat Backend running on port ${PORT}`);
    console.log(`📝 API logs: ${path.join(logsDir, 'api.log')}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
});

module.exports = app;
