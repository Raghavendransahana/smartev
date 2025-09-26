#!/usr/bin/env node

/**
 * User Management Test Suite
 * Tests user registration, login, profile retrieval, and profile updates
 */

const http = require('http');

const API_BASE = process.env.API_URL || 'http://localhost:4000';

console.log('🧪 Testing User Management System...');

// Test user data
const testUser = {
  email: 'usertest@example.com',
  password: 'testpassword123',
  role: 'owner',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890'
  }
};

let authToken = '';
let userId = '';

// HTTP request helper
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const postData = data ? JSON.stringify(data) : null;
    
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'FlexiEVChain-UserTest/1.0'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method,
      headers,
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

async function runUserManagementTests() {
  console.log('\n📋 Step 1: User Registration');
  try {
    const response = await makeRequest('POST', '/api/users/register', testUser);
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 201) {
      console.log('   ✅ User registration successful');
      userId = response.data.user._id;
      console.log(`   📄 User ID: ${userId}`);
    } else {
      console.log('   ❌ User registration failed');
      console.log(`   📄 Response:`, response.data);
      return;
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
    return;
  }

  console.log('\n📋 Step 2: User Login');
  try {
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    const response = await makeRequest('POST', '/api/users/login', loginData);
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   ✅ User login successful');
      authToken = response.data.token;
      console.log(`   📄 Token received: ${authToken.substring(0, 20)}...`);
    } else {
      console.log('   ❌ User login failed');
      console.log(`   📄 Response:`, response.data);
      return;
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
    return;
  }

  console.log('\n📋 Step 3: Get Current User Profile');
  try {
    const response = await makeRequest('GET', '/api/users/profile', null, authToken);
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   ✅ Profile retrieval successful');
      console.log(`   📄 Name: ${response.data.name}`);
      console.log(`   📄 Email: ${response.data.email}`);
      console.log(`   📄 Role: ${response.data.role}`);
    } else {
      console.log('   ❌ Profile retrieval failed');
      console.log(`   📄 Response:`, response.data);
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
  }

  console.log('\n📋 Step 4: Get Profile by ID');
  try {
    const response = await makeRequest('GET', `/api/users/profile/${userId}`, null, authToken);
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   ✅ Profile retrieval by ID successful');
      console.log(`   📄 Name: ${response.data.name}`);
      console.log(`   📄 Email: ${response.data.email}`);
    } else {
      console.log('   ❌ Profile retrieval by ID failed');
      console.log(`   📄 Response:`, response.data);
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
  }

  console.log('\n📋 Step 5: Update User Profile (Name Only)');
  try {
    const updateData = {
      profile: {
        firstName: 'Jane',
        lastName: 'Smith'
      }
    };
    
    const response = await makeRequest('PUT', '/api/users/profile', updateData, authToken);
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   ✅ Profile update successful');
      console.log(`   📄 Updated Name: ${response.data.user.name}`);
    } else {
      console.log('   ❌ Profile update failed');
      console.log(`   📄 Response:`, response.data);
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
  }

  console.log('\n📋 Step 6: Update Profile with Password Change');
  try {
    const updateData = {
      profile: {
        firstName: 'Jane',
        lastName: 'Doe-Smith',
        phone: '+9876543210'
      },
      currentPassword: testUser.password,
      newPassword: 'newpassword456'
    };
    
    const response = await makeRequest('PUT', '/api/users/profile', updateData, authToken);
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   ✅ Profile and password update successful');
      console.log(`   📄 Updated Name: ${response.data.user.name}`);
    } else {
      console.log('   ❌ Profile and password update failed');
      console.log(`   📄 Response:`, response.data);
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
  }

  console.log('\n📋 Step 7: Test Login with New Password');
  try {
    const loginData = {
      email: testUser.email,
      password: 'newpassword456'
    };
    
    const response = await makeRequest('POST', '/api/users/login', loginData);
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   ✅ Login with new password successful');
    } else {
      console.log('   ❌ Login with new password failed');
      console.log(`   📄 Response:`, response.data);
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
  }

  console.log('\n📋 Step 8: Test Invalid Password Change');
  try {
    const updateData = {
      currentPassword: 'wrongpassword',
      newPassword: 'anothernewpassword789'
    };
    
    const response = await makeRequest('PUT', '/api/users/profile', updateData, authToken);
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 400) {
      console.log('   ✅ Invalid password change properly rejected');
      console.log(`   📄 Error Message: ${response.data.message}`);
    } else {
      console.log('   ❌ Invalid password change not properly handled');
      console.log(`   📄 Response:`, response.data);
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
  }

  console.log('\n📋 Step 9: Test Unauthorized Access');
  try {
    const response = await makeRequest('GET', '/api/users/profile', null, 'invalid-token');
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('   ✅ Unauthorized access properly rejected');
    } else {
      console.log('   ❌ Unauthorized access not properly handled');
      console.log(`   📄 Response:`, response.data);
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
  }

  console.log('\n🎯 User Management Tests Complete!');
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⏹️  Tests interrupted by user');
  process.exit(0);
});

// Start tests
runUserManagementTests().catch(error => {
  console.error('\n💥 Tests failed:', error);
  process.exit(1);
});
