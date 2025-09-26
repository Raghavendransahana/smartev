import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { wrapAsync } from '../middlewares/errorHandler';
import { z } from 'zod';
import { ChargingSessionModel } from '../models/chargingSession.model';
import { VehicleModel } from '../models/vehicle.model';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

const router = express.Router();

// Validation schemas
const startChargingSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1, 'Vehicle ID is required'),
    chargerId: z.string().min(1, 'Charger ID is required'),
    location: z.string().min(1, 'Location is required')
  })
});

const endChargingSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    energyKWh: z.number().min(0, 'Energy consumed must be positive'),
    cost: z.number().min(0, 'Cost must be positive').optional()
  })
});

// Charging management endpoints
router.post('/start',
  authMiddleware,
  validateRequest(startChargingSchema),
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    const { vehicleId, chargerId, location } = req.body;
    
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
      
      // Check if there's already an active session for this vehicle
      const activeSession = await ChargingSessionModel.findOne({
        vehicle: vehicleId,
        endedAt: { $exists: false }
      });
      
      if (activeSession) {
        throw createHttpError(409, 'Vehicle already has an active charging session');
      }
      
      const chargingSession = await ChargingSessionModel.create({
        vehicle: vehicleId,
        chargerId,
        location,
        startedAt: new Date()
      });
      
      res.status(201).json(chargingSession);
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, 'Failed to start charging session');
    }
  })
);

router.post('/end',
  authMiddleware,
  validateRequest(endChargingSchema),
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    const { sessionId, energyKWh, cost } = req.body;
    
    if (!Types.ObjectId.isValid(sessionId)) {
      throw createHttpError(400, 'Invalid session ID');
    }
    
    try {
      // Find session and verify ownership through vehicle
      const session = await ChargingSessionModel.findById(sessionId)
        .populate('vehicle');
      
      if (!session) {
        throw createHttpError(404, 'Charging session not found');
      }
      
      // Check if session is already ended
      if (session.endedAt) {
        throw createHttpError(409, 'Charging session already completed');
      }
      
      // Verify vehicle ownership
      const vehicle = session.vehicle as any;
      if (!vehicle.owner.equals(user._id)) {
        throw createHttpError(403, 'Not authorized to end this charging session');
      }
      
      // Calculate duration
      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - session.startedAt.getTime()) / (1000 * 60));
      
      // Update session
      session.endedAt = endTime;
      session.energyKWh = energyKWh;
      session.durationMinutes = durationMinutes;
      if (cost !== undefined) {
        session.cost = cost;
      }
      
      await session.save();
      
      res.json(session);
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, 'Failed to end charging session');
    }
  })
);

router.get('/:vehicleId/history',
  authMiddleware,
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    const { vehicleId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    
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
      
      const chargingHistory = await ChargingSessionModel
        .find({ vehicle: vehicleId })
        .sort({ startedAt: -1 })
        .limit(limit)
        .lean();
      
      res.json(chargingHistory);
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, 'Failed to fetch charging history');
    }
  })
);

export { router as chargingRouter };