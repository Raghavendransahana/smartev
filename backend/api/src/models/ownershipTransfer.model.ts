import { Schema, Document, Model, Types, model } from 'mongoose';

export interface IOwnershipTransfer {
  vehicle: Types.ObjectId;
  previousOwner: Types.ObjectId;
  newOwner: Types.ObjectId;
  transferredAt: Date;
  blockchainTxId?: string;
}

export interface IOwnershipTransferDocument extends IOwnershipTransfer, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IOwnershipTransferModel extends Model<IOwnershipTransferDocument> {}

const ownershipTransferSchema = new Schema<IOwnershipTransferDocument, IOwnershipTransferModel>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    previousOwner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    newOwner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    transferredAt: { type: Date, required: true, default: () => new Date() },
    blockchainTxId: { type: String }
  },
  {
    timestamps: true
  }
);

ownershipTransferSchema.index({ vehicle: 1, transferredAt: -1 });

export const OwnershipTransferModel = model<IOwnershipTransferDocument, IOwnershipTransferModel>(
  'OwnershipTransfer',
  ownershipTransferSchema
);
