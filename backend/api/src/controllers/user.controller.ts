import { Request, Response } from 'express';
import { registerUser, authenticateUser, getUserProfile } from '../services/user.service';
import { createAuditLog } from '../services/audit.service';
import { Types } from 'mongoose';
import { wrapAsync } from '../middlewares/errorHandler';
import createHttpError from 'http-errors';

export const register = wrapAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await registerUser(req.body);
    const userId = user && '_id' in user ? (user._id as Types.ObjectId).toString() : undefined;
    await createAuditLog(req, 'user_register', 'User', userId, {
      email: req.body.email,
      role: req.body.role
    });
    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 11000) {
      throw createHttpError(409, 'User with this email already exists');
    }
    throw createHttpError(500, 'Failed to register user');
  }
});

export const login = wrapAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createHttpError(400, 'Email and password are required');
    }
    const result = await authenticateUser(email, password);
    res.json(result);
  } catch (error: any) {
    if (error.status === 401) {
      throw error;
    }
    throw createHttpError(500, 'Failed to authenticate user');
  }
});

export const getProfile = wrapAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const userFromToken = req.user as { _id: Types.ObjectId };
    const userId = req.params.id === 'me' ? userFromToken._id.toString() : req.params.id;
    
    if (!userId) {
      throw createHttpError(400, 'User ID is required');
    }
    
    const user = await getUserProfile(userId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    
    res.json(user);
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    throw createHttpError(500, 'Failed to retrieve user profile');
  }
});

export const updateProfile = wrapAsync(async (req: Request, res: Response): Promise<void> => {
  const userFromToken = req.user as { _id: Types.ObjectId };
  const userId = userFromToken._id.toString();
  // TODO: Implement profile update logic
  res.json({ message: 'Profile update not implemented yet', userId });
});

export const userController = {
  register,
  login,
  getProfile,
  updateProfile
};
