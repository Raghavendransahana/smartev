import express from 'express';
import { systemRouter } from './system.routes';
import { userRouter } from './user.routes';
import { vehicleRouter } from './vehicle.routes';
import { batteryRouter } from './battery.routes';
import { chargingRouter } from './charging.routes';
import { ownershipRouter } from './ownership.routes';
import { alertRouter } from './alert.routes';
import { analyticsRouter } from './analytics.routes';
import { blockchainRouter } from './blockchain.routes';

const router = express.Router();

// System routes
router.use('/system', systemRouter);

// User routes  
router.use('/users', userRouter);

// Vehicle routes
router.use('/vehicles', vehicleRouter);

// Battery routes
router.use('/battery', batteryRouter);

// Charging routes
router.use('/charging', chargingRouter);

// Ownership routes
router.use('/ownership', ownershipRouter);

// Alert routes
router.use('/alerts', alertRouter);

// Analytics routes
router.use('/analytics', analyticsRouter);

// Blockchain routes
router.use('/blockchain', blockchainRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { router as routes };