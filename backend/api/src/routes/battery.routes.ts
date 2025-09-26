import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';
import { BatteryLogModel } from '../models/batteryLog.model';
import { VehicleModel } from '../models/vehicle.model';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

const router = express.Router();

// Validation schemas
const batteryLogSchema = z.object({
  body: z.object({
    vehicleId: z.string(),
    batteryLevel: z.number().min(0).max(100),
    voltage: z.number().min(0),
    temperature: z.number(),
    cycleCount: z.number().min(0),
    healthPercentage: z.number().min(0).max(100),
    chargingStatus: z.enum(['charging', 'not_charging', 'fast_charging'])
  })
});

// Battery management endpoints
router.post('/log',
  authMiddleware,
  validateRequest(batteryLogSchema),
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      // Verify vehicle ownership
      const vehicle = await VehicleModel.findOne({
        _id: req.body.vehicleId,
        owner: user._id
      });
      
      if (!vehicle) {
        throw createHttpError(404, 'Vehicle not found or not owned by user');
      }
      
      const batteryLog = await BatteryLogModel.create({
        ...req.body,
        vehicle: req.body.vehicleId,
        timestamp: new Date()
      });
      
      res.status(201).json(batteryLog);
    } catch (error) {
      throw createHttpError(500, 'Failed to log battery data');
    }
  }
);

router.get('/:vehicleId/history',
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Verify vehicle ownership
      const vehicle = await VehicleModel.findOne({
        _id: req.params.vehicleId,
        owner: user._id
      });
      
      if (!vehicle) {
        throw createHttpError(404, 'Vehicle not found or not owned by user');
      }
      
      const batteryHistory = await BatteryLogModel
        .find({ vehicle: req.params.vehicleId })
        .sort({ timestamp: -1 })
        .limit(limit);
      
      res.json(batteryHistory);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch battery history');
    }
  }
);

export { router as batteryRouter };