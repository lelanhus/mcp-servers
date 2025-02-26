#!/bin/bash

# Script to set up Claude Desktop to use the Perplexity MCP server
# This script will create or update the Claude Desktop configuration file

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect OS
case "$(uname -s)" in
   Darwin)
     echo -e "${BLUE}Detected macOS${NC}"
     CONFIG_DIR="$HOME/Library/Application Support/Claude"
     ;;
   Linux)
     echo -e "${BLUE}Detected Linux${NC}"
     CONFIG_DIR="$HOME/.config/Claude"
     ;;
   CYGWIN*|MINGW*|MSYS*)
     echo -e "${BLUE}Detected Windows${NC}"
     CONFIG_DIR="$APPDATA/Claude"
     ;;
   *)
     echo -e "${RED}Unsupported operating system${NC}"
     exit 1
     ;;
esac

# Create config directory if it doesn't exist
mkdir -p "$CONFIG_DIR"

CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

# Get the absolute path to the server directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if config file exists
if [ -f "$CONFIG_FILE" ]; then
  echo -e "${YELLOW}Config file exists. Will update it...${NC}"
  # Create a backup of the existing config
  cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
  echo -e "${GREEN}Created backup at $CONFIG_FILE.backup${NC}"
  
  # Check if jq is installed
  if command -v jq &> /dev/null; then
    # Use jq to update the config
    jq --arg dir "$SCRIPT_DIR" '.mcpServers.perplexity = {"command": "npm", "args": ["--prefix", $dir, "run", "start"]}' "$CONFIG_FILE" > "$CONFIG_FILE.tmp"
    mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
  else
    # Manual replacement if jq is not available
    echo -e "${YELLOW}jq not found, creating new config file${NC}"
    cat > "$CONFIG_FILE" <<EOL
{
  "mcpServers": {
    "perplexity": {
      "command": "npm",
      "args": ["--prefix", "$SCRIPT_DIR", "run", "start"]
    }
  }
}
EOL
  fi
else
  # Create a new config file
  echo -e "${YELLOW}Creating new config file...${NC}"
  cat > "$CONFIG_FILE" <<EOL
{
  "mcpServers": {
    "perplexity": {
      "command": "npm",
      "args": ["--prefix", "$SCRIPT_DIR", "run", "start"]
    }
  }
}
EOL
fi

echo -e "${GREEN}Configuration complete!${NC}"
echo -e "${BLUE}Claude Desktop is now configured to use the Perplexity MCP server.${NC}"
echo -e "${BLUE}Please restart Claude Desktop for changes to take effect.${NC}" 