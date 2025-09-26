import { Schema, Document, Model, Types, model } from 'mongoose';

export interface IVehicle {
  brand: string;
  vehicleModel: string; // Renamed to avoid conflict with Document.model
  vin: string;
  owner: Types.ObjectId;
  blockchainPassportId?: string;
  status: 'active' | 'inactive';
}

export interface IVehicleDocument extends Omit<IVehicle, 'vehicleModel'>, Document {
  vehicleModel: string; // Explicitly define to avoid conflicts
  createdAt: Date;
  updatedAt: Date;
}

export interface IVehicleModel extends Model<IVehicleDocument> {}

const vehicleSchema = new Schema<IVehicleDocument, IVehicleModel>(
  {
    brand: { type: String, required: true, trim: true },
    vehicleModel: { type: String, required: true, trim: true },
    vin: { type: String, required: true, unique: true, uppercase: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blockchainPassportId: { type: String, index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  {
    timestamps: true
  }
);

vehicleSchema.index({ vin: 1 }, { unique: true });
vehicleSchema.index({ owner: 1 });
vehicleSchema.index({ brand: 1 });

export const VehicleModel = model<IVehicleDocument, IVehicleModel>('Vehicle', vehicleSchema);
