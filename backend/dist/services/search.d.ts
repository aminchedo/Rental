/**
 * Search API Integration Service
 *
 * Integrates custom search API for retrieval-augmented generation (RAG)
 * Provides context snippets for Persian chat responses
 */
import { z } from 'zod';
export declare const SearchRequestSchema: z.ZodObject<{
    query: z.ZodString;
    top_k: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    lang: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    top_k: number;
    lang: string;
}, {
    query: string;
    top_k?: number | undefined;
    lang?: string | undefined;
}>;
export interface SearchResult {
    title: string;
    snippet: string;
    url?: string;
    score: number;
    source: string;
}
export interface SearchResponse {
    results: SearchResult[];
    query: string;
    total_results: number;
    duration_ms: number;
    timestamp: string;
}
/**
 * Search for relevant content
 *
 * @param query - Search query (Persian text)
 * @param topK - Number of results to return (1-10, default 3)
 * @param lang - Language code (default 'fa')
 * @returns Search results with snippets and sources
 */
export declare function search(query: string, topK?: number, lang?: string): Promise<SearchResponse>;
/**
 * Validate and process search request
 */
export declare function handleSearchRequest(query: string, topK?: number, lang?: string): Promise<SearchResponse>;
/**
 * Build context window from search results
 * Formats search results into a context string for LLM
 */
export declare function buildContextWindow(searchResults: SearchResult[], maxLength?: number): string;
/**
 * Check if search API is configured
 */
export declare function isSearchConfigured(): boolean;
/**
 * Get search API status
 */
export declare function getSearchStatus(): {
    enabled: boolean;
    configured: boolean;
    api_url: string;
    has_api_key: boolean;
};
//# sourceMappingURL=search.d.ts.map