import { Schema, Document, Model, Types, model } from 'mongoose';

export interface IBatteryLog {
  vehicle: Types.ObjectId;
  stateOfCharge: number;
  stateOfHealth: number;
  temperature: number;
  cycleCount: number;
  recordedAt: Date;
  source: 'iot' | 'manual';
  blockchainTxId?: string;
}

export interface IBatteryLogDocument extends IBatteryLog, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IBatteryLogModel extends Model<IBatteryLogDocument> {}

const batteryLogSchema = new Schema<IBatteryLogDocument, IBatteryLogModel>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    stateOfCharge: { type: Number, required: true, min: 0, max: 100 },
    stateOfHealth: { type: Number, required: true, min: 0, max: 100 },
    temperature: { type: Number, required: true },
    cycleCount: { type: Number, required: true },
    recordedAt: { type: Date, required: true, default: () => new Date() },
    source: { type: String, enum: ['iot', 'manual'], default: 'iot' },
    blockchainTxId: { type: String }
  },
  {
    timestamps: true
  }
);

batteryLogSchema.index({ vehicle: 1, recordedAt: -1 });

export const BatteryLogModel = model<IBatteryLogDocument, IBatteryLogModel>('BatteryLog', batteryLogSchema);
