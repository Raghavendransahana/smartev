import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserModel, UserRole } from '../models/user.model';

interface JwtPayload {
  sub: string;
  role: UserRole;
}

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(createHttpError(401, 'Authentication required'));
  }

  const token = authHeader.slice(7).trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await UserModel.findById(decoded.sub);
    if (!user) {
      return next(createHttpError(401, 'Invalid authentication token'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(createHttpError(401, 'Invalid authentication token'));
  }
};

export const authenticate = authMiddleware;

export const requireRoles = (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(createHttpError(401, 'Authentication required'));
  }

  if (roles.length > 0 && !roles.includes(req.user.role)) {
    return next(createHttpError(403, 'Insufficient permissions'));
  }

  next();
};
