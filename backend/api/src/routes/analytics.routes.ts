import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { wrapAsync } from '../middlewares/errorHandler';
import { VehicleModel } from '../models/vehicle.model';
import { BatteryLogModel } from '../models/batteryLog.model';
import { ChargingSessionModel } from '../models/chargingSession.model';
import { AlertModel } from '../models/alert.model';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

const router = express.Router();

// Vehicle analytics endpoints
router.get('/vehicle/:vehicleId/summary',
  authMiddleware,
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    const { vehicleId } = req.params;
    
    if (!Types.ObjectId.isValid(vehicleId)) {
      throw createHttpError(400, 'Invalid vehicle ID');
    }
    
    try {
      // Verify vehicle ownership
      const vehicle = await VehicleModel.findOne({
        _id: vehicleId,
        owner: user._id
      });
      
      if (!vehicle) {
        throw createHttpError(404, 'Vehicle not found or not owned by user');
      }
      
      // Get latest battery data
      const latestBattery = await BatteryLogModel
        .findOne({ vehicle: vehicleId })
        .sort({ recordedAt: -1 });
      
      // Get charging statistics
      const chargingStats = await ChargingSessionModel.aggregate([
        { $match: { vehicle: new Types.ObjectId(vehicleId) } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalEnergy: { $sum: '$energyKWh' },
            totalCost: { $sum: '$cost' },
            avgEnergyPerSession: { $avg: '$energyKWh' }
          }
        }
      ]);
      
      // Get active alerts count
      const activeAlerts = await AlertModel.countDocuments({
        vehicle: vehicleId,
        status: 'active'
      });
      
      const summary = {
        vehicle: {
          vin: vehicle.vin,
          brand: vehicle.brand,
          model: vehicle.vehicleModel
        },
        batteryStatus: latestBattery ? {
          level: latestBattery.stateOfCharge,
          health: latestBattery.stateOfHealth,
          temperature: latestBattery.temperature,
          cycleCount: latestBattery.cycleCount,
          lastUpdated: latestBattery.recordedAt
        } : null,
        chargingStats: chargingStats[0] || {
          totalSessions: 0,
          totalEnergy: 0,
          totalCost: 0,
          avgEnergyPerSession: 0
        },
        activeAlerts
      };
      
      res.json(summary);
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, 'Failed to fetch vehicle summary');
    }
  })
);

router.get('/vehicle/:vehicleId/battery-trends',
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      // Verify vehicle ownership
      const vehicle = await VehicleModel.findOne({
        _id: req.params.vehicleId,
        owner: user._id
      });
      
      if (!vehicle) {
        throw createHttpError(404, 'Vehicle not found or not owned by user');
      }
      
      const days = parseInt(req.query.days as string) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const batteryTrends = await BatteryLogModel
        .find({
          vehicle: req.params.vehicleId,
          timestamp: { $gte: startDate }
        })
        .sort({ timestamp: 1 })
        .select('batteryLevel batteryHealth temperature timestamp');
      
      res.json(batteryTrends);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch battery trends');
    }
  }
);

router.get('/vehicle/:vehicleId/charging-patterns',
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      // Verify vehicle ownership
      const vehicle = await VehicleModel.findOne({
        _id: req.params.vehicleId,
        owner: user._id
      });
      
      if (!vehicle) {
        throw createHttpError(404, 'Vehicle not found or not owned by user');
      }
      
      const chargingPatterns = await ChargingSessionModel.aggregate([
        { $match: { vehicle: new Types.ObjectId(req.params.vehicleId) } },
        {
          $group: {
            _id: {
              hour: { $hour: '$startTime' },
              type: '$chargingType'
            },
            sessions: { $sum: 1 },
            totalEnergy: { $sum: '$energyConsumed' },
            avgDuration: {
              $avg: {
                $divide: [
                  { $subtract: ['$endTime', '$startTime'] },
                  1000 * 60 * 60 // Convert to hours
                ]
              }
            }
          }
        },
        { $sort: { '_id.hour': 1 } }
      ]);
      
      res.json(chargingPatterns);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch charging patterns');
    }
  }
);

router.get('/fleet/overview',
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      // Get user's vehicles
      const vehicles = await VehicleModel.find({ owner: user._id });
      const vehicleIds = vehicles.map(v => v._id);
      
      if (vehicleIds.length === 0) {
        return res.json({
          totalVehicles: 0,
          fleetStats: null,
          recentActivity: []
        });
      }
      
      // Fleet-wide statistics
      const fleetStats = await ChargingSessionModel.aggregate([
        { $match: { vehicle: { $in: vehicleIds } } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalEnergy: { $sum: '$energyConsumed' },
            totalCost: { $sum: '$cost' },
            avgSessionDuration: {
              $avg: {
                $divide: [
                  { $subtract: ['$endTime', '$startTime'] },
                  1000 * 60 * 60 // Convert to hours
                ]
              }
            }
          }
        }
      ]);
      
      // Recent activity across fleet
      const recentActivity = await ChargingSessionModel
        .find({ vehicle: { $in: vehicleIds } })
        .populate('vehicle', 'vin model')
        .sort({ startTime: -1 })
        .limit(10);
      
      const fleetOverview = {
        totalVehicles: vehicles.length,
        fleetStats: fleetStats[0] || {
          totalSessions: 0,
          totalEnergy: 0,
          totalCost: 0,
          avgSessionDuration: 0
        },
        recentActivity
      };
      
      res.json(fleetOverview);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch fleet overview');
    }
  }
);

export { router as analyticsRouter };