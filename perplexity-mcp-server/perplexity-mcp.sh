#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if .env file exists, and use it if available
if [ -f "$SCRIPT_DIR/.env" ]; then
  echo "Using .env file for configuration" >&2
  source "$SCRIPT_DIR/.env"
else
  echo "WARNING: No .env file found, API calls will likely fail" >&2
  # You need to get a valid API key from Perplexity
  # Visit https://www.perplexity.ai/ and create an account if needed
  # Then get your API key from your account settings
  # Uncomment and edit the line below with your actual API key
  # export PERPLEXITY_API_KEY="your_api_key_here"
fi

# Debug flag for additional logging
export DEBUG=true

# Run the MCP server
node "$SCRIPT_DIR/dist/index.js"