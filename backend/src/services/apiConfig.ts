/**
 * API Configuration Service
 * 
 * Handles API endpoint override/fallback logic:
 * - If user provides custom API endpoint + key → use external API
 * - Otherwise → use local model
 * 
 * All routes are logged to /logs/api.log
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ApiConfig {
  endpoint: string;
  apiKey?: string;
  isExternal: boolean;
  source: 'external' | 'local';
}

/**
 * Get API configuration from environment or defaults
 */
export function getApiConfig(): ApiConfig {
  const customEndpoint = process.env.CUSTOM_API_ENDPOINT || '';
  const customApiKey = process.env.CUSTOM_API_KEY || '';
  
  // If custom endpoint and API key are provided, use external API
  if (customEndpoint && customApiKey) {
    logApiRoute('external', customEndpoint);
    return {
      endpoint: customEndpoint,
      apiKey: customApiKey,
      isExternal: true,
      source: 'external',
    };
  }
  
  // Otherwise, use local model
  const localEndpoint = process.env.LOCAL_MODEL_ENDPOINT || 'http://localhost:3001';
  logApiRoute('local', localEndpoint);
  
  return {
    endpoint: localEndpoint,
    apiKey: undefined,
    isExternal: false,
    source: 'local',
  };
}

/**
 * Log API route selection to /logs/api.log
 */
function logApiRoute(source: 'external' | 'local', endpoint: string): void {
  const logsDir = path.join(process.cwd(), '..', 'logs');
  
  // Ensure logs directory exists
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: 'API_ROUTE_SELECTED',
    source,
    endpoint: endpoint.replace(/api[_-]?key=[^&]+/gi, 'api_key=***'),
    message: source === 'external' 
      ? 'Using external API (custom endpoint provided)'
      : 'Using local model (no custom endpoint configured)'
  };
  
  fs.appendFileSync(
    path.join(logsDir, 'api.log'),
    JSON.stringify(logEntry) + '\n',
    'utf-8'
  );
}

/**
 * Make authenticated request to configured API
 */
export async function makeApiRequest(
  config: ApiConfig,
  payload: any
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (config.isExternal && config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }
  
  return fetch(config.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}
