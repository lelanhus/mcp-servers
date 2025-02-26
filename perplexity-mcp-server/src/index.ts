#!/usr/bin/env node

import 'isomorphic-fetch';
import { config } from './config/env.js';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { PerplexityService } from './services/perplexityService.js';
import { PerplexityModelType, ResponseFormat } from './interfaces/perplexity.js';

// Function to log to stderr (never stdout)
// Debug flag - set to true for detailed logging
const DEBUG = true;

const log = (message: string) => {
  // Writing directly to stderr to avoid any stdout pollution
  process.stderr.write(`[MCP Perplexity] ${message}\n`);
};

// Debug log function - only logs when DEBUG is true
const debugLog = (message: string) => {
  if (DEBUG) {
    log(`DEBUG: ${message}`);
  }
};

// Initialize the Perplexity service
const perplexityService = new PerplexityService();

// Initialize the MCP server
const server = new Server(
  {
    name: "perplexity-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "perplexity_search",
        description: "Search the web using Perplexity Sonar API for real-time information",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to look up information on the web",
            },
            focus: {
              type: "string",
              description: "Optional comma-separated list of domains to focus the search on (e.g., \"nytimes.com,bbc.com\")",
            },
            model: {
              type: "string",
              description: "The Perplexity model to use for the search. Options include: sonar-deep-research (60k context), sonar-reasoning-pro (128k context, max 8k output, CoT), sonar-reasoning (128k context, CoT), sonar-pro (200k context, max 8k output), sonar (128k context)",
              enum: ["sonar-deep-research", "sonar-reasoning-pro", "sonar-reasoning", "sonar-pro", "sonar"]
            },
            system_prompt: {
              type: "string",
              description: "Optional system prompt to control how Perplexity formats its response"
            },
            output_format: {
              type: "string",
              description: "Optional structured output format. Use 'json' for JSON schema or 'regex' for regex pattern",
              enum: ["json", "regex"]
            },
            output_schema: {
              type: "object",
              description: "JSON schema for structured output when output_format is 'json'"
            },
            output_regex: {
              type: "string",
              description: "Regex pattern for structured output when output_format is 'regex'"
            }
          },
          required: ["query"],
        },
      },
    ],
  };
});

// Implement resources/list handler with an empty resources list
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  log("Handling resources/list request");
  return {
    resources: []
  };
});

// Implement prompts/list handler with an empty prompts list
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  log("Handling prompts/list request");
  return {
    prompts: []
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  log(`Tool invocation received: ${request.params.name}`);
  log(`Tool arguments: ${JSON.stringify(request.params.arguments)}`);
  
  // Debug log the entire request
  debugLog(`Received request: ${JSON.stringify(request)}`);
  
  // Set a default ID if none provided
  const requestId = request.id || "1";

  if (request.params.name === "perplexity_search") {
    try {
      // Get parameters from the request
      const args = request.params.arguments || {};
      const query = args.query as string;
      const focus = args.focus as string | undefined;
      const model = args.model as PerplexityModelType | undefined;
      const systemPrompt = args.system_prompt as string | undefined;
      const outputFormat = args.output_format as string | undefined;
      const outputSchema = args.output_schema as Record<string, any> | undefined;
      const outputRegex = args.output_regex as string | undefined;
      
      log(`Processing search query: "${query}"`);
      
      // Parse focus domains if provided
      const focusDomains = focus ? focus.split(',').map((domain: string) => domain.trim()) : undefined;
      
      // Build response format if specified
      let responseFormat: ResponseFormat | undefined = undefined;
      if (outputFormat === 'json' && outputSchema) {
        responseFormat = {
          type: 'json_schema',
          json_schema: outputSchema
        };
      } else if (outputFormat === 'regex' && outputRegex) {
        responseFormat = {
          type: 'regex',
          regex: {
            regex: outputRegex
          }
        };
      }
      
      log(`Calling Perplexity API with model: ${model || 'default'}`);
      const searchResults = await perplexityService.search({
        query,
        focus: focusDomains,
        model,
        system_prompt: systemPrompt,
        response_format: responseFormat
      });

      if (searchResults.error) {
        log(`Perplexity API returned error: ${searchResults.error}`);
        throw new Error(searchResults.error);
      }

      log(`Perplexity API search successful with ${searchResults.results.length} results`);

      // Format the search results into a readable response
      let formattedContent = `Search results for: "${query}"`;
      if (model) {
        formattedContent += ` using model: ${model}`;
      }
      formattedContent += '\n\n';

      // For the chat completions API, we primarily get an answer
      if (searchResults.answer) {
        formattedContent += searchResults.answer;
      } else if (searchResults.results && searchResults.results.length > 0) {
        // Include any results if available (from original API format)
        searchResults.results.forEach((result, index) => {
          formattedContent += `${index + 1}. ${result.title}\n`;
          formattedContent += `   URL: ${result.url}\n`;
          formattedContent += `   ${result.snippet}\n\n`;
        });
      } else {
        formattedContent += 'No results found.';
      }

      log(`Returning search result with content length: ${formattedContent.length}`);
      
      // Fix the error "n.content.map is not a function"
      // Claude Desktop seems to expect an array in the content property
      const result = {
        content: [
          {
            type: "text",
            text: formattedContent
          }
        ]
      };
      
      // Log the response before sending
      debugLog(`Sending response: ${JSON.stringify(result)}`);
      
      return result;
    } catch (error) {
      log(`Error processing perplexity_search tool: ${error}`);
      // Use standard MCP error format
      const errorMessage = `Error processing search: ${error instanceof Error ? error.message : 'Unknown error'}`;
      log(`Returning error: ${errorMessage}`);
      
      // Return a properly formatted MCP error
      throw new Error(errorMessage);
    }
  }

  log(`Unknown tool requested: ${request.params.name}`);
  // Handle unknown tool
  // Use standard MCP error format for unknown tools
  const errorMessage = `Unknown tool: ${request.params.name}`;
  log(`Returning error: ${errorMessage}`);
  
  // Throw an error for the MCP framework to handle
  throw new Error(errorMessage);
});

// Connect the server using stdio transport
const startServer = async () => {
  try {
    // Validate configuration
    if (!config.perplexity.apiKey) {
      log('WARN: Perplexity API key is not set. API calls will fail.');
    }

    // Log server info
    log('Starting Perplexity MCP Server');
    log(`Server version: 1.0.0`);
    
    // Connect the transport
    const transport = new StdioServerTransport();
    
    try {
      await server.connect(transport);
      log('MCP server is running with Perplexity search tool');
    } catch (err) {
      log(`ERROR connecting to transport: ${err}`);
      throw err;
    }
  } catch (error) {
    log(`ERROR: Failed to start MCP server: ${error}`);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('Shutting down MCP server...');
  process.exit(0);
});

// Start the server
startServer(); 