import createHttpError from 'http-errors';
import { randomUUID } from 'crypto';
import { VehicleModel } from '../models/vehicle.model';
import { UserModel } from '../models/user.model';
import { recordBlockchainTransaction } from './blockchain.service';

interface RegisterVehicleParams {
  brand: string;
  model: string;
  vin: string;
  ownerId: string;
}

export const registerVehicle = async ({ brand, model, vin, ownerId }: RegisterVehicleParams) => {
  const owner = await UserModel.findById(ownerId);
  if (!owner) {
    throw createHttpError(404, 'Owner not found');
  }

  const existing = await VehicleModel.findOne({ vin });
  if (existing) {
    throw createHttpError(409, 'Vehicle already registered');
  }

  const blockchainPassportId = randomUUID();
  const vehicle = await VehicleModel.create({
    brand,
    model,
    vin,
    owner: owner._id,
    blockchainPassportId
  });

  await recordBlockchainTransaction('ownership', {
    action: 'vehicle_registered',
    vehicleId: vehicle._id,
    ownerId: owner._id,
    blockchainPassportId
  });

  return vehicle;
};

export const getVehicleById = async (id: string) => {
  const vehicle = await VehicleModel.findById(id).populate('owner', '-passwordHash');
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }
  return vehicle;
};

export const listVehicles = async (brand?: string) => {
  const query: Record<string, unknown> = {};
  if (brand) {
    query.brand = brand;
  }
  return VehicleModel.find(query).populate('owner', 'name email role').lean();
};
