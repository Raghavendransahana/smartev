import express from 'express';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/auth';
import { wrapAsync } from '../middlewares/errorHandler';
import { validateRequest } from '../middlewares/validateRequest';
import { executeBlockchainAction, getRecentTransactions } from '../services/blockchain.service';
import { BlockchainTransactionModel } from '../models/transaction.model';
import { VehicleModel } from '../models/vehicle.model';

const router = express.Router();

const hex32Schema = z.string().regex(/^0x[0-9a-fA-F]{64}$/u, 'Must be a 32-byte hex string');
const addressSchema = z.string().regex(/^0x[0-9a-fA-F]{40}$/u, 'Must be an Ethereum address');

const recordTransactionSchema = z.object({
  body: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('passport'),
      serialNumber: z.string().min(1),
      vehicleVin: z.string().min(5),
      originDocument: z.string().optional(),
      ownerAddress: addressSchema,
      vehicleId: z.string().optional()
    }),
    z.object({
      type: z.literal('ownership'),
      passportId: hex32Schema,
      toAddress: addressSchema,
      documentationHash: z.string().optional(),
      vehicleId: z.string().optional()
    }),
    z.object({
      type: z.literal('certification'),
      passportId: hex32Schema,
      category: z.string().min(1),
      documentHash: z.string().min(1),
      vehicleId: z.string().optional()
    }),
    z.object({
      type: z.literal('lifecycle'),
      passportId: hex32Schema,
      phase: z.enum(['manufactured', 'deployed', 'maintenance', 'endOfLife', 'end-of-life']),
      eventData: z.string().optional(),
      vehicleId: z.string().optional()
    }),
    z.object({
      type: z.literal('secondLife'),
      passportId: hex32Schema,
      eligible: z.boolean(),
      documentHash: z.string().optional(),
      vehicleId: z.string().optional()
    }),
    z.object({
      type: z.literal('recycling'),
      passportId: hex32Schema,
      action: z.enum(['none', 'scheduled', 'inTransit', 'in-transit', 'received', 'completed', 'intransit']),
      documentHash: z.string().optional(),
      vehicleId: z.string().optional()
    }),
    z.object({
      type: z.literal('charging'),
      passportId: hex32Schema,
      stationAddress: addressSchema,
      amountWei: z.string().regex(/^[0-9]+$/u, 'amountWei must be a numeric string'),
      sessionId: z.string().min(1),
      vehicleId: z.string().optional()
    }),
    z.object({
      type: z.literal('warranty'),
      passportId: hex32Schema,
      claimReference: z.string().min(1),
      vehicleId: z.string().optional()
    })
  ])
});

router.post(
  '/record',
  authMiddleware,
  validateRequest(recordTransactionSchema),
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    const actionInput = req.body as z.infer<typeof recordTransactionSchema>['body'];

    if (actionInput.vehicleId) {
      if (!Types.ObjectId.isValid(actionInput.vehicleId)) {
        throw createHttpError(400, 'Invalid vehicle ID');
      }
      const vehicle = await VehicleModel.findOne({ _id: actionInput.vehicleId, owner: user._id });
      if (!vehicle) {
        throw createHttpError(404, 'Vehicle not found or not owned by user');
      }
    }

    const result = await executeBlockchainAction(actionInput);

    const updated = await BlockchainTransactionModel.findByIdAndUpdate(
      result.transaction._id,
      {
        $set: {
          'payload.initiatedBy': user._id.toString(),
          ...(actionInput.vehicleId ? { 'payload.vehicleId': actionInput.vehicleId } : {})
        }
      },
      { new: true }
    ).lean();

    res.status(201).json({
      ...result,
      transaction: updated ?? result.transaction.toJSON()
    });
  })
);

router.get(
  '/transactions',
  authMiddleware,
  wrapAsync(async (req, res) => {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      BlockchainTransactionModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlockchainTransactionModel.countDocuments()
    ]);

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

router.get(
  '/vehicle/:vehicleId/transactions',
  authMiddleware,
  wrapAsync(async (req, res) => {
    const user = req.user as { _id: Types.ObjectId };
    const { vehicleId } = req.params;

    if (!Types.ObjectId.isValid(vehicleId)) {
      throw createHttpError(400, 'Invalid vehicle ID');
    }

    const vehicle = await VehicleModel.findOne({ _id: vehicleId, owner: user._id });
    if (!vehicle) {
      throw createHttpError(404, 'Vehicle not found or not owned by user');
    }

    const transactions = await BlockchainTransactionModel.find({ 'payload.vehicleId': vehicleId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(transactions);
  })
);

router.get(
  '/recent',
  authMiddleware,
  wrapAsync(async (_req, res) => {
    const recent = await getRecentTransactions();
    res.json(recent);
  })
);

router.get(
  '/stats',
  authMiddleware,
  wrapAsync(async (_req, res) => {
    const stats = await BlockchainTransactionModel.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = stats.reduce((sum, item) => sum + (item.count as number), 0);

    res.json({
      byType: stats,
      total
    });
  })
);

export { router as blockchainRouter };
