#!/usr/bin/env node

/**
 * Test Data Cleanup Script
 * Removes test users created during duplicate registration testing
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection - use the same environment variable as the backend
const MONGO_URI = process.env.MONGODB_URI;

console.log('🧹 Cleaning up test data...');

async function cleanupTestUsers() {
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('   ✅ Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Remove test users
    const testEmails = [
      'test@example.com',
      'TEST@EXAMPLE.COM',
      'different@example.com',
      'usertest@example.com'
    ];
    
    for (const email of testEmails) {
      const result = await usersCollection.deleteMany({ 
        email: { $regex: new RegExp(`^${email}$`, 'i') }
      });
      
      if (result.deletedCount > 0) {
        console.log(`   🗑️  Removed ${result.deletedCount} user(s) with email: ${email}`);
      }
    }
    
    // Also remove any audit logs for these test users
    const auditLogsCollection = db.collection('auditlogs');
    const auditResult = await auditLogsCollection.deleteMany({
      'metadata.email': { $in: testEmails.map(email => email.toLowerCase()) }
    });
    
    if (auditResult.deletedCount > 0) {
      console.log(`   🗑️  Removed ${auditResult.deletedCount} audit log(s) for test users`);
    }
    
    console.log('   ✅ Test data cleanup complete');
    
  } catch (error) {
    console.error('   ❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('   ✅ MongoDB connection closed');
    }
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⏹️  Cleanup interrupted by user');
  process.exit(0);
});

// Start cleanup
cleanupTestUsers().catch(error => {
  console.error('\n💥 Cleanup failed:', error);
  process.exit(1);
});
