import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';
import { VehicleModel } from '../models/vehicle.model';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

const router = express.Router();

// Validation schemas
const vehicleSchema = z.object({
  body: z.object({
    brand: z.string().min(1),
    vehicleModel: z.string().min(1),
    vin: z.string().min(17).max(17),
    status: z.enum(['active', 'inactive']).optional().default('active')
  })
});

// Vehicle management endpoints
router.post('/', 
  authMiddleware,
  validateRequest(vehicleSchema),
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      const vehicle = await VehicleModel.create({
        ...req.body,
        owner: user._id
      });
      res.status(201).json(vehicle);
    } catch (error) {
      if ((error as any).code === 11000) {
        throw createHttpError(409, 'Vehicle with this VIN already exists');
      }
      throw error;
    }
  }
);

router.get('/',
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      const vehicles = await VehicleModel.find({ owner: user._id });
      res.json(vehicles);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch vehicles');
    }
  }
);

router.get('/:vehicleId',
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      const vehicle = await VehicleModel.findOne({ 
        _id: req.params.vehicleId, 
        owner: user._id 
      });
      
      if (!vehicle) {
        throw createHttpError(404, 'Vehicle not found');
      }
      
      res.json(vehicle);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch vehicle');
    }
  }
);

export { router as vehicleRouter };