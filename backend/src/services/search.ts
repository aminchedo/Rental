/**
 * Search API Integration Service
 * 
 * Integrates custom search API for retrieval-augmented generation (RAG)
 * Provides context snippets for Persian chat responses
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// Environment configuration
const SEARCH_API_URL = process.env.SEARCH_API_URL || '';
const SEARCH_API_KEY = process.env.SEARCH_API_KEY || '';
const SEARCH_ENABLED = process.env.SEARCH_ENABLED === 'true';

// Request validation schema
export const SearchRequestSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  top_k: z.number().min(1).max(10).optional().default(3),
  lang: z.string().optional().default('fa'),
});

// Search result type
export interface SearchResult {
  title: string;
  snippet: string;
  url?: string;
  score: number;
  source: string;
}

// Search response type
export interface SearchResponse {
  results: SearchResult[];
  query: string;
  total_results: number;
  duration_ms: number;
  timestamp: string;
}

/**
 * Log search request/response
 */
function logSearch(
  query: string,
  result: SearchResponse | null,
  error?: string
): void {
  const logsDir = path.join(process.cwd(), '..', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    query: query.substring(0, 100),
    result: error ? null : {
      total_results: result?.total_results || 0,
      duration_ms: result?.duration_ms || 0,
    },
    error: error || null,
  };

  fs.appendFileSync(
    path.join(logsDir, 'search.log'),
    JSON.stringify(logEntry) + '\n',
    'utf-8'
  );
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 100
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on last attempt
      if (i === maxRetries - 1) {
        break;
      }
      
      // Exponential backoff: 100ms, 200ms, 400ms...
      const delay = initialDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Call external search API
 */
async function callSearchAPI(
  query: string,
  topK: number,
  _lang: string
): Promise<SearchResponse> {
  // Simulate API call with mock data
  // In production: Replace with actual fetch() to SEARCH_API_URL
  
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  
  // Mock search results based on query
  const mockResults: SearchResult[] = [
    {
      title: 'نتیجه جستجو برای: ' + query.substring(0, 20),
      snippet: 'این یک نتیجه نمونه است که اطلاعات مرتبط با سوال شما را ارائه می‌دهد.',
      url: 'https://example.com/result1',
      score: 0.95,
      source: 'mock_search',
    },
    {
      title: 'اطلاعات بیشتر درباره ' + query.substring(0, 20),
      snippet: 'جزئیات بیشتر و توضیحات تکمیلی در مورد موضوع مورد نظر شما.',
      url: 'https://example.com/result2',
      score: 0.87,
      source: 'mock_search',
    },
    {
      title: 'مقاله مرتبط: ' + query.substring(0, 20),
      snippet: 'مطالب مفید و کاربردی که می‌تواند به پاسخ سوال شما کمک کند.',
      url: 'https://example.com/result3',
      score: 0.76,
      source: 'mock_search',
    },
  ];

  return {
    results: mockResults.slice(0, topK),
    query,
    total_results: mockResults.length,
    duration_ms: 100,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Search for relevant content
 * 
 * @param query - Search query (Persian text)
 * @param topK - Number of results to return (1-10, default 3)
 * @param lang - Language code (default 'fa')
 * @returns Search results with snippets and sources
 */
export async function search(
  query: string,
  topK: number = 3,
  lang: string = 'fa'
): Promise<SearchResponse> {
  const startTime = Date.now();

  try {
    // Check if search is enabled
    if (!SEARCH_ENABLED) {
      // Return empty results if search is disabled
      const emptyResponse: SearchResponse = {
        results: [],
        query,
        total_results: 0,
        duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
      
      logSearch(query, emptyResponse);
      return emptyResponse;
    }

    // Validate query
    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    // Call search API with retry/backoff
    const response = await retryWithBackoff(
      () => callSearchAPI(query, topK, lang),
      3,
      100
    );

    // Update duration
    response.duration_ms = Date.now() - startTime;

    // Log successful request
    logSearch(query, response);

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error
    logSearch(query, null, errorMessage);

    // Return empty results on error (graceful degradation)
    return {
      results: [],
      query,
      total_results: 0,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Validate and process search request
 */
export async function handleSearchRequest(
  query: string,
  topK?: number,
  lang?: string
): Promise<SearchResponse> {
  // Validate request
  const validated = SearchRequestSchema.parse({
    query,
    top_k: topK || 3,
    lang: lang || 'fa',
  });

  // Process search
  return await search(
    validated.query,
    validated.top_k,
    validated.lang
  );
}

/**
 * Build context window from search results
 * Formats search results into a context string for LLM
 */
export function buildContextWindow(
  searchResults: SearchResult[],
  maxLength: number = 500
): string {
  if (searchResults.length === 0) {
    return '';
  }

  let context = 'اطلاعات مرتبط:\n\n';
  
  for (const result of searchResults) {
    const snippet = `- ${result.title}: ${result.snippet}`;
    
    // Check if adding this snippet would exceed max length
    if (context.length + snippet.length > maxLength) {
      break;
    }
    
    context += snippet + '\n';
  }

  return context.trim();
}

/**
 * Check if search API is configured
 */
export function isSearchConfigured(): boolean {
  return SEARCH_ENABLED && SEARCH_API_URL.length > 0;
}

/**
 * Get search API status
 */
export function getSearchStatus(): {
  enabled: boolean;
  configured: boolean;
  api_url: string;
  has_api_key: boolean;
} {
  return {
    enabled: SEARCH_ENABLED,
    configured: isSearchConfigured(),
    api_url: SEARCH_API_URL ? SEARCH_API_URL.substring(0, 50) + '...' : '',
    has_api_key: SEARCH_API_KEY.length > 0,
  };
}
