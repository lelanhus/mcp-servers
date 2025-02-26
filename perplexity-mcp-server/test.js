// Simple test script for the MCP server
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the server script
const serverPath = path.join(__dirname, 'dist', 'index.js');

// Test request
const testRequest = {
  jsonrpc: '2.0',
  id: '1',
  method: 'tools/call',
  params: {
    name: 'perplexity_search',
    arguments: {
      query: 'What is the capital of France?'
    }
  }
};

console.log('Sending request:', JSON.stringify(testRequest, null, 2));

// Spawn the server process
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Write test request to stdin
server.stdin.write(JSON.stringify(testRequest) + '\n');

// Capture stdout
let outputData = '';
server.stdout.on('data', (data) => {
  outputData += data.toString();
  console.log('Received output:', data.toString());
  
  // Try to parse the JSON response
  try {
    const response = JSON.parse(data.toString());
    console.log('Parsed response:', JSON.stringify(response, null, 2));
    
    // Check if the response is valid
    if (response.result) {
      console.log('✅ Response has result field');
    } else if (response.error) {
      console.log('⚠️ Response has error field:', response.error);
    } else {
      console.log('❌ Response is missing both result and error fields');
    }
    
    // Exit after receiving a response
    server.kill();
    process.exit(0);
  } catch (err) {
    console.log('❌ Failed to parse JSON response:', err.message);
  }
});

// Capture stderr
server.stderr.on('data', (data) => {
  console.error('Server stderr:', data.toString());
});

// Handle exit
server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏱️ Test timed out after 10 seconds');
  server.kill();
  process.exit(1);
}, 10000);