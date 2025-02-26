/**
 * MCP Tool Schema - represents the definition of a tool that Claude can call
 */
export interface MCPToolSchema {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

/**
 * MCP Tool Request - represents a request from Claude to call a tool
 */
export interface MCPToolRequest {
  name: string;
  parameters: Record<string, any>;
}

/**
 * MCP Tool Response - represents the response to Claude after calling a tool
 */
export interface MCPToolResponse {
  result: {
    content: Array<{
      type: string;
      text: string;
    }>;
  };
}

/**
 * MCP Server Response - top level response to Claude
 */
export interface MCPServerResponse {
  tools: MCPToolSchema[];
} 