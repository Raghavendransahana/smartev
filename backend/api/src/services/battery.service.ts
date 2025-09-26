import createHttpError from 'http-errors';
import { VehicleModel } from '../models/vehicle.model';
import { BatteryLogModel } from '../models/batteryLog.model';
import { recordBlockchainTransaction } from './blockchain.service';

interface TelemetryPayload {
  stateOfCharge: number;
  stateOfHealth: number;
  temperature: number;
  cycleCount: number;
}

export const logBatteryTelemetry = async (
  vehicleId: string,
  { stateOfCharge, stateOfHealth, temperature, cycleCount }: TelemetryPayload,
  source: 'iot' | 'manual' = 'iot'
) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  const telemetry = await BatteryLogModel.create({
    vehicle: vehicle._id,
    stateOfCharge,
    stateOfHealth,
    temperature,
    cycleCount,
    source
  });

  const transaction = await recordBlockchainTransaction('battery', {
    vehicleId: vehicle._id,
    telemetryId: telemetry._id,
    stateOfCharge,
    stateOfHealth,
    temperature,
    cycleCount
  });

  telemetry.blockchainTxId = transaction.txId;
  await telemetry.save();

  return telemetry;
};

export const getBatteryHistory = async (vehicleId: string) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  return BatteryLogModel.find({ vehicle: vehicle._id }).sort({ recordedAt: -1 }).lean();
};

export const getLatestBatteryLog = async (vehicleId: string) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  const latest = await BatteryLogModel.findOne({ vehicle: vehicle._id }).sort({ recordedAt: -1 }).lean();
  if (!latest) {
    throw createHttpError(404, 'No telemetry found');
  }
  return latest;
};
