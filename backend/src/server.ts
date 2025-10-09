/**
 * Persian Chat Backend Server (TypeScript Only)
 * 
 * CRITICAL: This entire backend is TypeScript-only (*.ts files).
 * No JavaScript (*.js) files are allowed in backend/.
 * CI will fail if any .js files are detected.
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import chatRouter from './routes/chat';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${req.method} ${req.path} - ${req.ip}\n`;
  
  // Log to file
  const logsDir = path.join(process.cwd(), '..', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  fs.appendFileSync(
    path.join(logsDir, 'api.log'),
    logMessage,
    'utf-8'
  );
  
  console.log(logMessage.trim());
  next();
});

// Routes
app.use('/api/chat', chatRouter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    backend: 'TypeScript-only',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'Persian Chat API - TypeScript Backend',
    endpoints: {
      chat: '/api/chat',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const errorMessage = `${timestamp} - ERROR: ${err.message}\n${err.stack}\n`;
  
  // Log errors
  const logsDir = path.join(process.cwd(), '..', 'logs');
  fs.appendFileSync(
    path.join(logsDir, 'api.log'),
    errorMessage,
    'utf-8'
  );
  
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

export default app;
