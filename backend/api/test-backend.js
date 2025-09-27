#!/usr/bin/env node

/**
 * Backend API Test Script
 * Tests basic functionality and error handling
 */

const http = require('http');
const path = require('path');

// Test configuration
const API_BASE = process.env.API_URL || 'http://10.10.40.174:4000';
const TEST_TIMEOUT = 5000;

console.log('🚀 Starting FlexiEVChain API Tests...');
console.log(`API Base URL: ${API_BASE}`);

// Test cases
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/api/health',
    expectedStatus: 200
  },
  {
    name: 'System Status',
    method: 'GET', 
    path: '/api/system/status',
    expectedStatus: 200
  },
  {
    name: 'System Info',
    method: 'GET',
    path: '/api/system/info', 
    expectedStatus: 200
  },
  {
    name: 'Invalid Route (404)',
    method: 'GET',
    path: '/api/nonexistent',
    expectedStatus: 404
  }
];

// HTTP request helper
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlexiEVChain-Test/1.0'
      },
      timeout: TEST_TIMEOUT
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

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run tests
async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📋 Running: ${test.name}`);
      console.log(`   ${test.method} ${test.path}`);
      
      const response = await makeRequest(test.method, test.path);
      
      if (response.status === test.expectedStatus) {
        console.log(`   ✅ PASS - Status: ${response.status}`);
        if (response.data) {
          console.log(`   📄 Response:`, JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        }
        passed++;
      } else {
        console.log(`   ❌ FAIL - Expected ${test.expectedStatus}, got ${response.status}`);
        console.log(`   📄 Response:`, response.data);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Backend API is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the backend setup.');
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⏹️  Tests interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('\n💥 Unhandled rejection:', error);
  process.exit(1);
});

// Start tests
runTests().catch(error => {
  console.error('\n💥 Test runner failed:', error);
  process.exit(1);
});
