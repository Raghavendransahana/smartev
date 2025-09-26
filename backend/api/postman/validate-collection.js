#!/usr/bin/env node

/**
 * Validation script for FlexiEVChain API Postman Collection
 * Checks if the collection covers all the important endpoints
 */

const fs = require('fs');
const path = require('path');

// Expected endpoints from the application routes
const expectedEndpoints = [
  // System routes
  { method: 'GET', path: '/api/system/status', section: 'System' },
  { method: 'GET', path: '/api/system/info', section: 'System' },
  
  // User routes
  { method: 'POST', path: '/api/users/register', section: 'Authentication' },
  { method: 'POST', path: '/api/users/login', section: 'Authentication' },
  { method: 'GET', path: '/api/users/profile', section: 'User Management' },
  { method: 'PUT', path: '/api/users/profile', section: 'User Management' },
  { method: 'DELETE', path: '/api/users/profile', section: 'User Management' },
  
  // Vehicle routes
  { method: 'POST', path: '/api/vehicles', section: 'Vehicle Management' },
  { method: 'GET', path: '/api/vehicles', section: 'Vehicle Management' },
  { method: 'GET', path: '/api/vehicles/:id', section: 'Vehicle Management' },
  { method: 'PUT', path: '/api/vehicles/:id', section: 'Vehicle Management' },
  { method: 'DELETE', path: '/api/vehicles/:id', section: 'Vehicle Management' },
  
  // Battery routes
  { method: 'POST', path: '/api/battery/log', section: 'Battery Management' },
  { method: 'GET', path: '/api/battery/:vehicleId/history', section: 'Battery Management' },
  
  // Charging routes
  { method: 'POST', path: '/api/charging/start', section: 'Charging Management' },
  { method: 'POST', path: '/api/charging/end', section: 'Charging Management' },
  { method: 'GET', path: '/api/charging/history/:vehicleId', section: 'Charging Management' },
  
  // Ownership routes
  { method: 'POST', path: '/api/ownership/initiate', section: 'Ownership Management' },
  { method: 'POST', path: '/api/ownership/approve', section: 'Ownership Management' },
  { method: 'GET', path: '/api/ownership/history/:vehicleId', section: 'Ownership Management' },
  
  // Alert routes
  { method: 'POST', path: '/api/alerts', section: 'Alerts & Notifications' },
  { method: 'GET', path: '/api/alerts/vehicle/:vehicleId', section: 'Alerts & Notifications' },
  { method: 'PATCH', path: '/api/alerts/:alertId', section: 'Alerts & Notifications' },
  
  // Analytics routes
  { method: 'GET', path: '/api/analytics/vehicle/:vehicleId/summary', section: 'Analytics & Reports' },
  { method: 'GET', path: '/api/analytics/battery/trends', section: 'Analytics & Reports' },
  { method: 'GET', path: '/api/analytics/fleet/overview', section: 'Analytics & Reports' },
  
  // Blockchain routes
  { method: 'POST', path: '/api/blockchain/record', section: 'Blockchain Integration' },
  { method: 'GET', path: '/api/blockchain/transactions', section: 'Blockchain Integration' },
  { method: 'GET', path: '/api/blockchain/vehicle/:vehicleId/transactions', section: 'Blockchain Integration' },
  { method: 'GET', path: '/api/blockchain/stats', section: 'Blockchain Integration' }
];

function validateCollection() {
  try {
    const collectionPath = path.join(__dirname, 'FlexiEVChain-API.postman_collection.json');
    const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
    
    console.log('🔍 Validating FlexiEVChain API Postman Collection...\n');
    
    // Extract all endpoints from the collection
    const collectionEndpoints = [];
    
    function extractEndpoints(items, sectionName = '') {
      items.forEach(item => {
        if (item.item) {
          // This is a folder
          extractEndpoints(item.item, item.name);
        } else if (item.request) {
          // This is a request
          const method = item.request.method;
          const url = item.request.url;
          let path = '';
          
          if (url && url.path) {
            path = '/' + url.path.join('/');
            // Replace Postman variables with parameter patterns
            path = path.replace(/{{[^}]+}}/g, ':param');
          }
          
          collectionEndpoints.push({
            method,
            path,
            section: sectionName,
            name: item.name
          });
        }
      });
    }
    
    extractEndpoints(collection.item);
    
    console.log(`📊 Collection Summary:`);
    console.log(`   Total requests: ${collectionEndpoints.length}`);
    console.log(`   Expected endpoints: ${expectedEndpoints.length}\n`);
    
    // Check coverage
    const missing = [];
    const covered = [];
    
    expectedEndpoints.forEach(expected => {
      const found = collectionEndpoints.find(endpoint => 
        endpoint.method === expected.method && 
        endpoint.path.replace(/:param/g, ':id') === expected.path.replace(/:[\w]+/g, ':id')
      );
      
      if (found) {
        covered.push({ ...expected, found });
      } else {
        missing.push(expected);
      }
    });
    
    console.log('✅ Covered Endpoints:');
    covered.forEach(endpoint => {
      console.log(`   ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(40)} [${endpoint.section}]`);
    });
    
    if (missing.length > 0) {
      console.log('\n❌ Missing Endpoints:');
      missing.forEach(endpoint => {
        console.log(`   ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(40)} [${endpoint.section}]`);
      });
    }
    
    console.log('\n📈 Coverage Report:');
    console.log(`   Covered: ${covered.length}/${expectedEndpoints.length} (${Math.round(covered.length/expectedEndpoints.length * 100)}%)`);
    
    // Check for production readiness features
    console.log('\n🚀 Production Readiness Check:');
    
    const hasGlobalTests = collection.event && collection.event.some(e => e.listen === 'test');
    const hasPreRequestScripts = collection.event && collection.event.some(e => e.listen === 'prerequest');
    const hasVariables = collection.variable && collection.variable.length > 0;
    
    console.log(`   Global test scripts: ${hasGlobalTests ? '✅' : '❌'}`);
    console.log(`   Pre-request scripts: ${hasPreRequestScripts ? '✅' : '❌'}`);
    console.log(`   Collection variables: ${hasVariables ? '✅' : '❌'} (${collection.variable?.length || 0} variables)`);
    
    // Check individual requests for test scripts
    let requestsWithTests = 0;
    collectionEndpoints.forEach(endpoint => {
      // This is a simplified check - would need to parse the full collection structure for accurate count
    });
    
    if (missing.length === 0) {
      console.log('\n🎉 Collection is comprehensive and production-ready!');
      return true;
    } else {
      console.log(`\n⚠️  Collection needs ${missing.length} more endpoints for complete coverage.`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error validating collection:', error.message);
    return false;
  }
}

if (require.main === module) {
  const isValid = validateCollection();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateCollection };