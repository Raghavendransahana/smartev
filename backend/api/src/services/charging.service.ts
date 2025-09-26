import createHttpError from 'http-errors';
import { VehicleModel } from '../models/vehicle.model';
import { ChargingSessionModel } from '../models/chargingSession.model';
import { recordBlockchainTransaction } from './blockchain.service';

interface StartSessionPayload {
  timestamp: Date;
  location: string;
  chargerId: string;
}

interface EndSessionPayload {
  energyKWh: number;
  durationMinutes: number;
  cost: number;
}

export const startChargingSession = async (vehicleId: string, payload: StartSessionPayload) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  const session = await ChargingSessionModel.create({
    vehicle: vehicle._id,
    startedAt: payload.timestamp,
    location: payload.location,
    chargerId: payload.chargerId
  });

  const transaction = await recordBlockchainTransaction('charging', {
    action: 'start',
    vehicleId: vehicle._id,
    sessionId: session._id,
    timestamp: payload.timestamp,
    location: payload.location
  });

  session.blockchainTxId = transaction.txId;
  await session.save();

  return session;
};

export const endChargingSession = async (vehicleId: string, payload: EndSessionPayload) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  const session = await ChargingSessionModel.findOne({ vehicle: vehicle._id, endedAt: { $exists: false } }).sort({
    startedAt: -1
  });

  if (!session) {
    throw createHttpError(404, 'Active charging session not found');
  }

  session.endedAt = new Date();
  session.energyKWh = payload.energyKWh;
  session.durationMinutes = payload.durationMinutes;
  session.cost = payload.cost;

  const transaction = await recordBlockchainTransaction('charging', {
    action: 'end',
    vehicleId: vehicle._id,
    sessionId: session._id,
    energyKWh: payload.energyKWh,
    durationMinutes: payload.durationMinutes,
    cost: payload.cost
  });

  session.blockchainTxId = transaction.txId;
  await session.save();

  return session;
};

export const getChargingHistory = async (vehicleId: string) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  return ChargingSessionModel.find({ vehicle: vehicle._id }).sort({ startedAt: -1 }).lean();
};
