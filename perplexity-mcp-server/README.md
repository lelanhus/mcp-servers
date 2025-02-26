# Perplexity Sonar MCP Server for Claude Desktop

This project implements a Model Context Protocol (MCP) server that allows Claude Desktop to access the Perplexity Sonar search API. With this integration, Claude can search the web for real-time information through Perplexity's powerful search capabilities.

## Features

- Uses the official MCP SDK for seamless integration with Claude Desktop
- Provides a web search capability using Perplexity's Sonar API
- Supports multiple Perplexity Sonar models with different capabilities
- Supports custom system prompts for controlling response format
- Supports structured outputs using JSON schema and regex patterns
- Written in TypeScript for type safety and maintainability
- Easy to configure and extend

## Supported Perplexity Models

The server supports the following Perplexity Sonar models:

| Model | Context Length | Features |
|-------|---------------|----------|
| sonar-deep-research | 60k | Research-focused search model |
| sonar-reasoning-pro | 128k | Includes Chain of Thought, max 8k output |
| sonar-reasoning | 128k | Includes Chain of Thought |
| sonar-pro | 200k | Larger context window, max 8k output |
| sonar | 128k | Standard search model |

## Prerequisites

- Node.js (v18 or later)
- A Perplexity API key (sign up at [Perplexity AI](https://www.perplexity.ai/))
- Claude Desktop application

## Installation

1. Clone this repository or download the source code
2. Install dependencies:

```bash
cd perplexity-mcp-server
npm install
```

3. Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

4. Edit the `.env` file and add your Perplexity API key:

```
PERPLEXITY_API_KEY=your_api_key_here
```

## Building and Running

To build the TypeScript project:

```bash
npm run build
```

To start the server directly (for testing):

```bash
npm start
```

For development with automatic reloading:

```bash
npm run dev
```

## Connecting to Claude Desktop

To use this MCP server with Claude Desktop, you need to update the Claude Desktop configuration:

1. Open your Claude Desktop App configuration file:
   - On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - On Windows: `%AppData%\Claude\claude_desktop_config.json`

2. Add the perplexity-mcp-server configuration:

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "/ABSOLUTE/PATH/TO/perplexity-mcp-server/perplexity-mcp.sh"
    }
  }
}
```

Or, alternatively:

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/perplexity-mcp-server/dist/index.js"
      ]
    }
  }
}
```

Replace `/ABSOLUTE/PATH/TO/` with the actual path to the project directory on your system.

3. Restart Claude Desktop

## Using the Search Tool

Once configured, Claude will be able to use the Perplexity search tool when asked to search for information on the web. 

### Basic Search

For a basic search request:

```
Search for the latest news about artificial intelligence using Perplexity
```

### Specifying a Model

You can specify which Perplexity model to use:

```
Search for "climate change solutions" using the sonar-reasoning-pro model
```

```
Use the sonar-deep-research model to find detailed information about quantum computing research
```

### Focusing on Specific Domains

You can focus your search on specific domains:

```
Search for healthcare innovation news focusing on nih.gov,who.int domains
```

### Using System Prompts

You can provide a system prompt to control how Perplexity formats its responses:

```
Search for "recent advancements in AI" with system prompt "You are a helpful AI assistant. Provide only the final answer without any explanations or intermediate steps."
```

### Using Structured Outputs

You can request structured output in JSON format:

```
Search for "top 5 electric vehicles" with JSON output schema: {"top_picks": [{"name": "string", "range": "string", "price": "string"}]}
```

Or using regex patterns:

```
Search for "Is climate change real?" with regex output format "^(Yes|No): (.*)$"
```

## Development Notes

- This server uses the MCP SDK with stdio transport for communication with Claude Desktop
- The Perplexity API is accessed via fetch requests
- Environment variables are managed using dotenv

## Troubleshooting

- If you see API key errors, make sure your Perplexity API key is correctly set in the `.env` file
- If Claude can't find the server, verify the path in your Claude Desktop configuration
- For more detailed logs, check the stderr output where the server is running
- You may need to set executable permissions on the built index.js file:
  ```bash
  chmod +x dist/index.js
  ```
- If you see "not valid JSON" errors in Claude Desktop, make sure no console.log statements are being used in the code. All logging must go to stderr (using process.stderr.write) to avoid polluting the JSON communication over stdout.
- Colored terminal output (ANSI color codes) can interfere with the JSON communication. All logging should be plain text.
- If you see "Method not found" errors for `resources/list` or `prompts/list`, make sure you're using the latest version of the server which implements these required MCP methods.

## License

ISC License 