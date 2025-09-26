import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';
import { OwnershipTransferModel } from '../models/ownershipTransfer.model';
import { VehicleModel } from '../models/vehicle.model';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

const router = express.Router();

// Validation schemas
const initiateTransferSchema = z.object({
  body: z.object({
    vehicleId: z.string(),
    newOwnerId: z.string(),
    transferPrice: z.number().min(0).optional(),
    notes: z.string().optional()
  })
});

const approveTransferSchema = z.object({
  body: z.object({
    transferId: z.string(),
    approved: z.boolean()
  })
});

// Ownership transfer endpoints
router.post('/initiate',
  authMiddleware,
  validateRequest(initiateTransferSchema),
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
      
      const transferRequest = await OwnershipTransferModel.create({
        vehicle: req.body.vehicleId,
        currentOwner: user._id,
        newOwner: req.body.newOwnerId,
        transferPrice: req.body.transferPrice,
        notes: req.body.notes,
        status: 'pending',
        initiatedAt: new Date()
      });
      
      res.status(201).json(transferRequest);
    } catch (error) {
      throw createHttpError(500, 'Failed to initiate ownership transfer');
    }
  }
);

router.post('/approve',
  authMiddleware,
  validateRequest(approveTransferSchema),
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      const transfer = await OwnershipTransferModel.findById(req.body.transferId);
      
      if (!transfer) {
        throw createHttpError(404, 'Transfer request not found');
      }
      
      // Verify user is the new owner
      if (!transfer.newOwner.equals(user._id)) {
        throw createHttpError(403, 'Not authorized to approve this transfer');
      }
      
      if (req.body.approved) {
        // Update transfer status
        // Transfer approved - update vehicle ownership
        await VehicleModel.findByIdAndUpdate(transfer.vehicle, { owner: transfer.newOwner });
        await transfer.save();
        
        // Update vehicle ownership
        await VehicleModel.findByIdAndUpdate(
          transfer.vehicle,
          { owner: user._id }
        );
        
        res.json({ message: 'Transfer approved and completed', transfer });
      } else {
        // Transfer rejected - no action needed beyond logging
        await transfer.save();
        
        res.json({ message: 'Transfer rejected', transfer });
      }
    } catch (error) {
      throw createHttpError(500, 'Failed to process transfer approval');
    }
  }
);

router.get('/pending',
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      const pendingTransfers = await OwnershipTransferModel
        .find({ 
          $or: [
            { currentOwner: user._id },
            { newOwner: user._id }
          ],
          status: 'pending'
        })
        .populate('vehicle')
        .populate('currentOwner', 'name email')
        .populate('newOwner', 'name email');
      
      res.json(pendingTransfers);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch pending transfers');
    }
  }
);

router.get('/history',
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      const transferHistory = await OwnershipTransferModel
        .find({
          $or: [
            { currentOwner: user._id },
            { newOwner: user._id }
          ]
        })
        .populate('vehicle')
        .populate('currentOwner', 'name email')
        .populate('newOwner', 'name email')
        .sort({ initiatedAt: -1 });
      
      res.json(transferHistory);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch transfer history');
    }
  }
);

export { router as ownershipRouter };