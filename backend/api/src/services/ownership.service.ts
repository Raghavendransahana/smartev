import createHttpError from 'http-errors';
import { VehicleModel } from '../models/vehicle.model';
import { UserModel } from '../models/user.model';
import { OwnershipTransferModel } from '../models/ownershipTransfer.model';
import { recordBlockchainTransaction } from './blockchain.service';
import { Types } from 'mongoose';

export const transferOwnership = async (vehicleId: string, newOwnerId: string) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  const newOwner = await UserModel.findById(newOwnerId);
  if (!newOwner) {
    throw createHttpError(404, 'New owner not found');
  }

  const previousOwner = vehicle.owner;
  vehicle.owner = newOwner._id as Types.ObjectId;
  await vehicle.save();

  const transfer = await OwnershipTransferModel.create({
    vehicle: vehicle._id,
    previousOwner,
    newOwner: newOwner._id,
    transferredAt: new Date()
  });

  const transaction = await recordBlockchainTransaction('ownership', {
    vehicleId: vehicle._id,
    previousOwner,
    newOwner: newOwner._id,
    transferId: transfer._id
  });

  transfer.blockchainTxId = transaction.txId;
  await transfer.save();

  return transfer;
};

export const getOwnershipHistory = async (vehicleId: string) => {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw createHttpError(404, 'Vehicle not found');
  }

  return OwnershipTransferModel.find({ vehicle: vehicle._id })
    .populate('previousOwner', 'name email role')
    .populate('newOwner', 'name email role')
    .sort({ transferredAt: -1 })
    .lean();
};
