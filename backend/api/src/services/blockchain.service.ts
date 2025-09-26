import { randomUUID } from 'crypto';
import { BlockchainTransactionModel, TransactionType } from '../models/transaction.model';

export const recordBlockchainTransaction = async (
  type: TransactionType,
  payload: Record<string, unknown>
) => {
  const txId = randomUUID();
  const transaction = await BlockchainTransactionModel.create({
    txId,
    type,
    status: 'confirmed',
    payload
  });
  return transaction;
};

export const getRecentTransactions = async (limit = 50) => {
  return BlockchainTransactionModel.find().sort({ createdAt: -1 }).limit(limit).lean();
};

export const getTransactionById = async (txId: string) => {
  return BlockchainTransactionModel.findOne({ txId }).lean();
};
