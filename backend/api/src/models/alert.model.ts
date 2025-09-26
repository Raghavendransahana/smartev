import { Schema, Document, Model, Types, model } from 'mongoose';

export interface IAlert {
  vehicle: Types.ObjectId;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  acknowledged: boolean;
}

export interface IAlertDocument extends IAlert, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IAlertModel extends Model<IAlertDocument> {}

const alertSchema = new Schema<IAlertDocument, IAlertModel>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    acknowledged: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

alertSchema.index({ vehicle: 1, createdAt: -1 });

export const AlertModel = model<IAlertDocument, IAlertModel>('Alert', alertSchema);
