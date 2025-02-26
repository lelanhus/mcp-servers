import { config } from '../config/env.js';
import { PerplexitySearchRequest, PerplexitySearchResponse } from '../interfaces/perplexity.js';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Function to log to stderr (never stdout)
const log = (message: string) => {
  // Writing directly to stderr to avoid any stdout pollution
  process.stderr.write(`[MCP Perplexity] ${message}\n`);
};

/**
 * Service for making requests to the Perplexity Sonar API
 */
export class PerplexityService {
  private apiKey: string;

  constructor() {
    this.apiKey = config.perplexity.apiKey;
    
    if (!this.apiKey) {
      log('WARN: Perplexity API key is not set. API calls will fail.');
    }
  }

  /**
   * Search the web using Perplexity Sonar API
   * @param request Search request parameters
   * @returns Promise with search results
   */
  async search(request: PerplexitySearchRequest): Promise<PerplexitySearchResponse> {
    try {
      // Log the request for debugging
      log(`Making request to Perplexity with API key: ${this.apiKey.substring(0, 8)}...`);
      
      // Build the proper request format for the chat completions API
      const messages = [];
      
      // Add system prompt if provided
      if (request.system_prompt) {
        messages.push({
          role: 'system',
          content: request.system_prompt
        });
      }
      
      // Add user message with the search query
      let content = `Please search the web for information about: ${request.query}`;
      if (request.focus && request.focus.length > 0) {
        content += `\nFocus on these domains: ${request.focus.join(', ')}`;
      }
      
      messages.push({
        role: 'user',
        content: content
      });
      
      const apiRequest = {
        model: request.model || 'sonar',
        messages: messages,
        response_format: request.response_format
      };
      
      log(`Calling Perplexity API with request: ${JSON.stringify(apiRequest)}`);
      
      const response = await fetch(
        PERPLEXITY_API_URL,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiRequest),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Perplexity API error: ${response.status} - ${errorText || response.statusText}`;
        log(`ERROR: ${errorMessage}`);
        return {
          query: request.query,
          results: [],
          error: errorMessage,
        };
      }

      const data = await response.json() as any;
      // Truncate the response if it's too long to avoid flooding the logs
      const truncatedResponse = JSON.stringify(data).length > 1000 
        ? JSON.stringify(data).substring(0, 1000) + '...' 
        : JSON.stringify(data);
      log(`Received Perplexity API response: ${truncatedResponse}`);
      
      // Process the response from chat completions API to fit our expected format
      const answer = data.choices?.[0]?.message?.content || '';
      
      // Create a simplified response that fits our PerplexitySearchResponse format
      return {
        query: request.query,
        results: [],  // We don't get separate results from the chat completions API
        answer: answer
      };
    } catch (error) {
      log(`ERROR: Error searching with Perplexity API: ${error}`);
      
      return {
        query: request.query,
        results: [],
        error: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
} 