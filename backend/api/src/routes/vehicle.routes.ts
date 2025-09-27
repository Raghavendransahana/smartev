import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { wrapAsync } from '../middlewares/errorHandler';
import { z } from 'zod';
import { VehicleModel } from '../models/vehicle.model';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

const router = express.Router();

// Validation schemas
const vehicleSchema = z.object({
  body: z.object({
    brand: z.string().min(1, 'Brand is required'),
    vehicleModel: z.string().min(1, 'Vehicle model is required'),
    vin: z.string().min(17, 'VIN must be 17 characters').max(17, 'VIN must be 17 characters'),
    status: z.enum(['active', 'inactive']).optional().default('active')
  })
});

// Vehicle management endpoints
router.post('/', 
  authMiddleware,
  validateRequest(vehicleSchema),
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    
    try {
      const vehicle = await VehicleModel.create({
        ...req.body,
        owner: user._id
      });
      res.status(201).json(vehicle);
    } catch (error: any) {
      if (error.code === 11000) {
        throw createHttpError(409, 'Vehicle with this VIN already exists');
      }
      throw createHttpError(500, 'Failed to create vehicle');
    }
  })
);

router.get('/',
  authMiddleware,
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    
    try {
      const vehicles = await VehicleModel.find({ owner: user._id }).sort({ createdAt: -1 });
      res.json(vehicles);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch vehicles');
    }
  })
);

// Admin endpoint to get all vehicles (for admin users)
router.get('/admin/all',
  authMiddleware,
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId, role: string };
    
    // Only allow admin users to access this endpoint
    if (user.role !== 'admin') {
      throw createHttpError(403, 'Access denied. Admin role required.');
    }
    
    try {
      const vehicles = await VehicleModel.find()
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });
      res.json(vehicles);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch all vehicles');
    }
  })
);

// Admin endpoint to get vehicles by user ID
router.get('/admin/user/:userId',
  authMiddleware,
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId, role: string };
    const { userId } = req.params;
    
    // Only allow admin users to access this endpoint
    if (user.role !== 'admin') {
      throw createHttpError(403, 'Access denied. Admin role required.');
    }
    
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user ID');
    }
    
    try {
      const vehicles = await VehicleModel.find({ owner: userId })
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });
      res.json(vehicles);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch vehicles for user');
    }
  })
);

// Admin endpoint to create vehicle for specific user
const adminVehicleSchema = z.object({
  body: z.object({
    brand: z.string().min(1, 'Brand is required'),
    vehicleModel: z.string().min(1, 'Vehicle model is required'),
    vin: z.string().min(17, 'VIN must be 17 characters').max(17, 'VIN must be 17 characters'),
    ownerId: z.string().min(1, 'Owner ID is required'),
    status: z.enum(['active', 'inactive']).optional().default('active')
  })
});

router.post('/admin/create',
  authMiddleware,
  validateRequest(adminVehicleSchema),
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId, role: string };
    
    // Only allow admin users to access this endpoint
    if (user.role !== 'admin') {
      throw createHttpError(403, 'Access denied. Admin role required.');
    }
    
    const { ownerId, ...vehicleData } = req.body;
    
    if (!Types.ObjectId.isValid(ownerId)) {
      throw createHttpError(400, 'Invalid owner ID');
    }
    
    try {
      const vehicle = await VehicleModel.create({
        ...vehicleData,
        owner: ownerId
      });
      
      const populatedVehicle = await VehicleModel.findById(vehicle._id)
        .populate('owner', 'name email');
        
      res.status(201).json(populatedVehicle);
    } catch (error: any) {
      if (error.code === 11000) {
        throw createHttpError(409, 'Vehicle with this VIN already exists');
      }
      throw createHttpError(500, 'Failed to create vehicle');
    }
  })
);

router.get('/:vehicleId',
  authMiddleware,
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    const { vehicleId } = req.params;
    
    if (!Types.ObjectId.isValid(vehicleId)) {
      throw createHttpError(400, 'Invalid vehicle ID');
    }
    
    try {
      const vehicle = await VehicleModel.findOne({ 
        _id: vehicleId, 
        owner: user._id 
      });
      
      if (!vehicle) {
        throw createHttpError(404, 'Vehicle not found');
      }
      
      res.json(vehicle);
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, 'Failed to fetch vehicle');
    }
  })
);

export { router as vehicleRouter };