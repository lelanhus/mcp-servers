// Direct test for the Perplexity API service
import { PerplexityService } from './dist/services/perplexityService.js';
import fs from 'fs';

const service = new PerplexityService();

async function testSearch() {
  console.log('Testing Perplexity search...');
  
  try {
    const result = await service.search({
      query: 'What is the capital of France?',
      model: 'sonar'
    });
    
    console.log('Search result:');
    console.log(JSON.stringify(result, null, 2));
    
    // Save the raw result
    fs.writeFileSync('perplexity-response.json', JSON.stringify(result, null, 2));
    
    // Test different response formats that Claude Desktop might expect
    const formats = {
      // Basic - just the text in a result field
      simpleResult: { 
        result: result.answer || 'No answer found' 
      },
      
      // Text in content field
      contentResult: { 
        content: result.answer || 'No answer found' 
      },
      
      // Raw structure mimicking LLM response
      structuredResult: {
        tool_result: {
          type: "perplexity_search",
          content: result.answer || 'No answer found'
        }
      },
      
      // Fully raw format from the API
      rawResult: result
    };
    
    // Save all formats to a file for inspection
    fs.writeFileSync('perplexity-test-formats.json', JSON.stringify(formats, null, 2));
    
    if (result.answer) {
      console.log('✅ Got answer:', result.answer.substring(0, 50) + '...');
      console.log('✅ Generated test formats in perplexity-test-formats.json');
    } else if (result.error) {
      console.log('❌ Error:', result.error);
    } else {
      console.log('⚠️ No answer or error in response');
    }
  } catch (err) {
    console.error('❌ Error testing search:', err);
  }
}

// Also do a direct fetch test to see the raw API response
async function testDirectApi() {
  console.log('\nTesting direct API call to Perplexity...');
  
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    const apiUrl = 'https://api.perplexity.ai/chat/completions';
    
    if (!apiKey) {
      console.error('ERROR: PERPLEXITY_API_KEY not found in environment');
      return;
    }
    
    const messages = [
      {
        role: 'user',
        content: 'Please search the web for information about: current time in Paris'
      }
    ];
    
    const requestBody = {
      model: 'sonar',
      messages: messages
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      return;
    }
    
    const responseData = await response.json();
    
    // Log and save the raw API response
    console.log('Raw API response:', JSON.stringify(responseData, null, 2));
    fs.writeFileSync('perplexity-direct-response.json', JSON.stringify(responseData, null, 2));
    console.log('✅ Raw API response saved to perplexity-direct-response.json');
  } catch (error) {
    console.error('❌ ERROR during direct API test:', error);
  }
}

// Run both tests
testSearch();
setTimeout(testDirectApi, 1000); // Small delay between tests