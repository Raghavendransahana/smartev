import { readFileSync } from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { VehicleModel } from '../models/vehicle.model';
import { BlockchainTransactionModel } from '../models/transaction.model';

const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, '../../package.json'), { encoding: 'utf-8' })
);

export const getSystemInfo = async () => {
  const [vehicleBrands, txCount] = await Promise.all([
    VehicleModel.distinct('brand'),
    BlockchainTransactionModel.countDocuments()
  ]);

  return {
    version: packageJson.version,
    supportedBrands: vehicleBrands,
    blockchain: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      transactionCount: txCount
    }
  };
};
