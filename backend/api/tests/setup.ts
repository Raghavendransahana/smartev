import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo: MongoMemoryServer;

declare global {
  // eslint-disable-next-line no-var
  var __MONGO_URI__: string | undefined;
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1'
    }
  });
  const uri = mongo.getUri();
  global.__MONGO_URI__ = uri;
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? '1234567890abcdefghijklmnopqrstuvwxyz123456';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
  process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'silent';
  process.env.BLOCKCHAIN_RPC_URL = process.env.BLOCKCHAIN_RPC_URL ?? 'http://127.0.0.1:8545';
  process.env.BLOCKCHAIN_PRIVATE_KEY =
    process.env.BLOCKCHAIN_PRIVATE_KEY ?? '0x59c6995e998f97a5a0044966f0945381d8737100a89b1c0c0c44c8f329f0f4';
  process.env.BATTERY_CONTRACT_ADDRESS =
    process.env.BATTERY_CONTRACT_ADDRESS ?? '0x0000000000000000000000000000000000000001';
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) {
    await mongo.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map(async (collection) => {
      await collection.deleteMany({});
    })
  );
});
