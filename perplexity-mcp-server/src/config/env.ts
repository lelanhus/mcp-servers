import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Function to log to stderr (never stdout)
const log = (message: string) => {
  // Writing directly to stderr to avoid any stdout pollution
  process.stderr.write(`[MCP Perplexity] ${message}\n`);
};

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY || '',
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
  },
};

// Validate required configuration
if (!config.perplexity.apiKey) {
  log('WARN: PERPLEXITY_API_KEY is not set. API calls will fail.');
} 