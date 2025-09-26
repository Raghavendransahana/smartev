import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';
import { TransactionModel } from '../models/transaction.model';
import { VehicleModel } from '../models/vehicle.model';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

const router = express.Router();

// Validation schemas
const recordTransactionSchema = z.object({
  body: z.object({
    vehicleId: z.string(),
    type: z.enum(['ownership_transfer', 'charging_payment', 'maintenance', 'insurance']),
    amount: z.number().min(0),
    currency: z.string().default('USD'),
    description: z.string(),
    metadata: z.record(z.any()).optional()
  })
});

const verifyTransactionSchema = z.object({
  body: z.object({
    transactionId: z.string(),
    blockchainHash: z.string(),
    blockNumber: z.number().optional(),
    gasUsed: z.number().optional()
  })
});

// Blockchain transaction endpoints
router.post('/record',
  authMiddleware,
  validateRequest(recordTransactionSchema),
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      // Verify vehicle ownership if vehicleId provided
      if (req.body.vehicleId) {
        const vehicle = await VehicleModel.findOne({
          _id: req.body.vehicleId,
          owner: user._id
        });
        
        if (!vehicle) {
          throw createHttpError(404, 'Vehicle not found or not owned by user');
        }
      }
      
      // In a real implementation, this would interact with blockchain
      // For now, we'll create a pending transaction record
      const transaction = await TransactionModel.create({
        vehicle: req.body.vehicleId,
        user: user._id,
        type: req.body.type,
        amount: req.body.amount,
        currency: req.body.currency,
        description: req.body.description,
        status: 'pending',
        metadata: req.body.metadata,
        createdAt: new Date()
      });
      
      // Simulate blockchain interaction
      // In production, this would submit to actual blockchain
      setTimeout(async () => {
        try {
          transaction.blockchainHash = generateMockHash();
          transaction.status = 'confirmed';
          transaction.confirmedAt = new Date();
          await transaction.save();
        } catch (error) {
          console.error('Failed to update transaction status:', error);
        }
      }, 2000);
      
      res.status(201).json(transaction);
    } catch (error) {
      throw createHttpError(500, 'Failed to record blockchain transaction');
    }
  }
);

router.post('/verify',
  authMiddleware,
  validateRequest(verifyTransactionSchema),
  async (req, res) => {
    try {
      const transaction = await TransactionModel.findById(req.body.transactionId);
      
      if (!transaction) {
        throw createHttpError(404, 'Transaction not found');
      }
      
      // Update transaction with blockchain verification data
      transaction.blockchainHash = req.body.blockchainHash;
      transaction.blockNumber = req.body.blockNumber;
      transaction.gasUsed = req.body.gasUsed;
      transaction.status = 'confirmed';
      transaction.confirmedAt = new Date();
      
      await transaction.save();
      
      res.json({
        message: 'Transaction verified successfully',
        transaction
      });
    } catch (error) {
      throw createHttpError(500, 'Failed to verify transaction');
    }
  }
);

router.get('/history',
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      
      const transactions = await TransactionModel
        .find({ user: user._id })
        .populate('vehicle', 'vin model')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await TransactionModel.countDocuments({ user: user._id });
      
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
  }
);

router.get('/vehicle/:vehicleId/transactions',
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
      
      const transactions = await TransactionModel
        .find({ vehicle: req.params.vehicleId })
        .sort({ createdAt: -1 });
      
      res.json(transactions);
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch vehicle transactions');
    }
  }
);

router.get('/stats',
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user as { _id: Types.ObjectId };
      
      const stats = await TransactionModel.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' }
          }
        }
      ]);
      
      const totalStats = await TransactionModel.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalValue: { $sum: '$amount' },
            confirmedTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
            }
          }
        }
      ]);
      
      res.json({
        byType: stats,
        overall: totalStats[0] || {
          totalTransactions: 0,
          totalValue: 0,
          confirmedTransactions: 0
        }
      });
    } catch (error) {
      throw createHttpError(500, 'Failed to fetch transaction statistics');
    }
  }
);

// Utility function to generate mock blockchain hash
function generateMockHash(): string {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export { router as blockchainRouter };