import { Schema, Document, Model, model } from 'mongoose';

export type TransactionType = 'battery' | 'charging' | 'ownership' | 'alert' | 'oem';

export interface IBlockchainTransaction {
  txId: string;
  type: TransactionType;
  status: 'pending' | 'confirmed' | 'failed';
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlockchainTransactionDocument extends IBlockchainTransaction, Document {}

export interface IBlockchainTransactionModel extends Model<IBlockchainTransactionDocument> {}

const blockchainTransactionSchema = new Schema<IBlockchainTransactionDocument, IBlockchainTransactionModel>(
  {
    txId: { type: String, required: true, unique: true },
    type: { type: String, enum: ['battery', 'charging', 'ownership', 'alert', 'oem'], required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'confirmed' },
    payload: { type: Schema.Types.Mixed, required: true }
  },
  {
    timestamps: true
  }
);

blockchainTransactionSchema.index({ txId: 1 }, { unique: true });
blockchainTransactionSchema.index({ type: 1, createdAt: -1 });

export const BlockchainTransactionModel = model<IBlockchainTransactionDocument, IBlockchainTransactionModel>(
  'BlockchainTransaction',
  blockchainTransactionSchema
);
