/**
 * Perplexity Sonar Model Types
 */
export type PerplexityModelType = 
  | 'sonar-deep-research'    // 60k context, Chat Completion
  | 'sonar-reasoning-pro'    // 128k context, Chat Completion, max 8k output, includes CoT
  | 'sonar-reasoning'        // 128k context, Chat Completion, includes CoT
  | 'sonar-pro'              // 200k context, Chat Completion, max 8k output
  | 'sonar';                 // 128k context, Chat Completion

/**
 * JSON Schema Response Format for Structured Output
 */
export interface JSONSchemaResponseFormat {
  type: 'json_schema';
  json_schema: Record<string, any>;
}

/**
 * Regex Response Format for Structured Output
 */
export interface RegexResponseFormat {
  type: 'regex';
  regex: {
    regex: string;
  };
}

/**
 * Response Format for Structured Output
 */
export type ResponseFormat = JSONSchemaResponseFormat | RegexResponseFormat;

/**
 * Message for Perplexity Chat API
 */
export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Perplexity Search Request
 */
export interface PerplexitySearchRequest {
  query: string;
  focus?: string[];
  model?: PerplexityModelType;
  system_prompt?: string;
  response_format?: ResponseFormat;
  options?: {
    languages?: string[];
    timezone?: string;
  };
}

/**
 * Perplexity Search Result Item
 */
export interface PerplexitySearchResultItem {
  title: string;
  url: string;
  snippet: string;
  published?: string;
  author?: string;
}

/**
 * Perplexity Search Response
 */
export interface PerplexitySearchResponse {
  query: string;
  results: PerplexitySearchResultItem[];
  answer?: string;
  error?: string;
} 