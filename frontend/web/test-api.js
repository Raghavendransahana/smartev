// Test script to verify API service
const API_BASE_URL = 'http://localhost:4000/api';

// Test function
async function testApiConnection() {
  try {
    console.log('Testing API connection...');
    
    // Test login
    const loginResponse = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@smartev.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData);

    // Test users endpoint
    const usersResponse = await fetch(`${API_BASE_URL}/users?limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    if (!usersResponse.ok) {
      throw new Error(`Users fetch failed: ${usersResponse.status}`);
    }

    const usersData = await usersResponse.json();
    console.log('Users fetch successful:', usersData);

  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Run the test
testApiConnection();
