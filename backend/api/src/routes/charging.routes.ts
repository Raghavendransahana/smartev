import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';
import { ChargingSessionModel } from '../models/chargingSession.model';
import { VehicleModel } from '../models/vehicle.model';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

const router = express.Router();

// Validation schemas
const startChargingSchema = z.object({
  body: z.object({
    vehicleId: z.string(),
    stationId: z.string(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number()
    }),
    chargingType: z.enum(['slow', 'fast', 'ultra_fast']),
    powerRating: z.number().min(0)
  })
});

const endChargingSchema = z.object({
  body: z.object({
    sessionId: z.string(),
    finalBatteryLevel: z.number().min(0).max(100),
    energyConsumed: z.number().min(0),
    cost: z.number().min(0)
  })
});

// Charging management endpoints
router.post('/start',
  authMiddleware,
  validateRequest(startChargingSchema),
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
      
      const chargingSession = await ChargingSessionModel.create({
        vehicle: req.body.vehicleId,
        stationId: req.body.stationId,
        location: req.body.location,
        chargingType: req.body.chargingType,
        powerRating: req.body.powerRating,
        startTime: new Date(),
        status: 'active'
      });
      
      res.status(201).json(chargingSession);
    } catch (error) {
      throw createHttpError(500, 'Failed to start charging session');
    }
  }
);

router.post('/end',
  authMiddleware,
  validateRequest(endChargingSchema),
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      // Find session and verify ownership through vehicle
      const session = await ChargingSessionModel.findById(req.body.sessionId)
        .populate('vehicle');
      
      if (!session) {
        throw createHttpError(404, 'Charging session not found');
      }
      
      // Verify vehicle ownership
      const vehicle = session.vehicle as any;
      if (!vehicle.owner.equals(user._id)) {
        throw createHttpError(403, 'Not authorized to end this charging session');
      }
      
      session.endTime = new Date();
      session.finalBatteryLevel = req.body.finalBatteryLevel;
      session.energyConsumed = req.body.energyConsumed;
      session.cost = req.body.cost;
      session.status = 'completed';
      
      await session.save();
      
      res.json(session);
    } catch (error) {
      throw createHttpError(500, 'Failed to end charging session');
    }
  }
);

router.get('/:vehicleId/history',
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
      
      const chargingHistory = await ChargingSessionModel
        .find({ vehicle: req.params.vehicleId })
        .sort({ startTime: -1 });
      
      res.json(chargingHistory);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch charging history');
    }
  }
);

export { router as chargingRouter };