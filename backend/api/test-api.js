#!/usr/bin/env node

const http = require('http');

// Test data
const testUser = {
  email: 'test.user@example.com',
  password: 'TestPassword123!',
  role: 'owner',
  profile: {
    firstName: 'Test',
    lastName: 'User',
    phone: '+1-555-0199'
  }
};

// Test registration
function testRegistration() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(testUser);
    
    const options = {
      hostname: '10.10.40.174',
      port: 4000,
      path: '/api/users/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('✅ Registration successful');
          resolve(JSON.parse(body));
        } else {
          console.log('❌ Registration failed:', res.statusCode, body);
          reject(new Error(`Registration failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Test login
function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    
    const options = {
      hostname: '10.10.40.174',
      port: 4000,
      path: '/api/users/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Login successful');
          resolve(JSON.parse(body));
        } else {
          console.log('❌ Login failed:', res.statusCode, body);
          reject(new Error(`Login failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Test system health
function testHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '10.10.40.174',
      port: 4000,
      path: '/api/system/status',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Health check passed');
          resolve(JSON.parse(body));
        } else {
          console.log('❌ Health check failed:', res.statusCode);
          reject(new Error(`Health check failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Testing FlexiEVChain API endpoints...\n');

  try {
    // Test 1: Health check
    await testHealth();
    
    // Test 2: Registration
    await testRegistration();
    
    // Test 3: Login
    const loginResult = await testLogin(testUser.email, testUser.password);
    console.log('📝 JWT Token received:', loginResult.token ? 'Yes' : 'No');
    
    console.log('\n🎉 All tests passed! API is working correctly.');
    console.log('📋 You can now import the Postman collection to test all endpoints.');
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();