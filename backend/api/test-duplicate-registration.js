#!/usr/bin/env node

/**
 * User Registration Duplicate Entry Test
 * Tests duplicate email registration handling
 */

const http = require('http');

const API_BASE = process.env.API_URL || 'http://localhost:4000';

console.log('🧪 Testing User Registration Duplicate Entry Handling...');

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  role: 'owner',
  profile: {
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890'
  }
};

// HTTP request helper
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlexiEVChain-DuplicateTest/1.0'
      },
      timeout: 10000
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runDuplicateTest() {
  console.log('\n📋 Step 1: First Registration (should succeed)');
  try {
    const response1 = await makeRequest('POST', '/api/users/register', testUser);
    console.log(`   Status: ${response1.status}`);
    
    if (response1.status === 201) {
      console.log('   ✅ First registration successful');
      console.log(`   📄 Response:`, JSON.stringify(response1.data, null, 2));
    } else {
      console.log('   ❌ First registration failed');
      console.log(`   📄 Response:`, response1.data);
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
  }

  console.log('\n📋 Step 2: Duplicate Registration (should fail with 409)');
  try {
    const response2 = await makeRequest('POST', '/api/users/register', testUser);
    console.log(`   Status: ${response2.status}`);
    
    if (response2.status === 409) {
      console.log('   ✅ Duplicate registration properly rejected');
      console.log(`   📄 Error Message:`, response2.data.message);
    } else {
      console.log('   ❌ Duplicate registration not properly handled');
      console.log(`   📄 Response:`, response2.data);
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
  }

  console.log('\n📋 Step 3: Case Insensitive Duplicate (should also fail)');
  const testUserUpperCase = {
    ...testUser,
    email: testUser.email.toUpperCase()
  };
  
  try {
    const response3 = await makeRequest('POST', '/api/users/register', testUserUpperCase);
    console.log(`   Status: ${response3.status}`);
    
    if (response3.status === 409) {
      console.log('   ✅ Case insensitive duplicate properly rejected');
      console.log(`   📄 Error Message:`, response3.data.message);
    } else {
      console.log('   ❌ Case insensitive duplicate not properly handled');
      console.log(`   📄 Response:`, response3.data);
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
  }

  console.log('\n📋 Step 4: Different Email (should succeed)');
  const testUserDifferent = {
    ...testUser,
    email: 'different@example.com'
  };
  
  try {
    const response4 = await makeRequest('POST', '/api/users/register', testUserDifferent);
    console.log(`   Status: ${response4.status}`);
    
    if (response4.status === 201) {
      console.log('   ✅ Different email registration successful');
      console.log(`   📄 User:`, response4.data.user.email);
    } else {
      console.log('   ❌ Different email registration failed');
      console.log(`   📄 Response:`, response4.data);
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
  }

  console.log('\n🎯 Duplicate Entry Test Complete!');
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⏹️  Test interrupted by user');
  process.exit(0);
});

// Start test
runDuplicateTest().catch(error => {
  console.error('\n💥 Test failed:', error);
  process.exit(1);
});
