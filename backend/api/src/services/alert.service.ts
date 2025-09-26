import createHttpError from 'http-errors';
import { VehicleModel } from '../models/vehicle.model';
import { AlertModel } from '../models/alert.model';
import { recordBlockchainTransaction } from './blockchain.service';

interface AlertPayload {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export const createAlert = async (vehicleId: string, payload: AlertPayload) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  const alert = await AlertModel.create({
    vehicle: vehicle._id,
    type: payload.type,
    message: payload.message,
    severity: payload.severity
  });

  const transaction = await recordBlockchainTransaction('alert', {
    vehicleId: vehicle._id,
    alertId: alert._id,
    ...payload
  });

  alert.set('blockchainTxId', transaction.txId);
  return alert;
};

export const getAlertsForVehicle = async (vehicleId: string) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  return AlertModel.find({ vehicle: vehicle._id }).sort({ createdAt: -1 }).lean();
};
