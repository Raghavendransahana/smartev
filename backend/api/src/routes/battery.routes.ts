import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { wrapAsync } from '../middlewares/errorHandler';
import { z } from 'zod';
import { BatteryLogModel } from '../models/batteryLog.model';
import { VehicleModel } from '../models/vehicle.model';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

const router = express.Router();

// Validation schemas
const batteryLogSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1, 'Vehicle ID is required'),
    batteryLevel: z.number().min(0, 'Battery level must be at least 0').max(100, 'Battery level cannot exceed 100'),
    voltage: z.number().min(0, 'Voltage must be positive'),
    temperature: z.number(),
    cycleCount: z.number().min(0, 'Cycle count must be positive'),
    healthPercentage: z.number().min(0, 'Health percentage must be at least 0').max(100, 'Health percentage cannot exceed 100'),
    chargingStatus: z.enum(['charging', 'not_charging', 'fast_charging'])
  })
});

// Battery management endpoints
router.post('/log',
  authMiddleware,
  validateRequest(batteryLogSchema),
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    const { vehicleId } = req.body;
    
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
      
      const batteryLog = await BatteryLogModel.create({
        ...req.body,
        vehicle: vehicleId,
        timestamp: new Date()
      });
      
      res.status(201).json(batteryLog);
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, 'Failed to log battery data');
    }
  })
);

router.get('/:vehicleId/history',
  authMiddleware,
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    const { vehicleId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 1000); // Cap at 1000
    
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
      
      const batteryHistory = await BatteryLogModel
        .find({ vehicle: vehicleId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      
      res.json(batteryHistory);
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, 'Failed to fetch battery history');
    }
  })
);

export { router as batteryRouter };