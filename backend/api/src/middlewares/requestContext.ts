import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export const requestContext = (req: Request, res: Response, next: NextFunction): void => {
  const traceId = randomUUID();
  res.locals.traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  next();
};
