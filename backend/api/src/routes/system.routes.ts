import express from 'express';
import { systemController } from '../controllers/system.controller';

const router = express.Router();

// System status and info
router.get('/status', systemController.getStatus);
router.get('/info', systemController.getInfo);

export { router as systemRouter };