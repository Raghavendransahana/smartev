import { Schema, Document, Model, Types, model } from 'mongoose';

export interface IOEMData {
  vehicle: Types.ObjectId;
  payload: Record<string, unknown>;
  provider: string;
}

export interface IOEMDataDocument extends IOEMData, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IOEMDataModel extends Model<IOEMDataDocument> {}

const oemDataSchema = new Schema<IOEMDataDocument, IOEMDataModel>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    provider: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

oemDataSchema.index({ vehicle: 1, createdAt: -1 });

export const OEMDataModel = model<IOEMDataDocument, IOEMDataModel>('OEMData', oemDataSchema);
