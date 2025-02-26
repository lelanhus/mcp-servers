// MCP testing script to see what response formats work
import fs from 'fs';

// Formats to test
const formats = [
  // The new tool_result format we're trying
  {
    name: "tool_result",
    data: {
      tool_result: {
        type: "perplexity_search",
        content: "This is a search result from Perplexity."
      }
    }
  },
  
  // The original simple format
  {
    name: "simple_result",
    data: {
      result: "This is a search result from Perplexity."
    }
  },
  
  // Try just the content
  {
    name: "content_only",
    data: {
      content: "This is a search result from Perplexity."
    }
  },
  
  // MCP with results array format
  {
    name: "results_array",
    data: {
      results: [
        {
          title: "Test Result",
          url: "https://example.com",
          content: "This is a search result from Perplexity."
        }
      ]
    }
  },
  
  // Nested format
  {
    name: "nested_content",
    data: {
      response: {
        content: "This is a search result from Perplexity."
      }
    }
  }
];

// Write each format to a separate file to use as test cases
formats.forEach(format => {
  const filename = `test-format-${format.name}.json`;
  fs.writeFileSync(filename, JSON.stringify(format.data, null, 2));
  console.log(`Created test file: ${filename}`);
});

// Also create a combined file
fs.writeFileSync('test-formats.json', JSON.stringify({
  formats: formats.map(f => ({ name: f.name, data: f.data }))
}, null, 2));
console.log('Created combined test file: test-formats.json');

// Print debugging info
console.log('\nTo test these formats with the MCP protocol:');
console.log('1. Check what format Claude Desktop expects');
console.log('2. Try returning each format in turn');
console.log('3. Restart Claude Desktop after updating the format in index.ts');