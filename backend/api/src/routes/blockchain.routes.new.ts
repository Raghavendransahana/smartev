import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { wrapAsync } from '../middlewares/errorHandler';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';
import { BlockchainTransactionModel } from '../models/transaction.model';
import { VehicleModel } from '../models/vehicle.model';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

const router = express.Router();

// Validation schemas
const recordTransactionSchema = z.object({
  body: z.object({
    vehicleId: z.string().optional(),
    type: z.enum(['battery', 'charging', 'ownership', 'alert', 'oem']),
    payload: z.record(z.any())
  })
});

// Generate mock transaction hash
const generateMockHash = (): string => {
  return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Blockchain transaction endpoints
router.post('/record',
  authMiddleware,
  validateRequest(recordTransactionSchema),
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    const { vehicleId, type, payload } = req.body;
    
    if (vehicleId && !Types.ObjectId.isValid(vehicleId)) {
      throw createHttpError(400, 'Invalid vehicle ID');
    }
    
    try {
      // Verify vehicle ownership if vehicleId provided
      if (vehicleId) {
        const vehicle = await VehicleModel.findOne({
          _id: vehicleId,
          owner: user._id
        });
        
        if (!vehicle) {
          throw createHttpError(404, 'Vehicle not found or not owned by user');
        }
      }
      
      // Create transaction record
      const transaction = await BlockchainTransactionModel.create({
        txId: generateMockHash(),
        type,
        status: 'confirmed',
        payload: {
          ...payload,
          vehicleId,
          userId: user._id.toString(),
          timestamp: new Date().toISOString()
        }
      });
      
      res.status(201).json(transaction);
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, 'Failed to record blockchain transaction');
    }
  })
);

router.get('/transactions',
  authMiddleware,
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    
    try {
      const transactions = await BlockchainTransactionModel
        .find({
          $or: [
            { 'payload.userId': user._id.toString() },
            { 'payload.userId': { $exists: false } }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await BlockchainTransactionModel.countDocuments({
        $or: [
          { 'payload.userId': user._id.toString() },
          { 'payload.userId': { $exists: false } }
        ]
      });
      
      res.json({
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch transaction history');
    }
  })
);

router.get('/vehicle/:vehicleId/transactions',
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
      
      const transactions = await BlockchainTransactionModel
        .find({ 'payload.vehicleId': vehicleId })
        .sort({ createdAt: -1 })
        .lean();
      
      res.json(transactions);
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, 'Failed to fetch vehicle transactions');
    }
  })
);

router.get('/stats',
  authMiddleware,
  wrapAsync(async (req, res) => {
    try {
      const stats = await BlockchainTransactionModel.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const totalTransactions = await BlockchainTransactionModel.countDocuments();
      
      res.json({
        byType: stats,
        total: totalTransactions
      });
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch blockchain statistics');
    }
  })
);

export { router as blockchainRouter };
