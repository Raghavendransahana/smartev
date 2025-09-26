import { Request, Response } from 'express';
import { getSystemInfo } from '../services/system.service';

export const getStatus = (_req: Request, res: Response): void => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};

export const getInfo = async (_req: Request, res: Response): Promise<void> => {
  const info = await getSystemInfo();
  res.json(info);
};

export const systemController = {
  getStatus,
  getInfo
};
