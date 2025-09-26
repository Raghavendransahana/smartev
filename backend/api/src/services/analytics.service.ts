import createHttpError from 'http-errors';
import { VehicleModel } from '../models/vehicle.model';
import { BatteryLogModel } from '../models/batteryLog.model';
import { ChargingSessionModel } from '../models/chargingSession.model';

export const getBatteryAnalytics = async (vehicleId: string) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  const logs = await BatteryLogModel.find({ vehicle: vehicle._id }).sort({ recordedAt: -1 }).limit(50).lean();
  if (logs.length === 0) {
    throw createHttpError(404, 'No telemetry data available');
  }

  const latest = logs[0];
  const avgSoH = logs.reduce((acc, log) => acc + log.stateOfHealth, 0) / logs.length;
  const avgTemperature = logs.reduce((acc, log) => acc + log.temperature, 0) / logs.length;

  const predictedCyclesRemaining = Math.max(0, Math.round((latest.stateOfHealth / 100) * 1000 - latest.cycleCount));

  return {
    vehicleId,
    latest,
    averageStateOfHealth: Number(avgSoH.toFixed(2)),
    averageTemperature: Number(avgTemperature.toFixed(2)),
    predictedCyclesRemaining,
    riskLevel: latest.stateOfHealth < 60 ? 'high' : latest.stateOfHealth < 75 ? 'medium' : 'low'
  };
};

export const getChargingAnalytics = async (vehicleId: string) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  const sessions = await ChargingSessionModel.find({ vehicle: vehicle._id }).sort({ startedAt: -1 }).lean();
  if (sessions.length === 0) {
    throw createHttpError(404, 'No charging sessions found');
  }

  const totalEnergy = sessions.reduce((acc, session) => acc + (session.energyKWh ?? 0), 0);
  const totalCost = sessions.reduce((acc, session) => acc + (session.cost ?? 0), 0);
  const completedSessions = sessions.filter((session) => session.endedAt).length;

  return {
    vehicleId,
    totalSessions: sessions.length,
    completedSessions,
    averageEnergyPerSession: Number((totalEnergy / Math.max(completedSessions, 1)).toFixed(2)),
    averageCostPerKWh: Number((totalCost / Math.max(totalEnergy, 1)).toFixed(2)),
    lastSession: sessions[0]
  };
};

export const getFleetSummary = async () => {
  const vehicles = await VehicleModel.find().populate('owner', 'role').lean();
  const vehicleCount = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === 'active').length;

  const [batteryCount, chargingCount] = await Promise.all([
    BatteryLogModel.countDocuments(),
    ChargingSessionModel.countDocuments()
  ]);

  const brandDistribution = vehicles.reduce<Record<string, number>>((acc, vehicle) => {
    acc[vehicle.brand] = (acc[vehicle.brand] ?? 0) + 1;
    return acc;
  }, {});

  return {
    vehicleCount,
    activeVehicles,
    totalBatteryLogs: batteryCount,
    totalChargingSessions: chargingCount,
    brandDistribution
  };
};
