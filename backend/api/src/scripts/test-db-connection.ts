import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Import all models to ensure collections are created
import '../models/user.model';
import '../models/vehicle.model';
import '../models/batteryLog.model';
import '../models/chargingSession.model';
import '../models/ownershipTransfer.model';
import '../models/transaction.model';
import '../models/alert.model';
import '../models/auditLog.model';
import '../models/oemData.model';

async function testConnection() {
  try {
    logger.info('Testing MongoDB Atlas connection...');
    
    // Connect with production-ready options
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    logger.info('✅ Successfully connected to MongoDB Atlas');

    // Test database operations
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const collections = await db.listCollections().toArray();
    
    logger.info(`Database: ${db.databaseName}`);
    logger.info(`Existing collections: ${collections.map(c => c.name).join(', ') || 'None'}`);

    // Create indexes for production optimization
    const User = mongoose.model('User');
    const Vehicle = mongoose.model('Vehicle');
    const BatteryLog = mongoose.model('BatteryLog');
    const ChargingSession = mongoose.model('ChargingSession');

    // Ensure indexes exist
    await User.createIndexes();
    await Vehicle.createIndexes();
    await BatteryLog.createIndexes();
    await ChargingSession.createIndexes();

    logger.info('✅ All indexes created successfully');

    // Test a simple write/read operation
    const testDoc = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('temppass', 10),
      role: 'owner'
    });

    const foundDoc = await User.findById(testDoc._id);
    if (foundDoc) {
      logger.info('✅ Test document created and retrieved successfully');
      await User.findByIdAndDelete(testDoc._id);
      logger.info('✅ Test document cleaned up');
    }

    // List final collections
    const finalCollections = await db.listCollections().toArray();
    logger.info(`Final collections: ${finalCollections.map(c => c.name).join(', ')}`);

    logger.info('🎉 MongoDB Atlas is production-ready!');

  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

if (require.main === module) {
  testConnection()
    .then(() => {
      console.log('Connection test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Connection test failed:', error.message);
      process.exit(1);
    });
}

export { testConnection };