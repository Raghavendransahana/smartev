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

// Admin endpoint to create battery log for any vehicle
const adminBatteryLogSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1, 'Vehicle ID is required'),
    stateOfCharge: z.number().min(0, 'State of charge must be at least 0').max(100, 'State of charge cannot exceed 100'),
    stateOfHealth: z.number().min(0, 'State of health must be at least 0').max(100, 'State of health cannot exceed 100'),
    temperature: z.number(),
    cycleCount: z.number().min(0, 'Cycle count must be positive'),
    voltage: z.number().min(0, 'Voltage must be positive').optional(),
    chargingStatus: z.enum(['charging', 'not_charging', 'fast_charging']).optional(),
    source: z.enum(['iot', 'manual']).optional().default('manual'),
    recordedAt: z.string().datetime().optional()
  })
});

router.post('/admin/log',
  authMiddleware,
  validateRequest(adminBatteryLogSchema),
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId, role: string };
    const { vehicleId, recordedAt, ...batteryData } = req.body;
    
    // Only allow admin users to access this endpoint
    if (user.role !== 'admin') {
      throw createHttpError(403, 'Access denied. Admin role required.');
    }
    
    if (!Types.ObjectId.isValid(vehicleId)) {
      throw createHttpError(400, 'Invalid vehicle ID');
    }
    
    try {
      // Verify vehicle exists (don't need to check ownership for admin)
      const vehicle = await VehicleModel.findById(vehicleId);
      
      if (!vehicle) {
        throw createHttpError(404, 'Vehicle not found');
      }
      
      const batteryLog = await BatteryLogModel.create({
        vehicle: vehicleId,
        ...batteryData,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
        source: batteryData.source || 'manual'
      });
      
      const populatedLog = await BatteryLogModel.findById(batteryLog._id)
        .populate('vehicle', 'brand vehicleModel vin owner');
      
      res.status(201).json(populatedLog);
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, 'Failed to create battery log');
    }
  })
);

// Admin endpoint to get battery logs for any vehicle
router.get('/admin/logs/:vehicleId',
  authMiddleware,
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId, role: string };
    const { vehicleId } = req.params;
    
    // Only allow admin users to access this endpoint
    if (user.role !== 'admin') {
      throw createHttpError(403, 'Access denied. Admin role required.');
    }
    
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 1000);
    
    if (!Types.ObjectId.isValid(vehicleId)) {
      throw createHttpError(400, 'Invalid vehicle ID');
    }
    
    try {
      const batteryHistory = await BatteryLogModel
        .find({ vehicle: vehicleId })
        .sort({ recordedAt: -1 })
        .limit(limit)
        .populate('vehicle', 'brand vehicleModel vin')
        .lean();
      
      res.json(batteryHistory);
    } catch (error: any) {
      throw createHttpError(500, 'Failed to fetch battery history');
    }
  })
);

export { router as batteryRouter };