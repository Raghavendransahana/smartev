import { Request, Response } from 'express';
import { registerUser, authenticateUser, getUserProfile } from '../services/user.service';
import { createAuditLog } from '../services/audit.service';
import { Types } from 'mongoose';

export const register = async (req: Request, res: Response): Promise<void> => {
  const user = await registerUser(req.body);
  const userId = user && '_id' in user ? (user._id as Types.ObjectId).toString() : undefined;
  await createAuditLog(req, 'user_register', 'User', userId, {
    email: req.body.email,
    role: req.body.role
  });
  res.status(201).json(user);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await authenticateUser(req.body.email, req.body.password);
  res.json(result);
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const userFromToken = req.user as { _id: Types.ObjectId };
  const userId = req.params.id === 'me' ? userFromToken._id.toString() : req.params.id;
  if (!userId) {
    res.status(400).json({ message: 'User id is required' });
    return;
  }
  const user = await getUserProfile(userId);
  res.json(user);
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userFromToken = req.user as { _id: Types.ObjectId };
  const userId = userFromToken._id.toString();
  // TODO: Implement profile update logic
  res.json({ message: 'Profile update not implemented yet', userId });
};

export const userController = {
  register,
  login,
  getProfile,
  updateProfile
};
