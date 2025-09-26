import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { logger } from '../utils/logger';

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  expose?: boolean;
  details?: unknown;
}

export const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  const status = err.status || err.statusCode || 500;
  const isOperational = err.expose ?? status < 500;

  logger.error('Request failed', err);

  if (!isOperational) {
    return res.status(status).json({
      message: 'Internal server error',
      traceId: res.locals.traceId
    });
  }

  return res.status(status).json({
    message: err.message,
    details: err.details,
    traceId: res.locals.traceId
  });
};

export const wrapAsync = <TRequest extends Request, TResponse extends Response>(
  fn: (req: TRequest, res: TResponse, next: NextFunction) => Promise<unknown>
) =>
  async (req: TRequest, res: TResponse, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export const ensure = (condition: unknown, error: createHttpError.HttpError | (() => createHttpError.HttpError)): void => {
  if (!condition) {
    throw typeof error === 'function' ? error() : error;
  }
};
