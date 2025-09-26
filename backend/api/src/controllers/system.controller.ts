import { Request, Response } from 'express';
import { getSystemInfo } from '../services/system.service';
import { wrapAsync } from '../middlewares/errorHandler';
import createHttpError from 'http-errors';

export const getStatus = (_req: Request, res: Response): void => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};

export const getInfo = wrapAsync(async (_req: Request, res: Response): Promise<void> => {
  try {
    const info = await getSystemInfo();
    res.json(info);
  } catch (error) {
    throw createHttpError(500, 'Failed to retrieve system information');
  }
});

export const systemController = {
  getStatus,
  getInfo
};
