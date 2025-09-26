import { Schema, Document, Model, Types, model } from 'mongoose';

export interface IChargingSession {
  vehicle: Types.ObjectId;
  startedAt: Date;
  location: string;
  chargerId: string;
  endedAt?: Date;
  energyKWh?: number;
  durationMinutes?: number;
  cost?: number;
  blockchainTxId?: string;
}

export interface IChargingSessionDocument extends IChargingSession, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IChargingSessionModel extends Model<IChargingSessionDocument> {}

const chargingSessionSchema = new Schema<IChargingSessionDocument, IChargingSessionModel>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    startedAt: { type: Date, required: true },
    location: { type: String, required: true },
    chargerId: { type: String, required: true },
    endedAt: { type: Date },
    energyKWh: { type: Number, min: 0 },
    durationMinutes: { type: Number, min: 0 },
    cost: { type: Number, min: 0 },
    blockchainTxId: { type: String }
  },
  {
    timestamps: true
  }
);

chargingSessionSchema.index({ vehicle: 1, startedAt: -1 });

export const ChargingSessionModel = model<IChargingSessionDocument, IChargingSessionModel>(
  'ChargingSession',
  chargingSessionSchema
);
