import createHttpError from 'http-errors';
import { VehicleModel } from '../models/vehicle.model';
import { OEMDataModel } from '../models/oemData.model';

interface OEMPayload {
  provider: string;
  payload: Record<string, unknown>;
}

export const createOEMData = async (vehicleId: string, data: OEMPayload) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  return OEMDataModel.create({
    vehicle: vehicle._id,
    provider: data.provider,
    payload: data.payload
  });
};

export const getOEMDataByVehicle = async (vehicleId: string) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  return OEMDataModel.find({ vehicle: vehicle._id }).sort({ createdAt: -1 }).lean();
};
