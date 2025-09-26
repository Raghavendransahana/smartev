import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(createHttpError(404, `Route ${req.originalUrl} not found`));
};
