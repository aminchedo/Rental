"use strict";
/**
 * Search API Integration Service
 *
 * Integrates custom search API for retrieval-augmented generation (RAG)
 * Provides context snippets for Persian chat responses
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
exports.SearchRequestSchema = void 0;
exports.search = search;
exports.handleSearchRequest = handleSearchRequest;
exports.buildContextWindow = buildContextWindow;
exports.isSearchConfigured = isSearchConfigured;
exports.getSearchStatus = getSearchStatus;
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Environment configuration
const SEARCH_API_URL = process.env.SEARCH_API_URL || '';
const SEARCH_API_KEY = process.env.SEARCH_API_KEY || '';
const SEARCH_ENABLED = process.env.SEARCH_ENABLED === 'true';
// Request validation schema
exports.SearchRequestSchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Query cannot be empty'),
    top_k: zod_1.z.number().min(1).max(10).optional().default(3),
    lang: zod_1.z.string().optional().default('fa'),
});
/**
 * Log search request/response
 */
function logSearch(query, result, error) {
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
    fs.appendFileSync(path.join(logsDir, 'search.log'), JSON.stringify(logEntry) + '\n', 'utf-8');
}
/**
 * Retry with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 100) {
    let lastError = null;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
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
async function callSearchAPI(query, topK, _lang) {
    // Simulate API call with mock data
    // In production: Replace with actual fetch() to SEARCH_API_URL
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    // Mock search results based on query
    const mockResults = [
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
async function search(query, topK = 3, lang = 'fa') {
    const startTime = Date.now();
    try {
        // Check if search is enabled
        if (!SEARCH_ENABLED) {
            // Return empty results if search is disabled
            const emptyResponse = {
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
        const response = await retryWithBackoff(() => callSearchAPI(query, topK, lang), 3, 100);
        // Update duration
        response.duration_ms = Date.now() - startTime;
        // Log successful request
        logSearch(query, response);
        return response;
    }
    catch (error) {
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
async function handleSearchRequest(query, topK, lang) {
    // Validate request
    const validated = exports.SearchRequestSchema.parse({
        query,
        top_k: topK || 3,
        lang: lang || 'fa',
    });
    // Process search
    return await search(validated.query, validated.top_k, validated.lang);
}
/**
 * Build context window from search results
 * Formats search results into a context string for LLM
 */
function buildContextWindow(searchResults, maxLength = 500) {
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
function isSearchConfigured() {
    return SEARCH_ENABLED && SEARCH_API_URL.length > 0;
}
/**
 * Get search API status
 */
function getSearchStatus() {
    return {
        enabled: SEARCH_ENABLED,
        configured: isSearchConfigured(),
        api_url: SEARCH_API_URL ? SEARCH_API_URL.substring(0, 50) + '...' : '',
        has_api_key: SEARCH_API_KEY.length > 0,
    };
}
//# sourceMappingURL=search.js.map