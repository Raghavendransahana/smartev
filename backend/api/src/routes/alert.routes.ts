import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';
import { AlertModel } from '../models/alert.model';
import { VehicleModel } from '../models/vehicle.model';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

const router = express.Router();

// Validation schemas
const createAlertSchema = z.object({
  body: z.object({
    vehicleId: z.string(),
    type: z.enum(['maintenance', 'battery', 'charging', 'security']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    message: z.string(),
    data: z.record(z.any()).optional()
  })
});

const updateAlertSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'acknowledged', 'resolved']).optional(),
    resolvedBy: z.string().optional(),
    resolvedAt: z.date().optional()
  })
});

// Alert management endpoints
router.post('/create',
  authMiddleware,
  validateRequest(createAlertSchema),
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
      
      const alert = await AlertModel.create({
        vehicle: req.body.vehicleId,
        type: req.body.type,
        severity: req.body.severity,
        message: req.body.message,
        data: req.body.data,
        status: 'active',
        createdAt: new Date()
      });
      
      res.status(201).json(alert);
    } catch (error) {
      throw createHttpError(500, 'Failed to create alert');
    }
  }
);

router.get('/vehicle/:vehicleId',
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
      
      const alerts = await AlertModel
        .find({ vehicle: req.params.vehicleId })
        .sort({ createdAt: -1 });
      
      res.json(alerts);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch vehicle alerts');
    }
  }
);

router.get('/active',
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      // Get user's vehicles
      const vehicles = await VehicleModel.find({ owner: user._id });
      const vehicleIds = vehicles.map(v => v._id);
      
      const activeAlerts = await AlertModel
        .find({
          vehicle: { $in: vehicleIds },
          status: 'active'
        })
        .populate('vehicle')
        .sort({ createdAt: -1 });
      
      res.json(activeAlerts);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch active alerts');
    }
  }
);

router.patch('/:alertId/update',
  authMiddleware,
  validateRequest(updateAlertSchema),
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      // Find alert and verify ownership through vehicle
      const alert = await AlertModel.findById(req.params.alertId)
        .populate('vehicle');
      
      if (!alert) {
        throw createHttpError(404, 'Alert not found');
      }
      
      // Verify vehicle ownership
      const vehicle = alert.vehicle as any;
      if (!vehicle.owner.equals(user._id)) {
        throw createHttpError(403, 'Not authorized to update this alert');
      }
      
      // Update alert fields
      if (req.body.status) {
        alert.acknowledged = req.body.status === 'resolved';
      }
      
      await alert.save();
      
      res.json(alert);
    } catch (error) {
      throw createHttpError(500, 'Failed to update alert');
    }
  }
);

router.delete('/:alertId',
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      // Find alert and verify ownership through vehicle
      const alert = await AlertModel.findById(req.params.alertId)
        .populate('vehicle');
      
      if (!alert) {
        throw createHttpError(404, 'Alert not found');
      }
      
      // Verify vehicle ownership
      const vehicle = alert.vehicle as any;
      if (!vehicle.owner.equals(user._id)) {
        throw createHttpError(403, 'Not authorized to delete this alert');
      }
      
      await AlertModel.findByIdAndDelete(req.params.alertId);
      
      res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
      throw createHttpError(500, 'Failed to delete alert');
    }
  }
);

export { router as alertRouter };