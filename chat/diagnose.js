import dotenv from 'dotenv';
import GroqService from './src/services/groq.service.js';

dotenv.config();

async function runDiagnostics() {
  console.log('🔍 Running FlexiEV Chat Service Diagnostics...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`   PORT: ${process.env.PORT || 'not set (will use 4500)'}`);
  console.log(`   GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`   GROQ_MODEL: ${process.env.GROQ_MODEL || 'not set (will use llama3-8b-8192)'}\n`);
  
  // Check if API key is configured
  if (!process.env.GROQ_API_KEY) {
    console.log('❌ GROQ_API_KEY is not configured!');
    console.log('   Please add your Groq API key to the .env file:');
    console.log('   GROQ_API_KEY=your_groq_api_key_here\n');
    console.log('   Get your API key from: https://console.groq.com/keys');
    return;
  }
  
  // Test Groq API connection
  console.log('🤖 Testing Groq API Connection...');
  try {
    const groqService = new GroqService();
    
    console.log('   Initializing Groq service...');
    const connectionTest = await groqService.testConnection();
    
    if (connectionTest) {
      console.log('   ✅ Connection test passed!\n');
      
      // Test actual chat completion
      console.log('💬 Testing Chat Completion...');
      const response = await groqService.generateChatCompletion([
        { role: 'system', content: 'You are a helpful EV assistant.' },
        { role: 'user', content: 'Hello! Can you help me with EV questions?' }
      ]);
      
      console.log('   ✅ Chat completion successful!');
      console.log(`   Response: ${response.content.substring(0, 100)}...\n`);
      console.log(`   Model: ${groqService.model}`);
      
      console.log('🎉 All diagnostics passed! Your service should work correctly.');
      console.log('   You can now run: npm run dev');
      
    } else {
      console.log('   ❌ Connection test failed');
      console.log('   Please check your API key and internet connection.');
    }
    
  } catch (error) {
    console.log('   ❌ Groq API Error:');
    console.log(`   Error: ${error.message}\n`);
    
    if (error.status === 401 || error.message.includes('API key')) {
      console.log('💡 Troubleshooting:');
      console.log('   - Check if your Groq API key is correct');
      console.log('   - Make sure you copied the full API key');
      console.log('   - Verify the API key is active at https://console.groq.com/keys');
    } else if (error.status === 429 || error.message.includes('rate limit')) {
      console.log('💡 Troubleshooting:');
      console.log('   - You have exceeded your Groq API rate limit');
      console.log('   - Wait a moment and try again');
      console.log('   - Consider upgrading your plan for higher limits');
    } else if (error.status === 402 || error.message.includes('quota')) {
      console.log('💡 Troubleshooting:');
      console.log('   - You have exceeded your Groq API quota');
      console.log('   - Check your usage at https://console.groq.com/');
      console.log('   - Wait for quota reset or upgrade your plan');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('💡 Troubleshooting:');
      console.log('   - Check your internet connection');
      console.log('   - Verify firewall settings allow outbound HTTPS requests');
    } else {
      console.log('💡 Troubleshooting:');
      console.log('   - Check the error message above for specific details');
      console.log('   - Verify your API key is valid and active');
      console.log('   - Try again in a few minutes');
    }
  }
}

runDiagnostics().catch(console.error);