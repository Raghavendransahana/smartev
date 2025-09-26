import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import createHttpError from 'http-errors';

export const validateRequest = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction): void => {
  const result = schema.safeParse(req);
  if (!result.success) {
    return next(createHttpError(422, 'Validation failed', { details: result.error.flatten() }));
  }
  Object.assign(req, result.data);
  next();
};

export const validateBody = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction): void => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(createHttpError(422, 'Validation failed', { details: result.error.flatten() }));
  }
  req.body = result.data;
  next();
};

export const validateQuery = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction): void => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return next(createHttpError(422, 'Validation failed', { details: result.error.flatten() }));
  }
  req.query = result.data;
  next();
};
