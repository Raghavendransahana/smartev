process.env.BLOCKCHAIN_RPC_URL = process.env.BLOCKCHAIN_RPC_URL ?? 'http://127.0.0.1:8545';
process.env.BLOCKCHAIN_PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY ?? `0x${'1'.repeat(64)}`;
process.env.BATTERY_CONTRACT_ADDRESS =
  process.env.BATTERY_CONTRACT_ADDRESS ?? '0x0000000000000000000000000000000000000001';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? '1234567890abcdefghijklmnopqrstuvwxyz123456';

import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { app } from '../src/app';
import { UserModel, IUserDocument } from '../src/models/user.model';
import { VehicleModel, IVehicleDocument } from '../src/models/vehicle.model';
import { BlockchainTransactionModel } from '../src/models/transaction.model';
import * as blockchainService from '../src/services/blockchain.service';

jest.mock('../src/services/blockchain.service', () => {
  const actual = jest.requireActual('../src/services/blockchain.service');
  return {
    ...actual,
    executeBlockchainAction: jest.fn()
  };
});

declare global {
  // eslint-disable-next-line no-var
  var __MONGO_URI__: string | undefined;
}

const executeBlockchainAction = blockchainService.executeBlockchainAction as jest.Mock;

const createAuthToken = (userId: mongoose.Types.ObjectId, role: string) =>
  jwt.sign({ sub: userId.toString(), role }, process.env.JWT_SECRET!, { expiresIn: '1h' });

const createUser = async (): Promise<IUserDocument> => {
  return UserModel.create({
    name: 'Test User',
    email: `user-${new mongoose.Types.ObjectId().toString()}@example.com`,
    passwordHash: 'hashed-password',
    role: 'owner'
  });
};

const createVehicle = async (ownerId: mongoose.Types.ObjectId): Promise<IVehicleDocument> => {
  const vinSeed = `VIN${Math.random().toString(36).slice(2, 19).toUpperCase()}`;
  return VehicleModel.create({
    brand: 'TestBrand',
    vehicleModel: 'Model X',
    vin: vinSeed.padEnd(17, 'X').slice(0, 17),
    owner: ownerId,
    status: 'active'
  });
};

const createTxId = () => `0x${randomBytes(32).toString('hex')}`;

const toObjectId = (value: unknown): mongoose.Types.ObjectId => value as mongoose.Types.ObjectId;

beforeAll(async () => {
  if (!global.__MONGO_URI__) {
    throw new Error('Mongo URI not initialized');
  }
  await mongoose.connect(global.__MONGO_URI__);
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  jest.clearAllMocks();
});

const ownershipRequestPayload = (vehicleId: string) => ({
  type: 'ownership' as const,
  passportId: '0x' + 'a'.repeat(64),
  toAddress: '0x0000000000000000000000000000000000000002',
  documentationHash: 'transfer-doc',
  vehicleId
});

describe('Blockchain routes', () => {
  test('POST /api/blockchain/record stores transaction metadata with initiator and vehicle linkage', async () => {
    const user = await createUser();
    const userId = toObjectId(user._id);
    const vehicle = await createVehicle(userId);
    const vehicleId = toObjectId(vehicle._id);
    const token = createAuthToken(userId, user.role);

    executeBlockchainAction.mockImplementation(async (input) => {
      const transaction = await BlockchainTransactionModel.create({
        txId: createTxId(),
        type: input.type,
        status: 'confirmed',
        payload: {
          passportId: input.passportId
        }
      });

      return { transaction, receipt: { status: 1 } };
    });

    const response = await request(app)
      .post('/api/blockchain/record')
      .set('Authorization', `Bearer ${token}`)
  .send(ownershipRequestPayload(vehicleId.toString()))
      .expect(201);

    expect(executeBlockchainAction).toHaveBeenCalledTimes(1);
    expect(response.body.transaction).toMatchObject({
      payload: expect.objectContaining({
        initiatedBy: userId.toString(),
        vehicleId: vehicleId.toString()
      })
    });

    const stored = await BlockchainTransactionModel.findById(response.body.transaction._id).lean();
    expect(stored?.payload).toMatchObject({
      passportId: '0x' + 'a'.repeat(64),
      initiatedBy: userId.toString(),
      vehicleId: vehicleId.toString()
    });
  });

  test('POST /api/blockchain/record rejects access to vehicles not owned by user', async () => {
    const owner = await createUser();
    const ownerId = toObjectId(owner._id);
    const attacker = await createUser();
    const attackerId = toObjectId(attacker._id);
    const vehicle = await createVehicle(ownerId);
    const vehicleId = toObjectId(vehicle._id);
    const token = createAuthToken(attackerId, attacker.role);

    await request(app)
      .post('/api/blockchain/record')
      .set('Authorization', `Bearer ${token}`)
      .send(ownershipRequestPayload(vehicleId.toString()))
      .expect(404);

    expect(executeBlockchainAction).not.toHaveBeenCalled();
  });

  test('GET /api/blockchain/transactions returns paginated results', async () => {
    const user = await createUser();
    const token = createAuthToken(toObjectId(user._id), user.role);

    await BlockchainTransactionModel.insertMany(
      Array.from({ length: 3 }).map((_, index) => ({
        txId: createTxId(),
        type: 'ownership',
        status: 'confirmed',
        payload: { index }
      }))
    );

    const response = await request(app)
      .get('/api/blockchain/transactions?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.transactions).toHaveLength(2);
    expect(response.body.pagination).toMatchObject({ page: 1, limit: 2, total: 3 });
  });

  test('GET /api/blockchain/vehicle/:vehicleId/transactions filters by vehicle ownership', async () => {
    const user = await createUser();
    const userId = toObjectId(user._id);
    const vehicle = await createVehicle(userId);
    const vehicleId = toObjectId(vehicle._id);
    const token = createAuthToken(userId, user.role);

    await BlockchainTransactionModel.create({
      txId: createTxId(),
      type: 'ownership',
      status: 'confirmed',
      payload: { vehicleId: vehicleId.toString() }
    });

    const response = await request(app)
      .get(`/api/blockchain/vehicle/${vehicleId.toString()}/transactions`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].payload.vehicleId).toBe(vehicleId.toString());
  });

  test('GET /api/blockchain/recent returns latest transactions', async () => {
    const user = await createUser();
    const token = createAuthToken(toObjectId(user._id), user.role);

    await BlockchainTransactionModel.create({
      txId: createTxId(),
      type: 'passport',
      status: 'confirmed',
      payload: { foo: 'bar' }
    });

    const response = await request(app)
      .get('/api/blockchain/recent')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/blockchain/stats aggregates counts by type', async () => {
    const user = await createUser();
    const token = createAuthToken(toObjectId(user._id), user.role);

    await BlockchainTransactionModel.create([
      { txId: createTxId(), type: 'ownership', status: 'confirmed', payload: {} },
      { txId: createTxId(), type: 'ownership', status: 'confirmed', payload: {} },
      { txId: createTxId(), type: 'passport', status: 'confirmed', payload: {} }
    ]);

    const response = await request(app)
      .get('/api/blockchain/stats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const byType = response.body.byType.reduce(
      (acc: Record<string, number>, entry: { _id: string; count: number }) => ({
        ...acc,
        [entry._id]: entry.count
      }),
      {}
    );

    expect(byType.ownership).toBe(2);
    expect(byType.passport).toBe(1);
    expect(response.body.total).toBe(3);
  });
});
